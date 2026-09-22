"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { useMemo } from "react";
import { CartProvider } from "@/components/store-shell";

export function Providers({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    return url ? new ConvexReactClient(url) : null;
  }, []);

  if (!client) {
    return <main className="configuration-missing"><div><strong>BlastBodyRx</strong><h1>Store services are not connected.</h1><p>This environment needs a Convex deployment URL before the storefront and Operations workspace can load.</p></div></main>;
  }

  const content = <CartProvider>{children}</CartProvider>;
  return <ConvexAuthProvider client={client}>{content}</ConvexAuthProvider>;
}
