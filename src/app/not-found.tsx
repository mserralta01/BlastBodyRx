import Link from "next/link";
export default function NotFound() { return <main className="not-found"><div><span>404</span><h1>That record is not here.</h1><p>Return to the VirtualFitPath catalogue to continue.</p><Link className="button button--primary" href="/shop">Browse catalogue</Link></div></main>; }
