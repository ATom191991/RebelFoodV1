import { useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import AssetDetailsModal from "../components/AssetDetailsModal";
import { useSparkStore, selectAssetVerification, selectUnregisteredEntries } from "../store/useSparkStore";
import { KITCHEN, TODAY } from "../data/mockData";
import { VERIFICATION_CONFIG } from "../lib/assetStatus";
import { ClipboardList } from "lucide-react";
import type { Asset } from "../data/types";

export default function AssetRegister() {
  const assets = useSparkStore((s) => s.assets);
  const physicalRegister = useSparkStore((s) => s.physicalRegister);
  const verifyAsset = useSparkStore((s) => s.verifyAsset);
  const reassignAssetKitchen = useSparkStore((s) => s.reassignAssetKitchen);
  const createAssetFromRegisterEntry = useSparkStore((s) => s.createAssetFromRegisterEntry);
  const [detailsAsset, setDetailsAsset] = useState<Asset | null>(null);

  const kitchenAssets = assets.filter((a) => a.kitchen === KITCHEN && a.status !== "scrapped");
  const unregisteredEntries = selectUnregisteredEntries(physicalRegister);

  return (
    <Layout title="Fixed Assets — Register">
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50 px-4 py-2.5 text-[12.5px] text-sky-800">
        <ClipboardList size={15} className="mt-0.5 shrink-0" />
        <span>
          System asset records are imported from Physical Asset Register
        </span>
      </div>

      <Card padded={false} className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border px-5 py-4">
          <div>
            <h2 className="text-[15px] font-bold text-charcoal-900">Physical Fixed Asset Register</h2>
            <p className="mt-0.5 text-[12.5px] text-charcoal-500">
              physical_register_kitchen2214_{TODAY.replace(/\s/g, "").toLowerCase()}.csv · uploaded · {KITCHEN}
            </p>
          </div>
          <StatusBadge label={`${physicalRegister.length} entries in physical register`} tone="neutral" />
        </div>

        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-surface-border text-[11.5px] uppercase tracking-wide text-charcoal-500">
              <th className="px-5 py-2.5 font-semibold">Asset Tag</th>
              <th className="px-5 py-2.5 font-semibold">Description</th>
              <th className="px-5 py-2.5 font-semibold">System Kitchen</th>
              <th className="px-5 py-2.5 font-semibold">Physical Kitchen (as seen)</th>
              <th className="px-5 py-2.5 font-semibold">Verification</th>
              <th className="px-5 py-2.5 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {kitchenAssets.map((asset) => {
              const verification = selectAssetVerification(asset, physicalRegister);
              const cfg = VERIFICATION_CONFIG[verification];
              const entry = physicalRegister.find((e) => e.tagSeen && e.tagSeen === asset.tag);

              return (
                <tr key={asset.id} className="border-b border-surface-border last:border-0">
                  <td className="px-5 py-3 font-medium text-charcoal-900">{asset.tag}</td>
                  <td className="px-5 py-3 text-charcoal-700">{asset.name}</td>
                  <td className="px-5 py-3 text-charcoal-700">{asset.kitchen}</td>
                  <td className="px-5 py-3 text-charcoal-700">{entry ? entry.kitchenSeen : "—"}</td>
                  <td className="px-5 py-3">
                    <StatusBadge label={cfg.label} tone={cfg.tone} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {verification === "pending_confirmation" && (
                        <button
                          onClick={() => verifyAsset(asset.id)}
                          className="rounded-lg bg-charcoal-950 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-charcoal-800"
                        >
                          Confirm
                        </button>
                      )}
                      {verification === "kitchen_mismatch" && entry && (
                        <button
                          onClick={() => reassignAssetKitchen(asset.id, entry.kitchenSeen)}
                          className="rounded-lg bg-brand-red px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-redDark"
                        >
                          Update to {entry.kitchenSeen}
                        </button>
                      )}
                      <button
                        onClick={() => setDetailsAsset(asset)}
                        className="text-[12px] font-semibold text-charcoal-600 underline hover:text-charcoal-900"
                      >
                        View details
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {unregisteredEntries.map((entry) => (
              <tr key={entry.id} className="border-b border-surface-border bg-amber-50/30 last:border-0">
                <td className="px-5 py-3 font-medium text-charcoal-400">—</td>
                <td className="px-5 py-3 text-charcoal-700">{entry.descriptionSeen}</td>
                <td className="px-5 py-3 text-charcoal-400">—</td>
                <td className="px-5 py-3 text-charcoal-700">{entry.kitchenSeen}</td>
                <td className="px-5 py-3">
                  <StatusBadge label={VERIFICATION_CONFIG.unregistered.label} tone={VERIFICATION_CONFIG.unregistered.tone} />
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => createAssetFromRegisterEntry(entry.id)}
                    className="rounded-lg bg-charcoal-950 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-charcoal-800"
                  >
                    Create asset record
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {detailsAsset && <AssetDetailsModal asset={detailsAsset} onClose={() => setDetailsAsset(null)} />}
    </Layout>
  );
}
