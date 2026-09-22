import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { requireBlastBodyRxAdmin } from "./lib/auth";

const products = [
  ["bpc-157", "BPC-157", "Peptides", "A synthetic pentadecapeptide supplied as a lyophilized research compound.", "/assets/products/blastbodyrx-vial.svg", "Popular", [["BBRX-BPC-10", "10mg", 59.99, 48]]],
  ["ghk-cu", "GHK-Cu", "Peptides", "A copper-binding tripeptide prepared for laboratory research workflows.", "/assets/products/blastbodyrx-vial.svg", "", [["BBRX-GHK-100", "100mg", 64.99, 31]]],
  ["glow", "GLOW", "Peptides", "A multi-compound research blend offered in two total fill strengths.", "/assets/products/blastbodyrx-vial.svg", "Blend", [["BBRX-GLW-50", "50mg", 99.99, 18], ["BBRX-GLW-70", "70mg", 129.99, 12]]],
  ["ipamorelin", "Ipamorelin", "Peptides", "A selective growth-hormone secretagogue research peptide.", "/assets/products/blastbodyrx-vial.svg", "", [["BBRX-IPA-10", "10mg", 59.99, 42]]],
  ["mots-c", "MOTS-c", "Peptides", "A mitochondrial-derived peptide available in two research strengths.", "/assets/products/blastbodyrx-vial.svg", "", [["BBRX-MOT-10", "10mg", 49.99, 36], ["BBRX-MOT-40", "40mg", 119.99, 14]]],
  ["nad", "NAD+", "Peptides", "A nicotinamide adenine dinucleotide research compound in three strengths.", "/assets/products/blastbodyrx-vial.svg", "", [["BBRX-NAD-100", "100mg", 34.99, 56], ["BBRX-NAD-500", "500mg", 89.99, 24], ["BBRX-NAD-1000", "1000mg", 149.99, 10]]],
  ["retatrutide", "Retatrutide", "GLP-1", "A triple-agonist research compound offered in three strengths.", "/assets/products/blastbodyrx-vial.svg", "Bestseller", [["BBRX-RET-10", "10mg", 79.99, 65], ["BBRX-RET-20", "20mg", 129.99, 39], ["BBRX-RET-30", "30mg", 169.99, 22]]],
  ["semaglutide", "Semaglutide", "GLP-1", "A GLP-1 receptor agonist research compound in three strengths.", "/assets/products/blastbodyrx-vial.svg", "", [["BBRX-SEM-5", "5mg", 54.99, 74], ["BBRX-SEM-10", "10mg", 84.99, 51], ["BBRX-SEM-20", "20mg", 129.99, 27]]],
  ["sermorelin", "Sermorelin", "Peptides", "A growth-hormone-releasing hormone analog for research use.", "/assets/products/blastbodyrx-vial.svg", "", [["BBRX-SER-10", "10mg", 69.99, 29]]],
  ["tb-500", "TB-500", "Peptides", "A thymosin beta-4 fragment research peptide.", "/assets/products/blastbodyrx-vial.svg", "", [["BBRX-TB5-10", "10mg", 69.99, 33]]],
  ["tesamorelin", "Tesamorelin", "Peptides", "A GHRH analog supplied as a 10mg lyophilized research vial.", "/assets/products/blastbodyrx-vial.svg", "", [["BBRX-TES-10", "10mg", 99.99, 21]]],
  ["tirzepatide", "Tirzepatide", "GLP-1", "A dual GIP/GLP-1 receptor agonist research compound in five strengths.", "/assets/products/blastbodyrx-vial.svg", "Five strengths", [["BBRX-TIR-10", "10mg", 69.99, 61], ["BBRX-TIR-20", "20mg", 109.99, 43], ["BBRX-TIR-30", "30mg", 149.99, 26], ["BBRX-TIR-40", "40mg", 189.99, 17], ["BBRX-TIR-60", "60mg", 249.99, 8]]],
] as const;

const demoCustomers = [
  ["demo/customer/ava", "ava.demo@blastbodyrx.test", "Ava", "Thompson", "Austin", "TX"],
  ["demo/customer/liam", "liam.demo@blastbodyrx.test", "Liam", "Carter", "Denver", "CO"],
  ["demo/customer/mia", "mia.demo@blastbodyrx.test", "Mia", "Reynolds", "Miami", "FL"],
  ["demo/customer/noah", "noah.demo@blastbodyrx.test", "Noah", "Brooks", "Portland", "OR"],
  ["demo/customer/emma", "emma.demo@blastbodyrx.test", "Emma", "Collins", "Nashville", "TN"],
  ["demo/customer/ethan", "ethan.demo@blastbodyrx.test", "Ethan", "Mitchell", "Phoenix", "AZ"],
  ["demo/customer/olivia", "olivia.demo@blastbodyrx.test", "Olivia", "Bennett", "Chicago", "IL"],
  ["demo/customer/lucas", "lucas.demo@blastbodyrx.test", "Lucas", "Parker", "Seattle", "WA"],
] as const;

const demoOrderKeys = Array.from({ length: 16 }, (_, index) => `demo/order/${String(index + 1).padStart(2, "0")}`);
const demoDiscounts = [
  ["demo/discount/welcome", "WELCOME15", "percent", 15, 24],
  ["demo/discount/lab", "LAB25", "fixed", 25, 11],
  ["demo/discount/research", "RESEARCH10", "percent", 10, 38],
] as const;
const demoBatches = [
  ["demo/batch/bpc", "bpc-157", "BPC-157", "BBRX-BPC-2409"],
  ["demo/batch/ghk", "ghk-cu", "GHK-Cu", "BBRX-GHK-2410"],
  ["demo/batch/ret", "retatrutide", "Retatrutide", "BBRX-RET-2411"],
  ["demo/batch/sem", "semaglutide", "Semaglutide", "BBRX-SEM-2412"],
  ["demo/batch/tb", "tb-500", "TB-500", "BBRX-TB5-2501"],
  ["demo/batch/tir", "tirzepatide", "Tirzepatide", "BBRX-TIR-2502"],
] as const;

const demoStateValidator = v.object({
  enabled: v.boolean(),
  seededAt: v.union(v.number(), v.null()),
  counts: v.object({
    products: v.number(),
    customers: v.number(),
    orders: v.number(),
    discounts: v.number(),
    batches: v.number(),
  }),
});

async function seedStore(ctx: MutationCtx) {
  const existing = await ctx.db.query("products").first();
  if (existing) return { seeded: false };
  const now = Date.now();
  for (const [slug, name, category, description, image, badge, variants] of products) {
    await ctx.db.insert("products", {
      slug,
      name,
      category,
      description,
      image,
      ...(badge ? { badge } : {}),
      featured: true,
      sortOrder: now,
      active: true,
      updatedAt: now,
      variants: variants.map(([sku, strength, price, inventory]) => ({ sku, strength, price, inventory, lowStockAt: 12, active: true })),
    });
  }
  const settings = await ctx.db.query("storeSettings").withIndex("by_singleton", (q) => q.eq("singleton", "main")).unique();
  if (!settings) {
    await ctx.db.insert("storeSettings", { singleton: "main", storeName: "BlastBodyRx", supportPhone: "1-888-812-8690", legalName: "Ecom Blast LLC", freeShippingThreshold: 100, minimumOrder: 100, checkoutEnabled: false, announcement: "Free U.S. shipping on qualifying $100+ research orders", updatedAt: now });
  }
  const starterDiscount = await ctx.db.query("discounts").withIndex("by_code", (q) => q.eq("code", "LAB10")).unique();
  if (!starterDiscount) await ctx.db.insert("discounts", { code: "LAB10", type: "percent", amount: 10, active: true, usageCount: 0, startsAt: now });
  return { seeded: true };
}

async function readDemoState(ctx: QueryCtx | MutationCtx) {
  const [settings, productRows, customerRows, orderRows, discountRows, batchRows] = await Promise.all([
    ctx.db.query("storeSettings").withIndex("by_singleton", (q) => q.eq("singleton", "main")).unique(),
    ctx.db.query("products").take(250),
    Promise.all(demoCustomers.map(([key]) => ctx.db.query("customers").withIndex("by_demo_seed_key", (q) => q.eq("demoSeedKey", key)).unique())),
    Promise.all(demoOrderKeys.map((key) => ctx.db.query("orders").withIndex("by_demo_seed_key", (q) => q.eq("demoSeedKey", key)).unique())),
    Promise.all(demoDiscounts.map(([key]) => ctx.db.query("discounts").withIndex("by_demo_seed_key", (q) => q.eq("demoSeedKey", key)).unique())),
    Promise.all(demoBatches.map(([key]) => ctx.db.query("batches").withIndex("by_demo_seed_key", (q) => q.eq("demoSeedKey", key)).unique())),
  ]);
  return {
    enabled: settings?.demoModeEnabled ?? false,
    seededAt: settings?.demoModeEnabled ? settings.demoDataSeededAt ?? null : null,
    counts: {
      products: productRows.length,
      customers: customerRows.filter(Boolean).length,
      orders: orderRows.filter(Boolean).length,
      discounts: discountRows.filter(Boolean).length,
      batches: batchRows.filter(Boolean).length,
    },
  };
}

async function setDemoFlag(ctx: MutationCtx, enabled: boolean, seededAt: number) {
  const settings = await ctx.db.query("storeSettings").withIndex("by_singleton", (q) => q.eq("singleton", "main")).unique();
  if (settings) {
    await ctx.db.patch(settings._id, { demoModeEnabled: enabled, demoDataSeededAt: seededAt, updatedAt: Date.now() });
    return;
  }
  await ctx.db.insert("storeSettings", {
    singleton: "main",
    storeName: "BlastBodyRx",
    legalName: "Ecom Blast LLC",
    supportPhone: "1-888-812-8690",
    freeShippingThreshold: 100,
    minimumOrder: 100,
    checkoutEnabled: false,
    announcement: "Free U.S. shipping on qualifying $100+ research orders",
    demoModeEnabled: enabled,
    demoDataSeededAt: seededAt,
    updatedAt: Date.now(),
  });
}

async function ensureDemoData(ctx: MutationCtx) {
  await seedStore(ctx);
  const catalog = await ctx.db.query("products").take(100);
  if (!catalog.length) throw new Error("The product catalog could not be initialized");
  const now = Date.now();
  const customerIds = new Map<string, Id<"customers">>();
  for (const [key, email, firstName, lastName] of demoCustomers) {
    const existing = await ctx.db.query("customers").withIndex("by_demo_seed_key", (q) => q.eq("demoSeedKey", key)).unique();
    const customerId = existing?._id ?? await ctx.db.insert("customers", {
      email,
      firstName,
      lastName,
      phone: "(555) 010-2026",
      orderCount: 0,
      lifetimeValue: 0,
      notes: "Sample customer generated by Demo Mode.",
      tags: ["demo", "research customer"],
      demoSeedKey: key,
      createdAt: now - 90 * 24 * 60 * 60 * 1000,
      updatedAt: now,
    });
    customerIds.set(key, customerId);
  }

  const customerStats = new Map<string, { orders: number; lifetimeValue: number }>();
  const statuses = ["fulfilled", "paid", "pending", "fulfilled", "cancelled", "refunded"] as const;
  for (let index = 0; index < demoOrderKeys.length; index += 1) {
    const key = demoOrderKeys[index];
    const customer = demoCustomers[index % demoCustomers.length];
    const product = catalog[index % catalog.length];
    const productVariant = product.variants[index % product.variants.length];
    const quantity = index % 5 === 0 ? 2 : 1;
    const subtotal = Number((productVariant.price * quantity).toFixed(2));
    const discount = index % 4 === 0 ? Number((subtotal * 0.1).toFixed(2)) : 0;
    const shipping = subtotal - discount >= 100 ? 0 : 9.95;
    const total = Number((subtotal - discount + shipping).toFixed(2));
    const status = statuses[index % statuses.length];
    const paymentStatus = status === "refunded" ? "refunded" : status === "paid" || status === "fulfilled" ? "paid" : "unpaid";
    const createdAt = now - (index + 1) * 30 * 60 * 60 * 1000;
    const existing = await ctx.db.query("orders").withIndex("by_demo_seed_key", (q) => q.eq("demoSeedKey", key)).unique();
    if (!existing) {
      await ctx.db.insert("orders", {
        orderNumber: `BBRX-DEMO-${1001 + index}`,
        customerEmail: customer[1],
        customerName: `${customer[2]} ${customer[3]}`,
        status,
        paymentStatus,
        items: [{ sku: productVariant.sku, name: product.name, strength: productVariant.strength, quantity, unitPrice: productVariant.price }],
        subtotal,
        discount,
        shipping,
        total,
        shippingAddress: { line1: `${101 + index} Research Way`, city: customer[4], state: customer[5], postalCode: "00000", country: "US" },
        notes: "Demo Mode sample order",
        shippingMethodName: "Standard U.S. shipping",
        ...(status === "fulfilled" ? { trackingNumber: `DEMO${900000 + index}` } : {}),
        demoSeedKey: key,
        createdAt,
        updatedAt: createdAt,
      });
    }
    const stats = customerStats.get(customer[0]) ?? { orders: 0, lifetimeValue: 0 };
    if (status !== "cancelled") stats.orders += 1;
    if (status === "paid" || status === "fulfilled") stats.lifetimeValue += total;
    customerStats.set(customer[0], stats);
  }

  for (const [key] of demoCustomers) {
    const customerId = customerIds.get(key);
    const stats = customerStats.get(key) ?? { orders: 0, lifetimeValue: 0 };
    if (customerId) await ctx.db.patch(customerId, { orderCount: stats.orders, lifetimeValue: Number(stats.lifetimeValue.toFixed(2)), updatedAt: now });
  }

  for (const [key, code, type, amount, usageCount] of demoDiscounts) {
    const existing = await ctx.db.query("discounts").withIndex("by_demo_seed_key", (q) => q.eq("demoSeedKey", key)).unique();
    if (!existing) await ctx.db.insert("discounts", { code, type, amount, active: true, usageCount, startsAt: now - 30 * 24 * 60 * 60 * 1000, demoSeedKey: key });
  }
  for (const [key, productSlug, compound, lotNumber] of demoBatches) {
    const existing = await ctx.db.query("batches").withIndex("by_demo_seed_key", (q) => q.eq("demoSeedKey", key)).unique();
    if (!existing) await ctx.db.insert("batches", { productSlug, compound, lotNumber, certificateUrl: "/lab-results", testedAt: now - 14 * 24 * 60 * 60 * 1000, published: true, demoSeedKey: key });
  }
  await setDemoFlag(ctx, true, now);
}

async function clearDemoData(ctx: MutationCtx) {
  const rows = await Promise.all([
    ...demoCustomers.map(([key]) => ctx.db.query("customers").withIndex("by_demo_seed_key", (q) => q.eq("demoSeedKey", key)).unique()),
    ...demoOrderKeys.map((key) => ctx.db.query("orders").withIndex("by_demo_seed_key", (q) => q.eq("demoSeedKey", key)).unique()),
    ...demoDiscounts.map(([key]) => ctx.db.query("discounts").withIndex("by_demo_seed_key", (q) => q.eq("demoSeedKey", key)).unique()),
    ...demoBatches.map(([key]) => ctx.db.query("batches").withIndex("by_demo_seed_key", (q) => q.eq("demoSeedKey", key)).unique()),
  ]);
  for (const row of rows) if (row) await ctx.db.delete(row._id);
  await setDemoFlag(ctx, false, 0);
}

export const bootstrap = mutation({
  args: { setupCode: v.string() },
  returns: v.object({ seeded: v.boolean() }),
  handler: async (ctx, args) => {
    const expected = process.env.BLASTBODYRX_ADMIN_SETUP_CODE;
    if (!expected || args.setupCode.trim() !== expected) throw new Error("The bootstrap code is not valid");
    return seedStore(ctx);
  },
});

export const run = mutation({
  args: {},
  returns: v.object({ seeded: v.boolean() }),
  handler: async (ctx) => {
    await requireBlastBodyRxAdmin(ctx);
    return seedStore(ctx);
  },
});

export const demoState = query({
  args: {},
  returns: demoStateValidator,
  handler: async (ctx) => {
    await requireBlastBodyRxAdmin(ctx);
    return readDemoState(ctx);
  },
});

export const setDemoMode = mutation({
  args: { enabled: v.boolean() },
  returns: demoStateValidator,
  handler: async (ctx, args) => {
    await requireBlastBodyRxAdmin(ctx);
    if (args.enabled) await ensureDemoData(ctx);
    else await clearDemoData(ctx);
    return readDemoState(ctx);
  },
});
