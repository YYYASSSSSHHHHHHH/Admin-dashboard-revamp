import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Sparkles,
  LifeBuoy,
  Settings,
} from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/members", label: "Members", icon: Users },
  { to: "/plans", label: "Membership Plans", icon: Package },
];

const SECONDARY = [
  { to: "#", label: "Settings", icon: Settings, disabled: true },
  { to: "#", label: "Support", icon: LifeBuoy, disabled: true },
];

const Item = ({ to, label, icon: Icon, end, disabled, testid }) => {
  if (disabled) {
    return (
      <div
        data-testid={testid}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 cursor-not-allowed select-none"
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-slate-300 font-medium">
          Soon
        </span>
      </div>
    );
  }
  return (
    <NavLink
      to={to}
      end={end}
      data-testid={testid}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
          isActive
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500"}`} />
          <span className="font-medium">{label}</span>
        </>
      )}
    </NavLink>
  );
};

export const Sidebar = () => {
  return (
    <aside
      data-testid="sidebar"
      className="hidden lg:flex w-[240px] shrink-0 h-screen sticky top-0 flex-col bg-white border-r border-slate-200"
    >
      <div className="px-5 py-6 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="font-display font-semibold text-slate-900 leading-tight">
              Northgate
            </div>
            <div className="text-[11px] text-slate-500 leading-tight">
              Marketplace Admin
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 px-3 mb-2">
          Workspace
        </div>
        {NAV.map((item) => (
          <Item
            key={item.to}
            {...item}
            testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
          />
        ))}

        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 px-3 mt-6 mb-2">
          System
        </div>
        {SECONDARY.map((item) => (
          <Item
            key={item.label}
            {...item}
            testid={`nav-${item.label.toLowerCase()}`}
          />
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-default">
          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold border border-slate-200">
            OC
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-900 truncate">
              Olivia Chen
            </div>
            <div className="text-xs text-slate-500 truncate">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
