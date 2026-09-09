import Link from "next/link";
import { StoreLayout } from "@/components/store-shell";

export function InfoPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children?: React.ReactNode }) {
  return <StoreLayout><main className="info-page"><section className="info-hero"><div className="container"><span className="eyebrow eyebrow--blue">{eyebrow}</span><h1>{title}</h1><p>{intro}</p></div></section><section className="container info-content">{children || <><h2>Documentation first, at every step.</h2><p>BlastBodyRx organizes research compounds by variant, label, batch, and certificate so your records stay clear from selection through delivery.</p><div className="info-callout"><strong>Research use only</strong><p>Products are not for human or animal consumption, therapeutic use, diagnostic use, or household use.</p></div><Link className="button button--navy" href="/shop">Browse research catalogue</Link></>}</section></main></StoreLayout>;
}
