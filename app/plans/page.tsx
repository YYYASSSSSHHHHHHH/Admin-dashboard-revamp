'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Check,
  X,
  Pencil,
  ArrowUpRight,
  Users,
  Edit2,
  Shield,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FeaturePrivilege, MembershipPlanCatalog } from '@/lib/plan-catalog';
import { DEFAULT_PLAN_PERMISSIONS } from '@/lib/plan-catalog';

const VALIDITY_OPTIONS = ['1 Month', '3 Months', '6 Months', '1 Year'];

const ACCENTS: Record<
  string,
  {
    border: string;
    bar: string;
    badge: string;
    check: string;
  }
> = {
  'tk-lite': {
    border: 'border-sky-200/70',
    bar: 'bg-sky-500',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    check: 'text-sky-600',
  },
  starter: {
    border: 'border-slate-200/80',
    bar: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    check: 'text-slate-500',
  },
  growth: {
    border: 'border-blue-200/60',
    bar: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    check: 'text-blue-600',
  },
  scale: {
    border: 'border-violet-200/60',
    bar: 'bg-violet-500',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    check: 'text-violet-600',
  },
  enterprise: {
    border: 'border-slate-900/20',
    bar: 'bg-slate-900',
    badge: 'bg-slate-900 text-white border-slate-900',
    check: 'text-slate-900',
  },
};

function featureListLabel(feat: FeaturePrivilege) {
  if (feat.type === 'value') return `${feat.key}: ${feat.value}`;
  return feat.key;
}

const isMemberOnPlan = (member: { plan?: string }, plan: MembershipPlanCatalog) => {
  const mPlan = (member.plan || '').toLowerCase().trim();
  const pId = (plan.id || '').toLowerCase().trim();
  const pName = (plan.name || '').toLowerCase().trim();
  return mPlan === pId || mPlan === pName;
};

function permissionFeatures(plan: MembershipPlanCatalog) {
  return plan.features.filter(
    (f) => f.key !== 'Daily Broadcast' && f.key !== 'Daily Direct Email'
  );
}

function buildFeaturesFromForm(
  dailyBroadcast: string,
  dailyDirectEmail: string,
  permissions: FeaturePrivilege[]
): FeaturePrivilege[] {
  return [
    { key: 'Daily Broadcast', type: 'value', value: dailyBroadcast },
    { key: 'Daily Direct Email', type: 'value', value: dailyDirectEmail },
    ...permissions,
  ];
}

interface EditPlanDialogProps {
  plan: MembershipPlanCatalog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: MembershipPlanCatalog) => void;
}

function EditPlanDialog({ plan, open, onOpenChange, onSave }: EditPlanDialogProps) {
  const [name, setName] = useState('');
  const [validity, setValidity] = useState('1 Month');
  const [price, setPrice] = useState('0');
  const [dailyBroadcast, setDailyBroadcast] = useState('5');
  const [dailyDirectEmail, setDailyDirectEmail] = useState('2');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [permissions, setPermissions] = useState<FeaturePrivilege[]>([]);

  useEffect(() => {
    if (!plan) return;
    setName(plan.name);
    setValidity(plan.validity);
    setPrice(String(plan.price));
    setDailyBroadcast(plan.dailyBroadcast);
    setDailyDirectEmail(plan.dailyDirectEmail);
    setStatus(plan.status);
    const perms = permissionFeatures(plan);
    setPermissions(perms.length ? perms : DEFAULT_PLAN_PERMISSIONS.map((p) => ({ ...p })));
  }, [plan]);

  const togglePermission = (key: string) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.key === key ? { ...p, type: p.type === 'yes' ? 'no' : 'yes' } : p
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;
    onSave({
      ...plan,
      name,
      validity,
      price: Number(price) || 0,
      dailyBroadcast,
      dailyDirectEmail,
      status,
      features: buildFeaturesFromForm(dailyBroadcast, dailyDirectEmail, permissions),
    });
    onOpenChange(false);
  };

  const fieldClass = 'h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="edit-plan-dialog"
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[100]"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-slate-550" />
            Edit Plan
          </DialogTitle>
          <DialogDescription className="text-slate-550 text-xs">
            Update plan billing, validity limits, and member feature permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-plan-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Plan Name
              </Label>
              <Input
                id="edit-plan-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Plan Validity
              </Label>
              <Select value={validity} onValueChange={setValidity}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 z-[120]">
                  {VALIDITY_OPTIONS.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-plan-rate" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Plan Rate
              </Label>
              <Input
                id="edit-plan-rate"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={fieldClass}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-daily-broadcast" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Daily Broadcast
              </Label>
              <Input
                id="edit-daily-broadcast"
                value={dailyBroadcast}
                onChange={(e) => setDailyBroadcast(e.target.value)}
                className={fieldClass}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="edit-daily-email" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Daily Direct Email
              </Label>
              <Input
                id="edit-daily-email"
                value={dailyDirectEmail}
                onChange={(e) => setDailyDirectEmail(e.target.value)}
                className={fieldClass}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status</Label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs text-slate-800 font-semibold cursor-pointer select-none">
                  <input
                    type="radio"
                    name="edit-plan-status"
                    checked={status === 'Active'}
                    onChange={() => setStatus('Active')}
                    className="h-4 w-4 accent-slate-900 cursor-pointer"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-800 font-semibold cursor-pointer select-none">
                  <input
                    type="radio"
                    name="edit-plan-status"
                    checked={status === 'Inactive'}
                    onChange={() => setStatus('Inactive')}
                    className="h-4 w-4 accent-slate-900 cursor-pointer"
                  />
                  Inactive
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-dashed border-slate-200 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-450 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Plan Permissions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {permissions.map((perm) => (
                <label
                  key={perm.key}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5 cursor-pointer select-none hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xs font-semibold text-slate-800">{perm.key}</span>
                  <input
                    type="checkbox"
                    checked={perm.type === 'yes'}
                    onChange={() => togglePermission(perm.key)}
                    className="h-4 w-4 rounded border-slate-300 accent-slate-900 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
            >
              Save Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface PlanCardProps {
  plan: MembershipPlanCatalog;
  members: { id: string; name: string; initials?: string; status?: string }[];
  accent: (typeof ACCENTS)['starter'];
  onEdit: () => void;
}

function PlanCard({ plan, members, accent, onEdit }: PlanCardProps) {
  const [expanded, setExpanded] = useState(false);
  const activeOnPlan = members.filter((m) => m.status?.toLowerCase() === 'active');
  const mrr = activeOnPlan.reduce((s) => s + plan.price, 0);
  const isFree = plan.price <= 0;

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
          <div className="text-xs font-semibold text-slate-600 mt-0.5">{plan.status}</div>
        </div>
        <div className="flex items-start gap-1.5 shrink-0">
          <div
            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${accent.badge}`}
          >
            {plan.billing}
          </div>
          <button
            type="button"
            onClick={onEdit}
            data-testid={`plan-edit-${plan.id}`}
            className="h-7 w-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            aria-label={`Edit ${plan.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-1">
        {isFree ? (
          <span className="font-display text-4xl font-semibold tracking-tight text-slate-900">
            Free
          </span>
        ) : (
          <>
            <span className="font-display text-4xl font-semibold tracking-tight text-slate-900">
              ${plan.price}
            </span>
            <span className="text-sm text-slate-500">/{plan.billing.slice(0, -2)}</span>
          </>
        )}
      </div>
      <p className="text-sm text-slate-500 mb-5">{plan.validity}</p>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <ul className="space-y-2.5 mb-6">
            <li className="grid grid-cols-2 gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 pb-1">
              <span>Features</span>
              <span className="text-right">Included</span>
            </li>
            {plan.features.map((feat) => (
              <li key={feat.key} className="flex items-start justify-between gap-2 text-sm text-slate-700">
                <span>{feat.key}</span>
                <span className="shrink-0 flex items-center">
                  {feat.type === 'value' ? (
                    <span className="font-medium text-slate-900">{feat.value}</span>
                  ) : feat.type === 'yes' ? (
                    <Check className={`h-4 w-4 ${accent.check}`} aria-label="Included" />
                  ) : (
                    <X className="h-4 w-4 text-slate-400" aria-label="Not included" />
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-end -mt-2 mb-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          data-testid={`plan-expand-${plan.id}`}
          className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse plan details' : 'Expand plan details'}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

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
}

export default function MembershipPlans() {
  const [members, setMembers] = useState<{ plan?: string; status?: string }[]>([]);
  const [plans, setPlans] = useState<MembershipPlanCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<MembershipPlanCatalog | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [membersRes, plansRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/plans'),
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

  const handleSavePlan = async (updated: MembershipPlanCatalog) => {
    setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    try {
      await fetch(`/api/plans/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (error) {
      console.error('Failed to save plan:', error);
    }
  };

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
                  members={planMembers as { id: string; name: string; initials?: string; status?: string }[]}
                  accent={ACCENTS[plan.id] || ACCENTS.starter}
                  onEdit={() => {
                    setEditingPlan(plan);
                    setEditOpen(true);
                  }}
                />
              );
            })}
          </section>
        )}
      </div>

      <EditPlanDialog
        plan={editingPlan}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleSavePlan}
      />
    </DashboardLayout>
  );
}
