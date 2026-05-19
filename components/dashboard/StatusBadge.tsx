'use client';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status?.toLowerCase();

  const map: Record<string, string> = {
    active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    live:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    suspended: 'bg-red-50 text-red-700 border-red-200',
    inactive:  'bg-red-50 text-red-700 border-red-200',
    hidden:    'bg-amber-50 text-amber-700 border-amber-200',
    pending:   'bg-amber-50 text-amber-700 border-amber-200',
  };

  const cls = map[normalized] ?? map['active'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${cls}`}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {status}
    </span>
  );
}
