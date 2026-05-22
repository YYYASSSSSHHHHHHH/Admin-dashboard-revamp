'use client';

interface PlanBadgeProps {
  plan: string;
}

const PLAN_MAP: Record<string, string> = {
  starter: 'bg-slate-50 text-slate-700 border-slate-200',
  growth: 'bg-blue-50 text-blue-700 border-blue-200',
  scale: 'bg-violet-50 text-violet-700 border-violet-200',
  enterprise: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'tk-lite': 'bg-slate-50 text-slate-700 border-slate-200',
  'tk-standard': 'bg-blue-50 text-blue-700 border-blue-200',
  'tk-premium': 'bg-violet-50 text-violet-700 border-violet-200',
  'tk free': 'bg-slate-50 text-slate-700 border-slate-200',
};

export function PlanBadge({ plan }: PlanBadgeProps) {
  const key = plan?.toLowerCase();
  const cls = PLAN_MAP[key] ?? 'bg-slate-50 text-slate-600 border-slate-200';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${cls}`}
    >
      {plan}
    </span>
  );
}
