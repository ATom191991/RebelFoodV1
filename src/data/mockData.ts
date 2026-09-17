// ---------------------------------------------------------------------------
// SYNTHETIC DEMO DATA ONLY. Nothing in this file is connected to a live
// system — it exists to make the Spark prototype's logic demonstrable.
// ---------------------------------------------------------------------------
import type {
  Sku,
  GrnRecord,
  PackagingItem,
  DishPackagingMap,
  PackagingCountRecord,
  WasteSku,
  ExceptionRecord,
} from "./types";

export const KITCHEN = "Kitchen 2214";
export const SHIFT = "Dinner";
export const USER_ROLE = "Shift Lead";
export const TODAY = "17 Sep 2026";
export const YESTERDAY = "16 Sep 2026";
export const DAY_BEFORE = "15 Sep 2026";
export const FOUR_DAYS_AGO = "14 Sep 2026";

// ---------------------------------------------------------------------------
// SKU MASTER — last-3-months loss frequency/value drives which SKUs Spark
// flags for mandatory physical verification during GRN.
// ---------------------------------------------------------------------------
export const SKUS: Sku[] = [
  {
    id: "sku-boneless-chicken",
    name: "Boneless Chicken",
    unit: "kg",
    unitValue: 320,
    flagged: true,
    category: "Meat & Poultry",
    tolerance: { lossFrequencyTolerancePerMonth: 5, lossValueTolerance: 1000, observedInstancesLast3Months: 21 },
  },
  {
    id: "sku-paneer",
    name: "Paneer",
    unit: "kg",
    unitValue: 280,
    flagged: true,
    category: "Dairy",
    tolerance: { lossFrequencyTolerancePerMonth: 4, lossValueTolerance: 800, observedInstancesLast3Months: 17 },
  },
  {
    id: "sku-refined-oil",
    name: "Refined Oil",
    unit: "litres",
    unitValue: 140,
    flagged: true,
    category: "Oils & Fats",
    tolerance: { lossFrequencyTolerancePerMonth: 6, lossValueTolerance: 900, observedInstancesLast3Months: 24 },
  },
  {
    id: "sku-mozzarella",
    name: "Mozzarella Cheese",
    unit: "kg",
    unitValue: 380,
    flagged: true,
    category: "Dairy",
    tolerance: { lossFrequencyTolerancePerMonth: 3, lossValueTolerance: 1200, observedInstancesLast3Months: 11 },
  },
  {
    id: "sku-prawns",
    name: "Prawns",
    unit: "kg",
    unitValue: 650,
    flagged: true,
    category: "Seafood",
    tolerance: { lossFrequencyTolerancePerMonth: 3, lossValueTolerance: 1500, observedInstancesLast3Months: 9 },
  },
  {
    id: "sku-butter",
    name: "Butter",
    unit: "kg",
    unitValue: 480,
    flagged: true,
    category: "Dairy",
    tolerance: { lossFrequencyTolerancePerMonth: 4, lossValueTolerance: 1000, observedInstancesLast3Months: 13 },
  },
  {
    id: "sku-chicken-mince",
    name: "Chicken Mince",
    unit: "kg",
    unitValue: 300,
    flagged: true,
    category: "Meat & Poultry",
    tolerance: { lossFrequencyTolerancePerMonth: 5, lossValueTolerance: 900, observedInstancesLast3Months: 15 },
  },
  {
    id: "sku-cheese-slices",
    name: "Cheese Slices",
    unit: "kg",
    unitValue: 420,
    flagged: true,
    category: "Dairy",
    tolerance: { lossFrequencyTolerancePerMonth: 3, lossValueTolerance: 1100, observedInstancesLast3Months: 10 },
  },
  { id: "sku-basmati-rice", name: "Basmati Rice", unit: "kg", unitValue: 85, flagged: false, category: "Dry Goods" },
  { id: "sku-tomato-puree", name: "Tomato Puree", unit: "kg", unitValue: 60, flagged: false, category: "Sauces & Bases" },
  { id: "sku-onions", name: "Onions", unit: "kg", unitValue: 35, flagged: false, category: "Produce" },
  { id: "sku-yogurt", name: "Yogurt", unit: "kg", unitValue: 90, flagged: false, category: "Dairy" },
];

export const skuById = (id: string) => SKUS.find((s) => s.id === id)!;

// ---------------------------------------------------------------------------
// GRN — three POs received today. Only flagged SKUs ever require a staff
// verification step; everything else auto-passes at ordered = actual.
// ---------------------------------------------------------------------------
export const INITIAL_GRNS: GrnRecord[] = [
  {
    id: "grn-1",
    supplier: "Fresh Farm Poultry",
    poNumber: "PO-88231",
    invoiceNumber: "INV-55012",
    date: TODAY,
    kitchen: KITCHEN,
    lines: [
      { id: "grn-1-l1", skuId: "sku-boneless-chicken", orderedQty: 50, actualQty: null, status: "pending_verification" },
      { id: "grn-1-l2", skuId: "sku-chicken-mince", orderedQty: 20, actualQty: 19.5, status: "verified_within_tolerance" },
      { id: "grn-1-l3", skuId: "sku-basmati-rice", orderedQty: 30, actualQty: 30, status: "auto_pass" },
    ],
  },
  {
    id: "grn-2",
    supplier: "Dairy Direct",
    poNumber: "PO-88245",
    invoiceNumber: "INV-55098",
    date: TODAY,
    kitchen: KITCHEN,
    lines: [
      { id: "grn-2-l1", skuId: "sku-paneer", orderedQty: 20, actualQty: null, status: "pending_verification" },
      { id: "grn-2-l2", skuId: "sku-butter", orderedQty: 10, actualQty: 9.9, status: "verified_within_tolerance" },
      { id: "grn-2-l3", skuId: "sku-mozzarella", orderedQty: 15, actualQty: 11, status: "verified_exception" },
      { id: "grn-2-l4", skuId: "sku-tomato-puree", orderedQty: 12, actualQty: 12, status: "auto_pass" },
    ],
  },
  {
    id: "grn-3",
    supplier: "Ocean Fresh Seafood",
    poNumber: "PO-88260",
    invoiceNumber: "INV-55110",
    date: TODAY,
    kitchen: KITCHEN,
    lines: [
      { id: "grn-3-l1", skuId: "sku-refined-oil", orderedQty: 40, actualQty: null, status: "pending_verification" },
      { id: "grn-3-l2", skuId: "sku-prawns", orderedQty: 12, actualQty: 11.7, status: "verified_within_tolerance" },
      { id: "grn-3-l3", skuId: "sku-onions", orderedQty: 20, actualQty: 20, status: "auto_pass" },
    ],
  },
];

/** Invoice-stated quantity shown as a starting point for the physical count field — staff must confirm or correct it. */
export const INVOICE_HINTS: Record<string, number> = {
  "grn-1-l1": 47, // Boneless Chicken
  "grn-2-l1": 17.5, // Paneer
  "grn-3-l1": 33, // Refined Oil
};

// ---------------------------------------------------------------------------
// PACKAGING — expected usage is derived from today's dish orders x packaging
// mapping, never staff-estimated.
// ---------------------------------------------------------------------------
export const PACKAGING_ITEMS: PackagingItem[] = [
  { id: "pkg-2m-dia-box", name: "2M Dia Box", openingStock: 250, toleranceUnits: 10, unitCost: 18 },
  { id: "pkg-chutney-box", name: "Chutney Box", openingStock: 300, toleranceUnits: 10, unitCost: 6 },
  { id: "pkg-paper-bag", name: "Paper Bag", openingStock: 120, toleranceUnits: 10, unitCost: 4 },
];

export const packagingById = (id: string) => PACKAGING_ITEMS.find((p) => p.id === id)!;

export const DISH_PACKAGING_MAP: DishPackagingMap[] = [
  {
    dish: "Chicken Biryani",
    ordersToday: 120,
    packaging: [
      { packagingId: "pkg-2m-dia-box", qtyPerOrder: 1 },
      { packagingId: "pkg-chutney-box", qtyPerOrder: 1 },
    ],
  },
  {
    dish: "Mutton Biryani",
    ordersToday: 60,
    packaging: [
      { packagingId: "pkg-2m-dia-box", qtyPerOrder: 1 },
      { packagingId: "pkg-chutney-box", qtyPerOrder: 1 },
    ],
  },
  {
    dish: "Paneer Curry Bowl",
    ordersToday: 30,
    packaging: [{ packagingId: "pkg-chutney-box", qtyPerOrder: 1 }],
  },
  {
    dish: "Combo Meal",
    ordersToday: 45,
    packaging: [{ packagingId: "pkg-paper-bag", qtyPerOrder: 1 }],
  },
];

export function expectedUsage(packagingId: string): number {
  return DISH_PACKAGING_MAP.reduce((total, dish) => {
    const map = dish.packaging.find((p) => p.packagingId === packagingId);
    return total + (map ? map.qtyPerOrder * dish.ordersToday : 0);
  }, 0);
}

/** Suggested count shown as an input placeholder (e.g. from a prior spot-check pattern) — staff enters the real physical count. */
export const PACKAGING_COUNT_HINTS: Record<string, number> = {
  "pkg-2m-dia-box": 55,
  "pkg-chutney-box": 87,
};

export const INITIAL_PACKAGING_COUNTS: PackagingCountRecord[] = PACKAGING_ITEMS.map((p) => ({
  packagingId: p.id,
  physicalCount: null,
  status: "not_counted",
}));

// ---------------------------------------------------------------------------
// WASTE — only these selected high-value/high-loss SKUs get an end-of-shift
// waste capture screen. Everything else is out of scope by design.
// ---------------------------------------------------------------------------
export const WASTE_SKU_IDS = ["sku-boneless-chicken", "sku-paneer", "sku-refined-oil"];

/** Typical waste per shift, used only to flag unusually high (anomalous) waste — not a target or quota. */
export const WASTE_TYPICAL_QTY: Record<string, number> = {
  "sku-boneless-chicken": 1.5,
  "sku-paneer": 1.2,
  "sku-refined-oil": 3,
};
export const WASTE_ANOMALY_MULTIPLIER = 1.5;

export const INITIAL_WASTE: WasteSku[] = WASTE_SKU_IDS.map((skuId) => ({
  skuId,
  wasteQty: null,
  recorded: false,
}));

/** Waste value already captured this week prior to today's shift (for Financial Impact framing). */
export const WASTE_VALUE_CAPTURED_BASELINE = 4850;

// ---------------------------------------------------------------------------
// EXCEPTIONS — seeded with recent history so the Exceptions/Overview screens
// aren't empty on first load; new ones are appended live as staff act.
// ---------------------------------------------------------------------------
export const INITIAL_EXCEPTIONS: ExceptionRecord[] = [
  {
    id: "exc-1",
    date: TODAY,
    kitchen: KITCHEN,
    sku: "Mozzarella Cheese",
    module: "GRN",
    issue: "Material receiving variance detected",
    variance: "-4 kg",
    financialImpact: 1520,
    status: "Under Review",
    owner: "Receiving Team",
  },
  {
    id: "exc-2",
    date: YESTERDAY,
    kitchen: KITCHEN,
    sku: "Chutney Box",
    module: "Packaging",
    issue: "Packaging count variance above tolerance",
    variance: "-18 units",
    financialImpact: 108,
    status: "Open",
    owner: "Shift Lead",
  },
  {
    id: "exc-3",
    date: DAY_BEFORE,
    kitchen: KITCHEN,
    sku: "Paper Bag",
    module: "Packaging",
    issue: "Packaging count variance above tolerance",
    variance: "-14 units",
    financialImpact: 56,
    status: "Under Review",
    owner: "Shift Lead",
  },
  {
    id: "exc-4",
    date: FOUR_DAYS_AGO,
    kitchen: KITCHEN,
    sku: "Butter",
    module: "GRN",
    issue: "Material receiving variance detected",
    variance: "-3.5 kg",
    financialImpact: 1680,
    status: "Resolved",
    owner: "Receiving Team",
  },
];
