'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Check, ArrowUpRight, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

interface Plan {
  id: string;
  name: string;
  price: number;
  billing: string;
  features: string[];
}


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
    check: "text-violet-650",
  },
  enterprise: {
    border: "border-slate-900/20",
    bar: "bg-slate-900",
    badge: "bg-slate-900 text-white border-slate-900",
    check: "text-slate-900",
  },
};

const isMemberOnPlan = (member: any, plan: Plan) => {
  const mPlan = (member.plan || '').toLowerCase().trim();
  const pId = (plan.id || '').toLowerCase().trim();
  const pName = (plan.name || '').toLowerCase().trim();
  return mPlan === pId || mPlan === pName;
};

interface PlanCardProps {
  plan: Plan;
  members: any[];
  accent: typeof ACCENTS.starter;
}

const PlanCard = ({ plan, members, accent }: PlanCardProps) => {
  const activeOnPlan = members.filter((m) => m.status?.toLowerCase() === "active");
  const mrr = activeOnPlan.reduce((s) => s + plan.price, 0);

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
                {m.initials}
              </div>
            ))}
            {members.length > 4 && (
              <div className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-semibold border-2 border-white">
                +{members.length - 4}
              </div>
            )}
          </div>
          <Link
            href="/members"
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

export default function MembershipPlans() {
  const [members, setMembers] = useState<any[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [membersRes, plansRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/plans')
        ]);
        const membersData = await membersRes.json();
        const plansData = await plansRes.json();
        setMembers(membersData);
        setPlans(plansData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalMembers = members.length;

  const totalMrr = useMemo(() => {
    return members
      .filter((m) => m.status?.toLowerCase() === 'active')
      .reduce((sum, m) => {
        const matchedPlan = plans.find((p) => isMemberOnPlan(m, p));
        return sum + (matchedPlan ? matchedPlan.price : 0);
      }, 0);
  }, [members, plans]);

  return (
    <DashboardLayout>
      <div data-testid="plans-page" className="p-6 md:p-8 lg:p-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
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
              <span className="font-semibold text-slate-900">{plans.length}</span>
            </div>
            <div className="text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-md">
              <span className="text-slate-500">Total MRR · </span>
              <span className="font-semibold text-slate-900">${totalMrr.toLocaleString()}</span>
            </div>
            <div className="text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-md flex items-center">
              <Users className="inline h-3 w-3 mr-1 text-slate-400" />
              <span className="font-semibold text-slate-900 ml-1">{totalMembers}</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center min-h-[30vh]">
            <p className="text-slate-500 font-medium animate-pulse">Loading plans data...</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {plans.map((plan) => {
              const planMembers = members.filter((m) => isMemberOnPlan(m, plan));
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  members={planMembers}
                  accent={ACCENTS[plan.id as keyof typeof ACCENTS] || ACCENTS.starter}
                />
              );
            })}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
