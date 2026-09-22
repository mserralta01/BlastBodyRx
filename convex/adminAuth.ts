import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBlastBodyRxAdmin } from "./lib/auth";

const adminRole = v.union(v.literal("owner"), v.literal("manager"));
const inviteStatus = v.union(v.literal("pending"), v.literal("accepted"), v.literal("cancelled"));

const adminSummary = v.object({
  adminId: v.id("adminUsers"),
  userId: v.id("users"),
  email: v.string(),
  name: v.string(),
  role: adminRole,
  createdAt: v.number(),
  isCurrent: v.boolean(),
});

const invitationSummary = v.object({
  invitationId: v.id("adminInvitations"),
  email: v.string(),
  role: adminRole,
  status: inviteStatus,
  createdAt: v.number(),
});

function normalizeEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) throw new Error("Enter a valid email address");
  return normalized;
}

export const ownerExists = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => Boolean(await ctx.db.query("adminUsers").withIndex("by_role", (q) => q.eq("role", "owner")).first()),
});

export const viewer = query({
  args: {},
  returns: v.object({
    authenticated: v.boolean(),
    isAdmin: v.boolean(),
    hasOwner: v.boolean(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    role: v.optional(adminRole),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { authenticated: false, isAdmin: false, hasOwner: false };
    const user = await ctx.db.get(userId);
    const [admin, owner] = await Promise.all([
      ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).unique(),
      ctx.db.query("adminUsers").withIndex("by_role", (q) => q.eq("role", "owner")).first(),
    ]);
    return {
      authenticated: true,
      isAdmin: Boolean(admin),
      hasOwner: Boolean(owner),
      email: user?.email,
      name: user?.name,
      role: admin?.role,
    };
  },
});

export const claimOwner = mutation({
  args: { setupCode: v.string() },
  returns: v.object({ claimed: v.boolean(), alreadyAdmin: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in before claiming owner access");
    const existingAdmin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).unique();
    if (existingAdmin) return { claimed: false, alreadyAdmin: true };
    if (await ctx.db.query("adminUsers").withIndex("by_role", (q) => q.eq("role", "owner")).first()) {
      throw new Error("The BlastBodyRx owner account has already been created");
    }
    const expected = process.env.BLASTBODYRX_ADMIN_SETUP_CODE;
    if (!expected || args.setupCode.trim() !== expected) throw new Error("The owner setup code is not valid");
    await ctx.db.insert("adminUsers", { userId, role: "owner", createdAt: Date.now() });
    return { claimed: true, alreadyAdmin: false };
  },
});

export const listAdminUsers = query({
  args: {},
  returns: v.object({ admins: v.array(adminSummary), invitations: v.array(invitationSummary) }),
  handler: async (ctx) => {
    const { userId } = await requireBlastBodyRxAdmin(ctx);
    const [admins, invitations] = await Promise.all([
      ctx.db.query("adminUsers").take(100),
      ctx.db.query("adminInvitations").withIndex("by_status", (q) => q.eq("status", "pending")).take(100),
    ]);
    const adminRows = await Promise.all(admins.map(async (admin) => {
      const user = await ctx.db.get(admin.userId);
      return {
        adminId: admin._id,
        userId: admin.userId,
        email: user?.email ?? "Email unavailable",
        name: admin.displayName ?? user?.name ?? user?.email ?? "Administrator",
        role: admin.role,
        createdAt: admin.createdAt,
        isCurrent: admin.userId === userId,
      };
    }));
    return {
      admins: adminRows.sort((a, b) => (a.role === "owner" ? -1 : b.role === "owner" ? 1 : a.name.localeCompare(b.name))),
      invitations: invitations.map((invitation) => ({
        invitationId: invitation._id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        createdAt: invitation.createdAt,
      })),
    };
  },
});

export const inviteAdmin = mutation({
  args: { email: v.string() },
  returns: v.object({ status: v.union(v.literal("added"), v.literal("invited"), v.literal("already_admin")), message: v.string(), invitationId: v.optional(v.id("adminInvitations")) }),
  handler: async (ctx, args) => {
    const { userId } = await requireBlastBodyRxAdmin(ctx);
    const email = normalizeEmail(args.email);
    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).unique();
    if (user) {
      const existingAdmin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", user._id)).unique();
      if (existingAdmin) return { status: "already_admin" as const, message: `${email} already has administrator access.` };
      await ctx.db.insert("adminUsers", { userId: user._id, role: "manager", invitedBy: userId, createdAt: Date.now() });
      const pending = await ctx.db.query("adminInvitations").withIndex("by_email_and_status", (q) => q.eq("email", email).eq("status", "pending")).unique();
      if (pending) await ctx.db.patch(pending._id, { status: "accepted", acceptedBy: user._id, acceptedAt: Date.now() });
      return { status: "added" as const, message: `${email} can now sign in as an administrator.` };
    }
    const pending = await ctx.db.query("adminInvitations").withIndex("by_email_and_status", (q) => q.eq("email", email).eq("status", "pending")).unique();
    if (pending) return { status: "invited" as const, message: `${email} already has a pending invitation.`, invitationId: pending._id };
    const invitationId = await ctx.db.insert("adminInvitations", { email, role: "manager", status: "pending", invitedBy: userId, createdAt: Date.now() });
    return { status: "invited" as const, message: `Secure invitation ready for ${email}.`, invitationId };
  },
});

export const acceptInvitation = mutation({
  args: { invitationId: v.id("adminInvitations") },
  returns: v.object({ accepted: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in before accepting an invitation");
    const existingAdmin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).unique();
    if (existingAdmin) return { accepted: false };
    const user = await ctx.db.get(userId);
    const email = normalizeEmail(user?.email ?? "");
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation || invitation.status !== "pending" || invitation.email !== email) throw new Error("This administrator invitation is not valid for the signed-in email address");
    const now = Date.now();
    await ctx.db.insert("adminUsers", { userId, role: invitation.role, invitedBy: invitation.invitedBy, createdAt: now });
    await ctx.db.patch(invitation._id, { status: "accepted", acceptedBy: userId, acceptedAt: now });
    return { accepted: true };
  },
});

export const revokeAdmin = mutation({
  args: { adminId: v.id("adminUsers") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { userId } = await requireBlastBodyRxAdmin(ctx);
    const target = await ctx.db.get(args.adminId);
    if (!target) return null;
    if (target.role === "owner") throw new Error("The owner account cannot be removed");
    if (target.userId === userId) throw new Error("You cannot remove your own administrator access");
    await ctx.db.delete(target._id);
    return null;
  },
});

export const cancelInvitation = mutation({
  args: { invitationId: v.id("adminInvitations") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireBlastBodyRxAdmin(ctx);
    const invitation = await ctx.db.get(args.invitationId);
    if (invitation?.status === "pending") await ctx.db.patch(invitation._id, { status: "cancelled", cancelledAt: Date.now() });
    return null;
  },
});
