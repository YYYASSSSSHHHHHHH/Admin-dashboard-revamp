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
    <Card className="overflow-hidden border-border/40 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-border transition-all duration-300 py-0">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              {trend && (
                <span className={`inline-flex items-center text-xs font-semibold ${trend.isUp ? 'text-green-600' : 'text-red-500'}`}>
                  {trend.isUp ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
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

        {/* KPI Grid - Modern dashboard metrics */}
        <section className="space-y-7">
          {/* Member Details Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Member Overview</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Account status distribution</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <KpiCard 
                label="Active" 
                value={memberKpis.active} 
                icon={Users} 
                iconBg="bg-green-100" 
                iconColor="text-green-700"
                trend={{ value: 12, isUp: true }}
              />
              <KpiCard 
                label="Expired" 
                value={memberKpis.expired} 
                icon={Clock} 
                iconBg="bg-amber-100" 
                iconColor="text-amber-700"
                trend={{ value: 3, isUp: false }}
              />
              <KpiCard 
                label="Suspended" 
                value={memberKpis.suspended} 
                icon={AlertTriangle} 
                iconBg="bg-red-100" 
                iconColor="text-red-700"
              />
              <KpiCard 
                label="Blocked" 
                value={memberKpis.blocked} 
                icon={AlertCircle} 
                iconBg="bg-slate-200" 
                iconColor="text-slate-700"
              />
              <KpiCard 
                label="Pending" 
                value={memberKpis.pending} 
                icon={Clock} 
                iconBg="bg-blue-100" 
                iconColor="text-blue-700"
                subtitle="Awaiting approval"
              />
              <KpiCard 
                label="Incomplete" 
                value={memberKpis.incomplete} 
                icon={FileText} 
                iconBg="bg-purple-100" 
                iconColor="text-purple-700"
              />
              <KpiCard 
                label="Suspicious" 
                value={memberKpis.suspicious} 
                icon={AlertTriangle} 
                iconBg="bg-orange-100" 
                iconColor="text-orange-700"
              />
            </div>
          </div>

          {/* Broadcast & Activity Metrics */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Broadcast & Requests</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Activity summary</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <KpiCard 
                label="Today's Posts" 
                value={broadcastKpis.today} 
                icon={MessageSquare} 
                iconBg="bg-blue-100" 
                iconColor="text-blue-700"
                trend={{ value: 8, isUp: true }}
              />
              <KpiCard 
                label="Total Posts" 
                value={broadcastKpis.total} 
                icon={MessageSquare} 
                iconBg="bg-slate-200" 
                iconColor="text-slate-700"
              />
              <KpiCard 
                label="Pending" 
                value={sortedBroadcasts.length || broadcastKpis.pending} 
                icon={Clock} 
                iconBg="bg-warning/15" 
                iconColor="text-warning"
                subtitle="Needs review"
              />
              <KpiCard 
                label="Call Requests" 
                value={requestCallKpi} 
                icon={PhoneCall} 
                iconBg="bg-green-100" 
                iconColor="text-green-700"
              />
              <KpiCard 
                label="Reports" 
                value={reportsKpi} 
                icon={FileText} 
                iconBg="bg-red-100" 
                iconColor="text-red-700"
              />
            </div>
          </div>
        </section>

        {/* Two-column layout for main content */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Broadcast Approval Queue */}
          <Card className="xl:col-span-8 border-border/40 bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-secondary/20 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Approval Queue
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-1">
                    Pending broadcasts awaiting review
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold ${
                    sortedBroadcasts.length > 0 
                      ? 'bg-warning/20 text-warning' 
                      : 'bg-green-100/50 text-green-700'
                  }`}>
                    {sortedBroadcasts.length} {sortedBroadcasts.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50 border-b border-border/40">
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      <th className="px-6 py-4 w-8">#</th>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Broadcaster</th>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">Message</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Recipient</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {broadsLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-8 w-8 border-2 border-border border-t-primary rounded-full animate-spin" />
                            <span className="text-sm text-muted-foreground">Loading broadcasts...</span>
                          </div>
                        </td>
                      </tr>
                    ) : sortedBroadcasts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-success/15 flex items-center justify-center">
                              <MessageSquare className="h-6 w-6 text-success" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">All caught up!</span>
                            <span className="text-xs text-muted-foreground">No pending broadcasts to review</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sortedBroadcasts.map((b, i) => {
                        const formatted = formatDateDisplay(b.at);
                        const displaySendTo =
                          b.sendingOption === 'SendToAll'
                            ? 'All Members'
                            : b.sendingOption === 'SendToGroup'
                              ? 'Group'
                              : b.sendingOption;

                        return (
                          <tr
                            key={b.id}
                            onClick={() => openBroadcast(b)}
                            className="hover:bg-primary/5 cursor-pointer transition-colors select-none group"
                          >
                            <td className="px-6 py-4 text-muted-foreground font-mono text-xs font-medium">
                              {String(i + 1).padStart(2, '0')}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-foreground text-sm whitespace-nowrap">
                                {formatted.date}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">
                                {formatted.time}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                                  {b.sender.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <span className="text-foreground font-medium text-sm whitespace-nowrap">
                                  {b.sender}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-foreground/70 text-sm whitespace-nowrap">
                              {b.companyName}
                            </td>
                            <td className="px-6 py-4 max-w-[240px]">
                              <span
                                className="text-foreground/70 text-sm line-clamp-2"
                                title={b.text}
                              >
                                {b.text}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-[0.05em] ${
                                b.type === 'WTB' 
                                  ? 'bg-blue-100/70 text-blue-700' 
                                  : 'bg-green-100/70 text-green-700'
                              }`}>
                                {b.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-secondary text-foreground/70">
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

          {/* Category Statistics */}
          <Card className="xl:col-span-4 border-border/40 bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-secondary/20 px-6 py-5">
              <CardTitle className="text-lg font-semibold text-foreground">
                Category Breakdown
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Broadcast distribution summary
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {categoryData.map((cat, index) => (
                  <div 
                    key={cat.name} 
                    className="flex items-center justify-between px-6 py-4 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-muted-foreground w-6 text-center">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-medium text-foreground">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-5 text-sm">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-foreground">{cat.total}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`font-semibold ${cat.pending > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                          {cat.pending}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Pending</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-success">{cat.approved}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Approved</span>
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
