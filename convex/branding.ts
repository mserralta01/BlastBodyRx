import { mutation } from "./_generated/server";
import { requireBlastBodyRxAdmin } from "./lib/auth";

const newSku = (sku: string) => sku.startsWith("AX-") || sku.startsWith("TP-") ? `BBRX-${sku.slice(3)}` : sku;

/**
 * Idempotent production data alignment for the approved BlastBodyRx rebrand.
 * It only updates brand-owned catalogue fields and SKU labels.
 */
export const applyBlastBodyRx = mutation({
  args: {},
  handler: async (ctx) => {
    await requireBlastBodyRxAdmin(ctx);
    const now = Date.now();
    let updatedProducts = 0;
    let updatedOrders = 0;
    const [products, orders, settings] = await Promise.all([
      ctx.db.query("products").take(250),
      ctx.db.query("orders").withIndex("by_created_at").take(500),
      ctx.db.query("storeSettings").withIndex("by_singleton", (q) => q.eq("singleton", "main")).unique(),
    ]);

    for (const product of products) {
      const needsUpdate = product.image !== "/assets/products/blastbodyrx-vial.svg" || product.variants.some((variant) => variant.sku.startsWith("AX-") || variant.sku.startsWith("TP-"));
      if (!needsUpdate) continue;
      await ctx.db.patch(product._id, {
        image: "/assets/products/blastbodyrx-vial.svg",
        variants: product.variants.map((variant) => ({ ...variant, sku: newSku(variant.sku) })),
        updatedAt: now,
      });
      updatedProducts += 1;
    }

    for (const order of orders) {
      if (!order.items.some((item) => item.sku.startsWith("AX-") || item.sku.startsWith("TP-"))) continue;
      await ctx.db.patch(order._id, {
        items: order.items.map((item) => ({ ...item, sku: newSku(item.sku) })),
        updatedAt: now,
      });
      updatedOrders += 1;
    }

    const updatedSettings = Boolean(settings && (
      settings.storeName !== "BlastBodyRx" ||
      settings.legalName !== "Ecom Blast LLC" ||
      settings.supportPhone !== "1-888-812-8690" ||
      settings.supportEmail
    ));
    if (settings && updatedSettings) {
      await ctx.db.patch(settings._id, {
        storeName: "BlastBodyRx",
        legalName: "Ecom Blast LLC",
        supportPhone: "1-888-812-8690",
        supportEmail: "",
        updatedAt: now,
      });
    }

    return { products: updatedProducts, orders: updatedOrders, settings: updatedSettings };
  },
});
