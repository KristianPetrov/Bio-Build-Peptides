import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "paid",
  "shipped",
  "cancelled",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "zelle",
  "venmo",
  "cashapp",
  "paylink",
]);
export const containerEnum = pgEnum("container", ["vial_3ml", "vial_10ml"]);
export const discountTypeEnum = pgEnum("discount_type", ["percent", "fixed"]);
export const messageStatusEnum = pgEnum("message_status", [
  "new",
  "read",
  "archived",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("customer"),
  ...timestamps,
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  classification: text("classification").notNull(),
  summary: text("summary").notNull(),
  composition: text("composition"),
  categories: text("categories").array().notNull().default([]),
  molecules: text("molecules").array().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    priceCents: integer("price_cents").notNull(),
    pack5Cents: integer("pack5_cents"),
    pack10Cents: integer("pack10_cents"),
    /** When true, loose single vials of the same variant earn the 5/10 pack rate. */
    volumePricing: boolean("volume_pricing").notNull().default(true),
    container: containerEnum("container").notNull().default("vial_3ml"),
    /** Units on hand. `null` means inventory is not tracked for this variant. */
    stock: integer("stock"),
    coaUrl: text("coa_url"),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("product_variants_product_label_idx").on(
      table.productId,
      table.label,
    ),
  ],
);

export const referralPartners = pgTable("referral_partners", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email"),
  notes: text("notes"),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

export const referralCodes = pgTable("referral_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  partnerId: uuid("partner_id")
    .notNull()
    .references(() => referralPartners.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(),
  discountType: discountTypeEnum("discount_type").notNull(),
  /** Percent (0–100) or fixed amount in cents. */
  discountValue: integer("discount_value").notNull(),
  minSubtotalCents: integer("min_subtotal_cents").notNull().default(0),
  active: boolean("active").notNull().default(true),
  usedCount: integer("used_count").notNull().default(0),
  ...timestamps,
});

export type ShippingAddress = {
  fullName: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull().unique(),
    accessTokenHash: text("access_token_hash").notNull(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    email: text("email").notNull(),
    status: orderStatusEnum("status").notNull().default("pending_payment"),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    subtotalCents: integer("subtotal_cents").notNull(),
    discountCents: integer("discount_cents").notNull().default(0),
    shippingCents: integer("shipping_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    referralCodeId: uuid("referral_code_id").references(
      () => referralCodes.id,
      { onDelete: "set null" },
    ),
    referralCode: text("referral_code"),
    shippingAddress: jsonb("shipping_address")
      .$type<ShippingAddress>()
      .notNull(),
    carrier: text("carrier"),
    trackingNumber: text("tracking_number"),
    adminNotes: text("admin_notes"),
    researchAcknowledgedAt: timestamp("research_acknowledged_at", {
      withTimezone: true,
    }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    inventoryReleasedAt: timestamp("inventory_released_at", {
      withTimezone: true,
    }),
    ...timestamps,
  },
  (table) => [
    index("orders_email_idx").on(table.email),
    index("orders_user_idx").on(table.userId),
    index("orders_status_idx").on(table.status),
  ],
);

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => productVariants.id, {
    onDelete: "set null",
  }),
  productSlug: text("product_slug").notNull(),
  productName: text("product_name").notNull(),
  variantLabel: text("variant_label").notNull(),
  /** Vials per pack: 1, 5 or 10. */
  packSize: integer("pack_size").notNull(),
  /** Number of packs. */
  quantity: integer("quantity").notNull(),
  lineTotalCents: integer("line_total_cents").notNull(),
  /** Units deducted from tracked inventory (0 when the variant is untracked). */
  reservedUnits: integer("reserved_units").notNull().default(0),
});

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  orderReference: text("order_reference"),
  topic: text("topic").notNull(),
  message: text("message").notNull(),
  status: messageStatusEnum("status").notNull().default("new"),
  ...timestamps,
});

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type ReferralPartner = typeof referralPartners.$inferSelect;
export type ReferralCode = typeof referralCodes.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type OrderStatus = Order["status"];
export type PaymentMethodId = Order["paymentMethod"];
