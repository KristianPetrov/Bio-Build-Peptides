import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "../auth-form";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: PageProps<"/account/register">) {
  const { next } = await searchParams;
  const nextPath =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : undefined;
  if (await getCurrentUser()) redirect(nextPath ?? "/account");
  return (
    <AuthShell
      eyebrow="Account"
      title="Create an"
      accent="account"
      body="Orders placed while signed in are saved to your account, so you can review status, payment details and tracking in one place."
    >
      <AuthForm mode="register" next={nextPath} />
    </AuthShell>
  );
}
