export const BRAND = {
  name: "Bio Build Peptides",
  short: "Bio Build",
  tagline: "Build Better Biology",
  orderPrefix: "BB",
  cartKey: "bb-cart-v1",
  ageKey: "bb-age-21-v1",
} as const;

export const RUO_NOTICE =
  "For research use only. Products are supplied strictly for in-vitro laboratory, academic or institutional research and are not for human or animal consumption, injection or diagnostic use.";

/** Shipping mirrors the Affordable Peptides policy until Bio Build confirms its own. */
export const SHIPPING = {
  flatRateCents: 1000,
  freeThresholdCents: 30000,
} as const;

export function shippingForSubtotal(subtotalCents: number) {
  if (subtotalCents <= 0) return 0;
  return subtotalCents >= SHIPPING.freeThresholdCents
    ? 0
    : SHIPPING.flatRateCents;
}

export function getContact() {
  const email = process.env.CONTACT_EMAIL?.trim() || null;
  const phone = process.env.CONTACT_PHONE?.trim() || null;
  return {
    email,
    phone,
    phoneHref: phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null,
  };
}

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export const US_STATES = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
  ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
  ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"],
  ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"],
  ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"],
  ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"],
  ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
  ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"],
  ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"],
  ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
] as const;
