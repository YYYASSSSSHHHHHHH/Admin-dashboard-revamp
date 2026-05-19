import { Link } from "react-router-dom";
import { Check, ArrowUpRight, Users } from "lucide-react";
import { PLANS, MEMBERS } from "@/data/mockData";

const PlanCard = ({ plan, members, accent }) => {
  const activeOnPlan = members.filter((m) => m.status === "active");
  const mrr = activeOnPlan.reduce((s, m) => s + m.plan.price, 0);

  return (
    <div
      data-testid={`plan-card-${plan.id}`}
      className={`relative bg-white border ${accent.border} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col`}
    >
      <div className={`absolute -top-px left-6 right-6 h-0.5 ${accent.bar} rounded-full`} />
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Plan
          </div>
          <div className="font-display text-2xl font-semibold tracking-tight text-slate-900 mt-1">
            {plan.name}
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${accent.badge}`}>
          {plan.billing}
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-5">
        <span className="font-display text-4xl font-semibold tracking-tight text-slate-900">
          ${plan.price}
        </span>
        <span className="text-sm text-slate-500">/{plan.billing.slice(0, -2)}</span>
      </div>

      <ul className="space-y-2.5 mb-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
            <Check className={`h-4 w-4 mt-0.5 shrink-0 ${accent.check}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5 border-t border-dashed border-slate-200 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Members
          </div>
          <div className="font-display text-lg font-semibold text-slate-900 mt-0.5">
            {members.length}
          </div>
          <div className="text-xs text-slate-500">{activeOnPlan.length} active</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            MRR
          </div>
          <div className="font-display text-lg font-semibold text-slate-900 mt-0.5">
            ${mrr.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">from this plan</div>
        </div>
      </div>

      {members.length > 0 && (
        <div className="mt-5 flex items-center gap-2">
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-semibold border-2 border-white"
                title={m.name}
              >
                {m.avatar}
              </div>
            ))}
            {members.length > 4 && (
              <div className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-semibold border-2 border-white">
                +{members.length - 4}
              </div>
            )}
          </div>
          <Link
            to="/members"
            data-testid={`plan-view-members-${plan.id}`}
            className="ml-auto text-xs font-medium text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 transition-colors"
          >
            View
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
};

const ACCENTS = {
  starter: {
    border: "border-slate-200/80",
    bar: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    check: "text-slate-500",
  },
  growth: {
    border: "border-blue-200/60",
    bar: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    check: "text-blue-600",
  },
  scale: {
    border: "border-violet-200/60",
    bar: "bg-violet-500",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    check: "text-violet-600",
  },
  enterprise: {
    border: "border-slate-900/20",
    bar: "bg-slate-900",
    badge: "bg-slate-900 text-white border-slate-900",
    check: "text-slate-900",
  },
};

export default function MembershipPlans() {
  const totalMembers = MEMBERS.length;
  const totalMrr = MEMBERS.filter((m) => m.status === "active").reduce(
    (s, m) => s + m.plan.price,
    0
  );

  return (
    <div className="p-6 md:p-8 lg:p-10" data-testid="plans-page">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-1.5">
            Catalog
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Membership Plans
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Tiers your members can subscribe to — adoption and revenue at a glance.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-md">
            <span className="text-slate-500">Plans · </span>
            <span className="font-semibold text-slate-900">{PLANS.length}</span>
          </div>
          <div className="text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-md">
            <span className="text-slate-500">Total MRR · </span>
            <span className="font-semibold text-slate-900">${totalMrr.toLocaleString()}</span>
          </div>
          <div className="text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-md">
            <Users className="inline h-3 w-3 mr-1 text-slate-400" />
            <span className="font-semibold text-slate-900">{totalMembers}</span>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {PLANS.map((plan) => {
          const members = MEMBERS.filter((m) => m.plan.id === plan.id);
          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              members={members}
              accent={ACCENTS[plan.id] || ACCENTS.starter}
            />
          );
        })}
      </section>
    </div>
  );
}
