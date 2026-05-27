'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  AlertTriangle,
  Clock,
  Radio,
  CheckCircle2,
  ArrowUpRight,
  MessageSquare,
  FileText,
  PhoneCall,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { BroadcastDetailDialog } from '@/components/dashboard/BroadcastDetailDialog';
import type { FrontendBroadcast } from '@/lib/dashboard-mock-data';
import {
  BROADCAST_TYPES,
  BROADCAST_STATUSES,
  SEND_TO_OPTIONS,
} from '@/lib/dashboard-mock-data';
import { formatDate, relativeTime } from '@/lib/constants';
import { toast } from 'sonner';

interface KpiProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: any;
  accent: string;
  trend?: 'up' | 'down';
  testid?: string;
}

function Kpi({ label, value, sub, icon: Icon, accent, trend, testid }: KpiProps) {
  return (
    <div
      data-testid={testid}
      className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </span>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="font-display text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
      {sub && (
        <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
          {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-600" />}
          {sub}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const statusOf = (id: string) =>
    BROADCAST_STATUSES.find((s) => s.id === id) || BROADCAST_STATUSES[0];
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

const labelOf = (list: { id: string; label: string }[], id: string) =>
  list.find((x) => x.id === id)?.label || id;

export default function Dashboard() {
  const [broadcasts, setBroadcasts] = useState<FrontendBroadcast[]>([]);
  const [broadsLoading, setBroadsLoading] = useState(true);
  const [selectedBroad, setSelectedBroad] = useState<FrontendBroadcast | null>(null);
  const [broadOpen, setBroadOpen] = useState(false);

  // Mock data for KPIs
  const memberKpis = {
    active: 1240,
    expired: 85,
    suspended: 23,
    blocked: 12,
    pending: 156,
    incomplete: 42,
    suspicious: 8,
  };

  const broadcastKpis = {
    today: 34,
    total: 1284,
    pending: 18,
  };

  const requestCallKpi = 52;
  const reportsKpi = 127;

  // Fetch broadcasts
  useEffect(() => {
    async function fetchBroadcasts() {
      try {
        const response = await fetch('/api/broadcast-history');
        if (response.ok) {
          const data = await response.json();
          // Filter for pending/pending approval only
          const pending = data.filter(
            (b: any) => b.status === 'pending' || b.status === 'Pending',
          );
          setBroadcasts(pending);
        }
      } catch (error) {
        console.error('Error fetching broadcasts:', error);
      } finally {
        setBroadsLoading(false);
      }
    }
    fetchBroadcasts();
  }, []);

  const sortedBroadcasts = useMemo(
    () =>
      [...broadcasts].sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      ),
    [broadcasts],
  );

  const openBroadcast = (b: FrontendBroadcast) => {
    setSelectedBroad(b);
    setBroadOpen(true);
  };

  const handleBroadcastApprove = (form: FrontendBroadcast) => {
    // Mark as approved and remove from dashboard queue
    setBroadcasts((prev) => prev.filter((b) => b.id !== form.id));
    toast.success('Broadcast approved and moved to history');
    setBroadOpen(false);
  };

  const handleBroadcastReject = (form: FrontendBroadcast, reason: string) => {
    // Mark as rejected and remove from dashboard queue
    setBroadcasts((prev) => prev.filter((b) => b.id !== form.id));
    toast.success('Broadcast rejected and moved to history');
    setBroadOpen(false);
  };

  const handleBroadcastHide = (form: FrontendBroadcast, reason: string) => {
    // Mark as hidden and remove from dashboard queue
    setBroadcasts((prev) => prev.filter((b) => b.id !== form.id));
    toast.success('Broadcast hidden and moved to history');
    setBroadOpen(false);
  };

  const handleBroadcastSave = (form: FrontendBroadcast) => {
    toast.success('Broadcast details updated');
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 lg:p-10 space-y-8" data-testid="dashboard-page">
        <div className="mb-2">
          <Header
            title="Dashboard"
            subtitle="Operational snapshot of platform activity and pending approvals."
          />
        </div>

        {/* Member Details KPI Cards */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Member Details
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi
              label="Active User"
              value={memberKpis.active}
              icon={Users}
              accent="bg-emerald-50 text-emerald-600"
            />
            <Kpi
              label="Expired User"
              value={memberKpis.expired}
              icon={Clock}
              accent="bg-amber-50 text-amber-600"
            />
            <Kpi
              label="Suspended User"
              value={memberKpis.suspended}
              icon={AlertTriangle}
              accent="bg-red-50 text-red-600"
            />
            <Kpi
              label="Block User"
              value={memberKpis.blocked}
              icon={AlertCircle}
              accent="bg-slate-100 text-slate-600"
            />
            <Kpi
              label="Pending User"
              value={memberKpis.pending}
              icon={Clock}
              accent="bg-blue-50 text-blue-600"
            />
            <Kpi
              label="Incomplete User"
              value={memberKpis.incomplete}
              icon={FileText}
              accent="bg-purple-50 text-purple-600"
            />
            <Kpi
              label="Suspicious Activity"
              value={memberKpis.suspicious}
              icon={AlertTriangle}
              accent="bg-red-50 text-red-600"
            />
          </div>
        </section>

        {/* Broadcast KPI Cards */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Broadcast & Requests
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Kpi
              label="Today's Post"
              value={broadcastKpis.today}
              icon={MessageSquare}
              accent="bg-blue-50 text-blue-600"
            />
            <Kpi
              label="Total Post"
              value={broadcastKpis.total}
              icon={MessageSquare}
              accent="bg-slate-100 text-slate-600"
            />
            <Kpi
              label="Pending Approval"
              value={broadcastKpis.pending}
              icon={Clock}
              accent="bg-amber-50 text-amber-600"
            />
            <Kpi
              label="Request Call"
              value={requestCallKpi}
              icon={PhoneCall}
              accent="bg-green-50 text-green-600"
            />
            <Kpi
              label="Reports"
              value={reportsKpi}
              icon={FileText}
              accent="bg-red-50 text-red-600"
            />
          </div>
        </section>

        {/* New Broadcast Approval Queue */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              New Broadcast Approval Queue
            </h3>
            <span className="text-xs font-medium text-slate-500">
              {sortedBroadcasts.length} pending
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100">
                    <th className="px-6 py-3 w-12">Sr No</th>
                    <th className="px-6 py-3">Date & Time</th>
                    <th className="px-6 py-3">Broadcast Message</th>
                    <th className="px-6 py-3">Send to</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {broadsLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                        Loading broadcasts...
                      </td>
                    </tr>
                  ) : sortedBroadcasts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                        No pending broadcasts requiring approval.
                      </td>
                    </tr>
                  ) : (
                    sortedBroadcasts.map((b, i) => (
                      <tr
                        key={b.id}
                        onClick={() => openBroadcast(b)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-3.5 text-slate-500 font-mono text-xs">
                          {String(i + 1).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <div className="text-slate-900 font-medium">{formatDate(b.submittedAt)}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {relativeTime(b.submittedAt)}
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
        </section>

        {/* Most Category Broadcast */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Most Category Broadcast
            </h3>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100">
                    <th className="px-6 py-3">Category Name</th>
                    <th className="px-6 py-3 text-right">Total Broadcast</th>
                    <th className="px-6 py-3 text-right">Pending Approval</th>
                    <th className="px-6 py-3 text-right">Approved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 text-slate-900 font-medium">Electronics</td>
                    <td className="px-6 py-3.5 text-right text-slate-600">342</td>
                    <td className="px-6 py-3.5 text-right text-slate-600">8</td>
                    <td className="px-6 py-3.5 text-right text-slate-600">334</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 text-slate-900 font-medium">Mobile</td>
                    <td className="px-6 py-3.5 text-right text-slate-600">298</td>
                    <td className="px-6 py-3.5 text-right text-slate-600">5</td>
                    <td className="px-6 py-3.5 text-right text-slate-600">293</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 text-slate-900 font-medium">Accessories</td>
                    <td className="px-6 py-3.5 text-right text-slate-600">215</td>
                    <td className="px-6 py-3.5 text-right text-slate-600">3</td>
                    <td className="px-6 py-3.5 text-right text-slate-600">212</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 text-slate-900 font-medium">Computers</td>
                    <td className="px-6 py-3.5 text-right text-slate-600">187</td>
                    <td className="px-6 py-3.5 text-right text-slate-600">2</td>
                    <td className="px-6 py-3.5 text-right text-slate-600">185</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 text-slate-900 font-medium">Networking</td>
                    <td className="px-6 py-3.5 text-right text-slate-600">142</td>
                    <td className="px-6 py-3.5 text-right text-slate-600">0</td>
                    <td className="px-6 py-3.5 text-right text-slate-600">142</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* Broadcast Detail Dialog */}
      <BroadcastDetailDialog
        open={broadOpen}
        onOpenChange={setBroadOpen}
        broadcast={selectedBroad}
        companyName={selectedBroad?.companyName}
        approveLabel="Approve"
        onSave={handleBroadcastSave}
        onApprove={handleBroadcastApprove}
        onReject={handleBroadcastReject}
        onHide={handleBroadcastHide}
      />
    </DashboardLayout>
  );
}
