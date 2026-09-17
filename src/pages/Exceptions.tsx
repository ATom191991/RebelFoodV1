import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import { useSparkStore } from "../store/useSparkStore";
import { formatInr } from "../lib/format";
import type { ExceptionModule, ExceptionStatus } from "../data/types";

const MODULE_TABS: (ExceptionModule | "All")[] = ["All", "GRN", "Packaging", "Waste"];
const STATUSES: ExceptionStatus[] = ["Open", "Under Review", "Resolved"];

const STATUS_TONE: Record<ExceptionStatus, "red" | "amber" | "green"> = {
  Open: "red",
  "Under Review": "amber",
  Resolved: "green",
};

const MODULE_TONE: Record<ExceptionModule, "neutral" | "blue"> = {
  GRN: "blue",
  Packaging: "blue",
  Waste: "blue",
};

export default function Exceptions() {
  const exceptions = useSparkStore((s) => s.exceptions);
  const setExceptionStatus = useSparkStore((s) => s.setExceptionStatus);
  const [tab, setTab] = useState<(typeof MODULE_TABS)[number]>("All");

  const filtered = useMemo(() => {
    const list = tab === "All" ? exceptions : exceptions.filter((e) => e.module === tab);
    return [...list].sort((a, b) => (a.date === b.date ? 0 : a.date > b.date ? -1 : 1));
  }, [exceptions, tab]);

  const openCount = exceptions.filter((e) => e.status !== "Resolved").length;

  return (
    <Layout title="Exceptions">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-1 rounded-lg border border-surface-border bg-white p-1">
          {MODULE_TABS.map((m) => (
            <button
              key={m}
              onClick={() => setTab(m)}
              className={`rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                tab === m ? "bg-charcoal-950 text-white" : "text-charcoal-600 hover:bg-surface-muted"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <p className="text-[12.5px] text-charcoal-500">
          <span className="font-semibold text-charcoal-900">{openCount}</span> exception{openCount === 1 ? "" : "s"} awaiting
          resolution
        </p>
      </div>

      <Card padded={false} className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-surface-border text-[11px] uppercase tracking-wide text-charcoal-500">
              <th className="whitespace-nowrap px-3 py-3 font-semibold">Date</th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">Kitchen</th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">SKU</th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">Module</th>
              <th className="w-full px-3 py-3 font-semibold">Issue</th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">Variance</th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">Impact</th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">Status</th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">Owner</th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-b border-surface-border last:border-0">
                <td className="whitespace-nowrap px-3 py-3 text-charcoal-700">{e.date}</td>
                <td className="whitespace-nowrap px-3 py-3 text-charcoal-700">{e.kitchen}</td>
                <td className="whitespace-nowrap px-3 py-3 font-medium text-charcoal-900">{e.sku}</td>
                <td className="whitespace-nowrap px-3 py-3">
                  <StatusBadge label={e.module} tone={MODULE_TONE[e.module]} />
                </td>
                <td className="px-3 py-3 text-charcoal-600">{e.issue}</td>
                <td className="whitespace-nowrap px-3 py-3 tabular text-charcoal-700">{e.variance}</td>
                <td className="whitespace-nowrap px-3 py-3 tabular font-medium text-charcoal-900">
                  {formatInr(e.financialImpact)}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <StatusBadge label={e.status} tone={STATUS_TONE[e.status]} />
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-charcoal-700">{e.owner}</td>
                <td className="whitespace-nowrap px-3 py-3">
                  {e.status !== "Resolved" && (
                    <select
                      value=""
                      onChange={(ev) => {
                        if (ev.target.value) setExceptionStatus(e.id, ev.target.value as ExceptionStatus);
                      }}
                      className="rounded-md border border-surface-border bg-white px-1.5 py-1 text-[11.5px] font-medium text-charcoal-700 outline-none focus:border-brand-red"
                    >
                      <option value="" disabled>
                        Update
                      </option>
                      {STATUSES.filter((s) => s !== e.status).map((s) => (
                        <option key={s} value={s}>
                          Mark {s}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="px-5 py-10 text-center text-[13px] text-charcoal-500">
                  No exceptions in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </Layout>
  );
}
