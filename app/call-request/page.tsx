'use client';

import { useState, useMemo } from 'react';
import { Phone } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { FilterSelect } from '@/components/dashboard/FilterSelect';
import { MemberAvatar } from '@/components/dashboard/MemberAvatar';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CallRequestRecord {
  id: string; // request number (mobile)
  at: string;
  name: string;
  initials: string;
  companyName: string;
  location: string;
  mobile: string;
  topic: string;
  status: string;
  message: string;
}

const DEFAULT_CALL_REQUESTS: CallRequestRecord[] = [
  {
    id: '+91 98765 43210',
    at: '2026-05-08T10:15:00Z',
    name: 'Sanjay Jain',
    initials: 'SJ',
    companyName: 'Paxaal International',
    location: 'Ahmedabad, Gujarat, India',
    mobile: '+91 98765 43210',
    topic: 'Request a callback',
    status: 'OPEN',
    message: 'Wants to discuss premium membership features and bulk licensing.'
  },
  {
    id: '+91 87654 32109',
    at: '2026-05-07T14:30:00Z',
    name: 'Meera Patel',
    initials: 'MP',
    companyName: 'Patel Exporters',
    location: 'Surat, Gujarat, India',
    mobile: '+91 87654 32109',
    topic: 'Membership',
    status: 'CALLBACK',
    message: 'Needs help renewing their deactivated gold tier plan.'
  },
  {
    id: '+91 76543 21098',
    at: '2026-05-06T09:45:00Z',
    name: 'Rajesh Sharma',
    initials: 'RS',
    companyName: 'Sharma & Sons Co.',
    location: 'Mumbai, Maharashtra, India',
    mobile: '+91 76543 21098',
    topic: 'Billing',
    status: 'CLOSED',
    message: 'Required duplicate invoice copy for tax filing purposes.'
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
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return { date: `${day}-${month}-${year}`, time: `${String(hours).padStart(2,'0')}:${minutes} ${ampm}` };
}

export default function CallRequestsPage() {
  const [requests, setRequests] = useState<CallRequestRecord[]>(DEFAULT_CALL_REQUESTS);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<CallRequestRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState<string>('OPEN');

  const statusOptions = ['All statuses', 'OPEN', 'CALLBACK', 'CLOSED'];

  // Filter logic
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.mobile.includes(searchTerm) ||
        r.topic.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus =
        statusFilter === 'All statuses' ||
        r.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const handleRowClick = (r: CallRequestRecord) => {
    setSelectedRequest(r);
    setTempStatus(r.status.toUpperCase());
    setModalOpen(true);
  };

  const handleSaveChanges = () => {
    if (!selectedRequest) return;
    setRequests((prev) =>
      prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: tempStatus } : r))
    );
    toast.success(`Request marked as ${tempStatus.charAt(0) + tempStatus.slice(1).toLowerCase()}`);
    setModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-5">
          <Header
            title="Callback Requests"
            subtitle="Manage caller inquiries, callback logs, and member service escalation workflows."
          />
        </div>

        {/* Search and Filters — exact replicate of the members page filters wrapper */}
        <div
          className="p-4 border border-b-0 bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
          style={{ borderColor: '#E5E7EB', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
        >
          <SearchBar
            placeholder="Search by name, company, mobile or topic..."
            onSearch={setSearchTerm}
          />
          <FilterSelect
            label="All statuses"
            options={statusOptions}
            defaultValue={statusFilter}
            onChange={statusFilter === 'All statuses' ? () => setStatusFilter('All statuses') : setStatusFilter}
            showFilterIcon={true}
          />
        </div>

        {/* Table — exact replicate of MembersTable & TableRow styling */}
        <div
          className="bg-white border overflow-hidden shadow-sm"
          style={{
            borderColor: '#E5E7EB',
            borderTopLeftRadius: '0',
            borderTopRightRadius: '0',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
          }}
        >
          <table className="w-full">
            <thead className="bg-white border-b" style={{ borderColor: '#EEF2F6' }}>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                <th className="px-6 py-3.5 font-semibold w-16 text-center">SR.NO</th>
                <th className="px-6 py-3.5 font-semibold">DATE & TIME</th>
                <th className="px-6 py-3.5 font-semibold">NAME & COMPANY</th>
                <th className="px-6 py-3.5 font-semibold">LOCATION</th>
                <th className="px-6 py-3.5 font-semibold">MOBILE</th>
                <th className="px-6 py-3.5 font-semibold">REQUEST NO</th>
                <th className="px-6 py-3.5 font-semibold">TOPIC</th>
                <th className="px-6 py-3.5 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500">
                    No callback requests match your filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r, index) => {
                  const formatted = formatDateDisplay(r.at);
                  return (
                    <tr
                      key={r.id}
                      onClick={() => handleRowClick(r)}
                      className="border-b hover:bg-slate-55 transition-colors bg-white cursor-pointer select-none"
                      style={{ borderColor: '#F1F5F9' }}
                    >
                      {/* SR.NO */}
                      <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs font-semibold">
                        {String(index + 1).padStart(2, '0')}
                      </td>

                      {/* DATE & TIME */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '600' }} className="whitespace-nowrap">
                            {typeof formatted === 'object' ? formatted.date : formatted}
                          </span>
                          {typeof formatted === 'object' && (
                            <span style={{ color: '#64748B', fontSize: '11px', fontWeight: '500' }} className="whitespace-nowrap mt-0.5">
                              {formatted.time}
                            </span>
                          )}
                        </div>
                      </td >

                      {/* NAME & COMPANY using standardized MemberAvatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <MemberAvatar initials={r.initials} />
                          <div className="flex flex-col">
                            <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '600' }} className="whitespace-nowrap">{r.name}</span>
                            <span style={{ color: '#64748B', fontSize: '11px', fontWeight: '500' }} className="whitespace-nowrap">{r.companyName}</span>
                          </div>
                        </div>
                      </td>

                      {/* LOCATION */}
                      <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                        {r.location}
                      </td>

                      {/* MOBILE */}
                      <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                        {r.mobile}
                      </td>

                      {/* REQUEST NO */}
                      <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                        {r.id}
                      </td>

                      {/* TOPIC */}
                      <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                        {r.topic}
                      </td>

                      {/* STATUS Badge */}
                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dialog Details Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden p-0 bg-white border border-slate-200">
            {selectedRequest && (
              <>
                <DialogHeader className="pt-6 px-6 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <DialogTitle className="text-lg font-semibold leading-none tracking-tight font-display flex items-center gap-2">
                      Callback Request Details
                    </DialogTitle>
                  </div>
                  <DialogDescription className="text-xs text-slate-500 mt-1">
                    Review callback parameters, request metadata, and update agent dispatch status.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                  {/* Detailed Overview Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Name</div>
                      <div className="text-xs font-semibold text-slate-800 mt-1">{selectedRequest.companyName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Request Date</div>
                      <div className="text-xs font-semibold text-slate-800 mt-1">
                        {(() => {
                          const f = formatDateDisplay(selectedRequest.at);
                          return typeof f === 'object' ? `${f.date} at ${f.time}` : f;
                        })()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Person</div>
                      <div className="text-xs font-semibold text-slate-800 mt-1">{selectedRequest.name}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</div>
                      <div className="text-xs font-semibold text-slate-800 mt-1">{selectedRequest.mobile}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</div>
                      <div className="text-xs font-semibold text-slate-800 mt-1">{selectedRequest.location}</div>
                    </div>
                  </div>

                  {/* Styled Gray Message Box */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Original Callback Note</div>
                    <div className="text-xs text-slate-700 bg-[#f8fafc] border border-slate-200/60 rounded-lg p-3.5 leading-relaxed italic">
                      "{selectedRequest.message}"
                    </div>
                  </div>

                  {/* Status Radio Buttons Selector using pre-existing RadioGroup & Label */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Update Status</div>
                    <RadioGroup
                      value={tempStatus}
                      onValueChange={setTempStatus}
                      className="flex gap-6"
                    >
                      {['OPEN', 'CALLBACK', 'CLOSED'].map((statusOption) => {
                        const colors: Record<string, string> = {
                          OPEN: 'text-emerald-700',
                          CALLBACK: 'text-amber-700',
                          CLOSED: 'text-slate-700'
                        };
                        const displayLabel = statusOption.charAt(0) + statusOption.slice(1).toLowerCase();
                        return (
                          <div key={statusOption} className="flex items-center gap-2 cursor-pointer select-none">
                            <RadioGroupItem
                              value={statusOption}
                              id={`status-${statusOption.toLowerCase()}`}
                              className="border-slate-400 border-2"
                            />
                            <Label
                              htmlFor={`status-${statusOption.toLowerCase()}`}
                              className={`text-xs font-semibold cursor-pointer ${colors[statusOption]}`}
                            >
                              {displayLabel}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                </div>

                <DialogFooter className="pb-6 px-6 pt-4 border-t border-slate-100 mt-auto flex items-center justify-end gap-2 w-full">
                  <Button
                    variant="outline"
                    className="h-9 px-4 text-xs font-semibold"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-9 px-4 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
                    onClick={handleSaveChanges}
                  >
                    Save Changes
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
