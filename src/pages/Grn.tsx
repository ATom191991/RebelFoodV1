import { useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import VerifyGrnModal from "../components/VerifyGrnModal";
import { useSparkStore } from "../store/useSparkStore";
import { skuById } from "../data/mockData";
import { formatQty, formatInr } from "../lib/format";
import type { GrnLine, GrnLineStatus } from "../data/types";
import { ShieldCheck } from "lucide-react";

const STATUS_CONFIG: Record<GrnLineStatus, { label: string; tone: "neutral" | "red" | "amber" | "green" }> = {
  auto_pass: { label: "Not flagged", tone: "neutral" },
  pending_verification: { label: "Flagged — Verify", tone: "red" },
  verified_within_tolerance: { label: "Verified — within tolerance", tone: "green" },
  verified_exception: { label: "Flagged — Exception", tone: "red" },
};

export default function Grn() {
  const grns = useSparkStore((s) => s.grns);
  const [activeLine, setActiveLine] = useState<{ grnId: string; line: GrnLine } | null>(null);

  return (
    <Layout title="GRN Verification">
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50 px-4 py-2.5 text-[12.5px] text-sky-800">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
        <span>
          Spark only prompts physical verification for SKUs flagged from 3-month loss history. Non-flagged lines
          auto-pass at invoiced quantity — no extra work for staff.
        </span>
      </div>

      <div className="space-y-5">
        {grns.map((grn) => {
          const pendingCount = grn.lines.filter((l) => l.status === "pending_verification").length;
          return (
            <Card key={grn.id} padded={false}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border px-5 py-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-charcoal-500">Supplier</p>
                    <p className="text-[13.5px] font-semibold text-charcoal-900">{grn.supplier}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-charcoal-500">PO Number</p>
                    <p className="text-[13.5px] font-medium text-charcoal-700">{grn.poNumber}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-charcoal-500">Invoice</p>
                    <p className="text-[13.5px] font-medium text-charcoal-700">{grn.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-charcoal-500">Date</p>
                    <p className="text-[13.5px] font-medium text-charcoal-700">{grn.date}</p>
                  </div>
                </div>
                {pendingCount > 0 ? (
                  <StatusBadge label={`${pendingCount} pending verification`} tone="red" />
                ) : (
                  <StatusBadge label="GRN completed" tone="green" />
                )}
              </div>

              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-surface-border text-[11.5px] uppercase tracking-wide text-charcoal-500">
                    <th className="px-5 py-2.5 font-semibold">SKU</th>
                    <th className="px-5 py-2.5 font-semibold">Ordered Qty</th>
                    <th className="px-5 py-2.5 font-semibold">Flagged Status</th>
                    <th className="px-5 py-2.5 font-semibold">Actual Received</th>
                    <th className="px-5 py-2.5 font-semibold">Variance</th>
                    <th className="px-5 py-2.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {grn.lines.map((line) => {
                    const sku = skuById(line.skuId);
                    const unitLabel = sku.unit === "litres" ? "L" : sku.unit;
                    const status = STATUS_CONFIG[line.status];
                    const variance = line.actualQty !== null ? line.actualQty - line.orderedQty : null;
                    const varianceValue = variance !== null ? Math.abs(variance) * sku.unitValue : null;

                    return (
                      <tr key={line.id} className="border-b border-surface-border last:border-0">
                        <td className="px-5 py-3 font-medium text-charcoal-900">{sku.name}</td>
                        <td className="px-5 py-3 tabular text-charcoal-700">{formatQty(line.orderedQty, unitLabel)}</td>
                        <td className="px-5 py-3">
                          <StatusBadge label={status.label} tone={status.tone} />
                        </td>
                        <td className="px-5 py-3 tabular text-charcoal-700">
                          {line.actualQty !== null ? formatQty(line.actualQty, unitLabel) : "—"}
                        </td>
                        <td className="px-5 py-3 tabular text-charcoal-700">
                          {variance !== null ? (
                            <span className={variance !== 0 ? "font-medium text-brand-redDark" : ""}>
                              {variance > 0 ? "+" : ""}
                              {formatQty(variance, unitLabel)}
                              {varianceValue ? (
                                <span className="ml-1 text-[11.5px] text-charcoal-500">
                                  ({formatInr(varianceValue)})
                                </span>
                              ) : null}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {line.status === "pending_verification" ? (
                            <button
                              onClick={() => setActiveLine({ grnId: grn.id, line })}
                              className="rounded-lg bg-brand-red px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-brand-redDark"
                            >
                              Verify
                            </button>
                          ) : (
                            <span className="text-[12px] text-charcoal-500">
                              {line.status === "auto_pass" ? "No action needed" : "Completed"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          );
        })}
      </div>

      {activeLine && (
        <VerifyGrnModal
          grnId={activeLine.grnId}
          line={activeLine.line}
          onClose={() => setActiveLine(null)}
        />
      )}
    </Layout>
  );
}
