import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import {
  useSparkStore,
  selectPendingVerificationCount,
  selectPackagingAlertCount,
  selectPercentFlaggedVerified,
  selectPercentPackagingCountsCompleted,
  selectPercentWasteRecorded,
  selectUnexplainedLossValue,
  selectReceivingVarianceValue,
  selectPackagingVarianceValue,
  selectWasteValueCaptured,
} from "../store/useSparkStore";
import { SKUS, WASTE_VALUE_CAPTURED_BASELINE, PACKAGING_ITEMS } from "../data/mockData";
import { formatInr } from "../lib/format";
import {
  ClipboardCheck,
  PackageSearch,
  Trash2,
  ArrowRight,
  TriangleAlert,
  Info,
  ShieldAlert,
} from "lucide-react";
import type { ExceptionStatus } from "../data/types";

const EXCEPTION_TONE: Record<ExceptionStatus, "red" | "amber" | "green"> = {
  Open: "red",
  "Under Review": "amber",
  Resolved: "green",
};

export default function Overview() {
  const navigate = useNavigate();
  const grns = useSparkStore((s) => s.grns);
  const exceptions = useSparkStore((s) => s.exceptions);
  const packagingCounts = useSparkStore((s) => s.packagingCounts);
  const waste = useSparkStore((s) => s.waste);
  const wasteShiftSubmitted = useSparkStore((s) => s.wasteShiftSubmitted);

  const flaggedSkuCount = SKUS.filter((s) => s.flagged).length;
  const highRiskReceiving = selectPendingVerificationCount(grns);
  const packagingAlerts = selectPackagingAlertCount(exceptions);
  const wasteEntriesPending = wasteShiftSubmitted ? 0 : 1;

  const unexplainedLoss = selectUnexplainedLossValue(exceptions);
  const receivingVariance = selectReceivingVarianceValue(exceptions);
  const packagingVariance = selectPackagingVarianceValue(exceptions);
  const wasteCaptured = selectWasteValueCaptured(waste, WASTE_VALUE_CAPTURED_BASELINE);

  const pctFlaggedVerified = selectPercentFlaggedVerified(grns);
  const pctPackagingDone = selectPercentPackagingCountsCompleted(packagingCounts);
  const pctWasteRecorded = selectPercentWasteRecorded(waste);

  const recentExceptions = [...exceptions]
    .sort((a, b) => (a.date === b.date ? 0 : a.date > b.date ? -1 : 1))
    .slice(0, 5);

  return (
    <Layout title="Overview">
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-4 py-2.5 text-[12.5px] text-sky-800">
        <Info size={15} className="shrink-0" />
        <span>
          This dashboard uses synthetic demo data to illustrate Spark's workflows — no live systems are connected.
        </span>
      </div>

      {/* Inventory Risk */}
      <section className="mb-7">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-charcoal-500">Inventory Risk</h2>
        <div className="grid grid-cols-4 gap-4">
          <RiskStat label="Flagged SKUs" value={flaggedSkuCount} sub="Recurring loss above tolerance" icon={ShieldAlert} />
          <RiskStat
            label="High-risk receiving items"
            value={highRiskReceiving}
            sub="Awaiting physical verification"
            icon={ClipboardCheck}
            emphasize={highRiskReceiving > 0}
          />
          <RiskStat
            label="Packaging variance alerts"
            value={packagingAlerts}
            sub="Open or under review"
            icon={PackageSearch}
            emphasize={packagingAlerts > 0}
          />
          <RiskStat
            label="Waste entries pending"
            value={wasteEntriesPending}
            sub="End-of-shift capture"
            icon={Trash2}
            emphasize={wasteEntriesPending > 0}
          />
        </div>
      </section>

      {/* Financial Impact */}
      <section className="mb-7">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-charcoal-500">Financial Impact</h2>
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <p className="text-[12.5px] font-medium text-charcoal-500">Unexplained inventory loss</p>
            <p className="mt-2 text-2xl font-bold tabular text-brand-redDark">{formatInr(unexplainedLoss)}</p>
            <p className="mt-1 text-[11.5px] text-charcoal-500">Open + under-review exceptions</p>
          </Card>
          <Card>
            <p className="text-[12.5px] font-medium text-charcoal-500">Receiving variance value</p>
            <p className="mt-2 text-2xl font-bold tabular text-charcoal-900">{formatInr(receivingVariance)}</p>
            <p className="mt-1 text-[11.5px] text-charcoal-500">Detected via flagged-SKU verification</p>
          </Card>
          <Card>
            <p className="text-[12.5px] font-medium text-charcoal-500">Packaging variance value</p>
            <p className="mt-2 text-2xl font-bold tabular text-charcoal-900">{formatInr(packagingVariance)}</p>
            <p className="mt-1 text-[11.5px] text-charcoal-500">Detected via random physical counts</p>
          </Card>
          <Card>
            <p className="text-[12.5px] font-medium text-charcoal-500">Waste value captured</p>
            <p className="mt-2 text-2xl font-bold tabular text-emerald-700">{formatInr(wasteCaptured)}</p>
            <p className="mt-1 text-[11.5px] text-charcoal-500">Attributed &amp; explained loss</p>
          </Card>
        </div>
      </section>

      {/* Priority Actions */}
      <section className="mb-7">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-charcoal-500">Priority Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          <ActionCard
            icon={ClipboardCheck}
            title="Complete GRN verification"
            description={
              highRiskReceiving > 0
                ? `${highRiskReceiving} flagged SKU${highRiskReceiving > 1 ? "s" : ""} awaiting physical count`
                : "All flagged SKUs verified for today"
            }
            done={highRiskReceiving === 0}
            onClick={() => navigate("/grn")}
          />
          <ActionCard
            icon={PackageSearch}
            title="Packaging count required today"
            description={`${pctPackagingDone}% of ${PACKAGING_ITEMS.length} packaging types counted`}
            done={pctPackagingDone === 100}
            onClick={() => navigate("/packaging")}
          />
          <ActionCard
            icon={Trash2}
            title="Record waste"
            description={wasteShiftSubmitted ? "Today's waste has been recorded" : "End-of-shift capture not yet submitted"}
            done={wasteShiftSubmitted}
            onClick={() => navigate("/waste")}
          />
        </div>
      </section>

      {/* Recent Exceptions */}
      <section className="mb-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-charcoal-500">Recent Exceptions</h2>
          <button
            onClick={() => navigate("/exceptions")}
            className="flex items-center gap-1 text-[12.5px] font-medium text-brand-red hover:text-brand-redDark"
          >
            View all <ArrowRight size={13} />
          </button>
        </div>
        <Card padded={false}>
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-surface-border text-[11.5px] uppercase tracking-wide text-charcoal-500">
                <th className="px-5 py-3 font-semibold">SKU</th>
                <th className="px-5 py-3 font-semibold">Issue</th>
                <th className="px-5 py-3 font-semibold">Value</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentExceptions.map((e) => (
                <tr key={e.id} className="border-b border-surface-border last:border-0">
                  <td className="px-5 py-3 font-medium text-charcoal-900">{e.sku}</td>
                  <td className="px-5 py-3 text-charcoal-600">{e.issue}</td>
                  <td className="px-5 py-3 tabular font-medium text-charcoal-900">{formatInr(e.financialImpact)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge label={e.status} tone={EXCEPTION_TONE[e.status]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Metrics */}
      <section>
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-charcoal-500">Metrics</h2>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-charcoal-500">Input metrics</p>
            <MetricRow label="Flagged GRNs physically verified" value={`${pctFlaggedVerified}%`} />
            <MetricRow label="Prompted packaging counts completed" value={`${pctPackagingDone}%`} />
            <MetricRow label="Selected-SKU waste recorded" value={`${pctWasteRecorded}%`} />
          </Card>
          <Card>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-charcoal-500">Output metrics</p>
            <MetricRow label="Receiving variance value" value={formatInr(receivingVariance)} />
            <MetricRow label="Packaging variance value" value={formatInr(packagingVariance)} />
            <MetricRow label="Waste value captured" value={formatInr(wasteCaptured)} />
            <MetricRow label="Unexplained inventory loss" value={formatInr(unexplainedLoss)} />
          </Card>
          <Card className="border-amber-200 bg-amber-50/40">
            <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-amber-800">
              <TriangleAlert size={13} /> Gaming metric — watch closely
            </p>
            <p className="text-[12.5px] leading-snug text-amber-900">
              Control completion increases without a corresponding reduction in inventory variance value.
            </p>
            <div className="mt-3 flex items-center justify-between text-[11.5px] text-amber-800/80">
              <span>Completion (4wk)</span>
              <span className="font-semibold tabular">41% → 78%</span>
            </div>
            <div className="flex items-center justify-between text-[11.5px] text-amber-800/80">
              <span>Variance value (4wk)</span>
              <span className="font-semibold tabular">₹43,600 → ₹42,900</span>
            </div>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

function RiskStat({
  label,
  value,
  sub,
  icon: Icon,
  emphasize,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  emphasize?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <p className="text-[12.5px] font-medium text-charcoal-500">{label}</p>
        <Icon size={16} className={emphasize ? "text-brand-red" : "text-charcoal-500"} />
      </div>
      <p className={`mt-2 text-3xl font-bold tabular ${emphasize ? "text-brand-redDark" : "text-charcoal-900"}`}>
        {value}
      </p>
      <p className="mt-1 text-[11.5px] text-charcoal-500">{sub}</p>
    </Card>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  done,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="text-left">
      <Card className="h-full transition-shadow hover:shadow-pop">
        <div className="flex items-start justify-between">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${done ? "bg-emerald-50" : "bg-brand-redSoft"}`}>
            <Icon size={17} className={done ? "text-emerald-600" : "text-brand-red"} />
          </div>
          {done ? (
            <StatusBadge label="Done" tone="green" />
          ) : (
            <StatusBadge label="Action needed" tone="red" />
          )}
        </div>
        <p className="mt-3 text-[14px] font-semibold text-charcoal-900">{title}</p>
        <p className="mt-1 text-[12.5px] text-charcoal-500">{description}</p>
        <div className="mt-3 flex items-center gap-1 text-[12.5px] font-medium text-brand-red">
          Open <ArrowRight size={13} />
        </div>
      </Card>
    </button>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-surface-border py-2 last:border-0 last:pb-0">
      <span className="text-[12.5px] text-charcoal-600">{label}</span>
      <span className="text-[13px] font-semibold tabular text-charcoal-900">{value}</span>
    </div>
  );
}
