'use client';

interface StatusBadgeProps {
  status: string;
}

const STATUS_MAP: Record<string, string> = {
  active:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  approved:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  live:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  open:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending:    'bg-amber-50 text-amber-700 border-amber-200',
  unpaid:     'bg-amber-50 text-amber-700 border-amber-200',
  paid:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  'n/a':      'bg-slate-100 text-slate-500 border-slate-200',
  callback:   'bg-amber-50 text-amber-700 border-amber-200',
  incomplete: 'bg-purple-50 text-purple-700 border-purple-200',
  suspended:  'bg-red-50 text-red-700 border-red-200',
  rejected:   'bg-red-50 text-red-700 border-red-200',
  inactive:   'bg-slate-100 text-slate-500 border-slate-200',
  hidden:     'bg-slate-100 text-slate-500 border-slate-200',
  hide:       'bg-slate-100 text-slate-500 border-slate-200',
  closed:     'bg-slate-100 text-slate-500 border-slate-200',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = status?.toLowerCase();
  const cls = STATUS_MAP[key] ?? 'bg-slate-50 text-slate-600 border-slate-200';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${cls}`}
    >
      {status}
    </span>
  );
}
