"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState, useSyncExternalStore } from "react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { AdminDashboard } from "@/components/admin-dashboard";

const subscribeToLocation = () => () => undefined;
const readInvitationId = () => new URLSearchParams(window.location.search).get("invite") ?? "";
const readServerInvitationId = () => "";

export function AdminAccess() {
  return <>
    <AuthLoading><AdminAuthShell><div className="admin-auth-loading">Checking your BlastBodyRx session…</div></AdminAuthShell></AuthLoading>
    <Unauthenticated><AdminSignIn /></Unauthenticated>
    <Authenticated><AdminGate /></Authenticated>
  </>;
}

function AdminGate() {
  const viewer = useQuery(api.adminAuth.viewer);
  const claimOwner = useMutation(api.adminAuth.claimOwner);
  const acceptInvitation = useMutation(api.adminAuth.acceptInvitation);
  const { signOut } = useAuthActions();
  const [setupCode, setSetupCode] = useState("");
  const [notice, setNotice] = useState("");
  const [working, setWorking] = useState(false);
  const invitationId = useSyncExternalStore(subscribeToLocation, readInvitationId, readServerInvitationId);

  if (!viewer) return <AdminAuthShell><div className="admin-auth-loading">Loading your BlastBodyRx account…</div></AdminAuthShell>;
  if (viewer.isAdmin) return <AdminDashboard />;

  async function acceptAdminInvite() {
    setWorking(true); setNotice("");
    try {
      if (!invitationId) throw new Error("Open the secure invitation link supplied by a BlastBodyRx administrator");
      await acceptInvitation({ invitationId: invitationId as Id<"adminInvitations"> });
    }
    catch (error) { setNotice(error instanceof Error ? error.message : "Administrator access could not be activated"); }
    finally { setWorking(false); }
  }

  async function claim(event: FormEvent) {
    event.preventDefault();
    setWorking(true); setNotice("");
    try { await claimOwner({ setupCode }); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Owner access could not be activated"); }
    finally { setWorking(false); }
  }

  if (invitationId) {
    return <AdminAuthShell><div className="admin-auth-card"><ShieldCheck /><span className="admin-auth-kicker">Secure administrator invitation</span><h1>Join BlastBodyRx operations.</h1><p>Activate this invitation for {viewer.email} to manage the store with the rest of the team.</p>{notice && <div className="admin-auth-error" role="alert">{notice}</div>}<button type="button" className="admin-auth-primary" disabled={working} onClick={() => void acceptAdminInvite()}><KeyRound />{working ? "Activating…" : "Activate administrator access"}</button><button className="admin-auth-secondary" onClick={() => void signOut()}>Sign out</button></div></AdminAuthShell>;
  }

  return <AdminAuthShell><div className="admin-auth-card"><ShieldCheck /><span className="admin-auth-kicker">Signed in as {viewer.email}</span><h1>{viewer.hasOwner ? "This account is not authorized." : "Activate the BlastBodyRx owner account."}</h1><p>{viewer.hasOwner ? "Ask a BlastBodyRx administrator to invite this email from Settings → Admin users." : "Enter the one-time owner setup code to protect product, order, and customer data."}</p>{!viewer.hasOwner && <form onSubmit={claim}><label><span>Owner setup code</span><input type="password" value={setupCode} onChange={(event) => setSetupCode(event.target.value)} autoComplete="one-time-code" required /></label>{notice && <div className="admin-auth-error" role="alert">{notice}</div>}<button type="submit" disabled={working || !setupCode}><KeyRound />{working ? "Activating…" : "Activate owner access"}</button></form>}{notice && viewer.hasOwner && <div className="admin-auth-error" role="alert">{notice}</div>}<button className="admin-auth-secondary" onClick={() => void signOut()}>Sign out</button></div></AdminAuthShell>;
}

function AdminSignIn() {
  const { signIn } = useAuthActions();
  const ownerExists = useQuery(api.adminAuth.ownerExists);
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [notice, setNotice] = useState("");
  const [working, setWorking] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true); setNotice("");
    const data = new FormData(event.currentTarget);
    data.set("flow", flow);
    try { await signIn("password", data); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Sign-in was not successful"); }
    finally { setWorking(false); }
  }

  return <AdminAuthShell><div className="admin-auth-card"><LockKeyhole /><span className="admin-auth-kicker">Independent BlastBodyRx account</span><h1>{flow === "signIn" ? "Sign in to operations." : "Create your BlastBodyRx account."}</h1><p>Manage products, inventory, orders, customers, discounts, certificates, and store settings.</p><form onSubmit={submit}>{flow === "signUp" && <label><span>Name</span><input name="name" autoComplete="name" required /></label>}<label><span>Email address</span><input name="email" type="email" autoComplete="email" required /></label><label><span>Password</span><input name="password" type="password" autoComplete={flow === "signIn" ? "current-password" : "new-password"} minLength={12} required /></label>{flow === "signUp" && <small>Use at least 12 characters with uppercase, lowercase, and a number. New accounts need an administrator invitation unless this is the first owner.</small>}{notice && <div className="admin-auth-error" role="alert">{notice}</div>}<button type="submit" disabled={working}><LockKeyhole />{working ? "Please wait…" : flow === "signIn" ? "Sign in" : "Create account"}</button></form><button className="admin-auth-secondary" onClick={() => { setFlow(flow === "signIn" ? "signUp" : "signIn"); setNotice(""); }}>{flow === "signIn" ? ownerExists === false ? "Create the first BlastBodyRx account" : "Create an invited administrator account" : "I already have an account"}</button></div></AdminAuthShell>;
}

function AdminAuthShell({ children }: { children: React.ReactNode }) {
  return <main className="admin-auth-page"><div className="admin-auth-brand"><Image src="/assets/brand/blastbodyrx-wordmark.svg" alt="BlastBodyRx" width={234} height={38} priority /><span>OPERATIONS</span></div>{children}<Link href="/"><ArrowLeft /> Return to storefront</Link></main>;
}
