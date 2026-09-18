import { create } from "zustand";
import {
  INITIAL_GRNS,
  INITIAL_PACKAGING_COUNTS,
  INITIAL_WASTE,
  INITIAL_CASH,
  INITIAL_ASSETS,
  PHYSICAL_REGISTER,
  PACKAGING_ITEMS,
  TODAY,
  skuById,
  packagingById,
  expectedUsage,
} from "../data/mockData";
import type {
  GrnRecord,
  PackagingCountRecord,
  WasteSku,
  CashReconciliation,
  Asset,
  PhysicalRegisterEntry,
  AssetVerification,
} from "../data/types";

interface SparkState {
  grns: GrnRecord[];
  packagingCounts: PackagingCountRecord[];
  waste: WasteSku[];
  wasteShiftSubmitted: boolean;
  cash: CashReconciliation;
  assets: Asset[];
  physicalRegister: PhysicalRegisterEntry[];

  verifyGrnLine: (grnId: string, lineId: string, actualQty: number) => void;
  submitPackagingCount: (packagingId: string, physicalCount: number, reason?: string) => void;
  setWasteQty: (skuId: string, qty: number | null) => void;
  markNoWaste: (skuId: string) => void;
  submitWasteShift: () => void;
  submitCod: (actualCod: number, reason?: string) => void;

  createAssetFromRegisterEntry: (entryId: string) => void;
  verifyAsset: (assetId: string) => void;
  reassignAssetKitchen: (assetId: string, kitchen: string) => void;
  initiateTransfer: (assetId: string, destinationKitchen: string) => void;
  confirmReceipt: (assetId: string) => void;
  raiseScrapRequest: (assetId: string, reason: string) => void;
  approveScrap: (assetId: string) => void;
  rejectScrap: (assetId: string) => void;
  confirmDisposal: (assetId: string) => void;
}

export const useSparkStore = create<SparkState>((set, get) => ({
  grns: INITIAL_GRNS,
  packagingCounts: INITIAL_PACKAGING_COUNTS,
  waste: INITIAL_WASTE,
  wasteShiftSubmitted: false,
  cash: INITIAL_CASH,
  assets: INITIAL_ASSETS,
  physicalRegister: PHYSICAL_REGISTER,

  verifyGrnLine: (grnId, lineId, actualQty) => {
    const grn = get().grns.find((g) => g.id === grnId);
    const line = grn?.lines.find((l) => l.id === lineId);
    if (!grn || !line) return;
    const sku = skuById(line.skuId);
    const varianceValue = Math.abs(actualQty - line.orderedQty) * sku.unitValue;
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
    set((state) => ({
      waste: state.waste.map((w) => ({ ...w, wasteQty: w.wasteQty ?? 0, recorded: true })),
      wasteShiftSubmitted: true,
    }));
  },

  submitCod: (actualCod, reason) => {
    set((state) => ({ cash: { ...state.cash, actualCod, reason, submitted: true } }));
  },

  createAssetFromRegisterEntry: (entryId) => {
    const entry = get().physicalRegister.find((e) => e.id === entryId);
    if (!entry) return;
    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      tag: entry.tagSeen || `FA-PENDING-${entry.id}`,
      name: entry.descriptionSeen,
      category: "Unclassified",
      kitchen: entry.kitchenSeen,
      purchaseDate: "Unknown",
      purchaseValue: 0,
      status: "active",
      verifiedByStaff: true,
    };
    set((state) => ({
      assets: [...state.assets, newAsset],
      physicalRegister: state.physicalRegister.map((e) => (e.id !== entryId ? e : { ...e, matchedAssetId: newAsset.id })),
    }));
  },

  verifyAsset: (assetId) => {
    set((state) => ({
      assets: state.assets.map((a) => (a.id !== assetId ? a : { ...a, verifiedByStaff: true })),
    }));
  },

  reassignAssetKitchen: (assetId, kitchen) => {
    set((state) => ({
      assets: state.assets.map((a) => (a.id !== assetId ? a : { ...a, kitchen, verifiedByStaff: true })),
    }));
  },

  initiateTransfer: (assetId, destinationKitchen) => {
    set((state) => ({
      assets: state.assets.map((a) =>
        a.id !== assetId ? a : { ...a, status: "in_transit", destinationKitchen, transferInitiatedBy: "Shift Lead" }
      ),
    }));
  },

  confirmReceipt: (assetId) => {
    set((state) => ({
      assets: state.assets.map((a) =>
        a.id !== assetId || !a.destinationKitchen
          ? a
          : { ...a, kitchen: a.destinationKitchen, status: "active", destinationKitchen: undefined, transferInitiatedBy: undefined }
      ),
    }));
  },

  raiseScrapRequest: (assetId, reason) => {
    set((state) => ({
      assets: state.assets.map((a) =>
        a.id !== assetId ? a : { ...a, status: "scrap_requested", scrapReason: reason, scrapRequestedBy: "Shift Lead" }
      ),
    }));
  },

  approveScrap: (assetId) => {
    set((state) => ({
      assets: state.assets.map((a) => (a.id !== assetId ? a : { ...a, status: "scrap_approved" })),
    }));
  },

  rejectScrap: (assetId) => {
    set((state) => ({
      assets: state.assets.map((a) =>
        a.id !== assetId ? a : { ...a, status: "active", scrapReason: undefined, scrapRequestedBy: undefined }
      ),
    }));
  },

  confirmDisposal: (assetId) => {
    set((state) => ({
      assets: state.assets.map((a) => (a.id !== assetId ? a : { ...a, status: "scrapped", disposalDate: TODAY })),
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

export function selectPercentPackagingCountsCompleted(counts: PackagingCountRecord[]) {
  const total = PACKAGING_ITEMS.length;
  const done = counts.filter((c) => c.status !== "not_counted" && c.status !== "above_tolerance_pending_reason").length;
  return Math.round((done / total) * 100);
}

/** Reconciliation status of a system asset against today's physical register — computed, not stored. */
export function selectAssetVerification(asset: Asset, register: PhysicalRegisterEntry[]): AssetVerification {
  if (asset.verifiedByStaff) return "verified";
  const entry = register.find((e) => e.tagSeen && e.tagSeen === asset.tag);
  if (!entry) return "missing";
  if (entry.kitchenSeen !== asset.kitchen) return "kitchen_mismatch";
  return "pending_confirmation";
}

export function selectUnregisteredEntries(register: PhysicalRegisterEntry[]) {
  return register.filter((e) => !e.matchedAssetId);
}
