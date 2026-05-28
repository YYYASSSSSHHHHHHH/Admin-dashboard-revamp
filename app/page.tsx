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
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { BroadcastDetailDialog } from '@/components/dashboard/BroadcastDetailDialog';
import { toFrontendBroadcast } from '@/lib/broadcast-utils';
import type { FrontendBroadcast } from '@/lib/dashboard-mock-data';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

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

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: { value: number; isUp: boolean };
  subtitle?: string;
}

function KpiCard({ label, value, icon: Icon, iconBg, iconColor, trend, subtitle }: KpiCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-200 py-0">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 mb-1">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              {trend && (
                <span className={`inline-flex items-center text-xs font-medium ${trend.isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                  {trend.isUp ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
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
        <section className="space-y-5">
          {/* Member Details Row */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Member Overview
              </h3>
              <button className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <KpiCard 
                label="Active" 
                value={memberKpis.active} 
                icon={Users} 
                iconBg="bg-emerald-50" 
                iconColor="text-emerald-600"
                trend={{ value: 12, isUp: true }}
              />
              <KpiCard 
                label="Expired" 
                value={memberKpis.expired} 
                icon={Clock} 
                iconBg="bg-amber-50" 
                iconColor="text-amber-600"
                trend={{ value: 3, isUp: false }}
              />
              <KpiCard 
                label="Suspended" 
                value={memberKpis.suspended} 
                icon={AlertTriangle} 
                iconBg="bg-red-50" 
                iconColor="text-red-600"
              />
              <KpiCard 
                label="Blocked" 
                value={memberKpis.blocked} 
                icon={AlertCircle} 
                iconBg="bg-slate-100" 
                iconColor="text-slate-600"
              />
              <KpiCard 
                label="Pending" 
                value={memberKpis.pending} 
                icon={Clock} 
                iconBg="bg-blue-50" 
                iconColor="text-blue-600"
                subtitle="Awaiting approval"
              />
              <KpiCard 
                label="Incomplete" 
                value={memberKpis.incomplete} 
                icon={FileText} 
                iconBg="bg-purple-50" 
                iconColor="text-purple-600"
              />
              <KpiCard 
                label="Suspicious" 
                value={memberKpis.suspicious} 
                icon={AlertTriangle} 
                iconBg="bg-orange-50" 
                iconColor="text-orange-600"
              />
            </div>
          </div>

          {/* Broadcast & Requests Row */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Broadcast & Requests
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <KpiCard 
                label="Today's Posts" 
                value={broadcastKpis.today} 
                icon={MessageSquare} 
                iconBg="bg-blue-50" 
                iconColor="text-blue-600"
                trend={{ value: 8, isUp: true }}
              />
              <KpiCard 
                label="Total Posts" 
                value={broadcastKpis.total} 
                icon={MessageSquare} 
                iconBg="bg-slate-100" 
                iconColor="text-slate-600"
              />
              <KpiCard 
                label="Pending Approval" 
                value={sortedBroadcasts.length || broadcastKpis.pending} 
                icon={Clock} 
                iconBg="bg-amber-50" 
                iconColor="text-amber-600"
                subtitle="Needs review"
              />
              <KpiCard 
                label="Call Requests" 
                value={requestCallKpi} 
                icon={PhoneCall} 
                iconBg="bg-green-50" 
                iconColor="text-green-600"
              />
              <KpiCard 
                label="Reports" 
                value={reportsKpi} 
                icon={FileText} 
                iconBg="bg-red-50" 
                iconColor="text-red-600"
              />
            </div>
          </div>
        </section>

        {/* Two-column layout for tables */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* New Broadcast Approval Queue - Takes more space */}
          <Card className="xl:col-span-8 border-slate-200/60 shadow-sm py-0 overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/30 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Broadcast Approval Queue
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-500 mt-0.5">
                    Review and approve pending broadcast requests
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                    {sortedBroadcasts.length} pending
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      <th className="px-5 py-3 w-12">#</th>
                      <th className="px-5 py-3">Date & Time</th>
                      <th className="px-5 py-3">Broadcaster</th>
                      <th className="px-5 py-3">Company</th>
                      <th className="px-5 py-3">Message</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Send To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {broadsLoading ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="h-8 w-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
                            <span className="text-sm text-slate-500">Loading broadcasts...</span>
                          </div>
                        </td>
                      </tr>
                    ) : sortedBroadcasts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                              <MessageSquare className="h-6 w-6 text-emerald-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">All caught up!</span>
                            <span className="text-xs text-slate-500">No pending broadcasts requiring approval.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sortedBroadcasts.map((b, i) => {
                        const formatted = formatDateDisplay(b.at);
                        const displaySendTo =
                          b.sendingOption === 'SendToAll'
                            ? 'All'
                            : b.sendingOption === 'SendToGroup'
                              ? 'Group'
                              : b.sendingOption;

                        return (
                          <tr
                            key={b.id}
                            onClick={() => openBroadcast(b)}
                            className="hover:bg-blue-50/40 cursor-pointer transition-colors select-none group"
                          >
                            <td className="px-5 py-3.5 text-slate-400 font-mono text-xs font-semibold">
                              {String(i + 1).padStart(2, '0')}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="font-medium text-slate-900 text-[13px] whitespace-nowrap">
                                {formatted.date}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">
                                {formatted.time}
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-700 shrink-0">
                                  {b.sender.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <span className="text-slate-900 font-medium text-[13px] whitespace-nowrap">
                                  {b.sender}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 text-[13px] whitespace-nowrap">
                              {b.companyName}
                            </td>
                            <td className="px-5 py-3.5 max-w-[220px]">
                              <span
                                className="text-slate-600 text-[13px] line-clamp-2 leading-snug"
                                title={b.text}
                              >
                                {b.text}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
                                b.type === 'WTB' 
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}>
                                {b.type}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {displaySendTo}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Most Category Broadcast - Compact side panel */}
          <Card className="xl:col-span-4 border-slate-200/60 shadow-sm py-0 overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/30 px-5 py-4">
              <CardTitle className="text-base font-semibold text-slate-900">
                Top Categories
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 mt-0.5">
                Broadcast distribution by category
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100/80">
                {categoryData.map((cat, index) => (
                  <div 
                    key={cat.name} 
                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-400 w-5">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[13px] font-medium text-slate-900">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[13px]">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-slate-900">{cat.total}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide">Total</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`font-semibold ${cat.pending > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {cat.pending}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide">Pending</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-emerald-600">{cat.approved}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide">Approved</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
