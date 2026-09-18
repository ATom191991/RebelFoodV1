import { useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import { useSparkStore } from "../store/useSparkStore";
import { WASTE_SKU_IDS, skuById, TODAY, KITCHEN } from "../data/mockData";
import { formatInr } from "../lib/format";
import { CheckCircle2, Target } from "lucide-react";

export default function Waste() {
  const waste = useSparkStore((s) => s.waste);
  const wasteShiftSubmitted = useSparkStore((s) => s.wasteShiftSubmitted);
  const setWasteQty = useSparkStore((s) => s.setWasteQty);
  const markNoWaste = useSparkStore((s) => s.markNoWaste);
  const submitWasteShift = useSparkStore((s) => s.submitWasteShift);

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [noWaste, setNoWaste] = useState<Record<string, boolean>>({});

  const rows = WASTE_SKU_IDS.map((skuId) => {
    const sku = skuById(skuId);
    const unitLabel = sku.unit === "litres" ? "litres" : sku.unit;
    const qty = noWaste[skuId] ? 0 : parseFloat(inputs[skuId] ?? "");
    const validQty = Number.isNaN(qty) ? null : qty;
    const wasteValue = validQty !== null ? validQty * sku.unitValue : null;
    const filled = noWaste[skuId] || (inputs[skuId] ?? "").trim() !== "";
    return { sku, unitLabel, validQty, wasteValue, filled };
  });

  const allFilled = rows.every((r) => r.filled);
  const totalValue = rows.reduce((sum, r) => sum + (r.wasteValue ?? 0), 0);

  function handleSubmit() {
    rows.forEach(({ sku, validQty }) => {
      if (noWaste[sku.id]) {
        markNoWaste(sku.id);
      } else {
        setWasteQty(sku.id, validQty ?? 0);
      }
    });
    submitWasteShift();
  }

  if (wasteShiftSubmitted) {
    const submittedRows = waste.map((w) => {
      const sku = skuById(w.skuId);
      const unitLabel = sku.unit === "litres" ? "litres" : sku.unit;
      return { sku, unitLabel, qty: w.wasteQty ?? 0, value: (w.wasteQty ?? 0) * sku.unitValue };
    });
    const totalCapturedValue = submittedRows.reduce((sum, r) => sum + r.value, 0);

    return (
      <Layout title="Waste Capture">
        <Card className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 size={24} className="text-emerald-600" />
          </div>
          <h2 className="text-[17px] font-bold text-charcoal-900">Today's waste recorded</h2>
          <p className="mt-1 text-[13px] text-charcoal-500">
            {TODAY} · {KITCHEN}
          </p>

          <div className="mt-5 divide-y divide-surface-border rounded-lg border border-surface-border text-left">
            {submittedRows.map((r) => (
              <div key={r.sku.id} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                <span className="text-charcoal-700">{r.sku.name}</span>
                <span className="tabular text-charcoal-900">
                  {r.qty} {r.unitLabel} · {formatInr(r.value)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-surface-muted px-4 py-3">
            <span className="text-[13px] font-medium text-charcoal-700">Total waste value</span>
            <span className="text-[16px] font-bold tabular text-brand-redDark">{formatInr(totalCapturedValue)}</span>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title="Waste Capture">
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50 px-4 py-2.5 text-[12.5px] text-sky-800">
        <Target size={15} className="mt-0.5 shrink-0" />
        <span>
          Only selected high-value / high-loss SKUs require waste capture. This separates known, explained waste
          from unexplained inventory variance.
        </span>
      </div>

      <Card padded={false}>
        <div className="border-b border-surface-border px-5 py-4">
          <h2 className="text-[15px] font-bold text-charcoal-900">End-of-Shift Waste Capture</h2>
          <p className="mt-0.5 text-[12.5px] text-charcoal-500">
            {TODAY} · {KITCHEN}
          </p>
        </div>

        <div className="divide-y divide-surface-border">
          {rows.map(({ sku, unitLabel, wasteValue }) => (
            <div key={sku.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-[160px]">
                <p className="text-[14px] font-semibold text-charcoal-900">{sku.name}</p>
                <p className="text-[11.5px] text-charcoal-500">Unit value {formatInr(sku.unitValue)}/{unitLabel}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    disabled={!!noWaste[sku.id]}
                    value={inputs[sku.id] ?? ""}
                    onChange={(e) => setInputs((prev) => ({ ...prev, [sku.id]: e.target.value }))}
                    placeholder="0.0"
                    className="w-24 rounded-lg border border-surface-border bg-white px-2.5 py-1.5 text-[13px] font-medium tabular outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/15 disabled:bg-surface-muted disabled:text-charcoal-500"
                  />
                  <span className="text-[12.5px] text-charcoal-500">{unitLabel}</span>
                </div>

                <label className="flex items-center gap-1.5 text-[12.5px] text-charcoal-600">
                  <input
                    type="checkbox"
                    className="accent-brand-red"
                    checked={!!noWaste[sku.id]}
                    onChange={(e) => {
                      setNoWaste((prev) => ({ ...prev, [sku.id]: e.target.checked }));
                      if (e.target.checked) setInputs((prev) => ({ ...prev, [sku.id]: "" }));
                    }}
                  />
                  No waste
                </label>

                <div className="w-28 text-right">
                  <p className="text-[11px] text-charcoal-500">Waste value</p>
                  <p className="text-[13.5px] font-semibold tabular text-charcoal-900">
                    {wasteValue !== null ? formatInr(wasteValue) : "—"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-surface-border px-5 py-4">
          <div className="text-[13px] text-charcoal-600">
            Running total: <span className="font-semibold tabular text-charcoal-900">{formatInr(totalValue)}</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!allFilled}
            className="rounded-lg bg-charcoal-950 px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-charcoal-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit Waste
          </button>
        </div>
      </Card>
    </Layout>
  );
}
