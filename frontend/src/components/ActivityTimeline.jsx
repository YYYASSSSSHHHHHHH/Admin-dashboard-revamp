import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  TrendingUp,
  Undo2,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, relativeTime } from "@/data/mockData";

const ICON_MAP = {
  plan_assigned: { icon: Plus, cls: "bg-slate-900 text-white" },
  plan_extended: { icon: Clock, cls: "bg-blue-50 text-blue-600 border border-blue-100" },
  plan_upgraded: { icon: TrendingUp, cls: "bg-violet-50 text-violet-600 border border-violet-100" },
  member_suspended: { icon: PauseCircle, cls: "bg-red-50 text-red-600 border border-red-100" },
  member_reactivated: { icon: PlayCircle, cls: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
  payment_received: { icon: CreditCard, cls: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
  invoice_generated: { icon: CheckCircle2, cls: "bg-amber-50 text-amber-600 border border-amber-100" },
  invoice_paid: { icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
  invoice_refunded: { icon: Undo2, cls: "bg-violet-50 text-violet-600 border border-violet-100" },
};

const TYPE_FILTERS = [
  { id: "all", label: "All events" },
  { id: "plan_assigned", label: "Plan assigned" },
  { id: "plan_extended", label: "Plan extended" },
  { id: "plan_upgraded", label: "Plan upgraded" },
  { id: "member_suspended", label: "Suspended" },
  { id: "member_reactivated", label: "Reactivated" },
  { id: "payment_received", label: "Payment received" },
  { id: "invoice_generated", label: "Invoice generated" },
  { id: "invoice_refunded", label: "Refund" },
];

export const ActivityTimeline = ({ events }) => {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    const sorted = [...events].sort((a, b) => new Date(b.at) - new Date(a.at));
    return sorted.filter((e) => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        (e.description || "").toLowerCase().includes(q) ||
        (e.actor || "").toLowerCase().includes(q)
      );
    });
  }, [events, query, typeFilter]);

  return (
    <div
      data-testid="activity-timeline"
      className="bg-white border border-slate-200/80 rounded-xl shadow-sm"
    >
      <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900 tracking-tight">
            Activity Timeline
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Chronological history of plan and billing events
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              data-testid="timeline-search"
              placeholder="Search events…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 pl-9 pr-9 w-full sm:w-[220px] bg-white"
            />
            {query && (
              <button
                type="button"
                data-testid="timeline-search-clear"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger
              data-testid="timeline-type-filter"
              className="h-10 w-full sm:w-[180px] bg-white"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_FILTERS.map((f) => (
                <SelectItem
                  key={f.id}
                  value={f.id}
                  data-testid={`timeline-filter-${f.id}`}
                >
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span
            data-testid="timeline-count"
            className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-md"
          >
            {filtered.length} / {events.length}
          </span>
        </div>
      </div>

      <div className="p-6">
        {filtered.length === 0 ? (
          <div
            data-testid="timeline-empty"
            className="text-sm text-slate-500 text-center py-8"
          >
            {events.length === 0 ? "No activity yet." : "No events match your filters."}
          </div>
        ) : (
          <ol className="relative border-l-2 border-slate-100 ml-4 space-y-6">
            {filtered.map((evt) => {
              const meta = ICON_MAP[evt.type] || ICON_MAP.plan_assigned;
              const Icon = meta.icon;
              return (
                <li
                  key={evt.id}
                  data-testid={`timeline-item-${evt.id}`}
                  className="ml-6 relative animate-in fade-in slide-in-from-left-1 duration-300"
                >
                  <span
                    className={`absolute -left-[34px] top-0 h-7 w-7 rounded-full flex items-center justify-center ring-4 ring-white ${meta.cls}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{evt.title}</div>
                      <div className="text-sm text-slate-600 mt-0.5">{evt.description}</div>
                      <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-2">
                        <span>{evt.actor}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{formatDate(evt.at)}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0 font-mono">
                      {relativeTime(evt.at)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
};
