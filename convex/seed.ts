import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
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

async function seedStore(ctx: MutationCtx) {
    const existing = await ctx.db.query("products").first();
    if (existing) return { seeded: false };
    const now = Date.now();
    for (const [slug, name, category, description, image, badge, variants] of products) {
      await ctx.db.insert("products", { slug, name, category, description, image, ...(badge ? { badge } : {}), featured: true, sortOrder: now, active: true, updatedAt: now, variants: variants.map(([sku, strength, price, inventory]) => ({ sku, strength, price, inventory, lowStockAt: 12, active: true })) });
    }
    await ctx.db.insert("storeSettings", { singleton: "main", storeName: "BlastBodyRx", supportPhone: "1-888-812-8690", legalName: "Ecom Blast LLC", freeShippingThreshold: 100, minimumOrder: 100, checkoutEnabled: false, announcement: "Free U.S. shipping on qualifying $100+ research orders", updatedAt: now });
    await ctx.db.insert("discounts", { code: "LAB10", type: "percent", amount: 10, active: true, usageCount: 0, startsAt: now });
    return { seeded: true };
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
