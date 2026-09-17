import { ChevronDown, CircleUserRound } from "lucide-react";
import { KITCHEN, SHIFT, USER_ROLE } from "../data/mockData";

export default function Topbar({ title }: { title: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-surface-border bg-white px-8">
      <div>
        <h1 className="text-[17px] font-semibold tracking-tight text-charcoal-900">{title}</h1>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-muted px-3 py-1.5 text-[13px]">
          <span className="text-charcoal-500">Kitchen</span>
          <span className="font-semibold text-charcoal-900">{KITCHEN}</span>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-muted px-3 py-1.5 text-[13px]">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
          <span className="font-semibold text-charcoal-900">{SHIFT} shift</span>
        </div>

        <div className="mx-1 h-6 w-px bg-surface-border" />

        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] hover:bg-surface-muted">
          <CircleUserRound size={22} className="text-charcoal-600" strokeWidth={1.6} />
          <span className="font-medium text-charcoal-800">{USER_ROLE}</span>
          <ChevronDown size={14} className="text-charcoal-500" />
        </button>
      </div>
    </header>
  );
}
