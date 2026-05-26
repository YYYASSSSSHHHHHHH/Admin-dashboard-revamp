'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Eye,
  EyeOff,
  Pencil,
  CheckCircle2,
  X,
  Building2,
  ChevronDown,
  Clock,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import {
  BROADCAST_TYPES,
  BROADCAST_STATUSES,
  PRODUCT_CONDITIONS,
  MAIN_CATEGORIES,
  SUB_CATEGORIES_BY_MAIN,
  SEND_TO_OPTIONS,
  AUDIENCE_OPTIONS,
  REJECT_REASONS,
  HIDE_REASONS,
} from '@/lib/dashboard-mock-data';
import type { FrontendBroadcast } from '@/lib/dashboard-mock-data';
import { relativeTime } from '@/lib/constants';
import { toast } from 'sonner';

const labelOf = (list: { id: string; label: string }[], id: string) =>
  list.find((x) => x.id === id)?.label || id;

const statusOf = (id: string) => BROADCAST_STATUSES.find((s) => s.id === id) || BROADCAST_STATUSES[0];

function StatusPill({ status }: { status: string }) {
  const s = statusOf(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${s.cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

function formatDateTime(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  );
}

const BROADCAST_DIALOG_SHELL =
  'max-w-2xl w-[calc(100%-2rem)] sm:max-w-2xl h-[min(620px,calc(100vh-2rem))] flex flex-col gap-0 p-0 overflow-hidden';

function SlotField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 min-h-[60px]">
      <Label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 leading-none">
        {label}
      </Label>
      <div className="h-10 flex items-center min-w-0">{children}</div>
    </div>
  );
}

function SlotValue({ value }: { value?: string }) {
  return (
    <span className="text-sm font-medium text-slate-900 truncate block w-full">
      {value || <span className="text-slate-400">—</span>}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </Label>
      {children}
    </div>
  );
}

export interface BroadcastDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  broadcast: FrontendBroadcast | null;
  companyName?: string;
  approveLabel?: string;
  statusBadgeMode?: 'pill' | 'badge';
  statusBadgeValue?: string;
  onSave: (broadcast: FrontendBroadcast) => void;
  onApprove: (broadcast: FrontendBroadcast) => void;
  onReject: (broadcast: FrontendBroadcast, reason: string) => void;
  onHide: (broadcast: FrontendBroadcast, reason: string) => void;
}

export function BroadcastDetailDialog({
  open,
  onOpenChange,
  broadcast,
  companyName = '',
  approveLabel = 'Approve',
  statusBadgeMode = 'pill',
  statusBadgeValue,
  onSave,
  onApprove,
  onReject,
  onHide,
}: BroadcastDetailDialogProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [form, setForm] = useState<FrontendBroadcast | null>(null);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reasonAction, setReasonAction] = useState<'reject' | 'hide'>('reject');
  const [reasonId, setReasonId] = useState('');
  const [reasonNote, setReasonNote] = useState('');

  useEffect(() => {
    if (broadcast && open) {
      setForm({ ...broadcast });
      setMode('view');
    }
  }, [broadcast, open]);

  const subOptions = useMemo(
    () => SUB_CATEGORIES_BY_MAIN[form?.mainCategory || ''] || [],
    [form?.mainCategory],
  );

  const openReasonDialog = (action: 'reject' | 'hide') => {
    setReasonAction(action);
    setReasonId('');
    setReasonNote('');
    setReasonOpen(true);
  };

  const reasonOptions = reasonAction === 'reject' ? REJECT_REASONS : HIDE_REASONS;
  const reasonActionLabel = reasonAction === 'reject' ? 'Reject' : 'Hide';

  const handleReasonConfirm = () => {
    if (!form) return;
    if (!reasonId) {
      toast.error('Please select a reason');
      return;
    }
    const reasonLabel = labelOf(reasonOptions, reasonId);
    if (reasonId === 'other' && !reasonNote.trim()) {
      toast.error('Please specify the reason');
      return;
    }
    const reasonText =
      reasonId === 'other'
        ? reasonNote.trim()
        : reasonLabel + (reasonNote.trim() ? ` — ${reasonNote.trim()}` : '');
    if (reasonAction === 'reject') {
      onReject(form, reasonText);
    } else {
      onHide(form, reasonText);
    }
    setReasonOpen(false);
    onOpenChange(false);
  };

  const handleSaveEdit = () => {
    if (!form?.message?.trim()) {
      toast.error('Broadcast message is required');
      return;
    }
    onSave(form);
    setMode('view');
  };

  const displayCompany = companyName || form?.companyName || '';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent data-testid="broadcast-dialog" className={BROADCAST_DIALOG_SHELL}>
          {broadcast && form && (
            <>
              <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b border-slate-100 space-y-0 gap-0">
                <div className="flex items-start justify-between gap-3 pr-8">
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <DialogTitle className="font-display flex items-center gap-2 text-left">
                        <Radio className="h-4 w-4 text-slate-500 shrink-0" />
                        Broadcast Information
                      </DialogTitle>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border shrink-0 ${
                          mode === 'view'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {mode === 'view' ? <Eye className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                        {mode === 'view' ? 'Viewing' : 'Editing'}
                      </span>
                    </div>
                    <DialogDescription className="flex items-center gap-1.5 text-left">
                      <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {displayCompany} · ID:{' '}
                        <span className="font-mono text-slate-700">{broadcast.id}</span>
                      </span>
                    </DialogDescription>
                  </div>
                  <div className="h-8 shrink-0">
                    {mode === 'view' ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setMode('edit')}
                        className="h-8 text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Pencil className="h-3 w-3 mr-1.5" />
                        Edit
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" size="sm" onClick={handleSaveEdit} className="h-8">
                        <CheckCircle2 className="h-3 w-3 mr-1.5" />
                        Save changes
                      </Button>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 min-h-0 overflow-hidden px-6 py-4 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-0 shrink-0">
                  <SlotField label="Broadcast Type">
                    {mode === 'view' ? (
                      <SlotValue value={labelOf(BROADCAST_TYPES, form.type)} />
                    ) : (
                      <Select
                        value={form.type}
                        onValueChange={(v) => setForm({ ...form, type: v as 'wtb' | 'wts' })}
                      >
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BROADCAST_TYPES.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </SlotField>
                  <SlotField label="Product Condition">
                    {mode === 'view' ? (
                      <SlotValue value={labelOf(PRODUCT_CONDITIONS, form.productCondition)} />
                    ) : (
                      <Select
                        value={form.productCondition}
                        onValueChange={(v) => setForm({ ...form, productCondition: v })}
                      >
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_CONDITIONS.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </SlotField>
                  <SlotField label="Main Category">
                    {mode === 'view' ? (
                      <SlotValue value={labelOf(MAIN_CATEGORIES, form.mainCategory)} />
                    ) : (
                      <Select
                        value={form.mainCategory}
                        onValueChange={(v) => setForm({ ...form, mainCategory: v, subCategory: '' })}
                      >
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MAIN_CATEGORIES.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </SlotField>
                  <SlotField label="Sub Category">
                    {mode === 'view' ? (
                      <SlotValue value={form.subCategory} />
                    ) : (
                      <Select value={form.subCategory} onValueChange={(v) => setForm({ ...form, subCategory: v })}>
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Select sub category" />
                        </SelectTrigger>
                        <SelectContent>
                          {subOptions.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </SlotField>
                </div>

                <div className="shrink-0 flex flex-col gap-1">
                  <Label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 leading-none">
                    Message
                  </Label>
                  <div className="h-20 rounded-lg border border-slate-200 bg-white overflow-hidden">
                    {mode === 'view' ? (
                      <div className="h-full overflow-y-auto px-3.5 py-2.5 text-sm text-slate-900">
                        {form.message}
                      </div>
                    ) : (
                      <Textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="h-full min-h-0 resize-none border-0 bg-transparent rounded-none focus-visible:ring-0 text-sm py-2.5"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-0 shrink-0">
                  <SlotField label="Quantity">
                    {mode === 'view' ? (
                      <SlotValue value={form.quantity} />
                    ) : (
                      <Input
                        value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                        className="h-10"
                      />
                    )}
                  </SlotField>
                  <SlotField label="Price">
                    {mode === 'view' ? (
                      <SlotValue value={form.price} />
                    ) : (
                      <Input
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="h-10"
                      />
                    )}
                  </SlotField>
                  <SlotField label="Sending Option">
                    {mode === 'view' ? (
                      <SlotValue value={labelOf(SEND_TO_OPTIONS, form.sendTo)} />
                    ) : (
                      <Select value={form.sendTo} onValueChange={(v) => setForm({ ...form, sendTo: v })}>
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SEND_TO_OPTIONS.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </SlotField>
                  <SlotField label="Audience">
                    {mode === 'view' ? (
                      <SlotValue value={labelOf(AUDIENCE_OPTIONS, form.audience)} />
                    ) : (
                      <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AUDIENCE_OPTIONS.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </SlotField>
                </div>

                <div className="h-10 shrink-0 flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0 truncate">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      Submitted {form.submittedAgo || relativeTime(form.submittedAt)} ·{' '}
                      {formatDateTime(form.submittedAt)}
                    </span>
                  </div>
                  {statusBadgeMode === 'badge' ? (
                    <StatusBadge status={statusBadgeValue || broadcast.status} />
                  ) : (
                    <StatusPill status={form.status} />
                  )}
                </div>

                {(form.rejectionReason || form.hideReason) && (
                  <div
                    className={`shrink-0 px-3 py-2 rounded-lg border text-xs ${
                      form.rejectionReason
                        ? 'bg-red-50/60 border-red-100 text-red-700'
                        : 'bg-slate-50/80 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="font-semibold uppercase tracking-wider mr-1.5">
                      {form.rejectionReason ? 'Reject reason:' : 'Hide reason:'}
                    </span>
                    {form.rejectionReason || form.hideReason}
                  </div>
                )}
              </div>

              <DialogFooter className="shrink-0 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full mt-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 w-full sm:w-auto justify-between sm:justify-start">
                      <span>Other Actions</span>
                      <ChevronDown className="h-4 w-4 ml-2 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[220px]">
                    <DropdownMenuItem
                      onClick={() => openReasonDialog('reject')}
                      className="cursor-pointer text-red-700 focus:bg-red-50 focus:text-red-800"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject…
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openReasonDialog('hide')} className="cursor-pointer">
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide…
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center gap-2 justify-end">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => onApprove(form)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    {approveLabel}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              {reasonAction === 'reject' ? (
                <X className="h-4 w-4 text-red-500" />
              ) : (
                <EyeOff className="h-4 w-4 text-slate-500" />
              )}
              {reasonActionLabel} Broadcast
            </DialogTitle>
            <DialogDescription>
              Pick a reason <span className="text-slate-400">(reasons managed by admin)</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label={`${reasonActionLabel} Reason`}>
              <Select value={reasonId} onValueChange={setReasonId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reasonOptions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {reasonId === 'other' && (
              <Field label="Specify reason">
                <Textarea
                  value={reasonNote}
                  onChange={(e) => setReasonNote(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </Field>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReasonOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReasonConfirm}
              className={
                reasonAction === 'reject'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }
            >
              Confirm {reasonActionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
