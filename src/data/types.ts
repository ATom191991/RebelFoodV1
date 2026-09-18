// Core domain types for Spark inventory-control prototype.
// All data in this app is synthetic demo data — see data/mockData.ts.

export type Unit = "kg" | "litres" | "units" | "pcs";

export interface SkuTolerance {
  /** Recurring loss instances/month above which a SKU gets flagged */
  lossFrequencyTolerancePerMonth: number;
  /** Value (INR) of loss per instance above which it counts against the frequency tolerance */
  lossValueTolerance: number;
  /** Observed instances in the trailing 3 months, used to justify why a SKU is flagged */
  observedInstancesLast3Months: number;
}

export interface Sku {
  id: string;
  name: string;
  unit: Unit;
  unitValue: number; // INR per unit
  flagged: boolean; // has this SKU crossed the recurring-loss threshold?
  category: string;
  tolerance?: SkuTolerance; // present when flagged
}

export type GrnLineStatus =
  | "auto_pass" // not flagged, ordered = actual, no staff action needed
  | "pending_verification" // flagged, staff must physically verify
  | "verified_within_tolerance"
  | "verified_exception";

export interface GrnLine {
  id: string;
  skuId: string;
  orderedQty: number;
  actualQty: number | null; // null until physically verified (flagged lines only)
  status: GrnLineStatus;
}

export interface GrnRecord {
  id: string;
  supplier: string;
  poNumber: string;
  invoiceNumber: string;
  date: string;
  kitchen: string;
  lines: GrnLine[];
}

export interface PackagingItem {
  id: string;
  name: string;
  openingStock: number;
  toleranceUnits: number; // absolute unit tolerance before flagging
  unitCost: number; // INR per packaging unit, for financial impact
}

export interface DishPackagingMap {
  dish: string;
  ordersToday: number;
  packaging: { packagingId: string; qtyPerOrder: number }[];
}

export type PackagingCountStatus =
  | "not_counted"
  | "within_tolerance"
  | "above_tolerance_pending_reason"
  | "above_tolerance_reason_logged";

export interface PackagingCountRecord {
  packagingId: string;
  physicalCount: number | null;
  status: PackagingCountStatus;
  reason?: string;
}

export interface WasteSku {
  skuId: string;
  wasteQty: number | null; // null = not yet recorded; 0 = explicit "no waste"
  recorded: boolean;
}

// ---------------------------------------------------------------------------
// CASH — COD reconciliation, once per shift.
// ---------------------------------------------------------------------------
export interface CashReconciliation {
  kitchen: string;
  date: string;
  shift: string;
  ordersCount: number;
  systemCod: number;
  actualCod: number | null;
  tolerance: number;
  reason?: string;
  updatedBy: string;
  submitted: boolean;
}

// ---------------------------------------------------------------------------
// FIXED ASSETS
// ---------------------------------------------------------------------------
export type AssetLifecycleStatus =
  | "active"
  | "in_transit"
  | "scrap_requested"
  | "scrap_approved"
  | "scrapped";

export interface Asset {
  id: string;
  tag: string;
  name: string;
  category: string;
  kitchen: string; // current kitchen assignment
  purchaseDate: string;
  purchaseValue: number;
  status: AssetLifecycleStatus;
  verifiedByStaff?: boolean; // manually confirmed during Register reconciliation

  // Transfer in-flight fields
  destinationKitchen?: string;
  transferInitiatedBy?: string;

  // Scrap in-flight fields
  scrapReason?: string;
  scrapRequestedBy?: string;
  disposalDate?: string;
}

export interface PhysicalRegisterEntry {
  id: string;
  tagSeen: string; // blank when the item has no tag (unregistered)
  descriptionSeen: string;
  kitchenSeen: string;
  matchedAssetId?: string;
}

export type AssetVerification = "verified" | "pending_confirmation" | "kitchen_mismatch" | "missing" | "unregistered";
