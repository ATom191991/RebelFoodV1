import { useState } from "react";
import { X } from "lucide-react";
import Card from "./Card";
import { useSparkStore } from "../store/useSparkStore";
import { KITCHENS } from "../data/mockData";
import type { Asset } from "../data/types";

export default function TransferAssetModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const initiateTransfer = useSparkStore((s) => s.initiateTransfer);
  const options = KITCHENS.filter((k) => k !== asset.kitchen);
  const [destination, setDestination] = useState(options[0] ?? "");

  function handleConfirm() {
    if (!destination) return;
    initiateTransfer(asset.id, destination);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/50 px-4">
      <div className="w-full max-w-md">
        <Card className="relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-charcoal-500 hover:text-charcoal-900">
            <X size={18} />
          </button>

          <p className="text-[12px] font-semibold uppercase tracking-wide text-brand-red">Initiate Transfer</p>
          <h3 className="mt-1 text-[18px] font-bold text-charcoal-900">{asset.name}</h3>
          <p className="mt-1 text-[13px] text-charcoal-500">{asset.tag}</p>

          <div className="mt-4 space-y-3 rounded-lg bg-surface-muted p-4">
            <div className="flex items-center justify-between text-[13.5px]">
              <span className="text-charcoal-500">Current kitchen</span>
              <span className="font-semibold text-charcoal-900">{asset.kitchen}</span>
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-medium text-charcoal-700">Destination kitchen</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-[13.5px] font-medium outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/15"
              >
                {options.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="mt-5 w-full rounded-lg bg-charcoal-950 px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-charcoal-800"
          >
            Initiate Transfer
          </button>
        </Card>
      </div>
    </div>
  );
}
