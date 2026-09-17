import { useState } from "react";
import { X, TriangleAlert } from "lucide-react";
import Card from "./Card";
import { useSparkStore } from "../store/useSparkStore";
import { packagingById, expectedUsage } from "../data/mockData";
import { formatInr } from "../lib/format";

const REASONS = ["Spoilage / damaged", "Stock-out", "Counting error", "Other operational reason"];

export default function PackagingReasonModal({
  packagingId,
  physicalCount,
  onClose,
}: {
  packagingId: string;
  physicalCount: number;
  onClose: () => void;
}) {
  const item = packagingById(packagingId);
  const [reason, setReason] = useState<string | null>(null);
  const submitPackagingCount = useSparkStore((s) => s.submitPackagingCount);

  const expectedClosing = item.openingStock - expectedUsage(packagingId);
  const variance = physicalCount - expectedClosing;
  const valueImpact = Math.abs(variance) * item.unitCost;

  function handleSubmit() {
    if (!reason) return;
    submitPackagingCount(packagingId, physicalCount, reason);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/50 px-4">
      <div className="w-full max-w-md">
        <Card className="relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-charcoal-500 hover:text-charcoal-900">
            <X size={18} />
          </button>

          <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-brand-red">
            <TriangleAlert size={13} /> Variance detected
          </p>
          <h3 className="mt-1 text-[18px] font-bold text-charcoal-900">{item.name}</h3>
          <p className="mt-1 text-[13px] text-charcoal-500">
            Physical count is {variance > 0 ? "+" : ""}
            {variance} units vs expected closing stock — an estimated {formatInr(valueImpact)} variance, above the
            ±{item.toleranceUnits} unit tolerance.
          </p>

          <div className="mt-4">
            <label className="mb-2 block text-[13px] font-medium text-charcoal-700">Reason</label>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13.5px] transition-colors ${
                    reason === r
                      ? "border-brand-red bg-brand-redSoft/60 text-brand-redDark"
                      : "border-surface-border text-charcoal-700 hover:bg-surface-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    className="accent-brand-red"
                    checked={reason === r}
                    onChange={() => setReason(r)}
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!reason}
            className="mt-5 w-full rounded-lg bg-charcoal-950 px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-charcoal-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit count &amp; reason
          </button>
        </Card>
      </div>
    </div>
  );
}
