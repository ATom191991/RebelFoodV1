import { useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import PackagingReasonModal from "../components/PackagingReasonModal";
import { useSparkStore } from "../store/useSparkStore";
import { PACKAGING_ITEMS, PACKAGING_COUNT_HINTS, TODAY, KITCHEN, expectedUsage } from "../data/mockData";
import { Dices, CheckCircle2 } from "lucide-react";
import type { PackagingCountStatus } from "../data/types";

const STATUS_CONFIG: Record<PackagingCountStatus, { label: string; tone: "neutral" | "red" | "amber" | "green" }> = {
  not_counted: { label: "Count required", tone: "neutral" },
  within_tolerance: { label: "Within tolerance", tone: "green" },
  above_tolerance_pending_reason: { label: "Above tolerance", tone: "red" },
  above_tolerance_reason_logged: { label: "Above tolerance — reason logged", tone: "amber" },
};

export default function Packaging() {
  const packagingCounts = useSparkStore((s) => s.packagingCounts);
  const submitPackagingCount = useSparkStore((s) => s.submitPackagingCount);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [reasonModal, setReasonModal] = useState<{ packagingId: string; physicalCount: number } | null>(null);

  const countedCount = packagingCounts.filter((c) => c.status !== "not_counted" && c.status !== "above_tolerance_pending_reason").length;
  const allDone = countedCount === PACKAGING_ITEMS.length;

  function handleSubmit(packagingId: string) {
    const raw = inputs[packagingId] ?? "";
    const count = parseInt(raw, 10);
    if (Number.isNaN(count)) return;
    submitPackagingCount(packagingId, count);
    const updated = useSparkStore.getState().packagingCounts.find((c) => c.packagingId === packagingId);
    if (updated?.status === "above_tolerance_pending_reason") {
      setReasonModal({ packagingId, physicalCount: count });
    }
  }

  return (
    <Layout title="Packaging — Reconciliation">
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50 px-4 py-2.5 text-[12.5px] text-sky-800">
        <Dices size={15} className="mt-0.5 shrink-0" />
        <span>
          Today was randomly selected for a physical packaging count. Expected usage is calculated from today's
          order volumes and packaging mapping — not manually estimated.
        </span>
      </div>

      <Card padded={false} className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border px-5 py-4">
          <div>
            <h2 className="text-[15px] font-bold text-charcoal-900">Packaging Count — Required Today</h2>
            <p className="mt-0.5 text-[12.5px] text-charcoal-500">
              {TODAY} · {KITCHEN}
            </p>
          </div>
          {allDone ? (
            <StatusBadge label="All packaging types counted" tone="green" />
          ) : (
            <StatusBadge label={`${countedCount} of ${PACKAGING_ITEMS.length} counted`} tone="amber" />
          )}
        </div>

        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-surface-border text-[11.5px] uppercase tracking-wide text-charcoal-500">
              <th className="px-5 py-2.5 font-semibold">Packaging Type</th>
              <th className="px-5 py-2.5 font-semibold">Opening Stock</th>
              <th className="px-5 py-2.5 font-semibold">Expected Usage</th>
              <th className="px-5 py-2.5 font-semibold">Expected Closing</th>
              <th className="px-5 py-2.5 font-semibold">Physical Count</th>
              <th className="px-5 py-2.5 font-semibold">Variance</th>
              <th className="px-5 py-2.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {PACKAGING_ITEMS.map((item) => {
              const record = packagingCounts.find((c) => c.packagingId === item.id)!;
              const usage = expectedUsage(item.id);
              const expectedClosing = item.openingStock - usage;
              const variance = record.physicalCount !== null ? record.physicalCount - expectedClosing : null;
              const status = STATUS_CONFIG[record.status];
              const isEditable = record.status === "not_counted";

              return (
                <tr key={item.id} className="border-b border-surface-border last:border-0 align-top">
                  <td className="px-5 py-3 font-medium text-charcoal-900">{item.name}</td>
                  <td className="px-5 py-3 tabular text-charcoal-700">{item.openingStock}</td>
                  <td className="px-5 py-3 tabular text-charcoal-700">{usage}</td>
                  <td className="px-5 py-3 tabular font-medium text-charcoal-900">{expectedClosing}</td>
                  <td className="px-5 py-3">
                    {isEditable ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={inputs[item.id] ?? ""}
                          onChange={(e) => setInputs((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder={PACKAGING_COUNT_HINTS[item.id] !== undefined ? String(PACKAGING_COUNT_HINTS[item.id]) : "0"}
                          className="w-24 rounded-lg border border-surface-border bg-white px-2.5 py-1.5 text-[13px] font-medium tabular outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/15"
                        />
                        <button
                          onClick={() => handleSubmit(item.id)}
                          className="rounded-lg bg-charcoal-950 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-charcoal-800"
                        >
                          Submit
                        </button>
                      </div>
                    ) : (
                      <span className="tabular font-medium text-charcoal-900">{record.physicalCount}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 tabular text-charcoal-700">
                    {variance !== null ? (
                      <span className={Math.abs(variance) > item.toleranceUnits ? "font-semibold text-brand-redDark" : ""}>
                        {variance > 0 ? "+" : ""}
                        {variance}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge label={status.label} tone={status.tone} />
                    {record.status === "above_tolerance_pending_reason" && (
                      <button
                        onClick={() => setReasonModal({ packagingId: item.id, physicalCount: record.physicalCount! })}
                        className="ml-2 text-[12px] font-semibold text-brand-red underline hover:text-brand-redDark"
                      >
                        Add reason
                      </button>
                    )}
                    {record.reason && (
                      <p className="mt-1 text-[11.5px] text-charcoal-500">Reason: {record.reason}</p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {allDone && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-800">
          <CheckCircle2 size={16} />
          Packaging count submitted for all packaging types today.
        </div>
      )}

      {reasonModal && (
        <PackagingReasonModal
          packagingId={reasonModal.packagingId}
          physicalCount={reasonModal.physicalCount}
          onClose={() => setReasonModal(null)}
        />
      )}
    </Layout>
  );
}
