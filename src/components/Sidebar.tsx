import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  ClipboardCheck,
  PackageSearch,
  Trash2,
  TriangleAlert,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/grn", label: "GRN", icon: ClipboardCheck },
  { to: "/packaging", label: "Packaging", icon: PackageSearch },
  { to: "/waste", label: "Waste", icon: Trash2 },
  { to: "/exceptions", label: "Exceptions", icon: TriangleAlert },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-charcoal-950 text-white">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-red">
          <Zap size={18} className="fill-white text-white" strokeWidth={0} />
        </div>
        <div>
          <div className="text-[15px] font-bold leading-tight tracking-tight">Spark</div>
          <div className="text-[11px] leading-tight text-charcoal-500">Inventory Control</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-charcoal-500 hover:bg-white/5 hover:text-white",
              ].join(" ")
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-6 py-4 text-[11px] leading-relaxed text-charcoal-500">
        <p className="font-semibold text-charcoal-500/90">Prototype build</p>
        <p>Synthetic data for demo purposes only.</p>
      </div>
    </aside>
  );
}
