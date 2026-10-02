import type { Metadata } from "next";
import { LegalPage } from "@/components/page-header";
import { RUO_NOTICE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Research use policy",
  description: "Bio Build Peptides products are sold strictly for laboratory research use.",
  alternates: { canonical: "/research-use" },
};

export default function ResearchUsePage() {
  return (
    <LegalPage eyebrow="Policy" title="Research use only" updated="October 1, 2026">
      <p>{RUO_NOTICE}</p>
      <h2>Intended use</h2>
      <p>
        Materials sold by Bio Build Peptides are intended solely for in-vitro research and laboratory
        experimentation by qualified persons. They are not drugs, foods, cosmetics or dietary
        supplements, and they are not intended to diagnose, treat, cure or prevent any disease.
      </p>
      <h2>Purchaser confirmation</h2>
      <p>By placing an order, the purchaser confirms that they:</p>
      <ul>
        <li>are at least 21 years of age;</li>
        <li>are purchasing the materials for lawful laboratory research use only;</li>
        <li>will not use, or allow others to use, the materials in or on humans or animals;</li>
        <li>will store and handle the materials in accordance with the vial label and applicable laboratory safety practices.</li>
      </ul>
      <h2>No guidance</h2>
      <p>
        Information on this website describes the identity and classification of each material for
        reference only. Bio Build Peptides does not provide dosing, administration, medical or
        therapeutic guidance, and nothing on this website should be read as such.
      </p>
      <h2>Statements</h2>
      <p>
        Statements on this website have not been evaluated by the Food and Drug Administration.
      </p>
    </LegalPage>
  );
}
