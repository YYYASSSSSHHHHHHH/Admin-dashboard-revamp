import { Link } from "react-router-dom";
import {
  Users,
  Wallet,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  CreditCard,
  PauseCircle,
  PlayCircle,
  Plus,
  Clock,
} from "lucide-react";
import { MEMBERS, formatDate, relativeTime } from "@/data/mockData";

const ICONS = {
  plan_assigned: Plus,
  plan_extended: Clock,
  plan_upgraded: TrendingUp,
  member_suspended: PauseCircle,
  member_reactivated: PlayCircle,
  payment_received: CreditCard,
};

const Kpi = ({ label, value, sub, icon: Icon, accent, trend, testid }) => (
  <div
    data-testid={testid}
    className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300"
  >
    <div className="flex items-start justify-between mb-4">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <div className="font-display text-3xl font-semibold tracking-tight text-slate-900">
      {value}
    </div>
    {sub && (
      <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
        {trend === "up" && <ArrowUpRight className="h-3 w-3 text-emerald-600" />}
        {sub}
      </div>
    )}
  </div>
);

export default function Dashboard() {
  const totalMembers = MEMBERS.length;
  const activeMembers = MEMBERS.filter((m) => m.status === "active").length;
  const suspended = MEMBERS.filter((m) => m.status === "suspended").length;
  const mrr = MEMBERS.filter((m) => m.status === "active").reduce(
    (sum, m) => sum + m.plan.price,
    0
  );
  const overdueCount = MEMBERS.filter((m) => m.paymentStatus === "overdue").length;
  const pendingCount = MEMBERS.filter((m) => m.paymentStatus === "pending").length;

  const recentActivity = MEMBERS.flatMap((m) =>
    m.timeline.map((e) => ({ ...e, member: m }))
  )
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 6);

  return (
    <div className="p-6 md:p-8 lg:p-10" data-testid="dashboard-page">
      <header className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-1.5">
          Overview
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Operational snapshot of your marketplace memberships.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi
          testid="kpi-members"
          label="Total Members"
          value={totalMembers}
          sub={`${activeMembers} active · ${suspended} suspended`}
          icon={Users}
          accent="bg-slate-900 text-white"
        />
        <Kpi
          testid="kpi-mrr"
          label="MRR"
          value={`$${mrr.toLocaleString()}`}
          sub="from active subscriptions"
          icon={Wallet}
          accent="bg-emerald-50 text-emerald-600"
          trend="up"
        />
        <Kpi
          testid="kpi-overdue"
          label="Overdue Invoices"
          value={overdueCount}
          sub={overdueCount > 0 ? "Needs attention" : "All clear"}
          icon={AlertTriangle}
          accent="bg-red-50 text-red-600"
        />
        <Kpi
          testid="kpi-pending"
          label="Pending Payments"
          value={pendingCount}
          sub="awaiting clearance"
          icon={CreditCard}
          accent="bg-amber-50 text-amber-600"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 tracking-tight">
                Recent Members
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Latest snapshot — click Manage to edit.
              </p>
            </div>
            <Link
              to="/members"
              data-testid="dashboard-view-all-members"
              className="text-xs font-medium text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 transition-colors"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {MEMBERS.slice(0, 4).map((m) => (
              <li
                key={m.id}
                data-testid={`dashboard-member-${m.id}`}
                className="px-6 py-3.5 flex items-center gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold border border-slate-200">
                  {m.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {m.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {m.plan.name} · {m.company}
                  </div>
                </div>
                <span
                  className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                    m.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {m.status}
                </span>
                <Link
                  to={`/members/${m.id}`}
                  className="text-xs font-medium text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="font-display text-lg font-semibold text-slate-900 tracking-tight">
              Recent Activity
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Across all members in your workspace.
            </p>
          </div>
          <ol className="px-6 py-4 space-y-4">
            {recentActivity.map((e, i) => {
              const Icon = ICONS[e.type] || Plus;
              return (
                <li
                  key={`${e.member.id}-${e.id}-${i}`}
                  data-testid={`dashboard-activity-${i}`}
                  className="flex items-start gap-3"
                >
                  <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-slate-900">
                      <span className="font-medium">{e.member.name}</span>{" "}
                      <span className="text-slate-600">— {e.title.toLowerCase()}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">
                      {e.description}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0 font-mono">
                    {relativeTime(e.at)}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}
