import type { AssetLifecycleStatus, AssetVerification } from "../data/types";

type Tone = "neutral" | "red" | "amber" | "green" | "blue";

export const LIFECYCLE_CONFIG: Record<AssetLifecycleStatus, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "green" },
  in_transit: { label: "In Transit", tone: "blue" },
  scrap_requested: { label: "Scrap Requested", tone: "amber" },
  scrap_approved: { label: "Approved — Pending Disposal", tone: "amber" },
  scrapped: { label: "Scrapped / Disposed", tone: "neutral" },
};

export const VERIFICATION_CONFIG: Record<AssetVerification, { label: string; tone: Tone }> = {
  verified: { label: "Verified", tone: "green" },
  pending_confirmation: { label: "Matched — pending confirmation", tone: "amber" },
  kitchen_mismatch: { label: "Kitchen mismatch — flagged", tone: "red" },
  missing: { label: "Missing — flagged", tone: "red" },
  unregistered: { label: "New — not in system", tone: "amber" },
};
