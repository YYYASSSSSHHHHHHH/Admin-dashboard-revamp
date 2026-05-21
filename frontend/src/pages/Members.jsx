import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowUpRight, Filter, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEMBERS, formatDate, daysUntil } from "@/data/mockData";

const StatusPill = ({ status }) => {
  const map = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    suspended: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
        map[status] || map.active
      }`}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {status}
    </span>
  );
};

const PayPill = ({ status }) => {
  const map = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    overdue: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
        map[status] || map.paid
      }`}
    >
      {status}
    </span>
  );
};

export default function Members() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  const filtered = useMemo(() => {
    return MEMBERS.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (planFilter !== "all" && m.plan.id !== planFilter) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q)
      );
    });
  }, [query, statusFilter, planFilter]);

  const plans = useMemo(() => {
    const set = new Map();
    MEMBERS.forEach((m) => set.set(m.plan.id, m.plan.name));
    return Array.from(set.entries()).map(([id, name]) => ({ id, name }));
  }, []);

  return (
    <div className="p-6 md:p-8 lg:p-10" data-testid="members-page">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-1.5">
            Workspace
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Members
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Browse, search, and manage every member's plan and billing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-md">
            <span className="font-semibold text-slate-900">{filtered.length}</span> /{" "}
            {MEMBERS.length} members
          </div>
        </div>
      </header>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              data-testid="members-search"
              placeholder="Search by name, email, company…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 pl-9 bg-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger data-testid="members-status-filter" className="h-10 w-full sm:w-[160px] bg-white">
              <Filter className="h-3.5 w-3.5 mr-1 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger data-testid="members-plan-filter" className="h-10 w-full sm:w-[160px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              {plans.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="members-table">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100">
                <th className="px-6 py-3 font-semibold">Member</th>
                <th className="px-6 py-3 font-semibold">Plan</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Payment</th>
                <th className="px-6 py-3 font-semibold">Expiry</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500" data-testid="members-empty">
                    No members match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const days = daysUntil(m.expiry);
                  const expiryTone =
                    days < 0
                      ? "text-red-600"
                      : days <= 7
                        ? "text-amber-600"
                        : "text-slate-700";
                  return (
                    <tr
                      key={m.id}
                      data-testid={`members-row-${m.id}`}
                      onClick={() => navigate(`/members/${m.id}`)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold border border-slate-200 shrink-0">
                            {m.avatar}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 truncate group-hover:underline underline-offset-4 decoration-slate-300">
                              {m.name}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {m.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{m.plan.name}</div>
                        <div className="text-xs text-slate-500">
                          ${m.plan.price}/{m.plan.billing}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={m.status} />
                      </td>
                      <td className="px-6 py-4">
                        <PayPill status={m.paymentStatus} />
                      </td>
                      <td className={`px-6 py-4 ${expiryTone}`}>
                        <div className="font-medium">{formatDate(m.expiry)}</div>
                        <div className="text-xs">
                          {days < 0
                            ? `Expired ${Math.abs(days)}d ago`
                            : days === 0
                              ? "Today"
                              : `${days}d left`}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/members/${m.id}/manage`}
                            data-testid={`members-manage-${m.id}`}
                            title="Manage Plan"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-2.5 py-1.5 rounded-md transition-all"
                          >
                            <Settings2 className="h-3 w-3" />
                            Plan
                          </Link>
                          <Link
                            to={`/members/${m.id}`}
                            data-testid={`members-view-${m.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 rounded-md transition-all"
                          >
                            View
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
