import { desc, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { contactMessages } from "@/db/schema";
import { MessageStatusButtons } from "./status-buttons";

export const metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const messages = await getDb()
    .select()
    .from(contactMessages)
    .where(ne(contactMessages.status, "archived"))
    .orderBy(desc(contactMessages.createdAt))
    .limit(200);

  if (messages.length === 0) {
    return <p className="border hairline p-10 text-center text-stone">No messages. Contact-form submissions appear here.</p>;
  }

  return (
    <ul className="space-y-4">
      {messages.map((message) => (
        <li key={message.id} className={`border p-5 ${message.status === "new" ? "border-gold-400/50 bg-gold-400/5" : "hairline"}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-ivory">
                {message.name} · <a href={`mailto:${message.email}`} className="text-gold-100 hover:underline">{message.email}</a>
              </p>
              <p className="mt-1 text-xs tracking-[0.12em] text-stone uppercase">
                {message.topic}
                {message.orderReference ? ` · ${message.orderReference}` : ""} ·{" "}
                {message.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <MessageStatusButtons id={message.id} status={message.status} />
          </div>
          <p className="mt-4 text-sm leading-7 whitespace-pre-wrap text-parchment">{message.message}</p>
        </li>
      ))}
    </ul>
  );
}
