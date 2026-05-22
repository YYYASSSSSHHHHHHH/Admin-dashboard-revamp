'use client';

import { useMemo, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { BROADCAST_TYPES, BROADCAST_STATUSES, SEND_TO_OPTIONS } from '@/lib/dashboard-mock-data';
import type { FrontendBroadcast } from '@/lib/dashboard-mock-data';
import { toFrontendBroadcast } from '@/lib/broadcast-utils';
import { BroadcastDetailDialog } from '@/components/dashboard/BroadcastDetailDialog';
import { formatDate, relativeTime } from '@/lib/constants';
import { toast } from 'sonner';

const labelOf = (list: { id: string; label: string }[], id: string) =>
  list.find((x) => x.id === id)?.label || id;
const statusOf = (id: string) => BROADCAST_STATUSES.find((s) => s.id === id) || BROADCAST_STATUSES[0];

function StatusPill({ status }: { status: string }) {
  const s = statusOf(status);
  return (
    <span
      data-testid={`broadcast-status-${status}`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${s.cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

function normalizeBroadcast(broadcast: any): FrontendBroadcast {
  if (broadcast.submittedAt && broadcast.message) {
    return {
      ...broadcast,
      submittedAgo: broadcast.submittedAgo || relativeTime(broadcast.submittedAt),
    };
  }

  return toFrontendBroadcast({
    id: broadcast.id,
    at: broadcast.at,
    companyName: broadcast.companyName,
    type: broadcast.type,
    condition: broadcast.condition,
    mainCategory: broadcast.mainCategory,
    subCategory: broadcast.subCategory,
    text: broadcast.text,
    qty: broadcast.qty,
    priceOption: broadcast.priceOption,
    priceAmount: broadcast.priceAmount,
    sendingOption: broadcast.sendingOption,
    audience: broadcast.audience,
    status: broadcast.status,
  });
}

interface BroadcastTabProps {
  member: { company?: string; companyName?: string };
  broadcasts: FrontendBroadcast[];
  setBroadcasts: React.Dispatch<React.SetStateAction<FrontendBroadcast[]>>;
}

export function BroadcastTab({ member, broadcasts, setBroadcasts }: BroadcastTabProps) {
  const companyName = member.companyName || member.company || '';
  const [approvalRequired, setApprovalRequired] = useState(true);

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const normalizedBroadcasts = useMemo(() => broadcasts.map(normalizeBroadcast), [broadcasts]);

  const selected = useMemo(
    () => normalizedBroadcasts.find((b) => b.id === selectedId) || null,
    [normalizedBroadcasts, selectedId],
  );

  const openRow = (b: FrontendBroadcast) => {
    setSelectedId(b.id);
    setOpen(true);
  };

  const patchBroadcast = (id: string, patch: Partial<FrontendBroadcast>) => {
    setBroadcasts((prev) =>
      prev.map((b) => (b.id === id ? { ...normalizeBroadcast(b), ...patch } : normalizeBroadcast(b))),
    );
  };

  const sortedBroadcasts = useMemo(
    () =>
      [...normalizedBroadcasts].sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      ),
    [normalizedBroadcasts],
  );

  return (
    <div className="space-y-5" data-testid="broadcast-tab">
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900 tracking-tight">
              Broadcast History
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Click any row to view, edit, or change status.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-medium text-slate-900">Approved</span>
            <span
              className={`text-xs font-medium ${
                approvalRequired ? 'text-emerald-700' : 'text-slate-500'
              }`}
            >
              {approvalRequired ? 'Required' : 'Not required'}
            </span>
            <Switch
              data-testid="approval-required-switch"
              checked={approvalRequired}
              onCheckedChange={setApprovalRequired}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="broadcast-table">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100">
                <th className="px-6 py-3 w-12">Sr No</th>
                <th className="px-6 py-3">Date &amp; Time</th>
                <th className="px-6 py-3">Broadcast Message</th>
                <th className="px-6 py-3">Send to</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedBroadcasts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    data-testid="broadcast-empty"
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No broadcasts yet.
                  </td>
                </tr>
              ) : (
                sortedBroadcasts.map((b, i) => (
                  <tr
                    key={b.id}
                    data-testid={`broadcast-row-${b.id}`}
                    onClick={() => openRow(b)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-3.5 text-slate-500 font-mono text-xs">
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="text-slate-900 font-medium">{formatDate(b.submittedAt)}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {b.submittedAgo || relativeTime(b.submittedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-slate-100 text-slate-700 border-slate-200">
                          {BROADCAST_TYPES.find((t) => t.id === b.type)?.prefix || b.type}
                        </span>
                        <span className="text-slate-700 truncate max-w-[420px]">{b.message}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 whitespace-nowrap">
                      {labelOf(SEND_TO_OPTIONS, b.sendTo)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <StatusPill status={b.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BroadcastDetailDialog
        open={open}
        onOpenChange={setOpen}
        broadcast={selected}
        companyName={companyName}
        approveLabel="Approve"
        onSave={(form) => {
          patchBroadcast(form.id, form);
          toast.success('Broadcast updated');
        }}
        onApprove={(form) => {
          patchBroadcast(form.id, { ...form, status: 'live' });
          toast.success(`Broadcast marked as ${labelOf(BROADCAST_STATUSES, 'live')}`);
          setOpen(false);
        }}
        onReject={(form, reason) => {
          patchBroadcast(form.id, { ...form, status: 'rejected', rejectionReason: reason });
          toast.success(`Broadcast marked as ${labelOf(BROADCAST_STATUSES, 'rejected')}`);
          setOpen(false);
        }}
        onHide={(form, reason) => {
          patchBroadcast(form.id, { ...form, status: 'hide', hideReason: reason });
          toast.success(`Broadcast marked as ${labelOf(BROADCAST_STATUSES, 'hide')}`);
          setOpen(false);
        }}
      />
    </div>
  );
}
