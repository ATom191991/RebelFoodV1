import { useState } from "react";
import { X } from "lucide-react";
import Card from "./Card";
import { useSparkStore } from "../store/useSparkStore";
import { SCRAP_REASONS } from "../data/mockData";
import type { Asset } from "../data/types";

export default function ScrapRequestModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const raiseScrapRequest = useSparkStore((s) => s.raiseScrapRequest);
  const [reason, setReason] = useState<string | null>(null);

  function handleSubmit() {
    if (!reason) return;
    raiseScrapRequest(asset.id, reason);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/50 px-4">
      <div className="w-full max-w-md">
        <Card className="relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-charcoal-500 hover:text-charcoal-900">
            <X size={18} />
          </button>

          <p className="text-[12px] font-semibold uppercase tracking-wide text-brand-red">Raise Scrap Request</p>
          <h3 className="mt-1 text-[18px] font-bold text-charcoal-900">{asset.name}</h3>
          <p className="mt-1 text-[13px] text-charcoal-500">{asset.tag}</p>

          <div className="mt-4">
            <label className="mb-2 block text-[13px] font-medium text-charcoal-700">Scrap reason</label>
            <div className="space-y-2">
              {SCRAP_REASONS.map((r) => (
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
                    name="scrap-reason"
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
            Submit Scrap Request
          </button>
        </Card>
      </div>
    </div>
  );
}
