'use client';

import { useState, useMemo } from 'react';
import {
  Radio,
  Search,
  SlidersHorizontal,
  Calendar,
  Building,
  User,
  Info,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Sliders,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface BroadcastRecord {
  id: string;
  at: string;
  sender: string;
  companyName: string;
  text: string;
  sendingOption: 'SendToAll' | 'SendToGroup' | string;
  status: 'Approved' | 'Rejected' | 'Hidden' | string;
  type: 'WTB' | 'WTS';
  qty: number;
  unit: string;
}

const DEFAULT_BROADCASTS: BroadcastRecord[] = [
  {
    id: 'BRD-0003',
    at: '2026-05-08T17:59:46Z',
    sender: 'Sneha Reddy',
    companyName: 'Reddy Wholesale',
    text: 'Looking for Type-C 65W chargers in bulk | Qty: 500 Pcs',
    sendingOption: 'SendToGroup',
    status: 'Approved',
    type: 'WTB',
    qty: 500,
    unit: 'Pcs'
  },
  {
    id: 'BRD-0002',
    at: '2026-05-08T17:55:49Z',
    sender: 'Tattva Jain',
    companyName: 'Tattva Infosys',
    text: 'WTB Laptop Laptop | Qty: 1 Pcs | Quote',
    sendingOption: 'SendToAll',
    status: 'Approved',
    type: 'WTB',
    qty: 1,
    unit: 'Pcs'
  },
  {
    id: 'BRD-0001',
    at: '2026-05-08T14:34:58Z',
    sender: 'Jayesh Jain',
    companyName: 'Speedtech Systems',
    text: 'WTS Mobile iPhone | Qty: 1 Pcs | Call',
    sendingOption: 'SendToAll',
    status: 'Rejected',
    type: 'WTS',
    qty: 1,
    unit: 'Pcs'
  }
];

export default function BroadcastHistoryPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>(DEFAULT_BROADCASTS);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [audienceFilter, setAudienceFilter] = useState('All');

  // Drawer / Modal State
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filtered broadcasts listing
  const filteredBroadcasts = useMemo(() => {
    return broadcasts.filter((b) => {
      const matchesSearch = 
        b.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.text.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || b.status.toLowerCase() === statusFilter.toLowerCase();
      
      const matchesAudience = audienceFilter === 'All' || 
        (audienceFilter === 'SendToAll' && b.sendingOption === 'SendToAll') ||
        (audienceFilter === 'SendToGroup' && b.sendingOption === 'SendToGroup');

      return matchesSearch && matchesStatus && matchesAudience;
    });
  }, [broadcasts, searchQuery, statusFilter, audienceFilter]);

  // Handle status update
  const handleUpdateStatus = (id: string, newStatus: string) => {
    setBroadcasts(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    if (selectedBroadcast?.id === id) {
      setSelectedBroadcast(prev => prev ? { ...prev, status: newStatus } : null);
    }
    toast.success(`Broadcast status successfully updated to ${newStatus}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="broadcast-history-page">
        {/* Header Title Section */}
        <Header
          title="Broadcast History"
          subtitle="Audit ledger of all sent broadcast feeds, search queries, and platform-wide market notifications."
        />

        {/* Search & Dynamic Filter Control Bar */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search logs by broadcaster name, company, or post message..."
                className="pl-10 h-10 text-xs bg-slate-50/30 border-slate-250 hover:border-slate-350 focus:bg-white animate-none focus:border-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Audience filter */}
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

            {/* Status filter */}
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

        {/* Ledger Table Box */}
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
                {filteredBroadcasts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-500">
                      No broadcast histories matched the selected filter query criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBroadcasts.map((b, i) => {
                    // S.No: Descending calculated index logic: broadcasts.length - index
                    const descendingNo = String(broadcasts.length - i).padStart(2, '0');

                    // Date-Time formatted parameters
                    const d = new Date(b.at);
                    let dateFormatted = b.at;
                    let timeFormatted = '';
                    if (!isNaN(d.getTime())) {
                      const day = String(d.getDate()).padStart(2, '0');
                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const month = monthNames[d.getMonth()];
                      const year = d.getFullYear();
                      dateFormatted = `${day}-${month}-${year}`;

                      let hours = d.getHours();
                      const minutes = String(d.getMinutes()).padStart(2, '0');
                      const seconds = String(d.getSeconds()).padStart(2, '0');
                      const ampm = hours >= 12 ? 'PM' : 'AM';
                      hours = hours % 12;
                      hours = hours ? hours : 12;
                      timeFormatted = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
                    }

                    // Format audience: e.g. SendToAll -> Send To All
                    const displaySendTo = b.sendingOption === 'SendToAll' 
                      ? 'Send To All' 
                      : b.sendingOption === 'SendToGroup' 
                        ? 'Send To Group' 
                        : b.sendingOption;

                    return (
                      <tr
                        key={b.id}
                        onClick={() => {
                          setSelectedBroadcast(b);
                          setModalOpen(true);
                        }}
                        className="hover:bg-slate-50/40 cursor-pointer transition-colors group select-none"
                      >
                        {/* Serial number column */}
                        <td className="px-6 py-4.5 text-slate-400 font-mono text-xs font-semibold">
                          {descendingNo}
                        </td>
                        
                        {/* Date and Time column */}
                        <td className="px-6 py-4.5">
                          <div className="font-semibold text-slate-900 text-[13px] whitespace-nowrap">{dateFormatted}</div>
                          {timeFormatted && (
                            <div className="text-[11px] font-medium text-slate-400 mt-0.5 whitespace-nowrap">
                              {timeFormatted}
                            </div>
                          )}
                        </td>

                        {/* Broadcaster Name */}
                        <td className="px-6 py-4.5 text-slate-900 font-semibold text-[13px] whitespace-nowrap">
                          {b.sender}
                        </td>

                        {/* Company Name */}
                        <td className="px-6 py-4.5 text-slate-650 text-[13px] whitespace-nowrap">
                          {b.companyName}
                        </td>

                        {/* Message Text */}
                        <td className="px-6 py-4.5">
                          <span 
                            className="text-slate-650 text-[13px] truncate max-w-[240px] block leading-relaxed" 
                            title={b.text}
                          >
                            {b.text}
                          </span>
                        </td>

                        {/* Send To */}
                        <td className="px-6 py-4.5 text-slate-600 font-medium text-[13px] whitespace-nowrap">
                          {displaySendTo}
                        </td>

                        {/* Status Badge */}
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

        {/* Detailed Audit & Change Action Dialog */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-xl bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[150]">
            {selectedBroadcast && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                    <Radio className="h-5 w-5 text-slate-500" />
                    Broadcast Feed Audit
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 text-xs">
                    Review post variables, target scope permissions, and update status settings.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-3">
                  {/* Broadcaster profile snapshot */}
                  <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200/50">
                    <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-display text-xs font-bold shrink-0">
                      {selectedBroadcast.sender.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{selectedBroadcast.sender}</div>
                      <div className="text-[10px] font-semibold text-slate-450 uppercase mt-0.5">{selectedBroadcast.companyName}</div>
                    </div>
                    <div className="ml-auto">
                      <StatusBadge status={selectedBroadcast.status} />
                    </div>
                  </div>

                  {/* Core variables grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Type</div>
                      <div className="text-xs font-bold text-slate-800">{selectedBroadcast.type === 'WTB' ? 'Want to Buy (WTB)' : 'Want to Sell (WTS)'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity & Unit</div>
                      <div className="text-xs font-bold text-slate-800">{selectedBroadcast.qty} {selectedBroadcast.unit}</div>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Original Message Details</div>
                    <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200/50 text-xs font-medium text-slate-700 leading-relaxed italic">
                      "{selectedBroadcast.text}"
                    </div>
                  </div>

                  {/* Audience reach */}
                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 font-semibold">
                    <Info className="h-4 w-4 text-slate-400" />
                    <span>Audience Reach Group:</span>
                    <span className="bg-slate-100 border text-slate-700 rounded px-1.5 py-0.5 text-[10px]">
                      {selectedBroadcast.sendingOption === 'SendToAll' ? 'Send To All' : 'Send To Group'}
                    </span>
                  </div>

                  {/* Operational Change Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Administrative Actions</div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        onClick={() => handleUpdateStatus(selectedBroadcast.id, 'Approved')}
                        className={`h-9 text-xs font-bold px-3 rounded-lg flex items-center gap-1.5 cursor-pointer ${
                          selectedBroadcast.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve / Publish Live
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(selectedBroadcast.id, 'Rejected')}
                        className={`h-9 text-xs font-bold px-3 rounded-lg flex items-center gap-1.5 cursor-pointer ${
                          selectedBroadcast.status === 'Rejected'
                            ? 'bg-red-50 text-red-700 border border-red-300'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject / Suspend Feed
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(selectedBroadcast.id, 'Hidden')}
                        className={`h-9 text-xs font-bold px-3 rounded-lg flex items-center gap-1.5 cursor-pointer ${
                          selectedBroadcast.status === 'Hidden'
                            ? 'bg-slate-100 text-slate-800 border border-slate-300'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Eye className="h-4 w-4" />
                        Hide from Feed
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter className="pt-2 border-t border-slate-100">
                  <Button
                    onClick={() => setModalOpen(false)}
                    className="h-10 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                  >
                    Close Auditor
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
