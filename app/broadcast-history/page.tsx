'use client';

import { useState, useMemo } from 'react';
import {
  Radio,
  Search,
  CheckCircle,
  Eye,
  Edit2,
  Building2,
  Clock,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

function formatDateDisplay(isoString: string) {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return { date: `${day}-${month}-${year}`, time: `${String(hours).padStart(2,'0')}:${minutes}:${seconds} ${ampm}` };
}

export default function BroadcastHistoryPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>(DEFAULT_BROADCASTS);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [audienceFilter, setAudienceFilter] = useState('All');

  // Modal state
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form states (matching BroadcastTab.tsx pattern)
  const [editText, setEditText] = useState('');
  const [editType, setEditType] = useState<'WTB' | 'WTS'>('WTB');
  const [editQty, setEditQty] = useState('');
  const [editUnit, setEditUnit] = useState('Pcs');
  const [editSendingOption, setEditSendingOption] = useState('SendToAll');

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

  const handleRowClick = (b: BroadcastRecord) => {
    setSelectedBroadcast(b);
    setEditText(b.text);
    setEditType(b.type);
    setEditQty(String(b.qty));
    setEditUnit(b.unit);
    setEditSendingOption(b.sendingOption);
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) {
      toast.error('Broadcast message is required.');
      return;
    }
    setBroadcasts(prev =>
      prev.map(b =>
        b.id === selectedBroadcast?.id
          ? { ...b, text: editText, type: editType, qty: parseFloat(editQty) || 0, unit: editUnit, sendingOption: editSendingOption }
          : b
      )
    );
    setSelectedBroadcast(prev => prev ? { ...prev, text: editText, type: editType, qty: parseFloat(editQty) || 0, unit: editUnit, sendingOption: editSendingOption } : null);
    toast.success('Broadcast details updated');
    setIsEditing(false);
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setBroadcasts(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    if (selectedBroadcast?.id === id) {
      setSelectedBroadcast(prev => prev ? { ...prev, status: newStatus } : null);
    }
    toast.success(`Broadcast status updated to ${newStatus}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="broadcast-history-page">
        <Header
          title="Broadcast History"
          subtitle="Audit ledger of all sent broadcast feeds, search queries, and platform-wide market notifications."
        />

        {/* Search & Filter Bar */}
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

        {/* Table */}
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
                    const descendingNo = String(broadcasts.length - i).padStart(2, '0');
                    const formatted = formatDateDisplay(b.at);
                    const displaySendTo = b.sendingOption === 'SendToAll' ? 'Send To All' : b.sendingOption === 'SendToGroup' ? 'Send To Group' : b.sendingOption;

                    return (
                      <tr
                        key={b.id}
                        onClick={() => handleRowClick(b)}
                        className="hover:bg-slate-50/40 cursor-pointer transition-colors group select-none"
                      >
                        <td className="px-6 py-4.5 text-slate-400 font-mono text-xs font-semibold">{descendingNo}</td>
                        <td className="px-6 py-4.5">
                          <div className="font-semibold text-slate-900 text-[13px] whitespace-nowrap">{typeof formatted === 'object' ? formatted.date : formatted}</div>
                          {typeof formatted === 'object' && <div className="text-[11px] font-medium text-slate-400 mt-0.5 whitespace-nowrap">{formatted.time}</div>}
                        </td>
                        <td className="px-6 py-4.5 text-slate-900 font-semibold text-[13px] whitespace-nowrap">{b.sender}</td>
                        <td className="px-6 py-4.5 text-slate-650 text-[13px] whitespace-nowrap">{b.companyName}</td>
                        <td className="px-6 py-4.5">
                          <span className="text-slate-650 text-[13px] truncate max-w-[240px] block leading-relaxed" title={b.text}>{b.text}</span>
                        </td>
                        <td className="px-6 py-4.5 text-slate-600 font-medium text-[13px] whitespace-nowrap">{displaySendTo}</td>
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

        {/* Detail Modal — matches BroadcastTab.tsx popup exactly */}
        <Dialog open={modalOpen} onOpenChange={(open) => { setModalOpen(open); if (!open) setIsEditing(false); }}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden p-0">
            {selectedBroadcast && (
              <>
                <DialogHeader className="pt-6 px-6 pb-2">
                  <div className="flex items-center gap-2.5 pr-6">
                    <DialogTitle className="text-lg font-semibold leading-none tracking-tight font-display flex items-center gap-2">
                      <Radio className="h-4 w-4 text-slate-500" />
                      Broadcast Information
                    </DialogTitle>
                    {isEditing ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-200">
                        <Edit2 className="h-3 w-3" />
                        Editing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200">
                        <Eye className="h-3 w-3" />
                        Viewing
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <DialogDescription className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {selectedBroadcast.companyName} · ID:{' '}
                        <span className="font-mono text-slate-700">{selectedBroadcast.id}</span>
                      </span>
                    </DialogDescription>
                    {/* Edit / Save button — top right, same as BroadcastTab */}
                    {!isEditing ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-7 px-3 text-xs text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="h-3 w-3 mr-1.5" />
                        Edit
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-7 px-3 text-xs text-slate-700 border-slate-200 hover:bg-slate-50"
                        onClick={handleSaveEdit}
                      >
                        <CheckCircle className="h-3 w-3 mr-1.5" />
                        Save
                      </Button>
                    )}
                  </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 my-2 space-y-5">
                  {/* 2-col info grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Broadcaster</div>
                      <div className="text-sm font-medium text-slate-900 mt-1.5">{selectedBroadcast.sender}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Company Name</div>
                      <div className="text-sm font-medium text-slate-900 mt-1.5">{selectedBroadcast.companyName}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Broadcast Type</div>
                      {!isEditing ? (
                        <div className="text-sm font-medium text-slate-900 mt-1.5">
                          {selectedBroadcast.type === 'WTB' ? 'Want to Buy (WTB)' : 'Want to Sell (WTS)'}
                        </div>
                      ) : (
                        <Select value={editType} onValueChange={(v: any) => setEditType(v)}>
                          <SelectTrigger className="h-9 mt-1.5 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WTB">Want to Buy (WTB)</SelectItem>
                            <SelectItem value="WTS">Want to Sell (WTS)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Quantity & Unit</div>
                      {!isEditing ? (
                        <div className="text-sm font-medium text-slate-900 mt-1.5">{selectedBroadcast.qty} {selectedBroadcast.unit}</div>
                      ) : (
                        <div className="flex gap-2 mt-1.5">
                          <Input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} className="h-9 bg-white text-sm w-24" />
                          <Select value={editUnit} onValueChange={setEditUnit}>
                            <SelectTrigger className="h-9 bg-white flex-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pcs">Pcs</SelectItem>
                              <SelectItem value="Kg">Kg</SelectItem>
                              <SelectItem value="MT">MT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Sending Option</div>
                      {!isEditing ? (
                        <div className="text-sm font-medium text-slate-900 mt-1.5">
                          {selectedBroadcast.sendingOption === 'SendToAll' ? 'Send To All' : 'Send To Group'}
                        </div>
                      ) : (
                        <Select value={editSendingOption} onValueChange={setEditSendingOption}>
                          <SelectTrigger className="h-9 mt-1.5 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SendToAll">Send To All</SelectItem>
                            <SelectItem value="SendToGroup">Send To Group</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Status</div>
                      <div className="mt-1.5">
                        <StatusBadge status={selectedBroadcast.status} />
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-2">Broadcast Message</div>
                    {!isEditing ? (
                      <div className="text-sm text-slate-900 border border-slate-200 bg-slate-50/60 rounded-lg p-3.5 leading-relaxed">
                        {selectedBroadcast.text}
                      </div>
                    ) : (
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        className="resize-none bg-white text-sm border-slate-200"
                      />
                    )}
                  </div>

                  {/* Timestamp row */}
                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {(() => {
                        const f = formatDateDisplay(selectedBroadcast.at);
                        return typeof f === 'object' ? `Submitted · ${f.date}` : f;
                      })()}
                    </div>
                    <StatusBadge status={selectedBroadcast.status} />
                  </div>
                </div>

                {/* Footer — Other Actions (Hide/Reject) left | Cancel + Approve right */}
                <DialogFooter className="pb-6 px-6 pt-4 border-t border-slate-100 mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full sm:space-x-0">
                  <Select
                    onValueChange={(action) => {
                      if (action === 'hide') { handleUpdateStatus(selectedBroadcast.id, 'Hidden'); setModalOpen(false); }
                      else if (action === 'reject') { handleUpdateStatus(selectedBroadcast.id, 'Rejected'); setModalOpen(false); }
                    }}
                  >
                    <SelectTrigger className="h-10 w-full sm:w-auto border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-sm font-medium sm:min-w-[160px]">
                      <SelectValue placeholder="Other Actions" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 z-[200]">
                      <SelectItem value="hide">Hide Broadcast</SelectItem>
                      <SelectItem value="reject" className="text-red-600 focus:text-red-600">Reject</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="outline"
                      className="h-9 px-4 text-sm"
                      onClick={() => { setModalOpen(false); setIsEditing(false); }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="h-9 px-4 text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                      onClick={() => { handleUpdateStatus(selectedBroadcast.id, 'Approved'); setModalOpen(false); }}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
