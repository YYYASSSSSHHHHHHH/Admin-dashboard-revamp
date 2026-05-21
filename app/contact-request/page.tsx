'use client';

import { useState, useMemo, useEffect } from 'react';
import { UserCheck } from 'lucide-react';
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

interface ContactRequestRecord {
  id: string;
  at: string;
  primaryName: string;
  primaryInitials: string;
  companyName: string;
  primaryMobile: string;
  newContactName: string;
  newContactMobile: string;
  newContactEmail: string;
  newContactDesignation: string;
  location: string;
  status: string;
}



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

export default function ContactRequestsPage() {
  const [requests, setRequests] = useState<ContactRequestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');

  const [selectedRequest, setSelectedRequest] = useState<ContactRequestRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState<string>('PENDING');

  const statusOptions = ['All statuses', 'APPROVED', 'PENDING'];

  useEffect(() => {
    const fetchContactRequests = async () => {
      try {
        const response = await fetch('/api/contact-requests');
        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        }
      } catch (error) {
        console.error('Failed to fetch contact requests:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContactRequests();
  }, []);
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.primaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.newContactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.newContactMobile.includes(searchTerm) ||
        r.primaryMobile.includes(searchTerm);
      
      const matchesStatus =
        statusFilter === 'All statuses' ||
        r.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const handleRowClick = (r: ContactRequestRecord) => {
    setSelectedRequest(r);
    setTempStatus(r.status.toUpperCase());
    setModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedRequest) return;
    
    try {
      await fetch(`/api/contact-requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: tempStatus })
      });
      
      setRequests((prev) =>
        prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: tempStatus } : r))
      );
      const displayStatus = tempStatus.charAt(0) + tempStatus.slice(1).toLowerCase();
      toast.success(`Contact request marked as ${displayStatus}.`);
      setModalOpen(false);
    } catch (error) {
      toast.error('Failed to update request status');
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-5">
          <Header
            title="Contact Requests"
            subtitle="Review, approve, or manage updates and registration of new contact persons within corporate profiles."
          />
        </div>

        <div
          className="p-4 border border-b-0 bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
          style={{ borderColor: '#E5E7EB', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
        >
          <SearchBar
            placeholder="Search by name, company, mobile..."
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
                <th className="px-6 py-3.5 font-semibold">MOBILE</th>
                <th className="px-6 py-3.5 font-semibold">NEW CONTACT NAME</th>
                <th className="px-6 py-3.5 font-semibold">NEW CONTACT</th>
                <th className="px-6 py-3.5 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    Loading contact requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    No contact requests match your filters.
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
                      <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs font-semibold">
                        {String(index + 1).padStart(2, '0')}
                      </td>

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

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <MemberAvatar initials={r.primaryInitials} />
                          <div className="flex flex-col">
                            <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '600' }} className="whitespace-nowrap">{r.primaryName}</span>
                            <span style={{ color: '#64748B', fontSize: '11px', fontWeight: '500' }} className="whitespace-nowrap">{r.companyName}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                        {r.primaryMobile}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '600' }} className="whitespace-nowrap">
                            {r.newContactName}
                          </span>
                          <span style={{ color: '#64748B', fontSize: '9px', fontWeight: '600' }} className="whitespace-nowrap mt-0.5 uppercase tracking-wider text-[9px]">
                            NEW CONTACT REQUEST
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                        {r.newContactMobile}
                      </td>

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

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden p-0 bg-white border border-slate-200">
            {selectedRequest && (
              <>
                <DialogHeader className="pt-6 px-6 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="h-4 w-4 text-slate-500" />
                    <DialogTitle className="text-lg font-semibold leading-none tracking-tight font-display flex items-center gap-2">
                      Contact Person Request Details
                    </DialogTitle>
                  </div>
                  <DialogDescription className="text-xs text-slate-500 mt-1">
                    Review and authorize registration of new corporate contact person.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
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
                      <div className="text-xs font-semibold text-slate-800 mt-1">{selectedRequest.newContactName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</div>
                      <div className="text-xs font-semibold text-slate-800 mt-1">{selectedRequest.newContactMobile}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</div>
                      <div className="text-xs font-semibold text-slate-800 mt-1">{selectedRequest.newContactEmail}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Designation</div>
                      <div className="text-xs font-semibold text-slate-800 mt-1">{selectedRequest.newContactDesignation}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Update Status</div>
                    <RadioGroup
                      value={tempStatus}
                      onValueChange={setTempStatus}
                      className="flex gap-6"
                    >
                      {['PENDING', 'APPROVED'].map((statusOption) => {
                        const colors: Record<string, string> = {
                          APPROVED: 'text-emerald-700',
                          PENDING: 'text-amber-700'
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
