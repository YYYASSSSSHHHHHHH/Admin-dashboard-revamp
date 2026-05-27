'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  AlertTriangle,
  Clock,
  MessageSquare,
  FileText,
  PhoneCall,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { BroadcastDetailDialog } from '@/components/dashboard/BroadcastDetailDialog';
import { toFrontendBroadcast } from '@/lib/broadcast-utils';
import type { FrontendBroadcast } from '@/lib/dashboard-mock-data';
import { toast } from 'sonner';

interface BroadcastRecord {
  id: string;
  at: string;
  sender: string;
  companyName: string;
  text: string;
  sendingOption: string;
  status: string;
  type: string;
  qty: number;
  unit: string;
  condition?: string;
  mainCategory?: string;
  subCategory?: string;
  priceOption?: string;
  priceAmount?: number;
  audience?: string;
}

function recordToFrontend(b: BroadcastRecord): FrontendBroadcast {
  return toFrontendBroadcast({
    id: b.id,
    at: b.at,
    companyName: b.companyName,
    type: b.type,
    condition: b.condition || 'New',
    mainCategory: b.mainCategory || 'Accessories',
    subCategory: b.subCategory || '—',
    text: b.text,
    qty: b.qty,
    priceOption: b.priceOption || 'Quote',
    priceAmount: b.priceAmount ?? 0,
    sendingOption: b.sendingOption,
    audience: b.audience || 'All Members',
    status: b.status,
  });
}

interface KpiProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
}

function Kpi({ label, value, icon: Icon, accent }: KpiProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-lg px-4 py-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="font-display text-xl font-semibold tracking-tight text-slate-900">
            {value}
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatDateDisplay(isoString: string): { date: string; time: string } {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return { date: isoString, time: '' };
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return {
    date: `${day}-${month}-${year}`,
    time: `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`,
  };
}

export default function Dashboard() {
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>([]);
  const [broadsLoading, setBroadsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<BroadcastRecord | null>(null);
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
            (b: BroadcastRecord) =>
              b.status.toLowerCase() === 'pending' || b.status.toLowerCase() === 'Pending',
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
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
      ),
    [broadcasts],
  );

  const selectedFrontend = useMemo(
    () => (selectedRecord ? recordToFrontend(selectedRecord) : null),
    [selectedRecord],
  );

  const openBroadcast = (b: BroadcastRecord) => {
    setSelectedRecord(b);
    setBroadOpen(true);
  };

  const handleBroadcastApprove = (form: FrontendBroadcast) => {
    setBroadcasts((prev) => prev.filter((b) => b.id !== form.id));
    toast.success('Broadcast approved and moved to history');
    setBroadOpen(false);
  };

  const handleBroadcastReject = (form: FrontendBroadcast) => {
    setBroadcasts((prev) => prev.filter((b) => b.id !== form.id));
    toast.success('Broadcast rejected and moved to history');
    setBroadOpen(false);
  };

  const handleBroadcastHide = (form: FrontendBroadcast) => {
    setBroadcasts((prev) => prev.filter((b) => b.id !== form.id));
    toast.success('Broadcast hidden and moved to history');
    setBroadOpen(false);
  };

  const handleBroadcastSave = () => {
    toast.success('Broadcast details updated');
  };

  // Category data for the table
  const categoryData = [
    { name: 'Electronics', total: 342, pending: 8, approved: 334 },
    { name: 'Mobile', total: 298, pending: 5, approved: 293 },
    { name: 'Accessories', total: 215, pending: 3, approved: 212 },
    { name: 'Computers', total: 187, pending: 2, approved: 185 },
    { name: 'Networking', total: 142, pending: 0, approved: 142 },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-5" data-testid="dashboard-page">
        <Header
          title="Dashboard"
          subtitle="Operational snapshot of platform activity and pending approvals."
        />

        {/* KPI Grid - All cards in a dense responsive grid */}
        <section className="space-y-3">
          {/* Member Details Row */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-2">
              Member Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              <Kpi label="Active" value={memberKpis.active} icon={Users} accent="bg-emerald-50 text-emerald-600" />
              <Kpi label="Expired" value={memberKpis.expired} icon={Clock} accent="bg-amber-50 text-amber-600" />
              <Kpi label="Suspended" value={memberKpis.suspended} icon={AlertTriangle} accent="bg-red-50 text-red-600" />
              <Kpi label="Blocked" value={memberKpis.blocked} icon={AlertCircle} accent="bg-slate-100 text-slate-600" />
              <Kpi label="Pending" value={memberKpis.pending} icon={Clock} accent="bg-blue-50 text-blue-600" />
              <Kpi label="Incomplete" value={memberKpis.incomplete} icon={FileText} accent="bg-purple-50 text-purple-600" />
              <Kpi label="Suspicious" value={memberKpis.suspicious} icon={AlertTriangle} accent="bg-red-50 text-red-600" />
            </div>
          </div>

          {/* Broadcast & Requests Row */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-2">
              Broadcast & Requests
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              <Kpi label="Today's Post" value={broadcastKpis.today} icon={MessageSquare} accent="bg-blue-50 text-blue-600" />
              <Kpi label="Total Post" value={broadcastKpis.total} icon={MessageSquare} accent="bg-slate-100 text-slate-600" />
              <Kpi label="Pending" value={broadcastKpis.pending} icon={Clock} accent="bg-amber-50 text-amber-600" />
              <Kpi label="Request Call" value={requestCallKpi} icon={PhoneCall} accent="bg-green-50 text-green-600" />
              <Kpi label="Reports" value={reportsKpi} icon={FileText} accent="bg-red-50 text-red-600" />
            </div>
          </div>
        </section>

        {/* Two-column layout for tables */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* New Broadcast Approval Queue - Takes more space */}
          <section className="xl:col-span-8 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                New Broadcast Approval Queue
              </h3>
              <span className="text-[10px] font-medium text-slate-400">
                {sortedBroadcasts.length} pending
              </span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      <th className="px-4 py-3 w-12">S.NO</th>
                      <th className="px-4 py-3">DATE & TIME</th>
                      <th className="px-4 py-3">BROADCASTER</th>
                      <th className="px-4 py-3">COMPANY NAME</th>
                      <th className="px-4 py-3">BROADCAST MESSAGE</th>
                      <th className="px-4 py-3">SEND TO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {broadsLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500">
                          Loading broadcasts...
                        </td>
                      </tr>
                    ) : sortedBroadcasts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500">
                          No pending broadcasts requiring approval.
                        </td>
                      </tr>
                    ) : (
                      sortedBroadcasts.map((b, i) => {
                        const formatted = formatDateDisplay(b.at);
                        const displaySendTo =
                          b.sendingOption === 'SendToAll'
                            ? 'Send To All'
                            : b.sendingOption === 'SendToGroup'
                              ? 'Send To Group'
                              : b.sendingOption;

                        return (
                          <tr
                            key={b.id}
                            onClick={() => openBroadcast(b)}
                            className="hover:bg-slate-50/40 cursor-pointer transition-colors select-none"
                          >
                            <td className="px-4 py-3 text-slate-400 font-mono text-xs font-semibold">
                              {String(i + 1).padStart(2, '0')}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900 text-[13px] whitespace-nowrap">
                                {formatted.date}
                              </div>
                              <div className="text-[11px] font-medium text-slate-400 mt-0.5 whitespace-nowrap">
                                {formatted.time}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-900 font-semibold text-[13px] whitespace-nowrap">
                              {b.sender}
                            </td>
                            <td className="px-4 py-3 text-slate-600 text-[13px] whitespace-nowrap">
                              {b.companyName}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="text-slate-600 text-[13px] truncate max-w-[200px] block leading-relaxed"
                                title={b.text}
                              >
                                {b.text}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600 font-medium text-[13px] whitespace-nowrap">
                              {displaySendTo}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Most Category Broadcast - Compact side panel */}
          <section className="xl:col-span-4 space-y-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Most Category Broadcast
            </h3>

            <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-right">Pending</th>
                      <th className="px-4 py-3 text-right">Approved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {categoryData.map((cat) => (
                      <tr key={cat.name} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-2.5 text-slate-900 font-medium text-[13px]">{cat.name}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600 text-[13px]">{cat.total}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600 text-[13px]">{cat.pending}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600 text-[13px]">{cat.approved}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Broadcast Detail Dialog */}
      <BroadcastDetailDialog
        open={broadOpen}
        onOpenChange={setBroadOpen}
        broadcast={selectedFrontend}
        companyName={selectedRecord?.companyName}
        approveLabel="Approve"
        onSave={handleBroadcastSave}
        onApprove={handleBroadcastApprove}
        onReject={handleBroadcastReject}
        onHide={handleBroadcastHide}
      />
    </DashboardLayout>
  );
}
