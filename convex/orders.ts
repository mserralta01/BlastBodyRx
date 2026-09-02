import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireVirtualFitPathAdmin } from "./lib/auth";

const itemValidator = v.object({ sku: v.string(), name: v.string(), strength: v.string(), quantity: v.number(), unitPrice: v.number() });

export const list = query({ args: {}, handler: async (ctx) => {
  await requireVirtualFitPathAdmin(ctx);
  return (await ctx.db.query("orders").collect()).sort((a, b) => b.createdAt - a.createdAt);
} });

export const createDraft = mutation({
  args: {
    email: v.string(), firstName: v.string(), lastName: v.string(), phone: v.optional(v.string()),
    items: v.array(itemValidator), discountCode: v.optional(v.string()),
    shippingAddress: v.object({ line1: v.string(), line2: v.optional(v.string()), city: v.string(), state: v.string(), postalCode: v.string(), country: v.string() }),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("storeSettings").withIndex("by_singleton", (q) => q.eq("singleton", "main")).unique();
    if (!settings?.checkoutEnabled) throw new Error("Secure checkout is not accepting orders yet");
    if (!args.items.length) throw new Error("Cart is empty");
    const subtotal = args.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    if (subtotal < 100) throw new Error("Orders must total at least $100");
    let discount = 0;
    if (args.discountCode) {
      const record = await ctx.db.query("discounts").withIndex("by_code", (q) => q.eq("code", args.discountCode!.toUpperCase())).unique();
      if (record?.active && record.startsAt <= Date.now() && (!record.endsAt || record.endsAt > Date.now())) {
        discount = record.type === "percent" ? subtotal * record.amount / 100 : Math.min(subtotal, record.amount);
        await ctx.db.patch(record._id, { usageCount: record.usageCount + 1 });
      }
    }
    const now = Date.now();
    const orderNumber = `VFP-${new Date(now).toISOString().slice(2, 10).replaceAll("-", "")}-${String(now).slice(-5)}`;
    const total = Math.round((subtotal - discount) * 100) / 100;
    const customer = await ctx.db.query("customers").withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase())).unique();
    if (!customer) {
      await ctx.db.insert("customers", { email: args.email.toLowerCase(), firstName: args.firstName, lastName: args.lastName, phone: args.phone, orderCount: 0, lifetimeValue: 0, createdAt: now, updatedAt: now });
    }
    const orderId = await ctx.db.insert("orders", {
      orderNumber, customerEmail: args.email.toLowerCase(), customerName: `${args.firstName} ${args.lastName}`,
      status: "pending", paymentStatus: "unpaid", items: args.items, subtotal, discount, shipping: 0, total,
      shippingAddress: args.shippingAddress, createdAt: now, updatedAt: now,
    });
    return { orderId, orderNumber, total };
  },
});

export const updateStatus = mutation({
  args: { orderId: v.id("orders"), status: v.union(v.literal("draft"), v.literal("pending"), v.literal("paid"), v.literal("fulfilled"), v.literal("cancelled"), v.literal("refunded")) },
  handler: async (ctx, args) => {
    await requireVirtualFitPathAdmin(ctx);
    return ctx.db.patch(args.orderId, { status: args.status, updatedAt: Date.now() });
  },
});

export const recordPayment = mutation({
  args: { orderNumber: v.string(), secret: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.ORDER_WRITE_SECRET || args.secret !== process.env.ORDER_WRITE_SECRET) throw new Error("Unauthorized");
    const order = await ctx.db.query("orders").withIndex("by_order_number", (q) => q.eq("orderNumber", args.orderNumber)).unique();
    if (!order || order.paymentStatus === "paid") return;
    await ctx.db.patch(order._id, { status: "paid", paymentStatus: "paid", updatedAt: Date.now() });
    const customer = await ctx.db.query("customers").withIndex("by_email", (q) => q.eq("email", order.customerEmail)).unique();
    if (customer) await ctx.db.patch(customer._id, { orderCount: customer.orderCount + 1, lifetimeValue: customer.lifetimeValue + order.total, updatedAt: Date.now() });
  },
});
