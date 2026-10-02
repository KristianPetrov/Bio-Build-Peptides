/**
 * Source catalog for seeding. Products, strengths and tier prices come from the
 * Affordable Peptides catalog (approved by the owner on 2026-10-01). Copy is
 * written as identity/classification only — no efficacy or medical claims.
 * Certificates of analysis are intentionally omitted: AP's COAs describe AP
 * lots and must not be presented as Bio Build results.
 */

export const CATEGORIES = [
  {
    id: "metabolic",
    label: "Metabolic Research",
    description:
      "Materials cataloged for metabolic pathway and receptor-signaling studies.",
  },
  {
    id: "tissue",
    label: "Tissue Response",
    description:
      "Materials cataloged for peptide signaling and tissue-response studies.",
  },
  {
    id: "endocrine",
    label: "Endocrine Signaling",
    description:
      "Materials cataloged for endocrine and receptor-signaling studies.",
  },
  {
    id: "cellular",
    label: "Cellular Research",
    description:
      "Materials cataloged for cellular maintenance and aging-pathway studies.",
  },
  {
    id: "supplies",
    label: "Laboratory Supplies",
    description:
      "Supplies used for preparation, storage and handling workflows.",
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function getCategory(id: string) {
  return CATEGORIES.find((category) => category.id === id);
}

type Container = "vial_3ml" | "vial_10ml";

export type CatalogVariant = {
  label: string;
  priceCents: number;
  pack5Cents: number | null;
  pack10Cents: number | null;
  volumePricing: boolean;
  container: Container;
};

export type CatalogProduct = {
  slug: string;
  name: string;
  classification: string;
  summary: string;
  composition?: string;
  categories: CategoryId[];
  /** `file.ext|Display name` entries from /public/molecules. */
  molecules: string[];
  featured?: boolean;
  variants: CatalogVariant[];
};

const dollars = (value: number) => Math.round(value * 100);

/** AP standard tiers: 5-pack = 4× single, 10-pack = 7× single. */
const standard = (
  label: string,
  single: number,
  container: Container = "vial_3ml",
): CatalogVariant => ({
  label,
  priceCents: dollars(single),
  pack5Cents: dollars(single * 4),
  pack10Cents: dollars(single * 7),
  volumePricing: true,
  container,
});

/** AP flat tiers (supplies): no volume discount. */
const flat = (
  label: string,
  single: number,
  container: Container,
): CatalogVariant => ({
  label,
  priceCents: dollars(single),
  pack5Cents: dollars(single * 5),
  pack10Cents: dollars(single * 10),
  volumePricing: false,
  container,
});

const custom = (
  label: string,
  single: number,
  five: number,
  ten: number,
): CatalogVariant => ({
  label,
  priceCents: dollars(single),
  pack5Cents: dollars(five),
  pack10Cents: dollars(ten),
  volumePricing: true,
  container: "vial_3ml",
});

export const CATALOG: CatalogProduct[] = [
  {
    slug: "5-amino-1mq",
    name: "5-Amino-1MQ",
    classification: "Small-molecule NNMT inhibitor",
    summary:
      "A methylquinolinium compound studied as an inhibitor of nicotinamide N-methyltransferase (NNMT) in metabolic pathway research.",
    categories: ["metabolic", "cellular"],
    molecules: ["5-amino-1q-iodide.sdf|5-Amino-1MQ"],
    variants: [standard("10mg", 40), standard("50mg", 60)],
  },
  {
    slug: "aod-9604",
    name: "AOD 9604",
    classification: "Modified hGH fragment (176–191)",
    summary:
      "A synthetic analog of the C-terminal 176–191 region of human growth hormone, cataloged for metabolic signaling research.",
    categories: ["metabolic"],
    molecules: ["aod-9604.sdf|AOD 9604"],
    featured: true,
    variants: [standard("5mg", 40), standard("10mg", 70)],
  },
  {
    slug: "bacteriostatic-water",
    name: "Bacteriostatic Water",
    classification: "Sterile water with benzyl alcohol",
    summary:
      "Sterile water containing benzyl alcohol as a bacteriostatic preservative, supplied for laboratory reconstitution of multi-draw vials.",
    categories: ["supplies"],
    molecules: ["water.sdf|Water", "benzyl-alcohol.sdf|Benzyl alcohol"],
    variants: [flat("3ml", 2, "vial_3ml"), flat("10ml", 4, "vial_10ml")],
  },
  {
    slug: "vitamin-b12",
    name: "Vitamin B12",
    classification: "Cyanocobalamin solution, 1 mg/mL",
    summary:
      "A 10 mL multi-dose vial of cyanocobalamin at 1 mg/mL for laboratory research requiring repeated sterile draws.",
    categories: ["supplies", "cellular"],
    molecules: ["b12.sdf|Cyanocobalamin"],
    variants: [standard("10ml (1mg/mL)", 50, "vial_10ml")],
  },
  {
    slug: "bpc-tb-combo",
    name: "BPC + TB Combo",
    classification: "Two-peptide blend",
    summary:
      "A combined vial of BPC-157 and TB-500 for tissue-response research protocols that study both peptides together.",
    composition: "BPC-157 10mg · TB-500 10mg",
    categories: ["tissue", "cellular"],
    molecules: ["bpc-157.sdf|BPC-157", "tb-500.sdf|TB-500"],
    variants: [standard("20mg total (10mg each)", 80)],
  },
  {
    slug: "bpc-157",
    name: "BPC-157",
    classification: "Synthetic 15-amino-acid peptide",
    summary:
      "A pentadecapeptide derived from a sequence of a gastric protein, widely cataloged for peptide signaling and tissue-response research.",
    categories: ["tissue", "cellular"],
    molecules: ["bpc-157.sdf|BPC-157"],
    featured: true,
    variants: [standard("10mg", 50)],
  },
  {
    slug: "cjc-1295",
    name: "CJC-1295",
    classification: "Synthetic GHRH analog",
    summary:
      "A growth hormone–releasing hormone analog offered with and without the drug affinity complex (DAC), and as a blend with Ipamorelin.",
    categories: ["endocrine", "tissue"],
    molecules: ["cjc-1295.sdf|CJC-1295"],
    variants: [
      standard("10mg", 60),
      standard("5mg + DAC", 50),
      standard("10mg + IPA (no DAC)", 70),
    ],
  },
  {
    slug: "dsip",
    name: "DSIP",
    classification: "Delta sleep-inducing peptide (nonapeptide)",
    summary:
      "A nine-amino-acid neuropeptide studied in neuroendocrine and circadian signaling models.",
    categories: ["endocrine", "tissue"],
    molecules: ["dsip.sdf|DSIP"],
    variants: [standard("10mg", 50)],
  },
  {
    slug: "epithalon",
    name: "Epithalon",
    classification: "Synthetic tetrapeptide (Ala-Glu-Asp-Gly)",
    summary:
      "A four-amino-acid peptide cataloged for cellular maintenance and aging-pathway research. Reconstituted solution may cloud when refrigerated and typically clears at room temperature.",
    categories: ["cellular"],
    molecules: ["epitalon.sdf|Epithalon"],
    variants: [standard("50mg", 60)],
  },
  {
    slug: "ghk-cu",
    name: "GHK-Cu",
    classification: "Copper-binding tripeptide",
    summary:
      "Glycyl-L-histidyl-L-lysine complexed with copper(II), cataloged for dermal and tissue-response research.",
    categories: ["cellular", "tissue"],
    molecules: ["ghk-cu.sdf|GHK-Cu"],
    featured: true,
    variants: [standard("50mg", 30), standard("100mg", 50)],
  },
  {
    slug: "ghrp-2",
    name: "GHRP-2",
    classification: "Synthetic hexapeptide secretagogue",
    summary:
      "A growth hormone–releasing hexapeptide that acts at the ghrelin receptor (GHS-R1a), used in GH-axis signaling research.",
    categories: ["endocrine", "tissue"],
    molecules: ["ghrp-2.sdf|GHRP-2"],
    variants: [standard("10mg", 30)],
  },
  {
    slug: "glow",
    name: "GLOW",
    classification: "Three-peptide blend",
    summary:
      "A single-vial blend of BPC-157, TB-500 and GHK-Cu for research protocols that study the three peptides together.",
    composition: "BPC-157 10mg · TB-500 10mg · GHK-Cu 50mg",
    categories: ["cellular", "tissue"],
    molecules: [
      "bpc-157.sdf|BPC-157",
      "tb-500.sdf|TB-500",
      "ghk-cu.sdf|GHK-Cu",
    ],
    variants: [custom("70mg", 90, 400, 700)],
  },
  {
    slug: "glutathione",
    name: "Glutathione",
    classification: "Tripeptide (γ-Glu-Cys-Gly)",
    summary:
      "The endogenous tripeptide γ-glutamyl-cysteinyl-glycine, cataloged for redox and oxidative-stress research.",
    categories: ["cellular"],
    molecules: ["glutathione.sdf|Glutathione"],
    variants: [standard("1500mg", 50, "vial_10ml")],
  },
  {
    slug: "hcg",
    name: "HCG",
    classification: "Glycoprotein hormone, 10,000 IU",
    summary:
      "Human chorionic gonadotropin, a heterodimeric glycoprotein hormone, supplied for endocrine signaling research.",
    categories: ["endocrine", "supplies"],
    molecules: ["hcg.pdb|Human chorionic gonadotropin"],
    variants: [standard("10,000 IU", 60)],
  },
  {
    slug: "igf-1-lr3",
    name: "IGF-1 LR3",
    classification: "Long-chain IGF-1 analog (83 aa)",
    summary:
      "An 83-amino-acid analog of insulin-like growth factor 1 with an Arg³ substitution and N-terminal extension, used in growth-factor signaling research.",
    categories: ["endocrine", "tissue"],
    molecules: ["igf-1.pdb|IGF-1"],
    variants: [custom("1mg", 70, 210, 490)],
  },
  {
    slug: "ipamorelin",
    name: "Ipamorelin",
    classification: "Selective pentapeptide secretagogue",
    summary:
      "A synthetic pentapeptide ghrelin-receptor agonist used in growth hormone secretion research.",
    categories: ["endocrine", "tissue"],
    molecules: ["ipamorelin.sdf|Ipamorelin"],
    variants: [standard("10mg", 50)],
  },
  {
    slug: "sermorelin",
    name: "Sermorelin",
    classification: "GHRH (1–29) analog",
    summary:
      "A 29-amino-acid analog of the active fragment of growth hormone–releasing hormone, used in endocrine signaling research.",
    categories: ["endocrine", "tissue"],
    molecules: ["sermorelin.sdf|Sermorelin"],
    variants: [standard("10mg", 50)],
  },
  {
    slug: "klow",
    name: "KLOW",
    classification: "Four-peptide blend",
    summary:
      "A single-vial blend of BPC-157, TB-500, GHK-Cu and KPV for multi-pathway tissue-response research.",
    composition: "BPC-157 10mg · TB-500 10mg · GHK-Cu 50mg · KPV 10mg",
    categories: ["cellular", "tissue"],
    molecules: [
      "bpc-157.sdf|BPC-157",
      "tb-500.sdf|TB-500",
      "ghk-cu.sdf|GHK-Cu",
      "kpv.sdf|KPV",
    ],
    variants: [standard("80mg", 100)],
  },
  {
    slug: "kpv",
    name: "KPV",
    classification: "Tripeptide (Lys-Pro-Val)",
    summary:
      "The C-terminal tripeptide of α-melanocyte-stimulating hormone, cataloged for inflammatory-signaling research.",
    categories: ["tissue", "cellular"],
    molecules: ["kpv.sdf|KPV"],
    variants: [standard("10mg", 50)],
  },
  {
    slug: "l-carnitine",
    name: "L-Carnitine",
    classification: "Amino-acid derivative, 600 mg/mL",
    summary:
      "A 10 mL vial of L-carnitine at 600 mg/mL for fatty-acid transport and mitochondrial metabolism research.",
    categories: ["metabolic"],
    molecules: ["l-carnitine.sdf|L-Carnitine"],
    variants: [standard("10ml (600mg/ml)", 50, "vial_10ml")],
  },
  {
    slug: "lipo-c",
    name: "Lipo-C",
    classification: "MIC blend (methionine, inositol, choline)",
    summary:
      "A methionine-inositol-choline formulation offered with cyanocobalamin (B12) or without, for metabolic research.",
    categories: ["metabolic"],
    molecules: [
      "methionine.sdf|Methionine",
      "inositol.sdf|Inositol",
      "choline.sdf|Choline",
      "b12.sdf|Cyanocobalamin",
    ],
    variants: [
      standard("10ml (With B12)", 60, "vial_10ml"),
      standard("10ml (No B12)", 50, "vial_10ml"),
    ],
  },
  {
    slug: "melanotan-ii",
    name: "Melanotan II",
    classification: "Cyclic melanocortin analog",
    summary:
      "A synthetic cyclic analog of α-MSH that binds melanocortin receptors, used in melanogenesis and melanocortin signaling research.",
    categories: ["cellular"],
    molecules: ["melanotan-ii.sdf|Melanotan II"],
    variants: [standard("10mg", 40)],
  },
  {
    slug: "mots-c",
    name: "MOTS-c",
    classification: "Mitochondrial-derived peptide (16 aa)",
    summary:
      "A 16-amino-acid peptide encoded in the mitochondrial 12S rRNA region, cataloged for metabolic and mitochondrial research.",
    categories: ["metabolic", "cellular"],
    molecules: ["mots-c.sdf|MOTS-c"],
    variants: [standard("10mg", 40), standard("40mg", 100)],
  },
  {
    slug: "nad-plus",
    name: "NAD+",
    classification: "Coenzyme (nicotinamide adenine dinucleotide)",
    summary:
      "The oxidized form of nicotinamide adenine dinucleotide, a central redox coenzyme used in cellular energy and sirtuin research.",
    categories: ["cellular", "metabolic"],
    molecules: ["nad-plus.sdf|NAD+"],
    featured: true,
    variants: [
      standard("500mg", 60, "vial_10ml"),
      standard("1000mg", 100, "vial_10ml"),
    ],
  },
  {
    slug: "pt-141",
    name: "PT-141",
    classification: "Cyclic melanocortin agonist (bremelanotide)",
    summary:
      "A cyclic heptapeptide melanocortin receptor agonist used in central melanocortin signaling research.",
    categories: ["endocrine", "cellular"],
    molecules: ["pt-141.sdf|PT-141"],
    variants: [standard("10mg", 40)],
  },
  {
    slug: "retatrutide",
    name: "Retatrutide",
    classification: "GIP / GLP-1 / glucagon receptor triple agonist",
    summary:
      "A single peptide with agonist activity at the GIP, GLP-1 and glucagon receptors, cataloged for incretin and metabolic research.",
    categories: ["metabolic"],
    molecules: ["retatrutide.sdf|Retatrutide"],
    featured: true,
    variants: [
      standard("10mg", 80),
      standard("20mg", 150),
      standard("30mg", 175),
    ],
  },
  {
    slug: "selank",
    name: "Selank",
    classification: "Synthetic tuftsin analog (heptapeptide)",
    summary:
      "A seven-amino-acid analog of the immunopeptide tuftsin, used in neuropeptide and immunomodulation research.",
    categories: ["cellular", "tissue"],
    molecules: ["selank.sdf|Selank"],
    variants: [standard("10mg", 50)],
  },
  {
    slug: "semax",
    name: "Semax",
    classification: "ACTH (4–10) analog (heptapeptide)",
    summary:
      "A synthetic heptapeptide derived from the 4–10 fragment of adrenocorticotropic hormone, used in neurotrophic signaling research.",
    categories: ["cellular", "tissue"],
    molecules: ["semax.sdf|Semax"],
    variants: [standard("10mg", 50)],
  },
  {
    slug: "ss-31",
    name: "SS-31",
    classification: "Mitochondria-targeted tetrapeptide (elamipretide)",
    summary:
      "A Szeto-Schiller tetrapeptide that associates with cardiolipin in the inner mitochondrial membrane, used in mitochondrial research.",
    categories: ["cellular", "tissue"],
    molecules: ["ss-31.sdf|SS-31"],
    variants: [standard("10mg", 40), standard("50mg", 135)],
  },
  {
    slug: "tb-500",
    name: "TB-500",
    classification: "Synthetic thymosin β4 fragment",
    summary:
      "A synthetic peptide based on the actin-binding region of thymosin β4, cataloged for cell-migration and tissue-response research.",
    categories: ["tissue", "cellular"],
    molecules: ["tb-500.sdf|TB-500"],
    variants: [standard("10mg", 60)],
  },
  {
    slug: "tesamorelin-ipamorelin",
    name: "Tesamorelin + Ipamorelin",
    classification: "Two-peptide blend",
    summary:
      "A single-vial blend of the GHRH analog Tesamorelin and the ghrelin-receptor agonist Ipamorelin for complementary GH-axis research.",
    composition: "Tesamorelin 10mg · Ipamorelin 3mg",
    categories: ["endocrine", "metabolic", "tissue"],
    molecules: [
      "tesamorelin.sdf|Tesamorelin",
      "ipamorelin.sdf|Ipamorelin",
    ],
    variants: [standard("10mg/3mg", 80)],
  },
  {
    slug: "tesamorelin",
    name: "Tesamorelin",
    classification: "Synthetic GHRH analog",
    summary:
      "A stabilized 44-amino-acid analog of growth hormone–releasing hormone used in endocrine and body-composition research.",
    categories: ["endocrine", "metabolic"],
    molecules: ["tesamorelin.sdf|Tesamorelin"],
    variants: [standard("10mg", 60), standard("20mg", 100)],
  },
  {
    slug: "tirzepatide",
    name: "Tirzepatide",
    classification: "Dual GIP / GLP-1 receptor agonist",
    summary:
      "A 39-amino-acid peptide with agonist activity at the GIP and GLP-1 receptors, cataloged for incretin and metabolic research.",
    categories: ["metabolic"],
    molecules: ["tirzepatide.sdf|Tirzepatide"],
    featured: true,
    variants: [
      standard("10mg", 50),
      standard("15mg", 70),
      standard("20mg", 90),
      standard("30mg", 120),
      standard("40mg", 140),
      standard("60mg", 170),
    ],
  },
];
