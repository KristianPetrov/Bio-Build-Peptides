import "server-only";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import { users, type User } from "@/db/schema";

const COOKIE = "bb_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.AUTH_SECRET?.trim();
  if (!value) throw new Error("AUTH_SECRET is not configured.");
  return new TextEncoder().encode(value);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isAdminEmail(email: string) {
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => normalizeEmail(item))
    .filter(Boolean);
  return list.includes(normalizeEmail(email));
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function startSession(userId: string) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export type SessionUser = Pick<User, "id" | "email" | "name" | "role">;

/** Current signed-in user, memoized per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token || !process.env.AUTH_SECRET) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    const [user] = await getDb()
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, payload.sub));
    return user ?? null;
  } catch {
    return null;
  }
});

export async function requireUser(next = "/account") {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?next=/admin");
  if (user.role !== "admin") redirect("/account");
  return user;
}
