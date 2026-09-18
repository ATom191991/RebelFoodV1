import { useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import { useSparkStore } from "../store/useSparkStore";
import { COD_VARIANCE_REASONS } from "../data/mockData";
import { formatInr } from "../lib/format";
import { CheckCircle2, TriangleAlert, Wallet } from "lucide-react";

export default function Cod() {
  const cash = useSparkStore((s) => s.cash);
  const submitCod = useSparkStore((s) => s.submitCod);
  const [actualInput, setActualInput] = useState("");
  const [reason, setReason] = useState<string | null>(null);

  if (cash.submitted) {
    const variance = (cash.actualCod ?? 0) - cash.systemCod;
    const exceeded = Math.abs(variance) > cash.tolerance;
    return (
      <Layout title="COD Reconciliation">
        <Card className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 size={24} className="text-emerald-600" />
          </div>
          <h2 className="text-[17px] font-bold text-charcoal-900">COD reconciliation submitted</h2>
          <p className="mt-1 text-[13px] text-charcoal-500">
            {cash.date} · {cash.kitchen} · {cash.shift} shift
          </p>

          <div className="mt-5 divide-y divide-surface-border rounded-lg border border-surface-border text-left text-[13px]">
            <Row label="Number of orders" value={String(cash.ordersCount)} />
            <Row label="System COD collection" value={formatInr(cash.systemCod)} />
            <Row label="Actual COD collection" value={formatInr(cash.actualCod ?? 0)} />
            <Row
              label="Variance"
              value={`${variance > 0 ? "+" : ""}${formatInr(variance)}`}
              emphasize={exceeded}
            />
            {cash.reason && <Row label="Reason" value={cash.reason} />}
            <Row label="Updated by" value={cash.updatedBy} />
          </div>
        </Card>
      </Layout>
    );
  }

  const actual = parseFloat(actualInput);
  const hasValid = !Number.isNaN(actual) && actualInput.trim() !== "";
  const variance = hasValid ? actual - cash.systemCod : null;
  const exceedsTolerance = variance !== null && Math.abs(variance) > cash.tolerance;
  const canSubmit = hasValid && (!exceedsTolerance || !!reason);

  function handleSubmit() {
    if (!canSubmit) return;
    submitCod(actual, exceedsTolerance ? reason! : undefined);
  }

  return (
    <Layout title="COD Reconciliation">
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50 px-4 py-2.5 text-[12.5px] text-sky-800">
        <Wallet size={15} className="mt-0.5 shrink-0" />
        <span>
          Once per shift: enter actual COD collected and Spark compares it against the system-recorded COD for
          today's orders.
        </span>
      </div>

      <Card className="mx-auto max-w-lg">
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface-muted p-4">
          <Field label="Kitchen" value={cash.kitchen} />
          <Field label="Date" value={cash.date} />
          <Field label="Shift" value={cash.shift} />
          <Field label="Number of orders" value={String(cash.ordersCount)} />
          <Field label="System COD Collection" value={formatInr(cash.systemCod)} span />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-[13px] font-medium text-charcoal-700">
            Enter actual COD collection
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-charcoal-500">₹</span>
            <input
              type="number"
              value={actualInput}
              onChange={(e) => setActualInput(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-[14px] font-medium tabular outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/15"
            />
          </div>
        </div>

        {hasValid && (
          <div className="mt-4 space-y-2 rounded-lg border border-surface-border p-4">
            <div className="flex items-center justify-between text-[13.5px]">
              <span className="text-charcoal-500">Variance</span>
              <span className={`font-semibold tabular ${variance === 0 ? "text-charcoal-900" : "text-brand-redDark"}`}>
                {variance! > 0 ? "+" : ""}
                {formatInr(variance!)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13.5px]">
              <span className="text-charcoal-500">Configurable tolerance</span>
              <span className="font-medium tabular text-charcoal-700">±{formatInr(cash.tolerance)}</span>
            </div>

            {exceedsTolerance && (
              <div className="mt-1 flex items-start gap-2 rounded-md bg-brand-redSoft px-3 py-2 text-[12.5px] font-medium text-brand-redDark">
                <TriangleAlert size={15} className="mt-0.5 shrink-0" />
                <span>Variance exceeds the ±{formatInr(cash.tolerance)} tolerance. A reason is required.</span>
              </div>
            )}
          </div>
        )}

        {exceedsTolerance && (
          <div className="mt-4">
            <label className="mb-2 block text-[13px] font-medium text-charcoal-700">Reason</label>
            <div className="space-y-2">
              {COD_VARIANCE_REASONS.map((r) => (
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
                    name="cod-reason"
                    className="accent-brand-red"
                    checked={reason === r}
                    onChange={() => setReason(r)}
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <p className="text-[12px] text-charcoal-500">Updated by: {cash.updatedBy}</p>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-lg bg-charcoal-950 px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-charcoal-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit Reconciliation
          </button>
        </div>
      </Card>
    </Layout>
  );
}

function Field({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <p className="text-[11px] uppercase tracking-wide text-charcoal-500">{label}</p>
      <p className="text-[13.5px] font-semibold text-charcoal-900">{value}</p>
    </div>
  );
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-charcoal-500">{label}</span>
      <span className={`tabular font-medium ${emphasize ? "text-brand-redDark" : "text-charcoal-900"}`}>{value}</span>
    </div>
  );
}
