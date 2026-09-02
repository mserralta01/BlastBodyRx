import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function requireVirtualFitPathAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("VirtualFitPath account authentication is required");
  const admin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).unique();
  if (!admin) throw new Error("VirtualFitPath back-office access is required");
  return { userId, admin };
}
