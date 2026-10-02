import { asc, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { referralCodes, referralPartners } from "@/db/schema";
import { formatCents } from "@/lib/pricing";
import { CodeForm, PartnerForm, ToggleButton } from "./forms";

export const metadata = { title: "Referral codes" };

export default async function AdminReferralsPage() {
  const db = getDb();
  const [partners, codes] = await Promise.all([
    db.select().from(referralPartners).orderBy(asc(referralPartners.name)),
    db.select().from(referralCodes).orderBy(desc(referralCodes.createdAt)),
  ]);

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_22rem]">
      <div>
        <p className="max-w-2xl text-sm leading-6 text-stone">
          Every code belongs to a partner. Use a general partner such as “Promotions” for campaign
          codes. Discounts apply to the product subtotal; shipping is calculated after the discount.
        </p>
        {partners.length === 0 ? (
          <p className="mt-8 border hairline p-8 text-center text-stone">Create a partner to start issuing codes.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {partners.map((partner) => {
              const partnerCodes = codes.filter((code) => code.partnerId === partner.id);
              return (
                <li key={partner.id} className="border hairline">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-onyx px-5 py-4">
                    <div>
                      <p className="font-display text-lg tracking-[0.04em] text-ivory">{partner.name}</p>
                      <p className="text-xs text-stone">{partner.email ?? "No email"}{partner.notes ? ` · ${partner.notes}` : ""}</p>
                    </div>
                    <ToggleButton kind="partner" id={partner.id} active={partner.active} />
                  </div>
                  {partnerCodes.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-ash">No codes yet.</p>
                  ) : (
                    <ul className="divide-y divide-gold-400/10">
                      {partnerCodes.map((code) => (
                        <li key={code.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                          <span className="font-display tracking-[0.1em] text-gold-100">{code.code}</span>
                          <span className="text-parchment">
                            {code.discountType === "percent" ? `${code.discountValue}% off` : `${formatCents(code.discountValue)} off`}
                            {code.minSubtotalCents ? ` · min ${formatCents(code.minSubtotalCents)}` : ""}
                          </span>
                          <span className="text-stone">{code.usedCount} uses</span>
                          <ToggleButton kind="code" id={code.id} active={code.active} />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="space-y-6">
        <PartnerForm />
        {partners.length > 0 ? (
          <CodeForm partners={partners.map((partner) => ({ id: partner.id, name: partner.name }))} />
        ) : null}
      </div>
    </div>
  );
}
