'use client';

import { useState, useMemo, Fragment } from 'react';
import {
  Mail,
  ChevronDown,
  ChevronUp,
  Send,
  Calendar as CalendarIcon,
  User,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { formatDate } from '@/lib/mockData';
import { toast } from 'sonner';

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
}

interface EmailTabProps {
  member: any;
  emails: EmailRecord[];
  setEmails: React.Dispatch<React.SetStateAction<EmailRecord[]>>;
}

const CATEGORIES = [
  { id: 'welcome', label: 'Welcome Emails' },
  { id: 'billing', label: 'Billing Updates' },
  { id: 'system', label: 'System Announcements' },
];

const TEMPLATES = [
  {
    id: 'welcome_basic',
    categoryId: 'welcome',
    name: 'Welcome Email (pre-fills generic greeting text)',
    subject: 'Welcome to our Premium Marketplace Community!',
    body: 'Hi {name},\n\nWe are absolutely thrilled to welcome you to our Premium Marketplace! Your account is now active and ready to use.\n\nExplore our workspace, connect with other members, and let us know if you have any questions.\n\nBest regards,\nJayesh Jain',
  },
  {
    id: 'billing_reminder',
    categoryId: 'billing',
    name: 'Invoice Reminder (pre-fills invoice reference and payment due alerts)',
    subject: 'Action Required: Upcoming Invoice Reminder for {plan} Plan',
    body: 'Hi {name},\n\nThis is a friendly reminder that the invoice for your {plan} Plan is scheduled to be generated shortly.\n\nPlease ensure your billing details are up to date to avoid any interruption to your access.\n\nBest regards,\nJayesh Jain',
  },
  {
    id: 'system_update',
    categoryId: 'system',
    name: 'System Update (pre-fills maintenance announcement text)',
    subject: 'Scheduled System Maintenance Notice',
    body: 'Hi {name},\n\nWe will be conducting scheduled system maintenance on Sunday between 2:00 AM and 4:00 AM UTC.\n\nSome services may be temporarily unavailable. We apologize for any inconvenience.\n\nBest regards,\nJayesh Jain',
  },
];

export function EmailTab({ member, emails, setEmails }: EmailTabProps) {
  const [open, setOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Compose Form state
  const [recipientEmail, setRecipientEmail] = useState(member.email || '');
  const [selectedCategory, setSelectedCategory] = useState('welcome');
  const [selectedTemplate, setSelectedTemplate] = useState('welcome_basic');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((t) => t.categoryId === selectedCategory);
  }, [selectedCategory]);

  const handleOpen = () => {
    setRecipientEmail(member.email || '');
    setSelectedCategory('welcome');
    setSelectedTemplate('welcome_basic');
    
    // Process template variables
    const tpl = TEMPLATES.find((t) => t.id === 'welcome_basic')!;
    const processedSubject = tpl.subject
      .replace('{name}', member.name)
      .replace('{plan}', member.plan || 'Growth');
    const processedBody = tpl.body
      .replace('{name}', member.name)
      .replace('{plan}', member.plan || 'Growth');

    setSubject(processedSubject);
    setBody(processedBody);
    setOpen(true);
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const firstTpl = TEMPLATES.find((t) => t.categoryId === catId);
    if (firstTpl) {
      setSelectedTemplate(firstTpl.id);
      const processedSubject = firstTpl.subject
        .replace('{name}', member.name)
        .replace('{plan}', member.plan || 'Growth');
      const processedBody = firstTpl.body
        .replace('{name}', member.name)
        .replace('{plan}', member.plan || 'Growth');
      setSubject(processedSubject);
      setBody(processedBody);
    }
  };

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplate(tplId);
    const tpl = TEMPLATES.find((t) => t.id === tplId);
    if (tpl) {
      const processedSubject = tpl.subject
        .replace('{name}', member.name)
        .replace('{plan}', member.plan || 'Growth');
      const processedBody = tpl.body
        .replace('{name}', member.name)
        .replace('{plan}', member.plan || 'Growth');
      setSubject(processedSubject);
      setBody(processedBody);
    }
  };

  const handleSend = () => {
    if (!recipientEmail.trim()) {
      toast.error('Recipient email is required');
      return;
    }
    if (!subject.trim()) {
      toast.error('Subject line is required');
      return;
    }
    if (!body.trim()) {
      toast.error('Email body is required');
      return;
    }

    const newEmail: EmailRecord = {
      id: `EML-${Math.floor(Math.random() * 9000) + 1000}`,
      serial: emails.length + 1,
      dateSent: new Date().toISOString(),
      subject,
      body,
      recipientName: member.name,
      recipientEmail,
      senderName: 'Jayesh Jain',
      senderEmail: 'jayesh@marketplace.io',
    };

    setEmails((prev) => [newEmail, ...prev]);
    toast.success('Email dispatched successfully!', {
      description: `Sent to ${recipientEmail}`,
    });
    setOpen(false);
  };

  const toggleExpand = (id: string) => {
    const isExpanding = !expandedIds[id];
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));

    if (isExpanding) {
      setTimeout(() => {
        const el = document.getElementById(`email-row-expand-${id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 150);
    }
  };

  return (
    <div className="space-y-5" data-testid="email-history-tab">
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
        {/* Header inside Card to match symmetry */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900 tracking-tight">
              Email History Log
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Outbound administrative and system notification history for this member.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              data-testid="email-count"
              className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-md"
            >
              {emails.length} sent
            </span>
            <Button
              data-testid="compose-email-btn"
              onClick={handleOpen}
              className="h-10 bg-slate-900 hover:bg-slate-800 text-white"
            >
              <Mail className="h-4 w-4 mr-2" />
              Compose Email
            </Button>
          </div>
        </div>

        {/* Table Log */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="email-table">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100">
                <th className="px-6 py-3 w-16">S.No.</th>
                <th className="px-6 py-3">Date Sent</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Message Preview</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emails.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                    No emails sent yet. Click "Compose Email" to dispatch your first message.
                  </td>
                </tr>
              ) : (
                emails.map((e) => {
                  const isExpanded = !!expandedIds[e.id];
                  const preview = e.body.length > 60 ? e.body.substring(0, 60) + '...' : e.body;
                  return (
                    <Fragment key={e.id}>
                      <tr
                        data-testid={`email-row-${e.id}`}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => toggleExpand(e.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-400">
                          #{e.serial}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                          {formatDate(e.dateSent)}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 max-w-xs truncate">
                          {e.subject}
                        </td>
                        <td className="px-6 py-4 text-slate-500 max-w-sm truncate">
                          {preview}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button className="text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1">
                            {isExpanded ? (
                              <>
                                Collapse <ChevronUp className="h-4 w-4" />
                              </>
                            ) : (
                              <>
                                View Detail <ChevronDown className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      <tr
                        key={`expand-${e.id}`}
                        id={`email-row-expand-${e.id}`}
                        className={`bg-slate-50/50 transition-all duration-300 ${
                          isExpanded ? 'border-t border-slate-100' : 'border-none'
                        }`}
                      >
                        <td colSpan={5} className="p-0">
                          <div
                            className={`grid transition-all duration-300 ease-in-out ${
                              isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-4">
                                  <div>
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                      Subject
                                    </div>
                                    <div className="text-base font-semibold text-slate-900">
                                      {e.subject}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                      Message Body
                                    </div>
                                    <div className="p-4 rounded-lg bg-white border border-slate-200 text-slate-700 whitespace-pre-wrap leading-relaxed text-sm shadow-sm">
                                      {e.body}
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4 border-l border-slate-200 pl-6">
                                  <div>
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                                      <User className="h-3.5 w-3.5" />
                                      Recipient Details
                                    </div>
                                    <div className="space-y-1 text-sm bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                      <div className="font-semibold text-slate-800">
                                        {e.recipientName}
                                      </div>
                                      <div className="text-xs text-slate-500">{e.recipientEmail}</div>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                                      <Send className="h-3.5 w-3.5 text-slate-400" />
                                      Sender Details
                                    </div>
                                    <div className="space-y-1 text-sm bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                      <div className="font-semibold text-slate-800">{e.senderName}</div>
                                      <div className="text-xs text-slate-500">{e.senderEmail}</div>
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-slate-200">
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                      <CalendarIcon className="h-3.5 w-3.5" />
                                      Sent Outbound via SMTP
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compose Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="compose-dialog" className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Mail className="h-5 w-5 text-slate-500" />
              Compose Email Notification
            </DialogTitle>
            <DialogDescription>
              Create a custom notification using system categories and editable templates.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Recipient Email
                </Label>
                <Input
                  data-testid="email-recipient"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="h-11 bg-white"
                  placeholder="name@company.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Template Category
                </Label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger data-testid="email-category-select" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Email Template
              </Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger data-testid="email-template-select" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filteredTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Subject Line
              </Label>
              <Input
                data-testid="email-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-11 bg-white font-medium"
                placeholder="Enter subject line..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Message Body
              </Label>
              <Textarea
                data-testid="email-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className="resize-none bg-white leading-relaxed"
                placeholder="Write your message here..."
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500">
                This email will be dispatched using outbound system credentials. Sender details will display <strong>Jayesh Jain (jayesh@marketplace.io)</strong>.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              data-testid="compose-cancel"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-testid="compose-confirm"
              onClick={handleSend}
              className="bg-slate-900 hover:bg-slate-800 text-white inline-flex items-center"
            >
              <Send className="h-3.5 w-3.5 mr-2" />
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
