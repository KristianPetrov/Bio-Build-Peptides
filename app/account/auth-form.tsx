"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register, type AuthState } from "./actions";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    mode === "login" ? login : register,
    {},
  );
  const isRegister = mode === "register";

  return (
    <form action={action} className="panel space-y-5 p-6 sm:p-8">
      <input type="hidden" name="next" value={next ?? "/account"} />
      {isRegister ? (
        <div>
          <label htmlFor="name" className="label">Name</label>
          <input id="name" name="name" required autoComplete="name" defaultValue={state.name} className="field" />
        </div>
      ) : null}
      <div>
        <label htmlFor="auth-email" className="label">Email</label>
        <input id="auth-email" name="email" type="email" required autoComplete="email" defaultValue={state.email} className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={isRegister ? 10 : undefined}
          autoComplete={isRegister ? "new-password" : "current-password"}
          className="field"
          aria-describedby={isRegister ? "password-hint" : undefined}
        />
        {isRegister ? (
          <p id="password-hint" className="mt-1.5 text-xs text-ash">At least 10 characters.</p>
        ) : null}
      </div>
      {state.message ? (
        <p role="alert" className="text-sm text-ember">{state.message}</p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-gold w-full">
        {pending ? "One moment…" : isRegister ? "Create account" : "Sign in"}
      </button>
      <p className="text-center text-sm text-stone">
        {isRegister ? (
          <>Already registered? <Link href={`/account/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-gold-100 underline decoration-gold-400/40 underline-offset-4">Sign in</Link></>
        ) : (
          <>New here? <Link href={`/account/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-gold-100 underline decoration-gold-400/40 underline-offset-4">Create an account</Link></>
        )}
      </p>
      {!isRegister ? (
        <p className="text-center text-xs text-ash">
          Forgot your password? <Link href="/contact" className="underline underline-offset-4 hover:text-parchment">Contact us</Link> and we&apos;ll help you regain access.
        </p>
      ) : null}
    </form>
  );
}
