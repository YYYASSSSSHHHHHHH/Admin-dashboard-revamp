'use client';

import { useState, Fragment } from 'react';
import {
  Mail, X, Copy, RefreshCw, Send, Save,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Link, Undo, Redo, 
  BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate, relativeTime } from '@/lib/mockData';

// Re-using the parent interface but augmenting it internally for display
interface EmailRecord {
  id: string;
  serial: number;
  dateSent: string;
  subject: string;
  body: string;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  fromName?: string;
  fromEmail?: string;
  status?: string;
}

interface EmailTabProps {
  member: any;
  emails: EmailRecord[];
  setEmails: React.Dispatch<React.SetStateAction<EmailRecord[]>>;
}

export function EmailStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DELIVERED: 'bg-blue-50 text-blue-700 border-blue-200',
    SENT:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    QUEUED:    'bg-amber-50 text-amber-700 border-amber-200',
    DRAFT:     'bg-slate-50 text-slate-600 border-slate-200',
    FAILED:    'bg-red-50 text-red-700 border-red-200',
  };

  const currentStyle = styles[status] || styles['DRAFT'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${currentStyle}`}>
      {status}
    </span>
  );
}

const ToolbarBtn = ({ icon, text }: { icon?: React.ReactNode, text?: string }) => (
  <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center">
    {icon || text}
  </button>
);

export function EmailTab({ member, emails, setEmails }: EmailTabProps) {
  const [viewEmailId, setViewEmailId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const viewEmail = emails.find(e => e.id === viewEmailId);

  const handleOpenCompose = () => {
    setSubject('');
    setBody('');
    setComposeOpen(true);
  };

  const handleDuplicateDraft = () => {
    if (viewEmail) {
      setSubject(viewEmail.subject || '');
      setBody(viewEmail.body || '');
      setViewEmailId(null);
      setComposeOpen(true);
      toast.success('Email draft loaded for duplication');
    }
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and message are required');
      return;
    }

    const newEmail: EmailRecord = {
      id: `EML-${Math.floor(Math.random() * 9000) + 1000}`,
      serial: emails.length + 1,
      dateSent: new Date().toISOString(),
      subject,
      body,
      recipientName: member.name || 'Aria Lindqvist',
      recipientEmail: member.email || 'aria.lindqvist@northwave.io',
      senderName: 'Olivia Chen',
      senderEmail: 'olivia@northgate.io',
      fromName: 'Northgate Ops',
      fromEmail: 'ops@northgate.io',
      status: 'QUEUED'
    };

    setEmails((prev) => [newEmail, ...prev]);
    toast.success('Email dispatched successfully!');
    setComposeOpen(false);
  };

  return (
    <div className="space-y-5" data-testid="email-history-tab">
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900 tracking-tight">
              Email History
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Click any row to view full email details.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg"
            >
              {emails.length} emails
            </span>
            <Button
              onClick={handleOpenCompose}
              className="h-10 bg-[#0f172a] hover:bg-slate-800 text-white rounded-lg px-4 font-semibold text-sm transition-all"
            >
              <Mail className="h-4 w-4 mr-2" />
              Compose Email
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100">
                <th className="px-6 py-3 w-16">SR NO</th>
                <th className="px-6 py-3">RECIPIENT</th>
                <th className="px-6 py-3">SUBJECT & PREVIEW</th>
                <th className="px-6 py-3">FROM</th>
                <th className="px-6 py-3">SENT BY</th>
                <th className="px-6 py-3">STATUS</th>
                <th className="px-6 py-3 text-right whitespace-nowrap">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {emails.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    No emails found.
                  </td>
                </tr>
              ) : (
                emails.map((e, i) => {
                  const preview = e.body.length > 50 ? e.body.substring(0, 50) + '...' : e.body;
                  return (
                    <tr
                      key={e.id}
                      onClick={() => setViewEmailId(e.id)}
                      className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-400">
                        {String(i + 1).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{e.recipientName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{e.recipientEmail}</div>
                      </td>
                      <td className="px-6 py-4 max-w-[280px]">
                        <div className="font-medium text-slate-900 truncate">{e.subject}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">{preview}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-medium text-slate-900">
                          {e.fromName || 'Northgate Ops'}
                          <BadgeCheck className="h-3 w-3 text-blue-500" />
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{e.fromEmail || 'ops@northgate.io'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                        {e.senderName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <EmailStatusBadge status={e.status || 'DELIVERED'} />
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{formatDate(e.dateSent)}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{relativeTime(e.dateSent)}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!viewEmailId} onOpenChange={(open) => !open && setViewEmailId(null)}>
        <DialogContent className="sm:max-w-3xl h-[690px] max-h-[90vh] flex flex-col justify-between overflow-hidden p-0">
          <DialogHeader className="pt-6 px-6 pb-2">
            <DialogTitle className="font-display flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" />
              Email Details
            </DialogTitle>
            <DialogDescription>
              ID: <span className="font-mono text-slate-700">{viewEmail?.id}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 my-2 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-4 border-b border-slate-100">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1.5">Recipient</div>
                <div className="text-sm font-medium text-slate-900">{viewEmail?.recipientName}</div>
                <div className="text-xs text-slate-500">{viewEmail?.recipientEmail}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1.5">From</div>
                <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                  {viewEmail?.fromName || 'Northgate Ops'}
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-xs text-slate-500">{viewEmail?.fromEmail || 'ops@northgate.io'}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1.5">Sent By</div>
                <div className="text-sm font-medium text-slate-900">{viewEmail?.senderName}</div>
                <div className="text-xs text-slate-500">
                  {viewEmail ? `${formatDate(viewEmail.dateSent)} · ${relativeTime(viewEmail.dateSent)}` : ''}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1.5">Status</div>
                {viewEmail && <EmailStatusBadge status={viewEmail.status || 'DELIVERED'} />}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-2">Subject</div>
              <h3 className="font-display text-lg font-semibold text-slate-900 leading-tight">{viewEmail?.subject}</h3>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-2">Message</div>
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/40 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                {viewEmail?.body}
              </div>
            </div>
          </div>

          <DialogFooter className="pb-6 px-6 pt-4 border-t border-slate-100 gap-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setViewEmailId(null)} className="h-9">
              <X className="h-4 w-4 mr-1.5" />Close
            </Button>
            <Button variant="outline" className="h-9" onClick={handleDuplicateDraft}>
              <Copy className="h-4 w-4 mr-1.5" />Duplicate Draft
            </Button>
            <Button className="h-9 bg-slate-900 hover:bg-slate-800 text-white">
              <RefreshCw className="h-4 w-4 mr-1.5" />Resend Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-3xl h-[690px] max-h-[90vh] flex flex-col justify-between overflow-hidden p-0">
          <DialogHeader className="pt-6 px-6 pb-2">
            <DialogTitle className="font-display flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" />
              Compose Email
            </DialogTitle>
            <DialogDescription>
              Pick a recipient, optionally apply a template, then write your message.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 my-2 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Recipient</Label>
                <Select value="default">
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 text-[10px] font-semibold flex items-center justify-center text-slate-600">AL</div>
                        Aria Lindqvist
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Aria Lindqvist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">From</Label>
                <Select value="default">
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-900">Northgate Ops</span>
                        <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-slate-500 truncate">ops@northgate.io</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Northgate Ops</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Email Type</Label>
                <Select value="none">
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="No type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No type</SelectItem>
                    <SelectItem value="welcome">Welcome</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-[11px] text-slate-500">Optional. Filters template list.</div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Email Template</Label>
                <Select value="none">
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="No template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No template</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-[11px] text-slate-500">Auto-fills subject and message.</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Subject</Label>
              <Input
                placeholder="What's this email about?"
                className="h-10 text-sm"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Message</Label>
                <Button variant="outline" className="h-7 px-2.5 text-xs bg-white border-slate-200 text-slate-600">
                  <span className="font-mono bg-slate-100 border border-slate-200 rounded px-1 text-[9px] mr-1.5">{'{x}'}</span>
                  Insert variable
                </Button>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <div className="border-b border-slate-200 px-3 py-1.5 flex items-center gap-0.5 overflow-x-auto bg-slate-50/50">
                  <ToolbarBtn icon={<Bold className="h-4 w-4" />} />
                  <ToolbarBtn icon={<Italic className="h-4 w-4" />} />
                  <ToolbarBtn icon={<Underline className="h-4 w-4" />} />
                  <ToolbarBtn icon={<Strikethrough className="h-4 w-4" />} />
                  <div className="w-px h-4 bg-slate-200 mx-1.5" />
                  <ToolbarBtn text="H1" />
                  <ToolbarBtn text="H2" />
                  <div className="w-px h-4 bg-slate-200 mx-1.5" />
                  <ToolbarBtn icon={<List className="h-4 w-4" />} />
                  <ToolbarBtn icon={<ListOrdered className="h-4 w-4" />} />
                  <ToolbarBtn icon={<Quote className="h-4 w-4" />} />
                  <ToolbarBtn icon={<Link className="h-4 w-4" />} />
                  <div className="w-px h-4 bg-slate-200 mx-1.5" />
                  <ToolbarBtn icon={<Undo className="h-4 w-4" />} />
                  <ToolbarBtn icon={<Redo className="h-4 w-4" />} />
                </div>
                <Textarea
                  className="border-0 focus-visible:ring-0 rounded-none min-h-[160px] resize-none text-sm text-slate-700 p-3 leading-relaxed"
                  value={body}
                  placeholder="Type your message here..."
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pb-6 px-6 pt-4 border-t border-slate-100 gap-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setComposeOpen(false)} className="h-9">Cancel</Button>
            <Button variant="outline" className="h-9" onClick={() => { toast.success('Draft saved successfully!'); setComposeOpen(false); }}>
              <Save className="h-4 w-4 mr-1.5" /> Save Draft
            </Button>
            <Button className="h-9 bg-slate-900 hover:bg-slate-800 text-white" onClick={handleSend}>
              <Send className="h-4 w-4 mr-1.5" /> Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
