'use client';

import { useState, useMemo } from 'react';
import {
  Mail,
  Send,
  Save,
  Users,
  Search,
  BadgeCheck,
  Building,
  Calendar,
  Clock,
  ListFilter,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link,
  Info
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
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
import { toast } from 'sonner';

interface BulkEmailRecord {
  id: string;
  dateSent: string;
  subject: string;
  targetGroup: string;
  recipientCount: number;
  senderName: string;
  status: 'SENT' | 'QUEUED' | 'FAILED' | 'DRAFT';
}

const DEFAULT_BULK_LOGS: BulkEmailRecord[] = [
  {
    id: 'BLK-1002',
    dateSent: '2026-05-18T10:42:00Z',
    subject: 'System Announcement: Platform-Wide Security Update & Password Integrity Review',
    targetGroup: 'All Members',
    recipientCount: 48,
    senderName: 'Olivia Chen',
    status: 'SENT'
  },
  {
    id: 'BLK-1001',
    dateSent: '2026-05-14T15:20:00Z',
    subject: 'Exclusive Premium Feature: State & Regional City Filtering Options Enabled Now',
    targetGroup: 'Premium Subscribers',
    recipientCount: 12,
    senderName: 'Olivia Chen',
    status: 'SENT'
  }
];

export default function BulkEmailPage() {
  const [logs, setLogs] = useState<BulkEmailRecord[]>(DEFAULT_BULK_LOGS);

  // Form State
  const [targetGroup, setTargetGroup] = useState('All Members');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Search filter for history log
  const [searchQuery, setSearchQuery] = useState('');

  // Computes how many members are matched by target filter
  const estimatedReach = useMemo(() => {
    switch (targetGroup) {
      case 'All Members':
        return 48;
      case 'Active Members':
        return 36;
      case 'Overdue Members':
        return 5;
      case 'Premium Subscribers':
        return 12;
      case 'Standard Subscribers':
        return 20;
      default:
        return 0;
    }
  }, [targetGroup]);

  // Handle Send Bulk Email
  const handleSendBulk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error('Subject and message details are required');
      return;
    }

    const newRecord: BulkEmailRecord = {
      id: `BLK-${Math.floor(Math.random() * 9000) + 1000}`,
      dateSent: new Date().toISOString(),
      subject: emailSubject,
      targetGroup,
      recipientCount: estimatedReach,
      senderName: 'Olivia Chen',
      status: 'SENT'
    };

    setLogs(prev => [newRecord, ...prev]);
    toast.success(`Dispatched bulk notification successfully to ${estimatedReach} recipients!`);
    
    // Clear subject and message
    setEmailSubject('');
    setEmailBody('');
  };

  // Filter logs based on search query
  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      log.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetGroup.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [logs, searchQuery]);

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="bulk-email-page">
        {/* Header Section */}
        <Header
          title="Send Email Notification"
          subtitle="Bulk email dispatch manager for system announcements, privileges, and billing notifications."
        />

        {/* Primary Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: COMPOSER CARD (7 spans) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-slate-100 bg-white">
                <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-slate-500" />
                  Bulk Email Composer
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Pick a target category group filter, customize variables, and publish bulk announcements.
                </p>
              </div>

              <form onSubmit={handleSendBulk} className="p-6 space-y-4">
                
                {/* Dropdowns Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Recipient Audience Filter Group */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Recipient Audience Group</Label>
                    <Select value={targetGroup} onValueChange={setTargetGroup}>
                      <SelectTrigger className="h-10 w-full bg-slate-50/50 border-slate-200 text-xs">
                        <SelectValue placeholder="Select target group" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 z-50">
                        <SelectItem value="All Members">All Members</SelectItem>
                        <SelectItem value="Active Members">Active Members Only</SelectItem>
                        <SelectItem value="Overdue Members">Overdue / Unpaid Accounts</SelectItem>
                        <SelectItem value="Premium Subscribers">TK Premium Subscribers</SelectItem>
                        <SelectItem value="Standard Subscribers">TK Standard Subscribers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Verified Sender Address Signature */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">From Signature</Label>
                    <Select value="default">
                      <SelectTrigger className="h-10 w-full bg-slate-50/50 border-slate-200 text-xs">
                        <SelectValue>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">Northgate Ops</span>
                            <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-slate-400 font-mono text-[9px]">ops@northgate.io</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 z-50">
                        <SelectItem value="default">Northgate Ops</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Subject Input */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Announcement Subject Line</Label>
                  <Input
                    placeholder="Enter notification subject header..."
                    className="h-10 text-xs bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    required
                  />
                </div>

                {/* Message Body Editor */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Announcement Message Details</Label>
                    <div className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 border border-slate-200 rounded-md flex items-center gap-1">
                      <Info className="h-3 w-3 text-slate-400" />
                      Reach: <span className="font-semibold text-slate-900">{estimatedReach} members</span>
                    </div>
                  </div>
                  
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    {/* Rich Editor Formatting Toolbar */}
                    <div className="border-b border-slate-200 px-3 py-1.5 flex items-center gap-0.5 overflow-x-auto bg-slate-50/50">
                      <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><Bold className="h-4 w-4" /></button>
                      <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><Italic className="h-4 w-4" /></button>
                      <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><Underline className="h-4 w-4" /></button>
                      <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><Strikethrough className="h-4 w-4" /></button>
                      <div className="w-px h-4 bg-slate-200 mx-1.5" />
                      <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center font-bold">H1</button>
                      <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center font-bold">H2</button>
                      <div className="w-px h-4 bg-slate-200 mx-1.5" />
                      <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><List className="h-4 w-4" /></button>
                      <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><ListOrdered className="h-4 w-4" /></button>
                      <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><Quote className="h-4 w-4" /></button>
                      <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><Link className="h-4 w-4" /></button>
                      <div className="w-px h-4 bg-slate-200 mx-1.5" />
                      <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><Undo className="h-4 w-4" /></button>
                      <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><Redo className="h-4 w-4" /></button>
                    </div>
                    
                    {/* actual editing textbox */}
                    <textarea
                      className="w-full border-0 focus-visible:ring-0 rounded-none min-h-[220px] resize-none text-xs text-slate-700 p-3 leading-relaxed focus:outline-hidden"
                      value={emailBody}
                      placeholder="Write the message text details to broadcast in bulk here..."
                      onChange={(e) => setEmailBody(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Composer Actions footer */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      toast.success('Announcement draft template saved');
                      setEmailSubject('');
                      setEmailBody('');
                    }}
                    className="h-10 text-xs font-semibold hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Draft Template
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Bulk Email
                  </Button>
                </div>

              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: DISPATCH HISTORY LOGS (5 spans) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-slate-100 bg-white">
                <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-500" />
                  Announcements History Log
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Track the progress, recipient count, and status of past bulk campaigns.
                </p>
              </div>

              {/* Search History */}
              <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search logs by subject or group..."
                    className="pl-9 h-9 text-xs bg-white border-slate-250 animate-none focus:border-slate-350"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Logs List */}
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No past bulk announcements found matching search criteria.
                  </div>
                ) : (
                  filteredLogs.map((log) => {
                    const dateFormatted = new Date(log.dateSent).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div key={log.id} className="p-4 hover:bg-slate-50/40 transition-colors flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 border px-1.5 py-0.5 rounded-sm">
                            {log.id}
                          </span>
                          <span className="text-[10px] font-bold text-slate-450 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {dateFormatted}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 leading-tight line-clamp-2">
                          {log.subject}
                        </h4>

                        <div className="flex items-center justify-between gap-4 pt-1.5 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border px-2 py-0.5 rounded-md">
                              {log.targetGroup}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                              <Users className="h-3 w-3 text-slate-400" />
                              {log.recipientCount} reach
                            </span>
                          </div>

                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {log.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Total summary footer */}
            <div className="p-4 bg-slate-50/40 border-t border-slate-100 text-center text-[10px] font-semibold text-slate-450 tracking-wider uppercase">
              Total logs: {logs.length} dispatches recorded
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
