"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BRAND } from "@/lib/site";
import { Wordmark } from "./brand";

/** 21+ and research-use acknowledgement, as on the Affordable Peptides and Pure Energy storefronts. */
const EVENT = "bb-age-change";

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function readAccepted() {
  try {
    return window.localStorage.getItem(BRAND.ageKey) === "yes";
  } catch {
    return false;
  }
}

export function AgeGate() {
  // The server renders without the gate; the client shows it until confirmed.
  const accepted = useSyncExternalStore(subscribe, readAccepted, () => true);
  const show = !accepted;
  const [declined, setDeclined] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  if (!show) return null;

  function confirm() {
    try {
      window.localStorage.setItem(BRAND.ageKey, "yes");
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <div
      className="animate-fade fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/90 p-5 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-body"
    >
      <div className="animate-rise relative w-full max-w-[30rem] overflow-hidden border hairline bg-onyx px-7 pt-10 pb-8 text-center sm:px-10">
        <div className="relative">
          <Wordmark size="md" />
          <p className="eyebrow rule-label mt-5 text-[0.625rem]">Build better biology</p>
          <h2 id="age-gate-title" className="mt-8 font-serif text-[1.9rem] leading-tight text-ivory italic">
            Before you enter
          </h2>
          <div id="age-gate-body" className="mt-4 space-y-3 text-sm leading-6 text-parchment">
            {declined ? (
              <p className="text-ember">
                This website is only available to adults aged 21 or older purchasing for laboratory research.
              </p>
            ) : (
              <>
                <p>
                  You must be 21 or older to enter. All products are sold strictly for
                  in-vitro laboratory research and are not for human or animal consumption.
                </p>
                <p className="text-stone">
                  By continuing you confirm that you are 21+ and that you are purchasing for
                  research use only.
                </p>
              </>
            )}
          </div>
          <div className="mt-8 grid gap-3">
            <button ref={confirmRef} type="button" onClick={confirm} className="btn-gold w-full">
              I am 21+ · Research use
            </button>
            <button
              type="button"
              onClick={() => setDeclined(true)}
              className="py-2 text-[0.6875rem] tracking-[0.22em] text-ash uppercase hover:text-parchment"
            >
              I do not agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
