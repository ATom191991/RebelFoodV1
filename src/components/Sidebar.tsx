import { NavLink } from "react-router-dom";
import {
  ClipboardCheck,
  PackageSearch,
  Trash2,
  Wallet,
  ClipboardList,
  ArrowLeftRight,
  Recycle,
  Zap,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Inventory",
    items: [
      { to: "/grn", label: "GRN Verification", icon: ClipboardCheck },
      { to: "/packaging", label: "Packaging Reconciliation", icon: PackageSearch },
      { to: "/waste", label: "Waste Capture", icon: Trash2 },
    ],
  },
  {
    label: "Cash",
    items: [{ to: "/cod", label: "COD Reconciliation", icon: Wallet }],
  },
  {
    label: "Fixed Assets",
    items: [
      { to: "/assets/register", label: "Register", icon: ClipboardList },
      { to: "/assets/transfer", label: "Transfer", icon: ArrowLeftRight },
      { to: "/assets/scrap", label: "Scrap / Dispose", icon: Recycle },
    ],
  },
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
          <div className="text-[11px] leading-tight text-charcoal-500">Operations Control</div>
        </div>
      </div>

      <nav className="flex-1 space-y-5 px-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-charcoal-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
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
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-6 py-4 text-[11px] leading-relaxed text-charcoal-500">
        <p className="font-semibold text-charcoal-500/90">Prototype build</p>
        <p>Synthetic data for demo purposes only.</p>
      </div>
    </aside>
  );
}
