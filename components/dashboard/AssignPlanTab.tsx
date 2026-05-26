'use client';

import { useMemo, useState, Fragment } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CreditCard,
  Plus,
  Settings2,
  TrendingUp,
  PauseCircle,
  PlayCircle,
  FileText,
  Undo2,
  DollarSign,
  AlertTriangle,
  Trash2,
  Edit,
} from 'lucide-react';
import { InvoiceRowActionsMenu } from '@/components/dashboard/InvoiceRowActionsMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import {
  ACTIONS,
  PLANS,
  SUSPEND_REASONS,
  formatDate,
  relativeTime,
  Plan,
} from '@/lib/constants';
import { cn } from '@/lib/utils';
import { RECIPIENT_BANKS, PAYMENT_MODES } from '@/lib/invoice-utils';
import { toast } from 'sonner';

const INVOICE_CHOICES = [
  { id: 'none', label: 'No Invoice', description: 'Apply the action only', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'proforma', label: 'Proforma', description: 'Preliminary, not payable', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'final', label: 'Final Invoice', description: 'Real invoice + bank details', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
];

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

const Field = ({ label, children, hint }: FieldProps) => (
  <div className="flex flex-col gap-1.5">
    <Label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </Label>
    {children}
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
);

const ICONS: Record<string, any> = {
  plan_assigned: Plus,
  plan_extended: Clock,
  plan_upgraded: TrendingUp,
  member_suspended: PauseCircle,
  member_reactivated: PlayCircle,
  payment_received: CreditCard,
  invoice_generated: FileText,
  invoice_refunded: Undo2,
  invoice: FileText,
};

interface Invoice {
  id: string;
  invoiceNumber?: string;
  amount: number;
  type: 'final' | 'proforma';
  status: string;
  issuedAt: string;
  dueDate: string;
  planName?: string;
  validityStart?: string;
  validityEnd?: string;
  bankName?: string;
  bankRef?: string;
  bankRemark?: string;
  paidOn?: string;
}

function formatTableDate(dateInput: string) {
  if (!dateInput) return '—';
  const parsed = new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) return dateInput;
  const day = String(parsed.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day}-${months[parsed.getMonth()]}-${parsed.getFullYear()}`;
}

type InvoiceDisplayStatus = 'Unpaid' | 'Paid' | 'Cancel';

function invoiceStatusLabel(status: string): InvoiceDisplayStatus {
  const normalized = status.toLowerCase();
  if (normalized === 'paid') return 'Paid';
  if (normalized === 'cancel' || normalized === 'cancelled') return 'Cancel';
  return 'Unpaid';
}

function invoiceStatusToStored(status: InvoiceDisplayStatus): string {
  if (status === 'Paid') return 'paid';
  if (status === 'Cancel') return 'cancel';
  return 'pending';
}

function formatInrAmount(amount: number) {
  return `₹ ${amount.toLocaleString('en-IN')}`;
}

interface TimelineEvent {
  id: number;
  type: string;
  title: string;
  description: string;
  at: string;
  actor: string;
}

interface AssignPlanTabProps {
  member: any;
  plan: Plan;
  setPlan: (plan: Plan) => void;
  status: string;
  setStatus: (status: string) => void;
  expiry: string;
  setExpiry: (expiry: string) => void;
  timeline: TimelineEvent[];
  setTimeline: React.Dispatch<React.SetStateAction<TimelineEvent[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
}

const addDaysIso = (iso: string, days: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export function AssignPlanTab({
  member: seed,
  plan,
  setPlan,
  status,
  setStatus,
  expiry,
  setExpiry,
  timeline,
  setTimeline,
  invoices,
  setInvoices,
}: AssignPlanTabProps) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('assign');
  const [planId, setPlanId] = useState(plan.id);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [expiryDate, setExpiryDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  });
  const [duration, setDuration] = useState('30');
  const [reasonId, setReasonId] = useState('policy_violation');
  const [reasonOther, setReasonOther] = useState('');
  const [note, setNote] = useState('');
  const [invoiceChoice, setInvoiceChoice] = useState('none');
  const [bankDate, setBankDate] = useState<Date>(new Date());
  const [bankName, setBankName] = useState('');
  const [bankRef, setBankRef] = useState('');
  const [bankAmount, setBankAmount] = useState(plan.price.toString());
  const [bankRemark, setBankRemark] = useState('');
  const [markPaid, setMarkPaid] = useState(false);

  // New states for toggling views and expanding invoice rows
  const [viewMode, setViewMode] = useState<'activity' | 'invoices'>('activity');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  const [invoiceStatusOpen, setInvoiceStatusOpen] = useState(false);
  const [invoiceActionTarget, setInvoiceActionTarget] = useState<Invoice | null>(null);
  const [invoiceEditStatus, setInvoiceEditStatus] = useState<InvoiceDisplayStatus>('Unpaid');
  const [invoicePayDate, setInvoicePayDate] = useState('');
  const [invoicePayBank, setInvoicePayBank] = useState('');
  const [invoicePayRef, setInvoicePayRef] = useState('');
  const [invoicePayAmt, setInvoicePayAmt] = useState('');
  const [invoicePayMode, setInvoicePayMode] = useState<(typeof PAYMENT_MODES)[number] | ''>('Bank Transfer');
  const [invoicePayRemark, setInvoicePayRemark] = useState('');
  const [invoiceDeleteOpen, setInvoiceDeleteOpen] = useState(false);
  const [invoiceDeleting, setInvoiceDeleting] = useState<Invoice | null>(null);

  const openDialog = () => {
    setAction('assign');
    setPlanId(plan.id);
    const today = new Date();
    setStartDate(today);
    const exp = new Date(today);
    exp.setDate(exp.getDate() + 30);
    setExpiryDate(exp);
    setDuration('30');
    setReasonId('policy_violation');
    setReasonOther('');
    setNote('');
    setInvoiceChoice('none');
    setBankDate(today);
    setBankName('');
    setBankRef('');
    setBankAmount(plan.price.toString());
    setBankRemark('');
    setMarkPaid(false);
    setOpen(true);
  };

  const invoiceApplicable =
    action === 'assign' || action === 'extend' || action === 'upgrade';

  const handleConfirm = () => {
    const nowIso = new Date().toISOString();
    let events: TimelineEvent[] = [];
    let newInvoice: Invoice | null = null;
    let newPlan = plan;
    let newExpiry = expiry;
    let newStatus = status;

    if (action === 'assign') {
      newPlan = PLANS.find((p) => p.id === planId) || plan;
      newExpiry = expiryDate.toISOString();
      newStatus = 'active';
      events.push({
        id: Date.now(),
        type: 'plan_assigned',
        title: 'Plan assigned',
        description: `${newPlan.name} · ${formatDate(startDate.toISOString())} → ${formatDate(newExpiry)}`,
        at: nowIso,
        actor: 'Olivia Chen',
      });
    } else if (action === 'extend') {
      const days = parseInt(duration, 10) || 30;
      newExpiry = addDaysIso(expiry, days);
      events.push({
        id: Date.now(),
        type: 'plan_extended',
        title: 'Plan extended',
        description: `Extended by ${days} days`,
        at: nowIso,
        actor: 'Olivia Chen',
      });
    } else if (action === 'upgrade') {
      newPlan = PLANS.find((p) => p.id === planId) || plan;
      events.push({
        id: Date.now(),
        type: 'plan_upgraded',
        title: 'Plan upgraded',
        description: `Upgraded to ${newPlan.name}`,
        at: nowIso,
        actor: 'Olivia Chen',
      });
    } else if (action === 'suspend') {
      if (status === 'suspended') {
        toast.error('Member is already suspended');
        return;
      }
      const reason =
        reasonId === 'other'
          ? reasonOther.trim() || 'Other'
          : SUSPEND_REASONS.find((r) => r.id === reasonId)?.label || '—';
      if (reasonId === 'other' && !reasonOther.trim()) {
        toast.error('Please specify the reason');
        return;
      }
      newStatus = 'suspended';
      events.push({
        id: Date.now(),
        type: 'member_suspended',
        title: 'Member suspended',
        description: reason,
        at: nowIso,
        actor: 'Olivia Chen',
      });
    } else if (action === 'reactivate') {
      if (status === 'active') {
        toast.error('Member is already active');
        return;
      }
      newStatus = 'active';
      events.push({
        id: Date.now(),
        type: 'member_reactivated',
        title: 'Member reactivated',
        description: note.trim() || 'Access restored',
        at: nowIso,
        actor: 'Olivia Chen',
      });
    }

    if (invoiceApplicable && invoiceChoice !== 'none') {
      const isFinal = invoiceChoice === 'final';
      const shouldRecordPayment = isFinal && markPaid;
      if (shouldRecordPayment) {
        if (!bankName.trim() || !bankRef.trim() || !bankAmount.trim()) {
          toast.error('Please fill all bank details');
          return;
        }
      }
      const prefix = isFinal ? 'INV' : 'PRO';
      const invoiceId = `${prefix}-${Math.floor(Math.random() * 9000) + 3000}`;
      const amount = shouldRecordPayment ? parseFloat(bankAmount) || newPlan.price : newPlan.price;
      newInvoice = {
        id: invoiceId,
        invoiceNumber: invoiceId,
        amount,
        type: isFinal ? 'final' : 'proforma',
        status: isFinal ? (shouldRecordPayment ? 'paid' : 'pending') : 'draft',
        issuedAt: nowIso,
        dueDate: addDaysIso(nowIso, 14),
        planName: newPlan.name,
        validityStart: formatTableDate(startDate.toISOString()),
        validityEnd: formatTableDate(newExpiry),
        bankName: shouldRecordPayment ? bankName : undefined,
        bankRef: shouldRecordPayment ? bankRef : undefined,
        bankRemark: shouldRecordPayment ? bankRemark : undefined,
        paidOn: shouldRecordPayment ? bankDate.toISOString() : undefined,
      };
      events.push({
        id: Date.now() + 1,
        type: 'invoice_generated',
        title: `${isFinal ? 'Final' : 'Proforma'} invoice generated`,
        description: `${invoiceId} · $${amount.toFixed(2)}`,
        at: nowIso,
        actor: 'Olivia Chen',
      });
      if (shouldRecordPayment) {
        events.push({
          id: Date.now() + 2,
          type: 'payment_received',
          title: 'Payment received',
          description: `${invoiceId} · ${bankName} · Ref ${bankRef} · $${amount.toFixed(2)}`,
          at: nowIso,
          actor: 'Olivia Chen',
        });
      }
    }

    setPlan(newPlan);
    setStatus(newStatus);
    setExpiry(newExpiry);
    setTimeline((prev) => [...events, ...prev]);
    if (newInvoice) setInvoices((prev) => [newInvoice, ...prev]);

    fetch(`/api/members/${seed.id}/plan-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        plan: newPlan,
        status: newStatus,
        expiry: newExpiry,
        timelineEvents: events,
        invoice: newInvoice,
      }),
    }).catch((error) => console.error('Failed to save plan action:', error));

    const actionLabel = ACTIONS.find((a) => a.id === action)?.label || action;
    toast.success(`${actionLabel} applied`, {
      description: newInvoice
        ? `Invoice ${newInvoice.id} ${newInvoice.status === 'paid' ? 'marked as paid' : 'generated'}`
        : 'Member updated',
    });
    setOpen(false);
  };

  const activityRows = useMemo(() => {
    const events = timeline.map((t) => ({
        key: `t-${t.id}`,
        kind: 'event',
        type: t.type,
        title: t.title,
        description: t.description,
        at: t.at,
        actor: t.actor,
        amount: null as number | null,
        status: null as string | null,
      }));
    const invoiceEvents = invoices.map((invoice) => ({
      key: `i-${invoice.id}`,
      kind: 'invoice',
      type: 'invoice',
      title: `${invoice.type === 'proforma' ? 'Proforma' : 'Invoice'} ${invoice.id}`,
      description: invoice.bankName
        ? `${invoice.bankName} · Ref ${invoice.bankRef || '—'}${invoice.bankRemark ? ` · ${invoice.bankRemark}` : ''}`
        : `${invoice.type === 'proforma' ? 'Proforma' : 'Final'} invoice`,
      at: invoice.issuedAt,
      actor: 'System',
      amount: invoice.amount,
      status: invoice.status,
    }));

    return [...events, ...invoiceEvents].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [timeline, invoices]);

  const openInvoiceStatusEdit = (inv: Invoice) => {
    setInvoiceActionTarget(inv);
    const displayStatus = invoiceStatusLabel(inv.status);
    setInvoiceEditStatus(displayStatus);
    setInvoicePayDate(inv.paidOn ? formatTableDate(inv.paidOn) : '');
    setInvoicePayBank(inv.bankName || RECIPIENT_BANKS[0] || '');
    setInvoicePayRef(inv.bankRef || '');
    setInvoicePayAmt(String(inv.amount ?? ''));
    setInvoicePayMode('Bank Transfer');
    setInvoicePayRemark(inv.bankRemark || '');
    setInvoiceStatusOpen(true);
  };

  const handleInvoiceEditStatusChange = (stat: InvoiceDisplayStatus) => {
    setInvoiceEditStatus(stat);
    if (stat === 'Paid' && invoiceActionTarget) {
      setInvoicePayAmt((prev) => prev || String(invoiceActionTarget.amount ?? ''));
      setInvoicePayDate((prev) => prev || formatTableDate(new Date().toISOString()));
      setInvoicePayBank((prev) => prev || RECIPIENT_BANKS[0]);
      setInvoicePayMode((prev) => prev || 'Bank Transfer');
    }
  };

  const invoiceSettlementActive = invoiceEditStatus === 'Paid';
  const invoiceSettlementInputClass = cn(
    'h-10 w-full text-sm border-slate-200',
    invoiceSettlementActive ? 'bg-white' : 'bg-slate-100/80 text-slate-400 placeholder:text-slate-300',
  );
  const invoiceSettlementSelectClass = cn(
    'h-10 w-full font-normal border-slate-200',
    invoiceSettlementActive ? 'bg-white' : 'bg-slate-100/80 text-slate-400',
  );

  const handleInvoiceStatusSave = () => {
    if (!invoiceActionTarget) return;
    if (invoiceEditStatus === 'Paid') {
      if (!invoicePayDate.trim() || !invoicePayAmt.trim() || !invoicePayBank.trim() || !invoicePayRef.trim()) {
        toast.error('Payment date, amount, bank, and reference are required');
        return;
      }
    }
    const storedStatus = invoiceStatusToStored(invoiceEditStatus);
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceActionTarget.id
          ? {
              ...inv,
              status: storedStatus,
              paidOn: invoiceEditStatus === 'Paid' ? new Date().toISOString() : undefined,
              bankName: invoiceEditStatus === 'Paid' ? invoicePayBank : undefined,
              bankRef: invoiceEditStatus === 'Paid' ? invoicePayRef : undefined,
              bankRemark: invoiceEditStatus === 'Paid' ? invoicePayRemark : undefined,
            }
          : inv,
      ),
    );
    toast.success(
      `Invoice ${invoiceActionTarget.invoiceNumber || invoiceActionTarget.id} status set to ${invoiceEditStatus}`,
    );
    setInvoiceStatusOpen(false);
    setInvoiceActionTarget(null);
  };

  const handleInvoiceSendEmail = (inv: Invoice) => {
    toast.success('Invoice email queued', {
      description: `${inv.invoiceNumber || inv.id} → ${seed.email || 'member'}`,
    });
  };

  const handleInvoiceDownloadPdf = (inv: Invoice) => {
    const link = document.createElement('a');
    link.href =
      'data:text/plain;charset=utf-8,' +
      encodeURIComponent(
        `Invoice: ${inv.invoiceNumber || inv.id}\nAmount: ${formatInrAmount(inv.amount)}\nPlan: ${inv.planName || plan.name}`,
      );
    link.setAttribute('download', `${(inv.invoiceNumber || inv.id).replace(/\//g, '_')}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Invoice ${inv.invoiceNumber || inv.id} downloaded`);
  };

  const handleInvoiceDelete = () => {
    if (!invoiceDeleting) return;
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceDeleting.id));
    if (expandedInvoiceId === invoiceDeleting.id) setExpandedInvoiceId(null);
    toast.success(`Invoice ${invoiceDeleting.invoiceNumber || invoiceDeleting.id} removed`);
    setInvoiceDeleteOpen(false);
    setInvoiceDeleting(null);
  };

  const invoiceHistoryRows = useMemo(
    () =>
      invoices
        .map((inv) => ({
          key: inv.id,
          rowDate: inv.issuedAt,
          planName: inv.planName || plan.name,
          validityStart: inv.validityStart || formatTableDate(inv.issuedAt),
          validityEnd: inv.validityEnd || expiry || '—',
          invoiceNumber: inv.invoiceNumber || inv.id,
          invoiceDate: inv.issuedAt,
          amount: inv.amount,
          status: invoiceStatusLabel(inv.status),
          invoice: inv,
        }))
        .sort((a, b) => new Date(b.rowDate).getTime() - new Date(a.rowDate).getTime()),
    [invoices, plan.name, expiry],
  );

  return (
    <div className="space-y-5" data-testid="assign-plan-tab">
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">
              Plan History
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {viewMode === 'activity'
                ? `${activityRows.length} events · Comprehensive audit log`
                : `${invoiceHistoryRows.length} invoices · Comprehensive audit log`}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
              <button
                type="button"
                onClick={() => setViewMode('activity')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'activity'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                Activity
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('invoices');
                  setExpandedInvoiceId(null);
                }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'invoices'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                Invoices
              </button>
            </div>
            <Button
              data-testid="assign-action-btn"
              onClick={openDialog}
              className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Manage Plan
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {viewMode === 'activity' ? (
            <table className="w-full text-sm" data-testid="activity-table">
              <thead>
                <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-3 w-16 text-center">SR.NO</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Actor</th>
                  <th className="px-6 py-3 text-right">Amount / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activityRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                      No activity yet.
                    </td>
                  </tr>
                ) : (
                  activityRows.map((r, index) => {
                    const Icon = ICONS[r.type] || Plus;
                    return (
                      <tr
                        key={r.key}
                        data-testid={`activity-row-${r.key}`}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-3 text-center text-slate-400 font-mono text-xs font-semibold">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-900 text-[13px]">{formatDate(r.at)}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {relativeTime(r.at)}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="inline-flex items-center gap-2">
                            <span
                              className={`h-7 w-7 rounded-full flex items-center justify-center ${
                                r.kind === 'invoice'
                                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-sm font-medium text-slate-900">{r.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-slate-700 max-w-xl">
                          <span className="line-clamp-2">{r.description}</span>
                        </td>
                        <td className="px-6 py-3 text-slate-500 text-xs whitespace-nowrap">
                          {r.actor}
                        </td>
                        <td className="px-6 py-3 text-right whitespace-nowrap">
                          {r.amount != null ? (
                            <div>
                              <div className="font-medium text-slate-900 font-mono">
                                ${r.amount.toFixed(2)}
                              </div>
                              <div
                                className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${
                                  r.status === 'paid'
                                    ? 'text-emerald-700'
                                    : r.status === 'overdue'
                                      ? 'text-red-700'
                                      : r.status === 'pending'
                                        ? 'text-amber-700'
                                        : 'text-slate-500'
                                }`}
                              >
                                {r.status || '—'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm" data-testid="invoice-table">
              <thead className="bg-white border-b" style={{ borderColor: '#EEF2F6' }}>
                <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-6 py-3 w-16 text-center">SR NO</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Plan &amp; Validity</th>
                  <th className="px-6 py-3">Invoice</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-4 py-3 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoiceHistoryRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  invoiceHistoryRows.map((row, index) => {
                    const inv = row.invoice;
                    const isExpanded = expandedInvoiceId === inv.id;
                    const isPaid = row.status === 'Paid';
                    return (
                      <Fragment key={row.key}>
                        <tr
                          className="hover:bg-slate-50/40 bg-white border-b transition-colors cursor-pointer select-none"
                          style={{ borderColor: '#F1F5F9' }}
                          onClick={() =>
                            setExpandedInvoiceId(isExpanded ? null : inv.id)
                          }
                        >
                          <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs font-semibold w-16">
                            {String(index + 1).padStart(2, '0')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[13px] text-slate-700 font-medium">
                            {formatTableDate(row.rowDate)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900 text-[13px]">{row.planName}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {row.validityStart} to {row.validityEnd}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900 text-[13px]">{row.invoiceNumber}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {formatTableDate(row.invoiceDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[13px] font-medium text-slate-800">
                            {formatInrAmount(row.amount)}
                          </td>
                          <td className="px-6 py-4 w-28">
                            <StatusBadge status={row.status} />
                          </td>
                          <td
                            className="px-4 py-4 text-center w-28"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <InvoiceRowActionsMenu
                              testIdPrefix={`member-invoice-${inv.id}`}
                              onUpdateStatus={() => openInvoiceStatusEdit(inv)}
                              onSendEmail={() => handleInvoiceSendEmail(inv)}
                              onDownloadPdf={() => handleInvoiceDownloadPdf(inv)}
                              onDelete={() => {
                                setInvoiceDeleting(inv);
                                setInvoiceDeleteOpen(true);
                              }}
                            />
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50/30">
                            <td colSpan={7} className="px-6 py-4 border-b" style={{ borderColor: '#EEF2F6' }}>
                              <div className="p-4 rounded-lg bg-blue-50/40 border border-blue-100 max-w-4xl">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-3 flex items-center gap-1.5">
                                  <DollarSign className="h-3.5 w-3.5" />
                                  Invoice Settlement
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-xs">
                                  {[
                                    {
                                      label: 'Settlement Date',
                                      value: isPaid && inv.paidOn ? formatTableDate(inv.paidOn) : '—',
                                    },
                                    {
                                      label: 'Amount Paid',
                                      value: isPaid ? formatInrAmount(row.amount) : '—',
                                    },
                                    {
                                      label: 'Recipient Bank',
                                      value: isPaid ? inv.bankName || '—' : '—',
                                    },
                                    {
                                      label: 'Payment Mode',
                                      value: isPaid ? 'Bank Transfer' : '—',
                                    },
                                    {
                                      label: 'Reference',
                                      value: isPaid ? inv.bankRef || '—' : '—',
                                    },
                                  ].map((field) => (
                                    <div key={field.label}>
                                      <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500 mb-0.5">
                                        {field.label}
                                      </div>
                                      <div className="font-semibold text-slate-800">{field.value}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={invoiceStatusOpen} onOpenChange={setInvoiceStatusOpen}>
        <DialogContent className="sm:max-w-2xl bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[100] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Edit className="h-5 w-5 text-slate-500" />
              Update Payment Status
            </DialogTitle>
            <DialogDescription className="text-slate-550 text-xs">
              Modify transaction payment details and complete bank settlement audits.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Select Status
              </Label>
              <div className="flex items-center gap-6">
                {(['Unpaid', 'Paid', 'Cancel'] as const).map((stat) => (
                  <label
                    key={stat}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer select-none"
                  >
                    <input
                      type="radio"
                      name="member-invoice-status"
                      checked={invoiceEditStatus === stat}
                      onChange={() => handleInvoiceEditStatusChange(stat)}
                      className="h-4 w-4 accent-slate-900 cursor-pointer"
                    />
                    {stat}
                  </label>
                ))}
              </div>
            </div>

            <div
              className={cn(
                'pt-4 border-t border-dashed border-slate-200 space-y-4 min-h-[248px]',
                !invoiceSettlementActive && 'opacity-90',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Bank Settlement Audit Variables
                </h4>
                {!invoiceSettlementActive && (
                  <span className="text-[10px] font-medium text-slate-400 italic">
                    Available when status is Paid
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Payment Date
                  </Label>
                  <Input
                    placeholder="e.g. 24-Apr-2026"
                    value={invoiceSettlementActive ? invoicePayDate : ''}
                    onChange={(e) => setInvoicePayDate(e.target.value)}
                    disabled={!invoiceSettlementActive}
                    className={invoiceSettlementInputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Amount Paid
                  </Label>
                  <Input
                    placeholder="e.g. ₹ 5,000"
                    value={invoiceSettlementActive ? invoicePayAmt : ''}
                    onChange={(e) => setInvoicePayAmt(e.target.value)}
                    disabled={!invoiceSettlementActive}
                    className={cn(invoiceSettlementInputClass, 'font-mono')}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Bank Name
                  </Label>
                  <Select
                    value={invoiceSettlementActive ? invoicePayBank || undefined : undefined}
                    onValueChange={setInvoicePayBank}
                    disabled={!invoiceSettlementActive}
                  >
                    <SelectTrigger className={invoiceSettlementSelectClass}>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECIPIENT_BANKS.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Reference No.
                  </Label>
                  <Input
                    placeholder="UTR / Txn ID"
                    value={invoiceSettlementActive ? invoicePayRef : ''}
                    onChange={(e) => setInvoicePayRef(e.target.value)}
                    disabled={!invoiceSettlementActive}
                    className={cn(invoiceSettlementInputClass, 'font-mono')}
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Payment Mode
                  </Label>
                  <Select
                    value={invoiceSettlementActive ? invoicePayMode || undefined : undefined}
                    onValueChange={(val) => setInvoicePayMode(val as (typeof PAYMENT_MODES)[number])}
                    disabled={!invoiceSettlementActive}
                  >
                    <SelectTrigger className={invoiceSettlementSelectClass}>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_MODES.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {mode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setInvoiceStatusOpen(false)}
              className="h-10 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleInvoiceStatusSave}
              className="h-10 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={invoiceDeleteOpen} onOpenChange={setInvoiceDeleteOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-250 p-6 shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Invoice
            </DialogTitle>
            <DialogDescription className="text-slate-550 text-xs">
              Remove {invoiceDeleting?.invoiceNumber || invoiceDeleting?.id} from this member&apos;s history?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setInvoiceDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInvoiceDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="assign-action-dialog" className="max-w-3xl h-[690px] max-h-[90vh] flex flex-col justify-between overflow-hidden p-0">
          <DialogHeader className="pt-6 px-6 pb-2">
            <DialogTitle className="font-display flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-slate-500" />
              Plan Action
            </DialogTitle>
            <DialogDescription>
              Apply a plan change and optionally generate a Proforma or Final invoice.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 my-2 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Action">
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger data-testid="dialog-action-select" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((a) => (
                      <SelectItem
                        key={a.id}
                        value={a.id}
                        data-testid={`dialog-action-${a.id}`}
                      >
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {(action === 'assign' || action === 'upgrade') && (
                <Field label="Plan">
                  <Select value={planId} onValueChange={setPlanId}>
                    <SelectTrigger data-testid="dialog-plan-select" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} · ${p.price}/{p.billing}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}

              {action === 'extend' && (
                <Field label="Extend by (days)">
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger data-testid="dialog-duration" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </div>

            {(action === 'assign' || action === 'upgrade') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Start Date">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        data-testid="dialog-start-date"
                        variant="outline"
                        className={cn('h-11 w-full justify-start font-normal text-left')}
                      >
                        <CalendarIcon className="h-4 w-4 mr-2 text-slate-500" />
                        {formatDate(startDate.toISOString())}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(d) => d && setStartDate(d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </Field>

                {action === 'assign' && (
                  <Field label="Expiry Date" hint="Editable. Defaults to +30 days.">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          data-testid="dialog-expiry-date"
                          variant="outline"
                          className={cn('h-11 w-full justify-start font-normal text-left')}
                        >
                          <CalendarIcon className="h-4 w-4 mr-2 text-slate-500" />
                          {formatDate(expiryDate.toISOString())}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={expiryDate}
                          onSelect={(d) => d && setExpiryDate(d)}
                          disabled={(d) => d <= startDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </Field>
                )}
              </div>
            )}

            {action === 'suspend' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-3">
                  <Field label="Suspension Reason">
                    <Select value={reasonId} onValueChange={setReasonId}>
                      <SelectTrigger data-testid="dialog-suspend-reason" className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUSPEND_REASONS.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  {reasonId === 'other' && (
                    <Field label="Specify Reason">
                      <Textarea
                        data-testid="dialog-suspend-other"
                        value={reasonOther}
                        onChange={(e) => setReasonOther(e.target.value)}
                        rows={2}
                        className="resize-none"
                      />
                    </Field>
                  )}
                </div>
              </div>
            )}

            {action === 'reactivate' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Field label="Note (optional)">
                    <Textarea
                      data-testid="dialog-reactivate-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      className="resize-none"
                      placeholder="e.g. Payment cleared, manual override…"
                    />
                  </Field>
                </div>
              </div>
            )}

            {invoiceApplicable && (
              <div className="pt-4 border-t border-dashed border-slate-200">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-3">
                  Invoice
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {INVOICE_CHOICES.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      data-testid={`invoice-choice-${c.id}`}
                      onClick={() => setInvoiceChoice(c.id)}
                      className={`text-left p-3 rounded-lg border-2 transition-all ${invoiceChoice === c.id
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border mb-2 ${c.cls}`}
                      >
                        {c.label}
                      </div>
                      <div className="text-xs text-slate-600">{c.description}</div>
                    </button>
                  ))}
                </div>

                {invoiceChoice === 'final' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-6 mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Payment Status
                      </Label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentStatus"
                            checked={!markPaid}
                            onChange={() => setMarkPaid(false)}
                            className="h-4 w-4 accent-slate-900"
                            data-testid="radio-unpaid"
                          />
                          Unpaid
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentStatus"
                            checked={markPaid}
                            onChange={() => setMarkPaid(true)}
                            className="h-4 w-4 accent-slate-900"
                            data-testid="radio-paid"
                          />
                          Mark as Paid
                        </label>
                      </div>
                    </div>

                    {markPaid && (
                      <div className="p-4 rounded-lg bg-blue-50/40 border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700 mb-3 flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5" />
                          Bank Details · Mark as Paid
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Field label="Payment Date">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  data-testid="bank-date-trigger"
                                  variant="outline"
                                  className="h-10 w-full justify-start font-normal bg-white text-left"
                                >
                                  <CalendarIcon className="h-4 w-4 mr-2 text-slate-500" />
                                  {formatDate(bankDate.toISOString())}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={bankDate}
                                  onSelect={(d) => d && setBankDate(d)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </Field>
                          <Field label="Bank Name">
                            <Select value={bankName || undefined} onValueChange={setBankName}>
                              <SelectTrigger data-testid="bank-name" className="h-10 bg-white">
                                <SelectValue placeholder="Select bank" />
                              </SelectTrigger>
                              <SelectContent>
                                {RECIPIENT_BANKS.map((bank) => (
                                  <SelectItem key={bank} value={bank}>
                                    {bank}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Reference No.">
                            <Input
                              data-testid="bank-ref"
                              value={bankRef}
                              onChange={(e) => setBankRef(e.target.value)}
                              className="h-10 bg-white"
                              placeholder="UTR / Txn ID"
                            />
                          </Field>
                          <Field label="Amount">
                            <Input
                              data-testid="bank-amount"
                              type="number"
                              value={bankAmount}
                              onChange={(e) => setBankAmount(e.target.value)}
                              className="h-10 bg-white"
                            />
                          </Field>
                          <div className="md:col-span-2">
                            <Field label="Remark (optional)">
                              <Textarea
                                data-testid="bank-remark"
                                value={bankRemark}
                                onChange={(e) => setBankRemark(e.target.value)}
                                rows={2}
                                className="resize-none bg-white"
                                placeholder="Any note for the ledger…"
                              />
                            </Field>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pb-6 px-6 pt-4 border-t border-slate-100 mt-4 gap-2 sm:space-x-0">
            <Button
              data-testid="dialog-cancel"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-testid="dialog-confirm"
              onClick={handleConfirm}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {invoiceChoice === 'final' && markPaid ? 'Confirm & Mark as Paid' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
