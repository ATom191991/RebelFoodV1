import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import InventoryTrendChart from "../components/InventoryTrendChart";
import { formatInr } from "../lib/format";
import {
  TIME_PERIODS,
  CATEGORIES,
  DASHBOARD_KITCHENS,
  DASHBOARD_KPIS,
  TREND_DATA,
  STOCK_SURVIVAL,
  TOP_VARIANCE,
  KITCHEN_VARIANCE,
  SKU_MASTER,
  RECIPE_MASTER,
  PRICING_MASTER,
  stockSurvivalDaysOfCover,
  varianceQty,
  variancePercent,
  type TimePeriod,
  type SurvivalStatus,
} from "../data/inventoryDashboardData";
import { AlertTriangle, TrendingDown, ShieldAlert, PackageX } from "lucide-react";

const SURVIVAL_TONE: Record<SurvivalStatus, "red" | "amber" | "green"> = {
  Critical: "red",
  Low: "amber",
  Healthy: "green",
};

const selectClass =
  "rounded-lg border border-surface-border bg-white px-3 py-2 text-[13px] font-medium text-charcoal-700 outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/15";

export default function InventoryDashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("Monthly");
  const [kitchen, setKitchen] = useState(DASHBOARD_KITCHENS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [dateFrom, setDateFrom] = useState("2026-09-01");
  const [dateTo, setDateTo] = useState("2026-09-18");

  const kpis = useMemo(() => {
    if (kitchen === "All Kitchens") return DASHBOARD_KPIS;
    const row = KITCHEN_VARIANCE.find((k) => k.kitchen === kitchen);
    const lowSurvival = STOCK_SURVIVAL.filter((s) => s.kitchen === kitchen && s.status !== "Healthy").length;
    return {
      totalInventoryVariance: row?.totalVariance ?? 0,
      unexplainedLoss: row?.unexplainedLoss ?? 0,
      criticalSkus: row?.criticalSkus ?? 0,
      lowSurvivalStock: lowSurvival,
    };
  }, [kitchen]);

  const stockSurvivalRows = STOCK_SURVIVAL.filter(
    (r) => (kitchen === "All Kitchens" || r.kitchen === kitchen) && (category === "All Categories" || r.category === category)
  );
  const topVarianceRows = TOP_VARIANCE.filter(
    (r) => (kitchen === "All Kitchens" || r.kitchen === kitchen) && (category === "All Categories" || r.category === category)
  );
  const kitchenVarianceRows = KITCHEN_VARIANCE.filter((r) => kitchen === "All Kitchens" || r.kitchen === kitchen);
  const skuMasterRows = SKU_MASTER.filter((r) => category === "All Categories" || r.category === category);

  const trend = TREND_DATA[timePeriod];

  return (
    <Layout title="Inventory Dashboard">
      <p className="mb-6 -mt-2 text-[13px] text-charcoal-500">Stock, consumption and variance across kitchens</p>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <FilterField label="Time Period">
            <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value as TimePeriod)} className={selectClass}>
              {TIME_PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Kitchen">
            <select value={kitchen} onChange={(e) => setKitchen(e.target.value)} className={selectClass}>
              {DASHBOARD_KITCHENS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Date Range">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={selectClass}
              />
              <span className="text-charcoal-500">to</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={selectClass} />
            </div>
          </FilterField>
        </div>
      </Card>

      {/* KPI cards */}
      <div className="mb-7 grid grid-cols-4 gap-4">
        <KpiCard label="Total Inventory Variance" value={formatInr(kpis.totalInventoryVariance)} icon={TrendingDown} />
        <KpiCard label="Unexplained Loss" value={formatInr(kpis.unexplainedLoss)} icon={AlertTriangle} emphasize />
        <KpiCard label="Critical SKUs" value={String(kpis.criticalSkus)} icon={ShieldAlert} emphasize />
        <KpiCard label="Low Survival Stock" value={String(kpis.lowSurvivalStock)} icon={PackageX} />
      </div>

      {/* Trend */}
      <section className="mb-7">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-charcoal-500">
          Inventory Variance Trend
        </h2>
        <Card>
          <InventoryTrendChart
            labels={trend.map((t) => t.label)}
            series={[
              { key: "variance", label: "Total Inventory Variance", color: "#d92d3c", values: trend.map((t) => t.totalVariance) },
              { key: "loss", label: "Unexplained Loss", color: "#0284c7", values: trend.map((t) => t.unexplainedLoss) },
            ]}
          />
        </Card>
      </section>

      {/* Stock Survival */}
      <section className="mb-7">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-charcoal-500">
          Stock Survival — Critical Ingredients
        </h2>
        <Card padded={false} className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-surface-border text-[11.5px] uppercase tracking-wide text-charcoal-500">
                <th className="px-5 py-3 font-semibold">Ingredient</th>
                <th className="px-5 py-3 font-semibold">Current Stock</th>
                <th className="px-5 py-3 font-semibold">Avg. Daily Usage</th>
                <th className="px-5 py-3 font-semibold">Days of Cover</th>
                <th className="px-5 py-3 font-semibold">Min. Stock</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {stockSurvivalRows.map((r) => (
                <tr key={r.ingredient} className="border-b border-surface-border last:border-0">
                  <td className="px-5 py-3 font-medium text-charcoal-900">{r.ingredient}</td>
                  <td className="px-5 py-3 tabular text-charcoal-700">
                    {r.currentStock} {r.unit}
                  </td>
                  <td className="px-5 py-3 tabular text-charcoal-700">
                    {r.avgDailyUsage} {r.unit}/day
                  </td>
                  <td className="px-5 py-3 tabular font-medium text-charcoal-900">
                    {stockSurvivalDaysOfCover(r).toFixed(1)} days
                  </td>
                  <td className="px-5 py-3 tabular text-charcoal-700">
                    {r.minStock} {r.unit}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge label={r.status} tone={SURVIVAL_TONE[r.status]} />
                  </td>
                </tr>
              ))}
              {stockSurvivalRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[13px] text-charcoal-500">
                    No ingredients match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Top Variance by SKU */}
      <section className="mb-7">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-charcoal-500">
          Top Inventory Variance by SKU
        </h2>
        <Card padded={false} className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-surface-border text-[11.5px] uppercase tracking-wide text-charcoal-500">
                <th className="px-5 py-3 font-semibold">SKU</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Expected Qty</th>
                <th className="px-5 py-3 font-semibold">Actual Qty</th>
                <th className="px-5 py-3 font-semibold">Variance</th>
                <th className="px-5 py-3 font-semibold">Variance %</th>
                <th className="px-5 py-3 font-semibold">Variance Value</th>
              </tr>
            </thead>
            <tbody>
              {topVarianceRows.map((r) => {
                const qty = varianceQty(r);
                const pct = variancePercent(r);
                return (
                  <tr key={r.sku} className="border-b border-surface-border last:border-0">
                    <td className="px-5 py-3 font-medium text-charcoal-900">{r.sku}</td>
                    <td className="px-5 py-3 text-charcoal-700">{r.category}</td>
                    <td className="px-5 py-3 tabular text-charcoal-700">
                      {r.expectedQty} {r.unit}
                    </td>
                    <td className="px-5 py-3 tabular text-charcoal-700">
                      {r.actualQty} {r.unit}
                    </td>
                    <td className="px-5 py-3 tabular font-medium text-brand-redDark">
                      {qty} {r.unit}
                    </td>
                    <td className="px-5 py-3 tabular font-medium text-brand-redDark">{pct.toFixed(1)}%</td>
                    <td className="px-5 py-3 tabular font-medium text-charcoal-900">{formatInr(r.varianceValue)}</td>
                  </tr>
                );
              })}
              {topVarianceRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[13px] text-charcoal-500">
                    No SKUs match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Kitchen-wise Variance */}
      <section className="mb-7">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-charcoal-500">
          Kitchen-wise Inventory Variance
        </h2>
        <Card padded={false} className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-surface-border text-[11.5px] uppercase tracking-wide text-charcoal-500">
                <th className="px-5 py-3 font-semibold">Kitchen</th>
                <th className="px-5 py-3 font-semibold">Total Variance</th>
                <th className="px-5 py-3 font-semibold">Unexplained Loss</th>
                <th className="px-5 py-3 font-semibold">Critical SKUs</th>
                <th className="px-5 py-3 font-semibold">Variance %</th>
              </tr>
            </thead>
            <tbody>
              {kitchenVarianceRows.map((r) => (
                <tr key={r.kitchen} className="border-b border-surface-border last:border-0">
                  <td className="px-5 py-3 font-medium text-charcoal-900">{r.kitchen}</td>
                  <td className="px-5 py-3 tabular text-charcoal-700">{formatInr(r.totalVariance)}</td>
                  <td className="px-5 py-3 tabular text-charcoal-700">{formatInr(r.unexplainedLoss)}</td>
                  <td className="px-5 py-3 tabular text-charcoal-700">{r.criticalSkus}</td>
                  <td className="px-5 py-3 tabular font-medium text-brand-redDark">{r.variancePercent.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Inventory Masters */}
      <section>
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-charcoal-500">Inventory Masters</h2>
        <div className="space-y-5">
          <Card padded={false} className="overflow-x-auto">
            <div className="border-b border-surface-border px-5 py-3">
              <h3 className="text-[13.5px] font-semibold text-charcoal-900">SKU Master</h3>
            </div>
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-surface-border text-[11px] uppercase tracking-wide text-charcoal-500">
                  <th className="px-5 py-2.5 font-semibold">SKU</th>
                  <th className="px-5 py-2.5 font-semibold">Name</th>
                  <th className="px-5 py-2.5 font-semibold">Category</th>
                  <th className="px-5 py-2.5 font-semibold">UOM</th>
                  <th className="px-5 py-2.5 font-semibold">Perishable</th>
                  <th className="px-5 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {skuMasterRows.map((r) => (
                  <tr key={r.sku} className="border-b border-surface-border last:border-0">
                    <td className="px-5 py-2.5 font-medium text-charcoal-900">{r.sku}</td>
                    <td className="px-5 py-2.5 text-charcoal-700">{r.name}</td>
                    <td className="px-5 py-2.5 text-charcoal-700">{r.category}</td>
                    <td className="px-5 py-2.5 text-charcoal-700">{r.uom}</td>
                    <td className="px-5 py-2.5 text-charcoal-700">{r.perishable ? "Yes" : "No"}</td>
                    <td className="px-5 py-2.5">
                      <StatusBadge label={r.status} tone={r.status === "Active" ? "green" : "neutral"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card padded={false} className="overflow-x-auto">
            <div className="border-b border-surface-border px-5 py-3">
              <h3 className="text-[13.5px] font-semibold text-charcoal-900">Recipe Master</h3>
            </div>
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-surface-border text-[11px] uppercase tracking-wide text-charcoal-500">
                  <th className="px-5 py-2.5 font-semibold">Recipe</th>
                  <th className="px-5 py-2.5 font-semibold">Menu Item</th>
                  <th className="px-5 py-2.5 font-semibold">Ingredient</th>
                  <th className="px-5 py-2.5 font-semibold">Standard Qty</th>
                  <th className="px-5 py-2.5 font-semibold">UOM</th>
                </tr>
              </thead>
              <tbody>
                {RECIPE_MASTER.map((r, i) => (
                  <tr key={`${r.recipe}-${i}`} className="border-b border-surface-border last:border-0">
                    <td className="px-5 py-2.5 font-medium text-charcoal-900">{r.recipe}</td>
                    <td className="px-5 py-2.5 text-charcoal-700">{r.menuItem}</td>
                    <td className="px-5 py-2.5 text-charcoal-700">{r.ingredient}</td>
                    <td className="px-5 py-2.5 tabular text-charcoal-700">{r.standardQty}</td>
                    <td className="px-5 py-2.5 text-charcoal-700">{r.uom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card padded={false} className="overflow-x-auto">
            <div className="border-b border-surface-border px-5 py-3">
              <h3 className="text-[13.5px] font-semibold text-charcoal-900">Pricing Master</h3>
            </div>
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-surface-border text-[11px] uppercase tracking-wide text-charcoal-500">
                  <th className="px-5 py-2.5 font-semibold">SKU</th>
                  <th className="px-5 py-2.5 font-semibold">Name</th>
                  <th className="px-5 py-2.5 font-semibold">UOM</th>
                  <th className="px-5 py-2.5 font-semibold">Current Price</th>
                  <th className="px-5 py-2.5 font-semibold">Vendor</th>
                </tr>
              </thead>
              <tbody>
                {PRICING_MASTER.map((r) => (
                  <tr key={r.sku} className="border-b border-surface-border last:border-0">
                    <td className="px-5 py-2.5 font-medium text-charcoal-900">{r.sku}</td>
                    <td className="px-5 py-2.5 text-charcoal-700">{r.name}</td>
                    <td className="px-5 py-2.5 text-charcoal-700">{r.uom}</td>
                    <td className="px-5 py-2.5 tabular text-charcoal-700">{formatInr(r.currentPrice)}</td>
                    <td className="px-5 py-2.5 text-charcoal-700">{r.vendor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-charcoal-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  emphasize,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  emphasize?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <p className="text-[12.5px] font-medium text-charcoal-500">{label}</p>
        <Icon size={16} className={emphasize ? "text-brand-red" : "text-charcoal-500"} />
      </div>
      <p className={`mt-2 text-3xl font-bold tabular ${emphasize ? "text-brand-redDark" : "text-charcoal-900"}`}>
        {value}
      </p>
    </Card>
  );
}
