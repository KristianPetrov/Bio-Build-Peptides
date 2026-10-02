import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Bio Build" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  return (
    <div className="mx-auto max-w-[1320px] px-5 pt-10 pb-28 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b hairline pb-6">
        <div>
          <p className="eyebrow">Operations</p>
          <h1 className="mt-2 font-display text-3xl tracking-[0.04em] text-ivory">Admin</h1>
        </div>
        <p className="text-xs text-stone">Signed in as {user.email}</p>
      </div>
      <AdminNav />
      <div className="mt-10">{children}</div>
    </div>
  );
}
