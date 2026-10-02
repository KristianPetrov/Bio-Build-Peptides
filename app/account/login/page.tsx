import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "../auth-form";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/account/login">) {
  const { next } = await searchParams;
  const nextPath =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : undefined;
  if (await getCurrentUser()) redirect(nextPath ?? "/account");
  return (
    <AuthShell
      eyebrow="Account"
      title="Welcome"
      accent="back"
      body="Sign in to see your order history and check out faster. Guest checkout remains available at any time."
    >
      <AuthForm mode="login" next={nextPath} />
    </AuthShell>
  );
}
