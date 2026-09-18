// ---------------------------------------------------------------------------
// SYNTHETIC DEMO DATA ONLY — self-contained mock data for the Inventory
// Dashboard screen. Kept separate from mockData.ts so this additive screen
// cannot affect the existing GRN / Packaging / Waste / Cash / Fixed Assets
// data flows.
// ---------------------------------------------------------------------------

export const TIME_PERIODS = ["Weekly", "Monthly"] as const;
export type TimePeriod = (typeof TIME_PERIODS)[number];

export const CATEGORIES = ["All Categories", "Meat & Poultry", "Dairy", "Oils & Fats", "Seafood", "Dry Goods"];

export const DASHBOARD_KITCHENS = ["All Kitchens", "Kitchen 2214", "Kitchen 1187", "Kitchen 3390"];

// ---------------------------------------------------------------------------
// KPI cards (snapshot for the current period — matches the sum of the
// Kitchen-wise Inventory Variance table below).
// ---------------------------------------------------------------------------
export const DASHBOARD_KPIS = {
  totalInventoryVariance: 184600,
  unexplainedLoss: 96200,
  criticalSkus: 3,
  lowSurvivalStock: 6,
};

// ---------------------------------------------------------------------------
// Inventory Variance Trend — two series, switched by the Time Period filter.
// ---------------------------------------------------------------------------
export interface TrendPoint {
  label: string;
  totalVariance: number;
  unexplainedLoss: number;
}

export const TREND_DATA: Record<TimePeriod, TrendPoint[]> = {
  Weekly: [
    { label: "W1", totalVariance: 38000, unexplainedLoss: 21000 },
    { label: "W2", totalVariance: 41000, unexplainedLoss: 23000 },
    { label: "W3", totalVariance: 35000, unexplainedLoss: 19000 },
    { label: "W4", totalVariance: 47000, unexplainedLoss: 26000 },
    { label: "W5", totalVariance: 52000, unexplainedLoss: 29000 },
    { label: "W6", totalVariance: 44000, unexplainedLoss: 24000 },
    { label: "W7", totalVariance: 49000, unexplainedLoss: 27000 },
    { label: "W8", totalVariance: 58000, unexplainedLoss: 31000 },
  ],
  Monthly: [
    { label: "Apr", totalVariance: 142000, unexplainedLoss: 78000 },
    { label: "May", totalVariance: 151000, unexplainedLoss: 82000 },
    { label: "Jun", totalVariance: 138000, unexplainedLoss: 74000 },
    { label: "Jul", totalVariance: 165000, unexplainedLoss: 88000 },
    { label: "Aug", totalVariance: 172000, unexplainedLoss: 91000 },
    { label: "Sep", totalVariance: 184600, unexplainedLoss: 96200 },
  ],
};

// ---------------------------------------------------------------------------
// Stock Survival — Critical Ingredients
// ---------------------------------------------------------------------------
export type SurvivalStatus = "Critical" | "Low" | "Healthy";

export interface StockSurvivalRow {
  ingredient: string;
  category: string;
  kitchen: string;
  currentStock: number;
  unit: string;
  avgDailyUsage: number;
  minStock: number;
  status: SurvivalStatus;
}

function daysOfCover(row: Pick<StockSurvivalRow, "currentStock" | "avgDailyUsage">) {
  return row.currentStock / row.avgDailyUsage;
}

export const STOCK_SURVIVAL: StockSurvivalRow[] = [
  { ingredient: "Boneless Chicken", category: "Meat & Poultry", kitchen: "Kitchen 2214", currentStock: 18, unit: "kg", avgDailyUsage: 6, minStock: 15, status: "Critical" },
  { ingredient: "Paneer", category: "Dairy", kitchen: "Kitchen 2214", currentStock: 9, unit: "kg", avgDailyUsage: 2.2, minStock: 8, status: "Low" },
  { ingredient: "Refined Oil", category: "Oils & Fats", kitchen: "Kitchen 1187", currentStock: 40, unit: "litres", avgDailyUsage: 5, minStock: 20, status: "Healthy" },
  { ingredient: "Mozzarella Cheese", category: "Dairy", kitchen: "Kitchen 2214", currentStock: 6, unit: "kg", avgDailyUsage: 2.5, minStock: 10, status: "Critical" },
  { ingredient: "Prawns", category: "Seafood", kitchen: "Kitchen 3390", currentStock: 14, unit: "kg", avgDailyUsage: 2, minStock: 6, status: "Healthy" },
  { ingredient: "Butter", category: "Dairy", kitchen: "Kitchen 1187", currentStock: 5, unit: "kg", avgDailyUsage: 2, minStock: 6, status: "Critical" },
  { ingredient: "Chicken Mince", category: "Meat & Poultry", kitchen: "Kitchen 2214", currentStock: 22, unit: "kg", avgDailyUsage: 4, minStock: 10, status: "Low" },
  { ingredient: "Cheese Slices", category: "Dairy", kitchen: "Kitchen 3390", currentStock: 12, unit: "kg", avgDailyUsage: 3, minStock: 8, status: "Low" },
];

export function stockSurvivalDaysOfCover(row: StockSurvivalRow) {
  return daysOfCover(row);
}

// ---------------------------------------------------------------------------
// Top Inventory Variance by SKU
// ---------------------------------------------------------------------------
export interface TopVarianceRow {
  sku: string;
  category: string;
  kitchen: string;
  expectedQty: number;
  actualQty: number;
  unit: string;
  varianceValue: number;
}

export const TOP_VARIANCE: TopVarianceRow[] = [
  { sku: "Boneless Chicken", category: "Meat & Poultry", kitchen: "Kitchen 2214", expectedQty: 320, actualQty: 298, unit: "kg", varianceValue: 7040 },
  { sku: "Paneer", category: "Dairy", kitchen: "Kitchen 2214", expectedQty: 180, actualQty: 162, unit: "kg", varianceValue: 5040 },
  { sku: "Refined Oil", category: "Oils & Fats", kitchen: "Kitchen 1187", expectedQty: 260, actualQty: 251, unit: "litres", varianceValue: 1260 },
  { sku: "Mozzarella Cheese", category: "Dairy", kitchen: "Kitchen 2214", expectedQty: 140, actualQty: 122, unit: "kg", varianceValue: 6840 },
  { sku: "Prawns", category: "Seafood", kitchen: "Kitchen 3390", expectedQty: 90, actualQty: 86, unit: "kg", varianceValue: 2600 },
  { sku: "Butter", category: "Dairy", kitchen: "Kitchen 1187", expectedQty: 110, actualQty: 98, unit: "kg", varianceValue: 5760 },
  { sku: "Chicken Mince", category: "Meat & Poultry", kitchen: "Kitchen 2214", expectedQty: 150, actualQty: 143, unit: "kg", varianceValue: 2100 },
  { sku: "Basmati Rice", category: "Dry Goods", kitchen: "Kitchen 3390", expectedQty: 400, actualQty: 392, unit: "kg", varianceValue: 680 },
];

export function varianceQty(row: TopVarianceRow) {
  return row.actualQty - row.expectedQty;
}
export function variancePercent(row: TopVarianceRow) {
  return (varianceQty(row) / row.expectedQty) * 100;
}

// ---------------------------------------------------------------------------
// Kitchen-wise Inventory Variance
// ---------------------------------------------------------------------------
export interface KitchenVarianceRow {
  kitchen: string;
  totalVariance: number;
  unexplainedLoss: number;
  criticalSkus: number;
  variancePercent: number;
}

export const KITCHEN_VARIANCE: KitchenVarianceRow[] = [
  { kitchen: "Kitchen 2214", totalVariance: 78400, unexplainedLoss: 41200, criticalSkus: 3, variancePercent: 7.8 },
  { kitchen: "Kitchen 1187", totalVariance: 62900, unexplainedLoss: 33500, criticalSkus: 2, variancePercent: 6.1 },
  { kitchen: "Kitchen 3390", totalVariance: 43300, unexplainedLoss: 21500, criticalSkus: 1, variancePercent: 4.5 },
];

// ---------------------------------------------------------------------------
// Inventory Masters — SKU / Recipe / Pricing (compact, same screen)
// ---------------------------------------------------------------------------
export interface SkuMasterRow {
  sku: string;
  name: string;
  category: string;
  uom: string;
  perishable: boolean;
  status: "Active" | "Inactive";
}

export const SKU_MASTER: SkuMasterRow[] = [
  { sku: "SKU-1001", name: "Boneless Chicken", category: "Meat & Poultry", uom: "kg", perishable: true, status: "Active" },
  { sku: "SKU-1002", name: "Paneer", category: "Dairy", uom: "kg", perishable: true, status: "Active" },
  { sku: "SKU-1003", name: "Refined Oil", category: "Oils & Fats", uom: "litres", perishable: false, status: "Active" },
  { sku: "SKU-1004", name: "Mozzarella Cheese", category: "Dairy", uom: "kg", perishable: true, status: "Active" },
  { sku: "SKU-1005", name: "Prawns", category: "Seafood", uom: "kg", perishable: true, status: "Active" },
  { sku: "SKU-1006", name: "Butter", category: "Dairy", uom: "kg", perishable: true, status: "Active" },
  { sku: "SKU-1007", name: "Basmati Rice", category: "Dry Goods", uom: "kg", perishable: false, status: "Active" },
  { sku: "SKU-1008", name: "Chicken Mince", category: "Meat & Poultry", uom: "kg", perishable: true, status: "Inactive" },
];

export interface RecipeMasterRow {
  recipe: string;
  menuItem: string;
  ingredient: string;
  standardQty: number;
  uom: string;
}

export const RECIPE_MASTER: RecipeMasterRow[] = [
  { recipe: "REC-01", menuItem: "Chicken Biryani", ingredient: "Boneless Chicken", standardQty: 0.22, uom: "kg" },
  { recipe: "REC-01", menuItem: "Chicken Biryani", ingredient: "Basmati Rice", standardQty: 0.25, uom: "kg" },
  { recipe: "REC-02", menuItem: "Paneer Tikka Bowl", ingredient: "Paneer", standardQty: 0.15, uom: "kg" },
  { recipe: "REC-02", menuItem: "Paneer Tikka Bowl", ingredient: "Refined Oil", standardQty: 0.02, uom: "litres" },
  { recipe: "REC-03", menuItem: "Margherita Pizza", ingredient: "Mozzarella Cheese", standardQty: 0.18, uom: "kg" },
  { recipe: "REC-04", menuItem: "Prawn Curry Bowl", ingredient: "Prawns", standardQty: 0.2, uom: "kg" },
  { recipe: "REC-05", menuItem: "Butter Chicken", ingredient: "Butter", standardQty: 0.04, uom: "kg" },
  { recipe: "REC-05", menuItem: "Butter Chicken", ingredient: "Boneless Chicken", standardQty: 0.2, uom: "kg" },
];

export interface PricingMasterRow {
  sku: string;
  name: string;
  uom: string;
  currentPrice: number;
  vendor: string;
}

export const PRICING_MASTER: PricingMasterRow[] = [
  { sku: "SKU-1001", name: "Boneless Chicken", uom: "kg", currentPrice: 320, vendor: "Fresh Farm Poultry" },
  { sku: "SKU-1002", name: "Paneer", uom: "kg", currentPrice: 280, vendor: "Dairy Direct" },
  { sku: "SKU-1003", name: "Refined Oil", uom: "litres", currentPrice: 140, vendor: "Sunrise Oils & Fats Co." },
  { sku: "SKU-1004", name: "Mozzarella Cheese", uom: "kg", currentPrice: 380, vendor: "Dairy Direct" },
  { sku: "SKU-1005", name: "Prawns", uom: "kg", currentPrice: 650, vendor: "Ocean Fresh Seafood" },
  { sku: "SKU-1006", name: "Butter", uom: "kg", currentPrice: 480, vendor: "Dairy Direct" },
  { sku: "SKU-1007", name: "Basmati Rice", uom: "kg", currentPrice: 85, vendor: "Golden Grain Traders" },
  { sku: "SKU-1008", name: "Chicken Mince", uom: "kg", currentPrice: 300, vendor: "Fresh Farm Poultry" },
];
