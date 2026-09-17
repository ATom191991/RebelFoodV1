import { useState } from "react";
import { X, TriangleAlert, CheckCircle2 } from "lucide-react";
import Card from "./Card";
import { skuById, INVOICE_HINTS } from "../data/mockData";
import { useSparkStore } from "../store/useSparkStore";
import { formatInr, formatQty } from "../lib/format";
import type { GrnLine } from "../data/types";

export default function VerifyGrnModal({
  grnId,
  line,
  onClose,
}: {
  grnId: string;
  line: GrnLine;
  onClose: () => void;
}) {
  const sku = skuById(line.skuId);
  const hint = INVOICE_HINTS[line.id];
  const [qtyInput, setQtyInput] = useState<string>(hint !== undefined ? String(hint) : "");
  const [confirmed, setConfirmed] = useState(false);
  const verifyGrnLine = useSparkStore((s) => s.verifyGrnLine);

  const unitLabel = sku.unit === "litres" ? "L" : sku.unit;
  const actualQty = parseFloat(qtyInput);
  const hasValidQty = !Number.isNaN(actualQty) && qtyInput.trim() !== "";
  const varianceQty = hasValidQty ? actualQty - line.orderedQty : null;
  const varianceValue = varianceQty !== null ? Math.abs(varianceQty) * sku.unitValue : null;
  const exceedsTolerance =
    varianceValue !== null && sku.tolerance ? varianceValue > sku.tolerance.lossValueTolerance : false;

  function handleConfirm() {
    if (!hasValidQty) return;
    verifyGrnLine(grnId, line.id, actualQty);
    setConfirmed(true);
  }

  function handleRecheck() {
    setQtyInput("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/50 px-4">
      <div className="w-full max-w-md">
        <Card className="relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-charcoal-500 hover:text-charcoal-900">
            <X size={18} />
          </button>

          {!confirmed ? (
            <>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-brand-red">
                Physical verification required
              </p>
              <h3 className="mt-1 text-[18px] font-bold text-charcoal-900">{sku.name}</h3>

              <div className="mt-4 space-y-3 rounded-lg bg-surface-muted p-4">
                <div className="flex items-center justify-between text-[13.5px]">
                  <span className="text-charcoal-500">PO quantity</span>
                  <span className="font-semibold tabular text-charcoal-900">{formatQty(line.orderedQty, unitLabel)}</span>
                </div>

                <div>
                  <label className="mb-1 block text-[13px] font-medium text-charcoal-700">
                    Enter actual quantity received
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      type="number"
                      value={qtyInput}
                      onChange={(e) => setQtyInput(e.target.value)}
                      className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-[14px] font-medium tabular outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/15"
                      placeholder="0.0"
                    />
                    <span className="text-[13px] text-charcoal-500">{unitLabel}</span>
                  </div>
                </div>
              </div>

              {hasValidQty && (
                <div className="mt-4 space-y-2 rounded-lg border border-surface-border p-4">
                  <div className="flex items-center justify-between text-[13.5px]">
                    <span className="text-charcoal-500">Variance</span>
                    <span
                      className={`font-semibold tabular ${
                        varianceQty === 0 ? "text-charcoal-900" : "text-brand-redDark"
                      }`}
                    >
                      {varianceQty! > 0 ? "+" : ""}
                      {formatQty(varianceQty!, unitLabel)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[13.5px]">
                    <span className="text-charcoal-500">Estimated value variance</span>
                    <span className="font-semibold tabular text-charcoal-900">{formatInr(varianceValue!)}</span>
                  </div>

                  {exceedsTolerance && (
                    <div className="mt-2 flex items-start gap-2 rounded-md bg-brand-redSoft px-3 py-2 text-[12.5px] font-medium text-brand-redDark">
                      <TriangleAlert size={15} className="mt-0.5 shrink-0" />
                      <span>
                        Material receiving variance detected — exceeds tolerance of{" "}
                        {formatInr(sku.tolerance!.lossValueTolerance)}. An exception will be created.
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <button
                  onClick={handleConfirm}
                  disabled={!hasValidQty}
                  className="flex-1 rounded-lg bg-charcoal-950 px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-charcoal-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Confirm &amp; Complete GRN
                </button>
                <button
                  onClick={handleRecheck}
                  className="rounded-lg border border-surface-border px-4 py-2.5 text-[13.5px] font-semibold text-charcoal-700 hover:bg-surface-muted"
                >
                  Recheck
                </button>
              </div>
            </>
          ) : (
            <div className="py-3 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 size={22} className="text-emerald-600" />
              </div>
              <h3 className="text-[16px] font-bold text-charcoal-900">GRN line completed</h3>
              <p className="mt-1 text-[13px] text-charcoal-500">
                {exceedsTolerance
                  ? "Variance exceeded tolerance — an exception has been logged."
                  : "Actual quantity recorded — within tolerance, no exception created."}
              </p>
              <button
                onClick={onClose}
                className="mt-4 w-full rounded-lg bg-charcoal-950 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-charcoal-800"
              >
                Done
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
