'use client';

interface HeaderProps {
  title: string;
  subtitle: string;
  memberCount?: number;
  totalMembers?: number;
}

export function Header({ title, subtitle, memberCount, totalMembers }: HeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-5">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-1.5">
          Workspace
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          {subtitle}
        </p>
      </div>
      {memberCount !== undefined && totalMembers !== undefined && (
        <div className="flex items-center gap-3">
          <div className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-md">
            <span className="font-semibold text-slate-900">{memberCount}</span> /{" "}
            {totalMembers} members
          </div>
        </div>
      )}
    </div>
  );
}

