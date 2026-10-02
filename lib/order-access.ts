import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

/** Short-lived signed cookie that lets a verified track-order lookup view the order page. */
const COOKIE = "bb_order_access";

function secret() {
  const value = process.env.AUTH_SECRET?.trim();
  if (!value) throw new Error("AUTH_SECRET is not configured.");
  return new TextEncoder().encode(value);
}

export async function grantOrderAccess(reference: string) {
  const token = await new SignJWT({ ref: reference })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/order",
    maxAge: 60 * 60 * 2,
  });
}

export async function hasOrderAccess(reference: string) {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !process.env.AUTH_SECRET) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.ref === reference;
  } catch {
    return false;
  }
}
