import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireVirtualFitPathAdmin } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("products").collect(),
});

export const updateInventory = mutation({
  args: { productId: v.id("products"), sku: v.string(), inventory: v.number() },
  handler: async (ctx, args) => {
    await requireVirtualFitPathAdmin(ctx);
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");
    await ctx.db.patch(args.productId, {
      variants: product.variants.map((item) => item.sku === args.sku ? { ...item, inventory: Math.max(0, Math.floor(args.inventory)) } : item),
      updatedAt: Date.now(),
    });
  },
});

export const toggleActive = mutation({
  args: { productId: v.id("products"), active: v.boolean() },
  handler: async (ctx, args) => {
    await requireVirtualFitPathAdmin(ctx);
    return ctx.db.patch(args.productId, { active: args.active, updatedAt: Date.now() });
  },
});
