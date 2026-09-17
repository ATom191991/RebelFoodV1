import { create } from "zustand";
import {
  INITIAL_GRNS,
  INITIAL_PACKAGING_COUNTS,
  INITIAL_WASTE,
  INITIAL_EXCEPTIONS,
  PACKAGING_ITEMS,
  skuById,
  packagingById,
  expectedUsage,
  WASTE_TYPICAL_QTY,
  WASTE_ANOMALY_MULTIPLIER,
  TODAY,
  KITCHEN,
} from "../data/mockData";
import type {
  GrnRecord,
  PackagingCountRecord,
  WasteSku,
  ExceptionRecord,
  ExceptionStatus,
} from "../data/types";

let exceptionSeq = INITIAL_EXCEPTIONS.length + 1;
const nextExceptionId = () => `exc-${exceptionSeq++}`;

interface SparkState {
  grns: GrnRecord[];
  packagingCounts: PackagingCountRecord[];
  waste: WasteSku[];
  wasteShiftSubmitted: boolean;
  exceptions: ExceptionRecord[];

  verifyGrnLine: (grnId: string, lineId: string, actualQty: number) => void;
  submitPackagingCount: (packagingId: string, physicalCount: number, reason?: string) => void;
  setWasteQty: (skuId: string, qty: number | null) => void;
  markNoWaste: (skuId: string) => void;
  submitWasteShift: () => void;
  setExceptionStatus: (id: string, status: ExceptionStatus) => void;
}

export const useSparkStore = create<SparkState>((set, get) => ({
  grns: INITIAL_GRNS,
  packagingCounts: INITIAL_PACKAGING_COUNTS,
  waste: INITIAL_WASTE,
  wasteShiftSubmitted: false,
  exceptions: INITIAL_EXCEPTIONS,

  verifyGrnLine: (grnId, lineId, actualQty) => {
    const grn = get().grns.find((g) => g.id === grnId);
    const line = grn?.lines.find((l) => l.id === lineId);
    if (!grn || !line) return;
    const sku = skuById(line.skuId);
    const varianceQty = actualQty - line.orderedQty;
    const varianceValue = Math.abs(varianceQty) * sku.unitValue;
    const exceedsTolerance = sku.tolerance ? varianceValue > sku.tolerance.lossValueTolerance : false;

    set((state) => ({
      grns: state.grns.map((g) =>
        g.id !== grnId
          ? g
          : {
              ...g,
              lines: g.lines.map((l) =>
                l.id !== lineId
                  ? l
                  : { ...l, actualQty, status: exceedsTolerance ? "verified_exception" : "verified_within_tolerance" }
              ),
            }
      ),
    }));

    if (exceedsTolerance) {
      const unitLabel = sku.unit === "litres" ? "L" : sku.unit;
      const record: ExceptionRecord = {
        id: nextExceptionId(),
        date: TODAY,
        kitchen: grn.kitchen,
        sku: sku.name,
        module: "GRN",
        issue: "Material receiving variance detected",
        variance: `${varianceQty > 0 ? "+" : ""}${varianceQty.toFixed(1)} ${unitLabel}`,
        financialImpact: Math.round(varianceValue),
        status: "Open",
        owner: "Receiving Team",
      };
      set((state) => ({ exceptions: [record, ...state.exceptions] }));
    }
  },

  submitPackagingCount: (packagingId, physicalCount, reason) => {
    const item = packagingById(packagingId);
    const expectedClosing = item.openingStock - expectedUsage(packagingId);
    const variance = physicalCount - expectedClosing;
    const aboveTolerance = Math.abs(variance) > item.toleranceUnits;

    if (aboveTolerance && !reason) {
      set((state) => ({
        packagingCounts: state.packagingCounts.map((c) =>
          c.packagingId !== packagingId
            ? c
            : { ...c, physicalCount, status: "above_tolerance_pending_reason" }
        ),
      }));
      return;
    }

    set((state) => ({
      packagingCounts: state.packagingCounts.map((c) =>
        c.packagingId !== packagingId
          ? c
          : {
              ...c,
              physicalCount,
              status: aboveTolerance ? "above_tolerance_reason_logged" : "within_tolerance",
              reason,
            }
      ),
    }));

    if (aboveTolerance) {
      const record: ExceptionRecord = {
        id: nextExceptionId(),
        date: TODAY,
        kitchen: KITCHEN,
        sku: item.name,
        module: "Packaging",
        issue: "Packaging count variance above tolerance",
        variance: `${variance > 0 ? "+" : ""}${variance} units`,
        financialImpact: Math.round(Math.abs(variance) * item.unitCost),
        status: "Open",
        owner: "Shift Lead",
      };
      set((state) => ({ exceptions: [record, ...state.exceptions] }));
    }
  },

  setWasteQty: (skuId, qty) => {
    set((state) => ({
      waste: state.waste.map((w) => (w.skuId !== skuId ? w : { ...w, wasteQty: qty, recorded: false })),
    }));
  },

  markNoWaste: (skuId) => {
    set((state) => ({
      waste: state.waste.map((w) => (w.skuId !== skuId ? w : { ...w, wasteQty: 0, recorded: true })),
    }));
  },

  submitWasteShift: () => {
    const { waste } = get();
    const newExceptions: ExceptionRecord[] = [];

    waste.forEach((w) => {
      const qty = w.wasteQty ?? 0;
      const sku = skuById(w.skuId);
      const typical = WASTE_TYPICAL_QTY[w.skuId] ?? Infinity;
      if (qty > typical * WASTE_ANOMALY_MULTIPLIER) {
        newExceptions.push({
          id: nextExceptionId(),
          date: TODAY,
          kitchen: KITCHEN,
          sku: sku.name,
          module: "Waste",
          issue: "Waste quantity above typical shift pattern",
          variance: `+${(qty - typical).toFixed(1)} ${sku.unit === "litres" ? "L" : sku.unit} vs typical`,
          financialImpact: Math.round(qty * sku.unitValue),
          status: "Under Review",
          owner: "Shift Lead",
        });
      }
    });

    set((state) => ({
      waste: state.waste.map((w) => ({ ...w, wasteQty: w.wasteQty ?? 0, recorded: true })),
      wasteShiftSubmitted: true,
      exceptions: [...newExceptions, ...state.exceptions],
    }));
  },

  setExceptionStatus: (id, status) => {
    set((state) => ({
      exceptions: state.exceptions.map((e) => (e.id !== id ? e : { ...e, status })),
    }));
  },
}));

// ---------------------------------------------------------------------------
// Derived selectors — pure functions over store state, used across pages.
// ---------------------------------------------------------------------------
export function selectFlaggedGrnLines(grns: GrnRecord[]) {
  return grns.flatMap((g) => g.lines.filter((l) => skuById(l.skuId).flagged).map((l) => ({ grn: g, line: l })));
}

export function selectPendingVerificationCount(grns: GrnRecord[]) {
  return selectFlaggedGrnLines(grns).filter(({ line }) => line.status === "pending_verification").length;
}

export function selectPercentFlaggedVerified(grns: GrnRecord[]) {
  const flagged = selectFlaggedGrnLines(grns);
  if (flagged.length === 0) return 100;
  const verified = flagged.filter(({ line }) => line.status !== "pending_verification").length;
  return Math.round((verified / flagged.length) * 100);
}

export function selectPackagingAlertCount(exceptions: ExceptionRecord[]) {
  return exceptions.filter((e) => e.module === "Packaging" && e.status !== "Resolved").length;
}

export function selectPercentPackagingCountsCompleted(counts: PackagingCountRecord[]) {
  const total = PACKAGING_ITEMS.length;
  const done = counts.filter((c) => c.status !== "not_counted" && c.status !== "above_tolerance_pending_reason").length;
  return Math.round((done / total) * 100);
}

export function selectPercentWasteRecorded(waste: WasteSku[]) {
  const done = waste.filter((w) => w.recorded).length;
  return Math.round((done / waste.length) * 100);
}

export function selectUnexplainedLossValue(exceptions: ExceptionRecord[]) {
  return exceptions.filter((e) => e.status !== "Resolved").reduce((sum, e) => sum + e.financialImpact, 0);
}

export function selectReceivingVarianceValue(exceptions: ExceptionRecord[]) {
  return exceptions.filter((e) => e.module === "GRN").reduce((sum, e) => sum + e.financialImpact, 0);
}

export function selectPackagingVarianceValue(exceptions: ExceptionRecord[]) {
  return exceptions.filter((e) => e.module === "Packaging").reduce((sum, e) => sum + e.financialImpact, 0);
}

export function selectWasteValueCaptured(waste: WasteSku[], baseline: number) {
  const todayValue = waste.reduce((sum, w) => {
    if (!w.wasteQty) return sum;
    return sum + w.wasteQty * skuById(w.skuId).unitValue;
  }, 0);
  return baseline + todayValue;
}
