import { X } from "lucide-react";
import Card from "./Card";
import StatusBadge from "./StatusBadge";
import { useSparkStore, selectAssetVerification } from "../store/useSparkStore";
import { LIFECYCLE_CONFIG, VERIFICATION_CONFIG } from "../lib/assetStatus";
import { formatInr } from "../lib/format";
import type { Asset } from "../data/types";

export default function AssetDetailsModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const physicalRegister = useSparkStore((s) => s.physicalRegister);
  const verification = selectAssetVerification(asset, physicalRegister);
  const lifecycle = LIFECYCLE_CONFIG[asset.status];
  const verificationCfg = VERIFICATION_CONFIG[verification];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/50 px-4">
      <div className="w-full max-w-md">
        <Card className="relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-charcoal-500 hover:text-charcoal-900">
            <X size={18} />
          </button>

          <p className="text-[12px] font-semibold uppercase tracking-wide text-charcoal-500">{asset.tag}</p>
          <h3 className="mt-1 text-[18px] font-bold text-charcoal-900">{asset.name}</h3>

          <div className="mt-4 space-y-3 rounded-lg bg-surface-muted p-4 text-[13.5px]">
            <DetailRow label="Category" value={asset.category} />
            <DetailRow label="Current kitchen" value={asset.kitchen} />
            <DetailRow label="Purchase date" value={asset.purchaseDate} />
            <DetailRow label="Purchase value" value={formatInr(asset.purchaseValue)} />
            {asset.destinationKitchen && <DetailRow label="Destination kitchen" value={asset.destinationKitchen} />}
            {asset.scrapReason && <DetailRow label="Scrap reason" value={asset.scrapReason} />}
            {asset.disposalDate && <DetailRow label="Disposal date" value={asset.disposalDate} />}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <StatusBadge label={lifecycle.label} tone={lifecycle.tone} />
            <StatusBadge label={verificationCfg.label} tone={verificationCfg.tone} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-charcoal-500">{label}</span>
      <span className="font-medium text-charcoal-900">{value}</span>
    </div>
  );
}
