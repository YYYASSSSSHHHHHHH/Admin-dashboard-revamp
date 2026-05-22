'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { BroadcastDetailDialog } from '@/components/dashboard/BroadcastDetailDialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

function frontendToPayload(b: FrontendBroadcast, record: BroadcastRecord) {
  const audienceMap: Record<string, string> = {
    allMembers: 'All Members',
    chargerSuppliers: 'Charger suppliers',
    electronicsDistributors: 'Electronics distributors',
    mobileBuyers: 'Mobile buyers',
  };
  return {
    text: b.message,
    type: b.type.toUpperCase(),
    qty: parseFloat(b.quantity) || record.qty,
    unit: record.unit,
    sendingOption: b.sendTo === 'sendToAll' ? 'SendToAll' : 'SendToGroup',
    condition: b.productCondition,
    mainCategory: b.mainCategory,
    subCategory: b.subCategory,
    audience: audienceMap[b.audience] || record.audience || 'All Members',
  };
}

function formatDateDisplay(isoString: string) {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
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

export default function BroadcastHistoryPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [audienceFilter, setAudienceFilter] = useState('All');

  const [selectedRecord, setSelectedRecord] = useState<BroadcastRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchBroadcasts = async () => {
      try {
        const response = await fetch('/api/broadcast-history');
        if (response.ok) {
          const data = await response.json();
          setBroadcasts(data);
        }
      } catch (error) {
        console.error('Failed to fetch broadcasts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBroadcasts();
  }, []);

  const filteredBroadcasts = useMemo(() => {
    return broadcasts.filter((b) => {
      const matchesSearch =
        b.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || b.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesAudience =
        audienceFilter === 'All' ||
        (audienceFilter === 'SendToAll' && b.sendingOption === 'SendToAll') ||
        (audienceFilter === 'SendToGroup' && b.sendingOption === 'SendToGroup');
      return matchesSearch && matchesStatus && matchesAudience;
    });
  }, [broadcasts, searchQuery, statusFilter, audienceFilter]);

  const selectedFrontend = useMemo(
    () => (selectedRecord ? recordToFrontend(selectedRecord) : null),
    [selectedRecord],
  );

  const handleRowClick = (b: BroadcastRecord) => {
    setSelectedRecord(b);
    setModalOpen(true);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/broadcast-history/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      setBroadcasts((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
      if (selectedRecord?.id === id) {
        setSelectedRecord((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      toast.success(`Broadcast status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSave = async (form: FrontendBroadcast) => {
    if (!selectedRecord) return;
    const payload = frontendToPayload(form, selectedRecord);
    try {
      await fetch(`/api/broadcast-history/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setBroadcasts((prev) =>
        prev.map((b) => (b.id === selectedRecord.id ? { ...b, ...payload } : b)),
      );
      setSelectedRecord((prev) => (prev ? { ...prev, ...payload } : null));
      toast.success('Broadcast details updated');
    } catch {
      toast.error('Failed to update broadcast details');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 lg:p-10 space-y-6" data-testid="broadcast-history-page">
        <Header
          title="Broadcast History"
          subtitle="Audit ledger of all sent broadcast feeds, search queries, and platform-wide market notifications."
        />

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search logs by broadcaster name, company, or post message..."
                className="pl-10 h-10 text-xs bg-slate-50/30 border-slate-250 hover:border-slate-350 focus:bg-white animate-none focus:border-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={audienceFilter} onValueChange={setAudienceFilter}>
              <SelectTrigger className="h-10 w-full sm:w-48 bg-white border-slate-250 text-xs">
                <SelectValue placeholder="Audience filter" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 z-50">
                <SelectItem value="All">All Audiences</SelectItem>
                <SelectItem value="SendToAll">Send To All</SelectItem>
                <SelectItem value="SendToGroup">Send To Group</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-full sm:w-44 bg-white border-slate-250 text-xs">
                <SelectValue placeholder="Status filter" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 z-50">
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-6 py-4 w-16">S.NO</th>
                  <th className="px-6 py-4">DATE & TIME</th>
                  <th className="px-6 py-4">BROADCASTER</th>
                  <th className="px-6 py-4">COMPANY NAME</th>
                  <th className="px-6 py-4">BROADCAST MESSAGE</th>
                  <th className="px-6 py-4">SEND TO</th>
                  <th className="px-6 py-4 text-right w-36">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-500">
                      Loading broadcast history...
                    </td>
                  </tr>
                ) : filteredBroadcasts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-500">
                      No broadcast histories matched the selected filter query criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBroadcasts.map((b, i) => {
                    const descendingNo = String(broadcasts.length - i).padStart(2, '0');
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
                        onClick={() => handleRowClick(b)}
                        className="hover:bg-slate-50/40 cursor-pointer transition-colors group select-none"
                      >
                        <td className="px-6 py-4.5 text-slate-400 font-mono text-xs font-semibold">
                          {descendingNo}
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="font-semibold text-slate-900 text-[13px] whitespace-nowrap">
                            {formatted.date}
                          </div>
                          <div className="text-[11px] font-medium text-slate-400 mt-0.5 whitespace-nowrap">
                            {formatted.time}
                          </div>
                        </td>
                        <td className="px-6 py-4.5 text-slate-900 font-semibold text-[13px] whitespace-nowrap">
                          {b.sender}
                        </td>
                        <td className="px-6 py-4.5 text-slate-650 text-[13px] whitespace-nowrap">
                          {b.companyName}
                        </td>
                        <td className="px-6 py-4.5">
                          <span
                            className="text-slate-650 text-[13px] truncate max-w-[240px] block leading-relaxed"
                            title={b.text}
                          >
                            {b.text}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-slate-600 font-medium text-[13px] whitespace-nowrap">
                          {displaySendTo}
                        </td>
                        <td className="px-6 py-4.5 text-right">
                          <div className="flex justify-end">
                            <StatusBadge status={b.status} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <BroadcastDetailDialog
          open={modalOpen}
          onOpenChange={setModalOpen}
          broadcast={selectedFrontend}
          companyName={selectedRecord?.companyName}
          approveLabel="Approve"
          statusBadgeMode="badge"
          statusBadgeValue={selectedRecord?.status}
          onSave={handleSave}
          onApprove={(form) => handleUpdateStatus(form.id, 'Approved')}
          onReject={(form) => handleUpdateStatus(form.id, 'Rejected')}
          onHide={(form) => handleUpdateStatus(form.id, 'Hidden')}
        />
      </div>
    </DashboardLayout>
  );
}
