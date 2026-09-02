import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const ownerExists = query({
  args: {},
  handler: async (ctx) => Boolean(await ctx.db.query("adminUsers").first()),
});

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { authenticated: false, isAdmin: false, hasOwner: false };
    const [user, admin, anyOwner] = await Promise.all([
      ctx.db.get(userId),
      ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).unique(),
      ctx.db.query("adminUsers").first(),
    ]);
    return {
      authenticated: true,
      isAdmin: Boolean(admin),
      hasOwner: Boolean(anyOwner),
      email: user?.email,
      name: user?.name,
      role: admin?.role,
    };
  },
});

export const claimOwner = mutation({
  args: { setupCode: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in before claiming owner access");
    const existingAdmin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).unique();
    if (existingAdmin) return { claimed: false, alreadyAdmin: true };
    if (await ctx.db.query("adminUsers").first()) throw new Error("The VirtualFitPath owner account has already been created");
    const expected = process.env.VIRTUAL_FIT_PATH_ADMIN_SETUP_CODE;
    if (!expected || args.setupCode.trim() !== expected) throw new Error("The owner setup code is not valid");
    await ctx.db.insert("adminUsers", { userId, role: "owner", createdAt: Date.now() });
    return { claimed: true, alreadyAdmin: false };
  },
});
