"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import {
  endSession,
  hashPassword,
  isAdminEmail,
  normalizeEmail,
  startSession,
  verifyPassword,
} from "@/lib/auth";

export type AuthState = { message?: string; email?: string; name?: string };

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.email("Enter a valid email address.").max(200),
  password: z.string().min(10, "Use at least 10 characters.").max(200),
});

export async function register(_prev: AuthState, form: FormData): Promise<AuthState> {
  const raw = {
    name: String(form.get("name") ?? ""),
    email: String(form.get("email") ?? ""),
    password: String(form.get("password") ?? ""),
  };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message, email: raw.email, name: raw.name };
  }
  const email = normalizeEmail(parsed.data.email);
  const db = getDb();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) {
    return { message: "An account with that email already exists. Sign in instead.", email, name: raw.name };
  }
  const [user] = await db
    .insert(users)
    .values({
      name: parsed.data.name,
      email,
      passwordHash: await hashPassword(parsed.data.password),
      role: isAdminEmail(email) ? "admin" : "customer",
    })
    .returning({ id: users.id });
  await startSession(user.id);
  redirect(safeNext(form.get("next")));
}

export async function login(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = normalizeEmail(String(form.get("email") ?? ""));
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { message: "Enter your email and password.", email };

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !valid) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { message: "That email and password don't match.", email };
  }
  // Promote owners listed in ADMIN_EMAILS on their next sign-in.
  if (user.role !== "admin" && isAdminEmail(email)) {
    await db.update(users).set({ role: "admin", updatedAt: new Date() }).where(eq(users.id, user.id));
  }
  await startSession(user.id);
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  await endSession();
  redirect("/");
}
