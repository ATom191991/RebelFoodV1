type Tone = "neutral" | "red" | "amber" | "green" | "blue";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-charcoal-100 text-charcoal-700 bg-surface-alt",
  red: "bg-brand-redSoft text-brand-redDark",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-emerald-50 text-emerald-700",
  blue: "bg-sky-50 text-sky-700",
};

export default function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}
