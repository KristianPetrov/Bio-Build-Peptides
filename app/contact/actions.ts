"use server";

import { z } from "zod";
import { getDb } from "@/db";
import { contactMessages } from "@/db/schema";
import { CONTACT_TOPICS } from "@/lib/contact";

export type ContactState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.email("Enter a valid email.").max(200),
  topic: z.enum(CONTACT_TOPICS, "Choose a topic."),
  orderReference: z.string().trim().max(20).optional(),
  message: z.string().trim().min(10, "Tell us a little more (10+ characters).").max(4000),
});

export async function sendContactMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  const values = {
    name: String(form.get("name") ?? ""),
    email: String(form.get("email") ?? ""),
    topic: String(form.get("topic") ?? ""),
    orderReference: String(form.get("orderReference") ?? ""),
    message: String(form.get("message") ?? ""),
  };
  // Honeypot: real visitors never see or fill this field.
  if (String(form.get("company") ?? "")) return { ok: true, message: "Thank you — your message has been received." };

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { errors, values, message: "Please review the highlighted fields." };
  }
  try {
    await getDb().insert(contactMessages).values({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      topic: parsed.data.topic,
      orderReference: parsed.data.orderReference?.toUpperCase() || null,
      message: parsed.data.message,
    });
  } catch (error) {
    console.error("contact insert failed", error);
    return { values, message: "We couldn't send your message. Please try again." };
  }
  return { ok: true, message: "Thank you — your message has been received. We'll reply by email." };
}
