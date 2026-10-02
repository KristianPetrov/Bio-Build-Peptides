"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { priceLines, type PackSize } from "@/lib/pricing";
import { BRAND } from "@/lib/site";

export type CartLine = {
  id: string;
  variantId: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  container: "vial_3ml" | "vial_10ml";
  packSize: PackSize;
  quantity: number;
  priceCents: number;
  pack5Cents: number | null;
  pack10Cents: number | null;
  volumePricing: boolean;
};

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  subtotalCents: number;
  lineTotals: Record<string, number>;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (line: Omit<CartLine, "id" | "quantity">, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  replace: (lines: CartLine[]) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const EVENT = "bb-cart-change";

function read(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(BRAND.cartKey);
    const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
    return Array.isArray(parsed) ? parsed.filter((line) => line.quantity > 0) : [];
  } catch {
    return [];
  }
}

let snapshotRaw: string | null = null;
let snapshot: CartLine[] = [];
function getSnapshot() {
  const raw = window.localStorage.getItem(BRAND.cartKey);
  if (raw !== snapshotRaw) {
    snapshotRaw = raw;
    snapshot = read();
  }
  return snapshot;
}
const emptyLines: CartLine[] = [];
const noopSubscribe = () => () => {};
const getServerSnapshot = () => emptyLines;

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function write(lines: CartLine[]) {
  window.localStorage.setItem(
    BRAND.cartKey,
    JSON.stringify(lines.filter((line) => line.quantity > 0)),
  );
  window.dispatchEvent(new Event(EVENT));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const add = useCallback<CartContextValue["add"]>((line, quantity = 1) => {
    const id = `${line.variantId}:${line.packSize}`;
    const current = read();
    const existing = current.find((item) => item.id === id);
    if (existing) {
      existing.quantity = Math.min(50, existing.quantity + quantity);
      Object.assign(existing, line, { id, quantity: existing.quantity });
      write(current);
    } else {
      write([...current, { ...line, id, quantity }]);
    }
    setOpen(true);
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    const next = Math.max(0, Math.min(50, Math.floor(quantity)));
    write(read().map((line) => (line.id === id ? { ...line, quantity: next } : line)));
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((line) => line.id !== id));
  }, []);

  const clear = useCallback(() => write([]), []);
  const replace = useCallback((next: CartLine[]) => write(next), []);

  const value = useMemo<CartContextValue>(() => {
    const { totals, subtotal } = priceLines(
      lines.map((line) => ({
        key: line.id,
        variantId: line.variantId,
        packSize: line.packSize,
        quantity: line.quantity,
        variant: line,
      })),
    );
    return {
      lines,
      ready,
      count: lines.reduce((sum, line) => sum + line.quantity * line.packSize, 0),
      subtotalCents: subtotal,
      lineTotals: totals,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQuantity,
      remove,
      clear,
      replace,
    };
  }, [lines, ready, isOpen, add, setQuantity, remove, clear, replace]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
