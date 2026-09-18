import { useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import TransferAssetModal from "../components/TransferAssetModal";
import { useSparkStore } from "../store/useSparkStore";
import { KITCHEN } from "../data/mockData";
import { ArrowLeftRight } from "lucide-react";
import type { Asset } from "../data/types";

export default function AssetTransfer() {
  const assets = useSparkStore((s) => s.assets);
  const confirmReceipt = useSparkStore((s) => s.confirmReceipt);
  const [transferAsset, setTransferAsset] = useState<Asset | null>(null);

  const eligibleAssets = assets.filter((a) => a.kitchen === KITCHEN && a.status === "active");
  const pendingTransfers = assets.filter((a) => a.status === "in_transit");

  return (
    <Layout title="Fixed Assets — Transfer">
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50 px-4 py-2.5 text-[12.5px] text-sky-800">
        <ArrowLeftRight size={15} className="mt-0.5 shrink-0" />
        <span>
          Source Kitchen Lead initiates a transfer; the receiving Kitchen Lead confirms receipt before the asset's
          location updates.
        </span>
      </div>

      <Card padded={false} className="mb-6">
        <div className="border-b border-surface-border px-5 py-4">
          <h2 className="text-[15px] font-bold text-charcoal-900">Initiate Transfer</h2>
          <p className="mt-0.5 text-[12.5px] text-charcoal-500">Assets available at {KITCHEN}</p>
        </div>
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-surface-border text-[11.5px] uppercase tracking-wide text-charcoal-500">
              <th className="px-5 py-2.5 font-semibold">Asset</th>
              <th className="px-5 py-2.5 font-semibold">Category</th>
              <th className="px-5 py-2.5 font-semibold">Current Kitchen</th>
              <th className="px-5 py-2.5 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {eligibleAssets.map((asset) => (
              <tr key={asset.id} className="border-b border-surface-border last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium text-charcoal-900">{asset.name}</p>
                  <p className="text-[11.5px] text-charcoal-500">{asset.tag}</p>
                </td>
                <td className="px-5 py-3 text-charcoal-700">{asset.category}</td>
                <td className="px-5 py-3 text-charcoal-700">{asset.kitchen}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => setTransferAsset(asset)}
                    className="rounded-lg bg-charcoal-950 px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-charcoal-800"
                  >
                    Initiate Transfer
                  </button>
                </td>
              </tr>
            ))}
            {eligibleAssets.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-[13px] text-charcoal-500">
                  No assets currently eligible for transfer at {KITCHEN}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card padded={false}>
        <div className="border-b border-surface-border px-5 py-4">
          <h2 className="text-[15px] font-bold text-charcoal-900">Pending Transfers</h2>
          <p className="mt-0.5 text-[12.5px] text-charcoal-500">Awaiting receiving kitchen confirmation</p>
        </div>
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-surface-border text-[11.5px] uppercase tracking-wide text-charcoal-500">
              <th className="px-5 py-2.5 font-semibold">Asset</th>
              <th className="px-5 py-2.5 font-semibold">Current Kitchen</th>
              <th className="px-5 py-2.5 font-semibold">Destination Kitchen</th>
              <th className="px-5 py-2.5 font-semibold">Status</th>
              <th className="px-5 py-2.5 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingTransfers.map((asset) => (
              <tr key={asset.id} className="border-b border-surface-border last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium text-charcoal-900">{asset.name}</p>
                  <p className="text-[11.5px] text-charcoal-500">{asset.tag}</p>
                </td>
                <td className="px-5 py-3 text-charcoal-700">{asset.kitchen}</td>
                <td className="px-5 py-3 text-charcoal-700">{asset.destinationKitchen}</td>
                <td className="px-5 py-3">
                  <StatusBadge label="In Transit" tone="blue" />
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => confirmReceipt(asset.id)}
                    className="rounded-lg bg-brand-red px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-brand-redDark"
                  >
                    Confirm Receipt
                  </button>
                </td>
              </tr>
            ))}
            {pendingTransfers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-[13px] text-charcoal-500">
                  No transfers currently pending receipt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {transferAsset && <TransferAssetModal asset={transferAsset} onClose={() => setTransferAsset(null)} />}
    </Layout>
  );
}
