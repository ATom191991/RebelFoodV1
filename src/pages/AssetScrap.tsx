import { useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import ScrapRequestModal from "../components/ScrapRequestModal";
import { useSparkStore } from "../store/useSparkStore";
import { KITCHEN } from "../data/mockData";
import { Recycle } from "lucide-react";
import type { Asset } from "../data/types";

export default function AssetScrap() {
  const assets = useSparkStore((s) => s.assets);
  const approveScrap = useSparkStore((s) => s.approveScrap);
  const rejectScrap = useSparkStore((s) => s.rejectScrap);
  const confirmDisposal = useSparkStore((s) => s.confirmDisposal);
  const [scrapAsset, setScrapAsset] = useState<Asset | null>(null);

  const eligibleAssets = assets.filter((a) => a.kitchen === KITCHEN && a.status === "active");
  const pendingApproval = assets.filter((a) => a.status === "scrap_requested");
  const pendingDisposal = assets.filter((a) => a.status === "scrap_approved");
  const disposed = assets.filter((a) => a.status === "scrapped");

  return (
    <Layout title="Fixed Assets — Scrap / Dispose">
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50 px-4 py-2.5 text-[12.5px] text-sky-800">
        <Recycle size={15} className="mt-0.5 shrink-0" />
        <span>
          Kitchen Lead raises a scrap request → Finance approves → kitchen disposes → asset status updates to
          Scrapped/Disposed.
        </span>
      </div>

      <Card padded={false} className="mb-6">
        <div className="border-b border-surface-border px-5 py-4">
          <h2 className="text-[15px] font-bold text-charcoal-900">Raise Scrap Request</h2>
          <p className="mt-0.5 text-[12.5px] text-charcoal-500">Assets available at {KITCHEN}</p>
        </div>
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-surface-border text-[11.5px] uppercase tracking-wide text-charcoal-500">
              <th className="px-5 py-2.5 font-semibold">Asset</th>
              <th className="px-5 py-2.5 font-semibold">Category</th>
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
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => setScrapAsset(asset)}
                    className="rounded-lg bg-charcoal-950 px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-charcoal-800"
                  >
                    Raise Scrap Request
                  </button>
                </td>
              </tr>
            ))}
            {eligibleAssets.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-[13px] text-charcoal-500">
                  No assets currently eligible for scrap at {KITCHEN}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card padded={false} className="mb-6">
        <div className="border-b border-surface-border px-5 py-4">
          <h2 className="text-[15px] font-bold text-charcoal-900">Pending Finance Approval</h2>
        </div>
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-surface-border text-[11.5px] uppercase tracking-wide text-charcoal-500">
              <th className="px-5 py-2.5 font-semibold">Asset</th>
              <th className="px-5 py-2.5 font-semibold">Scrap Reason</th>
              <th className="px-5 py-2.5 font-semibold">Requested By</th>
              <th className="px-5 py-2.5 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingApproval.map((asset) => (
              <tr key={asset.id} className="border-b border-surface-border last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium text-charcoal-900">{asset.name}</p>
                  <p className="text-[11.5px] text-charcoal-500">{asset.tag}</p>
                </td>
                <td className="px-5 py-3 text-charcoal-700">{asset.scrapReason}</td>
                <td className="px-5 py-3 text-charcoal-700">{asset.scrapRequestedBy}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => rejectScrap(asset.id)}
                      className="rounded-lg border border-surface-border px-3.5 py-1.5 text-[12.5px] font-semibold text-charcoal-700 hover:bg-surface-muted"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => approveScrap(asset.id)}
                      className="rounded-lg bg-brand-red px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-brand-redDark"
                    >
                      Approve (Finance)
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pendingApproval.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-[13px] text-charcoal-500">
                  No scrap requests awaiting Finance approval.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card padded={false} className="mb-6">
        <div className="border-b border-surface-border px-5 py-4">
          <h2 className="text-[15px] font-bold text-charcoal-900">Approved — Pending Disposal</h2>
        </div>
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-surface-border text-[11.5px] uppercase tracking-wide text-charcoal-500">
              <th className="px-5 py-2.5 font-semibold">Asset</th>
              <th className="px-5 py-2.5 font-semibold">Scrap Reason</th>
              <th className="px-5 py-2.5 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingDisposal.map((asset) => (
              <tr key={asset.id} className="border-b border-surface-border last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium text-charcoal-900">{asset.name}</p>
                  <p className="text-[11.5px] text-charcoal-500">{asset.tag}</p>
                </td>
                <td className="px-5 py-3 text-charcoal-700">{asset.scrapReason}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => confirmDisposal(asset.id)}
                    className="rounded-lg bg-charcoal-950 px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-charcoal-800"
                  >
                    Confirm Disposal
                  </button>
                </td>
              </tr>
            ))}
            {pendingDisposal.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-[13px] text-charcoal-500">
                  No assets approved and awaiting disposal.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card padded={false}>
        <div className="border-b border-surface-border px-5 py-4">
          <h2 className="text-[15px] font-bold text-charcoal-900">Scrapped / Disposed</h2>
        </div>
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-surface-border text-[11.5px] uppercase tracking-wide text-charcoal-500">
              <th className="px-5 py-2.5 font-semibold">Asset</th>
              <th className="px-5 py-2.5 font-semibold">Scrap Reason</th>
              <th className="px-5 py-2.5 font-semibold">Disposal Date</th>
              <th className="px-5 py-2.5 font-semibold">Final Status</th>
            </tr>
          </thead>
          <tbody>
            {disposed.map((asset) => (
              <tr key={asset.id} className="border-b border-surface-border last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium text-charcoal-900">{asset.name}</p>
                  <p className="text-[11.5px] text-charcoal-500">{asset.tag}</p>
                </td>
                <td className="px-5 py-3 text-charcoal-700">{asset.scrapReason}</td>
                <td className="px-5 py-3 text-charcoal-700">{asset.disposalDate}</td>
                <td className="px-5 py-3">
                  <StatusBadge label="Scrapped / Disposed" tone="neutral" />
                </td>
              </tr>
            ))}
            {disposed.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-[13px] text-charcoal-500">
                  No assets have been disposed yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {scrapAsset && <ScrapRequestModal asset={scrapAsset} onClose={() => setScrapAsset(null)} />}
    </Layout>
  );
}
