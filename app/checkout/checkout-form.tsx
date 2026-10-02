"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { packLabel } from "@/components/cart/cart-drawer";
import { useCart } from "@/components/cart/cart-provider";
import { formatCents } from "@/lib/pricing";
import { US_STATES } from "@/lib/site";
import { placeOrder, quoteCart, type Quote } from "./actions";

type Method = { id: "zelle" | "venmo" | "cashapp" | "paylink"; label: string; description: string; configured: boolean };

function Field({
  name,
  label,
  error,
  className = "",
  children,
}: {
  name: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-xs text-ember">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CheckoutForm({
  methods,
  previewMode,
  defaultEmail,
  defaultName,
  signedIn,
}: {
  methods: Method[];
  previewMode: boolean;
  defaultEmail: string;
  defaultName: string;
  signedIn: boolean;
}) {
  const router = useRouter();
  const cart = useCart();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [referral, setReferral] = useState("");
  const [appliedReferral, setAppliedReferral] = useState("");
  const [referralError, setReferralError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [method, setMethod] = useState<Method["id"]>(methods[0]?.id ?? "zelle");
  const [isPending, startTransition] = useTransition();
  const [isQuoting, startQuote] = useTransition();
  const errorRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState(false);

  const linesPayload = cart.lines.map((line) => ({
    variantId: line.variantId,
    packSize: line.packSize,
    quantity: line.quantity,
  }));
  const linesKey = JSON.stringify(linesPayload);

  useEffect(() => {
    if (!cart.ready || cart.lines.length === 0 || placed) return;
    startQuote(async () => {
      const result = await quoteCart(JSON.parse(linesKey), appliedReferral);
      if (!result.ok && result.field === "referralCode") {
        setReferralError(result.message);
        setAppliedReferral("");
        return;
      }
      setQuote(result);
    });
  }, [cart.ready, linesKey, appliedReferral, cart.lines.length, placed]);

  function applyReferral() {
    setReferralError(null);
    setAppliedReferral(referral.trim().toUpperCase());
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      address1: String(form.get("address1") ?? ""),
      address2: String(form.get("address2") ?? ""),
      city: String(form.get("city") ?? ""),
      state: String(form.get("state") ?? ""),
      postalCode: String(form.get("postalCode") ?? ""),
      paymentMethod: method,
      referralCode: appliedReferral,
      acknowledge: form.get("acknowledge") === "on",
      lines: linesPayload,
    };
    setFormError(null);
    setErrors({});
    startTransition(async () => {
      const result = await placeOrder(payload);
      if (result.ok) {
        setPlaced(true);
        cart.clear();
        router.push(`/order/${result.reference}?key=${encodeURIComponent(result.token)}`);
        return;
      }
      setErrors(result.fieldErrors ?? {});
      setFormError(result.message);
      requestAnimationFrame(() => errorRef.current?.focus());
    });
  }

  if (cart.ready && cart.lines.length === 0 && !placed) {
    return (
      <div className="mt-12 max-w-xl border hairline bg-onyx p-8">
        <p className="font-serif text-3xl text-gold-100 italic">Your cart is empty.</p>
        <p className="mt-3 text-sm leading-6 text-stone">Add research materials from the catalog to check out.</p>
        <Link href="/shop" className="btn-gold mt-8">Browse the catalog</Link>
      </div>
    );
  }

  const quoted = quote?.ok ? quote : null;
  const lineTotal = (variantId: string, packSize: number, fallback: number) =>
    quoted?.lines.find((line) => line.variantId === variantId && line.packSize === packSize)
      ?.lineTotalCents ?? fallback;
  const invalid = (name: string) => (errors[name] ? true : undefined);
  const described = (name: string) => (errors[name] ? `${name}-error` : undefined);

  return (
    <form
      onSubmit={submit}
      onInput={(event) => {
        const name = (event.target as HTMLInputElement).name;
        if (name && errors[name]) {
          setErrors((current) => {
            const next = { ...current };
            delete next[name];
            return next;
          });
        }
      }}
      noValidate
      className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-16">
      <div className="space-y-12">
        {formError ? (
          <div ref={errorRef} tabIndex={-1} role="alert" className="border border-ember/40 bg-ember/5 p-4 text-sm text-ember outline-none">
            {formError}
          </div>
        ) : null}

        <section aria-labelledby="contact-heading">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="contact-heading" className="font-display text-xl tracking-[0.06em] text-gold-100">
              <span className="mr-3 text-ash">01</span>Contact
            </h2>
            {!signedIn ? (
              <Link href="/account/login?next=/checkout" className="text-xs text-stone underline decoration-gold-400/40 underline-offset-4 hover:text-gold-100">
                Sign in for order history
              </Link>
            ) : null}
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field name="email" label="Email" error={errors.email}>
              <input id="email" name="email" type="email" required autoComplete="email" defaultValue={defaultEmail} className="field" aria-invalid={invalid("email")} aria-describedby={described("email")} />
            </Field>
            <Field name="phone" label="Phone" error={errors.phone}>
              <input id="phone" name="phone" type="tel" required autoComplete="tel" className="field" aria-invalid={invalid("phone")} aria-describedby={described("phone")} />
            </Field>
          </div>
        </section>

        <section aria-labelledby="shipping-heading">
          <h2 id="shipping-heading" className="font-display text-xl tracking-[0.06em] text-gold-100">
            <span className="mr-3 text-ash">02</span>Shipping address
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-6">
            <Field name="fullName" label="Full name" error={errors.fullName} className="sm:col-span-6">
              <input id="fullName" name="fullName" required autoComplete="shipping name" defaultValue={defaultName} className="field" aria-invalid={invalid("fullName")} aria-describedby={described("fullName")} />
            </Field>
            <Field name="address1" label="Street address" error={errors.address1} className="sm:col-span-6">
              <input id="address1" name="address1" required autoComplete="shipping address-line1" className="field" aria-invalid={invalid("address1")} aria-describedby={described("address1")} />
            </Field>
            <Field name="address2" label="Apartment, suite (optional)" className="sm:col-span-6">
              <input id="address2" name="address2" autoComplete="shipping address-line2" className="field" />
            </Field>
            <Field name="city" label="City" error={errors.city} className="sm:col-span-2">
              <input id="city" name="city" required autoComplete="shipping address-level2" className="field" aria-invalid={invalid("city")} aria-describedby={described("city")} />
            </Field>
            <Field name="state" label="State" error={errors.state} className="sm:col-span-2">
              <select id="state" name="state" required autoComplete="shipping address-level1" defaultValue="" className="field px-3" aria-invalid={invalid("state")} aria-describedby={described("state")}>
                <option value="" disabled>—</option>
                {US_STATES.map(([code, name]) => (
                  <option key={code} value={code}>{code} — {name}</option>
                ))}
              </select>
            </Field>
            <Field name="postalCode" label="ZIP" error={errors.postalCode} className="sm:col-span-2">
              <input id="postalCode" name="postalCode" required inputMode="numeric" autoComplete="shipping postal-code" className="field" aria-invalid={invalid("postalCode")} aria-describedby={described("postalCode")} />
            </Field>
          </div>
          <p className="mt-3 text-xs text-ash">We currently ship within the United States.</p>
        </section>

        <section aria-labelledby="payment-heading">
          <h2 id="payment-heading" className="font-display text-xl tracking-[0.06em] text-gold-100">
            <span className="mr-3 text-ash">03</span>Payment method
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone">
            Payment is completed after you place the order. You will receive the exact amount,
            destination and your order ID to include as the memo.
          </p>
          {previewMode ? (
            <p className="mt-4 border border-gold-400/30 bg-gold-400/5 p-3 text-xs leading-5 text-gold-100">
              Preview deployment: methods marked “not configured” record a test order but show no
              payment destination. No payment can be collected on this preview.
            </p>
          ) : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method" aria-describedby={described("paymentMethod")}>
            {methods.map((option) => {
              const active = option.id === method;
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${active ? "border-gold-300 bg-gold-400/8" : "hairline hover:border-gold-400/45"}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.id}
                    checked={active}
                    onChange={() => setMethod(option.id)}
                    className="mt-1 accent-[#d9b672]"
                  />
                  <span>
                    <span className="block text-sm font-medium tracking-[0.04em] text-ivory">
                      {option.label}
                      {!option.configured ? (
                        <span className="ml-2 text-[0.625rem] tracking-[0.18em] text-ember uppercase">not configured</span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-stone">{option.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.paymentMethod ? <p id="paymentMethod-error" className="mt-2 text-xs text-ember">{errors.paymentMethod}</p> : null}
        </section>

        <section aria-labelledby="ack-heading">
          <h2 id="ack-heading" className="font-display text-xl tracking-[0.06em] text-gold-100">
            <span className="mr-3 text-ash">04</span>Confirm
          </h2>
          <label className={`mt-6 flex cursor-pointer gap-3 border p-4 text-sm leading-6 ${errors.acknowledge ? "border-ember/50" : "hairline"}`}>
            <input type="checkbox" name="acknowledge" required className="mt-1 h-4 w-4 shrink-0 accent-[#d9b672]" aria-invalid={invalid("acknowledge")} aria-describedby={described("acknowledge")} />
            <span className="text-parchment">
              I am 21 or older and I am purchasing these materials strictly for laboratory research.
              They are not for human or animal consumption. I agree to the{" "}
              <Link href="/terms" className="text-gold-100 underline decoration-gold-400/40 underline-offset-4" target="_blank">terms of sale</Link>{" "}
              and{" "}
              <Link href="/research-use" className="text-gold-100 underline decoration-gold-400/40 underline-offset-4" target="_blank">research use policy</Link>.
            </span>
          </label>
          {errors.acknowledge ? <p id="acknowledge-error" className="mt-2 text-xs text-ember">{errors.acknowledge}</p> : null}
        </section>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start" aria-labelledby="summary-heading">
        <div className="panel p-6 sm:p-7">
          <h2 id="summary-heading" className="eyebrow">Order summary</h2>
          <ul className="mt-5 divide-y divide-gold-400/10">
            {cart.lines.map((line) => (
              <li key={line.id} className="flex justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <p className="font-display text-sm tracking-[0.05em] text-ivory">{line.productName}</p>
                  <p className="mt-0.5 text-xs text-stone">
                    {line.variantLabel} · {packLabel(line.packSize)} × {line.quantity}
                  </p>
                </div>
                <p className="text-sm text-parchment tabular-nums">
                  {formatCents(lineTotal(line.variantId, line.packSize, cart.lineTotals[line.id] ?? 0))}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t hairline pt-5">
            <label htmlFor="referralCode" className="label">Referral code</label>
            <div className="flex gap-2">
              <input
                id="referralCode"
                value={referral}
                onChange={(event) => setReferral(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyReferral();
                  }
                }}
                autoComplete="off"
                className="field min-h-11 uppercase"
                aria-invalid={referralError ? true : undefined}
                aria-describedby={referralError ? "referral-error" : undefined}
              />
              <button type="button" onClick={applyReferral} className="btn-ghost min-h-11 px-4" disabled={isQuoting || !referral.trim()}>
                Apply
              </button>
            </div>
            {referralError ? <p id="referral-error" className="mt-1.5 text-xs text-ember">{referralError}</p> : null}
            {quoted?.referralCode ? <p className="mt-1.5 text-xs text-sage">Code {quoted.referralCode} applied.</p> : null}
          </div>

          <dl className="mt-5 space-y-2.5 border-t hairline pt-5 text-sm">
            <div className="flex justify-between text-stone">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatCents(quoted?.subtotalCents ?? cart.subtotalCents)}</dd>
            </div>
            {quoted && quoted.discountCents > 0 ? (
              <div className="flex justify-between text-sage">
                <dt>Referral discount</dt>
                <dd className="tabular-nums">−{formatCents(quoted.discountCents)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between text-stone">
              <dt>Shipping</dt>
              <dd className="tabular-nums">
                {quoted ? (quoted.shippingCents === 0 ? "Free" : formatCents(quoted.shippingCents)) : "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t hairline pt-4">
              <dt className="eyebrow text-stone">Total</dt>
              <dd className="font-display text-3xl text-gilt tabular-nums">
                {quoted ? formatCents(quoted.totalCents) : "—"}
              </dd>
            </div>
          </dl>
          {quote && !quote.ok ? (
            <p role="alert" className="mt-4 text-xs leading-5 text-ember">{quote.message}</p>
          ) : null}

          <button type="submit" className="btn-gold mt-6 w-full" disabled={isPending || !quoted || isQuoting}>
            {isPending ? "Placing order…" : quoted ? `Place order · ${formatCents(quoted.totalCents)}` : "Pricing your cart…"}
          </button>
          <p className="mt-3 text-center text-[0.6875rem] leading-5 text-ash">
            No payment is taken on this page.
          </p>
        </div>
      </aside>
    </form>
  );
}
