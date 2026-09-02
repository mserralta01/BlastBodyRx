"use client";

import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { Activity, BadgePercent, Boxes, ChevronRight, ClipboardCheck, FlaskConical, LayoutDashboard, Menu, PackageSearch, Search, Settings, ShoppingCart, Users, X } from "lucide-react";
import { money } from "@/lib/catalog";
import { VirtualFitPathVial } from "@/components/virtualfitpath-vial";

type View = "overview" | "products" | "orders" | "customers" | "discounts" | "batches" | "settings";
const nav: Array<[View, string, typeof LayoutDashboard]> = [["overview", "Overview", LayoutDashboard], ["products", "Products & inventory", Boxes], ["orders", "Orders", ShoppingCart], ["customers", "Customers", Users], ["discounts", "Discounts", BadgePercent], ["batches", "Batch certificates", FlaskConical], ["settings", "Store settings", Settings]];
const orderDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export function AdminDashboard() {
  const { signOut } = useAuthActions();
  const [view, setView] = useState<View>("overview");
  const [sidebar, setSidebar] = useState(false);
  const products = useQuery(api.catalog.list);
  const orders = useQuery(api.orders.list);
  const customers = useQuery(api.admin.customers);
  const discounts = useQuery(api.admin.discounts);
  const batches = useQuery(api.admin.batches);
  const settings = useQuery(api.admin.settings);
  const overview = useQuery(api.dashboard.overview);
  const seed = useMutation(api.seed.run);
  const updateInventory = useMutation(api.catalog.updateInventory);
  const updateStatus = useMutation(api.orders.updateStatus);

  const selectView = (next: View) => { setView(next); setSidebar(false); };
  const currentLabel = nav.find(([id]) => id === view)?.[1];
  return <div className="admin-shell"><aside className={`admin-sidebar ${sidebar ? "is-open" : ""}`}><div className="admin-brand"><Image src="/assets/brand/virtualfitpath-wordmark.svg" width={234} height={38} alt="VirtualFitPath" /><span>OPERATIONS</span><button onClick={() => setSidebar(false)} aria-label="Close navigation"><X /></button></div><nav>{nav.map(([id, label, Icon]) => <button className={view === id ? "is-active" : ""} onClick={() => selectView(id)} key={id}><Icon />{label}<ChevronRight /></button>)}</nav><div className="admin-sidebar__foot"><Link href="/">View storefront</Link><span>Convex operational console</span></div></aside><div className="admin-overlay" onClick={() => setSidebar(false)} />
    <div className="admin-main"><header className="admin-topbar"><div><button className="admin-menu" onClick={() => setSidebar(true)}><Menu /></button><span>{currentLabel}</span></div><label><Search /><input placeholder="Search operations" /></label><div className="environment"><span /> VirtualFitPath Cloud</div><button className="admin-signout" onClick={() => void signOut()}>Sign out</button></header><main className="admin-content">
      {!products?.length && <section className="seed-banner"><div><ClipboardCheck /><span><strong>Initialize the VirtualFitPath catalogue</strong>Seed 12 products, 24 variants, store settings, and a starter discount.</span></div><button onClick={() => seed()}>Seed Convex data</button></section>}
      {view === "overview" && <><div className="admin-heading"><div><span className="admin-kicker">Live operations</span><h1>Good afternoon, Matt.</h1><p>Here is what is happening across VirtualFitPath today.</p></div><button className="admin-primary" onClick={() => setView("orders")}>Review orders</button></div><div className="stat-grid">{[["Gross revenue", money(overview?.revenue || 0), "+12.4%", Activity], ["Orders", String(overview?.orders || 0), "All time", ShoppingCart], ["Customers", String(overview?.customers || 0), "Unique buyers", Users], ["Low stock", String(overview?.lowStock || 0), "Needs attention", PackageSearch]].map(([label, value, hint, Icon]) => <article key={String(label)}><div><span>{label as string}</span><Icon /></div><strong>{value as string}</strong><small>{hint as string}</small></article>)}</div><section className="admin-panel"><div className="panel-heading"><div><h2>Recent orders</h2><p>Latest customer activity across the store.</p></div><button onClick={() => setView("orders")}>View all</button></div><OrderTable orders={overview?.recentOrders || []} onStatus={updateStatus} /></section></>}
      {view === "products" && <section className="admin-panel"><div className="panel-heading"><div><h1>Products & inventory</h1><p>Control availability and stock at the SKU level.</p></div><span>{products?.length || 0} compounds</span></div><div className="inventory-list">{products?.map((product) => <article key={product._id}><VirtualFitPathVial name={product.name} strength={product.variants[0]?.strength || ""} /><div className="inventory-product"><strong>{product.name}</strong><span>{product.category} · {product.active ? "Active" : "Hidden"}</span></div><div className="variant-stock">{product.variants.map((variant) => <label key={variant.sku}><span><strong>{variant.strength}</strong>{variant.sku}</span><input type="number" min="0" defaultValue={variant.inventory} onBlur={(event) => { const inventory = event.currentTarget.valueAsNumber; if (Number.isFinite(inventory)) void updateInventory({ productId: product._id, sku: variant.sku, inventory }); }} /><small>units</small></label>)}</div></article>)}</div></section>}
      {view === "orders" && <section className="admin-panel"><div className="panel-heading"><div><h1>Orders</h1><p>Track payment, fulfillment, cancellations, and refunds.</p></div><span>{orders?.length || 0} total</span></div><OrderTable orders={orders || []} onStatus={updateStatus} /></section>}
      {view === "customers" && <section className="admin-panel"><div className="panel-heading"><div><h1>Customers</h1><p>Buyer history and lifetime value in one view.</p></div></div><div className="customer-grid">{customers?.map((customer) => <article key={customer._id}><div className="avatar">{customer.firstName[0]}{customer.lastName[0]}</div><div><strong>{customer.firstName} {customer.lastName}</strong><span>{customer.email}</span></div><div><strong>{customer.orderCount}</strong><span>orders</span></div><div><strong>{money(customer.lifetimeValue)}</strong><span>lifetime value</span></div></article>)}</div></section>}
      {view === "discounts" && <section className="admin-panel"><div className="panel-heading"><div><h1>Discounts</h1><p>Promotions with usage and availability controls.</p></div></div><div className="discount-grid">{discounts?.map((discount) => <article key={discount._id}><BadgePercent /><div><strong>{discount.code}</strong><span>{discount.type === "percent" ? `${discount.amount}% off` : `${money(discount.amount)} off`}</span></div><div><strong>{discount.usageCount}</strong><span>uses</span></div><b className={discount.active ? "status status--active" : "status"}>{discount.active ? "Active" : "Inactive"}</b></article>)}</div></section>}
      {view === "batches" && <section className="admin-panel"><div className="panel-heading"><div><h1>Batch certificates</h1><p>Publish searchable compound and lot documentation.</p></div><span>{batches?.length || 0} records</span></div>{!batches?.length ? <div className="admin-empty"><FlaskConical /><h3>No certificates yet</h3><p>Add lot records and hosted PDF links before publishing the library.</p></div> : <div>{batches.map((batch) => <article key={batch._id}>{batch.compound} {batch.lotNumber}</article>)}</div>}</section>}
      {view === "settings" && <section className="admin-panel settings-panel"><div className="panel-heading"><div><h1>Store settings</h1><p>Checkout rules, support identity, and customer messaging.</p></div></div><div className="settings-readout"><div><span>Store name</span><strong>{settings?.storeName || "VirtualFitPath"}</strong></div><div><span>Legal name</span><strong>{settings?.legalName || "Virtual Fit Path, LLC"}</strong></div><div><span>Support phone</span><strong>{settings?.supportPhone || "800-637-9046"}</strong></div><div><span>Minimum order</span><strong>{money(settings?.minimumOrder || 100)}</strong></div><div><span>Free shipping threshold</span><strong>{money(settings?.freeShippingThreshold || 100)}</strong></div><div><span>Checkout status</span><strong className={settings?.checkoutEnabled ? "online" : "offline"}>{settings?.checkoutEnabled ? "Enabled" : "Disabled until payment configuration"}</strong></div></div></section>}
    </main></div>
  </div>;
}

type OrderStatus = Doc<"orders">["status"];

function OrderTable({ orders, onStatus }: { orders: Array<Doc<"orders">>; onStatus: (args: { orderId: Id<"orders">; status: OrderStatus }) => Promise<unknown> }) {
  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Items</th><th>Total</th><th>Created</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td data-label="Order"><strong>{order.orderNumber}</strong></td><td data-label="Customer"><strong>{order.customerName}</strong><span>{order.customerEmail}</span></td><td data-label="Status"><select value={order.status} onChange={(event) => onStatus({ orderId: order._id, status: event.target.value as OrderStatus })}><option value="pending">Pending</option><option value="paid">Paid</option><option value="fulfilled">Fulfilled</option><option value="cancelled">Cancelled</option><option value="refunded">Refunded</option></select></td><td data-label="Items">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td><td data-label="Total"><strong>{money(order.total)}</strong></td><td data-label="Created">{orderDate.format(order.createdAt)}</td></tr>)}</tbody></table>{!orders.length && <div className="admin-empty"><ShoppingCart /><h3>No orders yet</h3><p>New checkout attempts will appear here.</p></div>}</div>;
}
