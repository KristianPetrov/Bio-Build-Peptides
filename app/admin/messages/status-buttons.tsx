"use client";

import { useTransition } from "react";
import { setMessageStatus } from "../actions";

export function MessageStatusButtons({ id, status }: { id: string; status: "new" | "read" | "archived" }) {
  const [pending, startTransition] = useTransition();
  const button = "border hairline px-3 py-1.5 text-[0.5625rem] tracking-[0.2em] uppercase text-gold-100 hover:border-gold-300 disabled:opacity-40";
  return (
    <div className="flex gap-2">
      {status === "new" ? (
        <button type="button" className={button} disabled={pending} onClick={() => startTransition(() => setMessageStatus(id, "read"))}>
          Mark read
        </button>
      ) : null}
      <button type="button" className={button} disabled={pending} onClick={() => startTransition(() => setMessageStatus(id, "archived"))}>
        Archive
      </button>
    </div>
  );
}
