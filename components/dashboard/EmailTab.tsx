'use client';

import { useMemo, useState } from 'react';
import {
  Mail,
  Plus,
  Search,
  Send,
  Save,
  Variable,
  RefreshCw,
  Copy,
  Check,
  ChevronsUpDown,
  BadgeCheck,
  X,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { RichTextEditor } from '@/components/dashboard/RichTextEditor';
import {
  MEMBERS,
  FROM_EMAILS,
  EMAIL_TYPES,
  EMAIL_TEMPLATES,
  EMAIL_STATUSES,
  EMAIL_VARIABLES,
} from '@/lib/dashboard-mock-data';
import type { FrontendEmail } from '@/lib/email-seed';
import { cn } from '@/lib/utils';
import { formatDate, relativeTime } from '@/lib/constants';
import { toast } from 'sonner';

const statusOf = (id: string) => EMAIL_STATUSES.find((s) => s.id === id) || EMAIL_STATUSES[0];
const fromOf = (id: string) => FROM_EMAILS.find((f) => f.id === id);

function StatusPill({ status }: { status: string }) {
  const s = statusOf(status);
  return (
    <span
      data-testid={`email-status-${status}`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${s.cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const EMAIL_DIALOG_SHELL =
  'max-w-3xl w-[calc(100%-2rem)] sm:max-w-3xl h-[min(700px,calc(100vh-2rem))] flex flex-col gap-0 p-0 overflow-hidden';

const emptyDraft = {
  recipientId: '',
  fromId: 'ops',
  typeId: '',
  templateId: '',
  subject: '',
  message: '',
};

function stripHtml(html: string) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').trim();
}

function normalizeEmail(email: any): FrontendEmail {
  if (email.recipient?.email) {
    return {
      id: email.id,
      recipient: email.recipient,
      from: email.from || 'ops',
      sentBy: email.sentBy || 'Olivia Chen',
      type: email.type || 'transactional',
      subject: email.subject,
      message: email.message || email.body || '',
      status: (email.status || 'sent').toLowerCase(),
      sentAt: email.sentAt || email.dateSent,
    };
  }

  return {
    id: email.id,
    recipient: {
      name: email.recipientName || 'Member',
      email: email.recipientEmail || '',
    },
    from: 'ops',
    sentBy: email.senderName || 'Olivia Chen',
    type: 'transactional',
    subject: email.subject,
    message: email.body || email.message || '',
    status: (email.status || 'sent').toLowerCase(),
    sentAt: email.dateSent || email.sentAt,
  };
}

interface EmailTabProps {
  member: { id?: string; name?: string; email?: string };
  emails: FrontendEmail[];
  setEmails: React.Dispatch<React.SetStateAction<FrontendEmail[]>>;
}

export function EmailTab({ emails, setEmails, member }: EmailTabProps) {
  const [composeOpen, setComposeOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [recipientOpen, setRecipientOpen] = useState(false);
  const [editorRef, setEditorRef] = useState<any>(null);
  const [varOpen, setVarOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    ...emptyDraft,
    recipientId: member?.id || '',
  }));

  const normalizedEmails = useMemo(() => emails.map(normalizeEmail), [emails]);

  const sortedEmails = useMemo(
    () => [...normalizedEmails].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()),
    [normalizedEmails],
  );

  const selected = useMemo(
    () => normalizedEmails.find((e) => e.id === selectedId) || null,
    [normalizedEmails, selectedId],
  );

  const recipientList = MEMBERS;
  const selectedRecipient = recipientList.find((m) => m.id === form.recipientId);

  const filteredTemplates = useMemo(() => {
    if (!form.typeId) return EMAIL_TEMPLATES;
    return EMAIL_TEMPLATES.filter((t) => t.type === form.typeId);
  }, [form.typeId]);

  const openCompose = (prefill: FrontendEmail | null) => {
    const initial = prefill
      ? {
          recipientId:
            recipientList.find((m) => m.email === prefill.recipient.email)?.id ||
            member?.id ||
            '',
          fromId: prefill.from,
          typeId: prefill.type || '',
          templateId: '',
          subject: prefill.subject,
          message: prefill.message,
        }
      : { ...emptyDraft, recipientId: member?.id || '' };
    setForm(initial);
    setComposeOpen(true);
  };

  const applyTemplate = (tplId: string) => {
    const tpl = EMAIL_TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) {
      setForm((f) => ({ ...f, templateId: '' }));
      return;
    }
    setForm((f) => ({
      ...f,
      templateId: tplId,
      typeId: tpl.type,
      subject: tpl.subject,
      message: tpl.message,
    }));
    toast.success(`Template applied: ${tpl.name}`);
  };

  const insertVariable = (varId: string) => {
    const token = `{{${varId}}}`;
    if (editorRef) {
      editorRef.chain().focus().insertContent(token).run();
    }
    setVarOpen(false);
  };

  const buildEmail = (status: string) => {
    const rec = recipientList.find((m) => m.id === form.recipientId);
    if (!rec) {
      toast.error('Please select a recipient');
      return null;
    }
    if (!form.subject.trim()) {
      toast.error('Subject is required');
      return null;
    }
    if (status === 'sent' && !stripHtml(form.message)) {
      toast.error('Message is required to send');
      return null;
    }
    return {
      id: `EML-${Math.floor(Math.random() * 9000) + 1100}`,
      recipient: { name: rec.name, email: rec.email },
      from: form.fromId,
      sentBy: 'Olivia Chen',
      type: form.typeId || 'transactional',
      subject: form.subject,
      message: form.message,
      status,
      sentAt: new Date().toISOString(),
    } satisfies FrontendEmail;
  };

  const handleSaveDraft = () => {
    const draft = buildEmail('draft');
    if (!draft) return;
    setEmails((prev) => [draft, ...prev.map(normalizeEmail)]);
    toast.success('Draft saved', { description: draft.subject });
    setComposeOpen(false);
  };

  const handleSend = () => {
    const email = buildEmail('sent');
    if (!email) return;
    setEmails((prev) => [email, ...prev.map(normalizeEmail)]);
    toast.success('Email sent', {
      description: `${email.subject} → ${email.recipient.email}`,
    });
    setComposeOpen(false);
  };

  const openDetails = (e: FrontendEmail) => {
    setSelectedId(e.id);
    setDetailsOpen(true);
  };

  const handleResend = () => {
    if (!selected) return;
    const resent: FrontendEmail = {
      ...selected,
      id: `EML-${Math.floor(Math.random() * 9000) + 1100}`,
      status: 'sent',
      sentBy: 'Olivia Chen',
      sentAt: new Date().toISOString(),
    };
    setEmails((prev) => [resent, ...prev.map(normalizeEmail)]);
    toast.success('Email resent', { description: resent.subject });
    setDetailsOpen(false);
  };

  const handleDuplicateDraft = () => {
    if (!selected) return;
    setDetailsOpen(false);
    openCompose(selected);
    toast.success('Duplicated as draft', {
      description: 'Edit and send when ready',
    });
  };

  const handleRemove = () => {
    if (!selected) return;
    setEmails((prev) =>
      prev.filter((e) => normalizeEmail(e).id !== selected.id),
    );
    toast.success('Email removed', { description: selected.subject });
    setDetailsOpen(false);
    setSelectedId(null);
  };

  return (
    <div data-testid="email-tab">
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="space-y-0.5 min-w-0">
            <h2 className="font-display text-lg font-semibold text-slate-900 tracking-tight">
              Email History
            </h2>
            <p className="text-sm text-slate-500">
              Click any row to view full email details sent to this member.
            </p>
          </div>
          <Button
            data-testid="compose-email-btn"
            onClick={() => openCompose(null)}
            className="h-10 bg-slate-900 hover:bg-slate-800 text-white shrink-0 ml-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="email-table">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100">
                <th className="px-6 py-3 w-12">Sr No</th>
                <th className="px-6 py-3">Recipient</th>
                <th className="px-6 py-3">Subject &amp; Preview</th>
                <th className="px-6 py-3">From</th>
                <th className="px-6 py-3">Sent By</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedEmails.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    data-testid="email-empty"
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No emails yet. Click Compose to send one.
                  </td>
                </tr>
              ) : (
                sortedEmails.map((e, i) => {
                  const f = fromOf(e.from);
                  return (
                    <tr
                      key={e.id}
                      data-testid={`email-row-${e.id}`}
                      onClick={() => openDetails(e)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-3.5 text-slate-500 font-mono text-xs">
                        {String(i + 1).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-slate-900">{e.recipient.name}</div>
                        <div className="text-xs text-slate-500">{e.recipient.email}</div>
                      </td>
                      <td className="px-6 py-3.5 max-w-md">
                        <div className="font-medium text-slate-900 truncate">{e.subject}</div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">
                          {stripHtml(e.message)}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-700 text-xs">{f?.name}</span>
                          {f?.verified && (
                            <BadgeCheck
                              className="h-3.5 w-3.5"
                              style={{ color: 'white', fill: '#3b82f6' }}
                            />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{f?.address}</div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-700 text-xs whitespace-nowrap">
                        {e.sentBy}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusPill status={e.status} />
                      </td>
                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        <div className="text-slate-900 font-medium">{formatDate(e.sentAt)}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {relativeTime(e.sentAt)}
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

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent data-testid="compose-dialog" className={EMAIL_DIALOG_SHELL}>
          <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="font-display flex items-center gap-2 text-left">
              <Mail className="h-4 w-4 text-slate-500" />
              Compose Email
            </DialogTitle>
            <DialogDescription className="text-left">
              Pick a recipient, optionally apply a template, then write your message.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-hidden px-6 py-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <Field label="Recipient">
                <Popover open={recipientOpen} onOpenChange={setRecipientOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      data-testid="recipient-trigger"
                      variant="outline"
                      role="combobox"
                      className="h-10 justify-between font-normal w-full"
                    >
                      {selectedRecipient ? (
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-semibold border border-slate-200">
                            {selectedRecipient.avatar}
                          </div>
                          <span className="truncate">{selectedRecipient.name}</span>
                          {!selectedRecipient.verified && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                              Unverified
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-2">
                          <Search className="h-3.5 w-3.5" />
                          Search recipient…
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput
                        data-testid="recipient-search"
                        placeholder="Search by name, email, company…"
                        className="h-11"
                      />
                      <CommandList>
                        <CommandEmpty>No recipient found.</CommandEmpty>
                        <CommandGroup heading="Members">
                          {recipientList.map((m) => (
                            <CommandItem
                              key={m.id}
                              value={`${m.name} ${m.email} ${m.company}`}
                              data-testid={`recipient-option-${m.id}`}
                              onSelect={() => {
                                setForm((f) => ({ ...f, recipientId: m.id }));
                                setRecipientOpen(false);
                              }}
                              className="flex items-center gap-3 py-2 cursor-pointer"
                            >
                              <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-semibold border border-slate-200">
                                {m.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{m.name}</div>
                                <div className="text-xs text-slate-500 truncate">{m.email}</div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {!m.verified && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-200">
                                    Unverified
                                  </span>
                                )}
                                <Check
                                  className={cn(
                                    'h-4 w-4',
                                    form.recipientId === m.id ? 'opacity-100' : 'opacity-0',
                                  )}
                                />
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </Field>

              <Field label="From">
                <Select
                  value={form.fromId}
                  onValueChange={(v) => setForm((f) => ({ ...f, fromId: v }))}
                >
                  <SelectTrigger data-testid="from-select" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FROM_EMAILS.map((f) => (
                      <SelectItem key={f.id} value={f.id} data-testid={`from-option-${f.id}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{f.name}</span>
                          <BadgeCheck
                            className="h-3.5 w-3.5 shrink-0"
                            style={{ color: 'white', fill: '#3b82f6' }}
                          />
                          <span className="text-xs text-slate-500 ml-1">{f.address}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0">
              <Field label="Email Type">
                <Select
                  value={form.typeId || 'none'}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      typeId: v === 'none' ? '' : v,
                      templateId: '',
                    }))
                  }
                >
                  <SelectTrigger data-testid="type-select" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No type</SelectItem>
                    {EMAIL_TYPES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Email Template">
                <Select
                  value={form.templateId || 'none'}
                  onValueChange={(v) => applyTemplate(v === 'none' ? '' : v)}
                >
                  <SelectTrigger data-testid="template-select" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No template</SelectItem>
                    {filteredTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id} data-testid={`template-option-${t.id}`}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Subject">
              <Input
                data-testid="subject-input"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                className="h-10"
                placeholder="What's this email about?"
              />
            </Field>

            <div className="flex-1 min-h-0 flex flex-col gap-1.5">
              <div className="flex items-center justify-between shrink-0">
                <Label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Message
                </Label>
                <Popover open={varOpen} onOpenChange={setVarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      data-testid="insert-variable-btn"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                    >
                      <Variable className="h-3 w-3 mr-1.5" />
                      Insert variable
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-[260px] p-2"
                    data-testid="variable-popover"
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 px-2 py-1.5">
                      Variables
                    </div>
                    <div className="space-y-0.5">
                      {EMAIL_VARIABLES.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          data-testid={`variable-${v.id}`}
                          onClick={() => insertVariable(v.id)}
                          className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors flex items-center justify-between text-sm"
                        >
                          <span className="text-slate-700">{v.label}</span>
                          <span className="text-[10px] font-mono text-slate-400">{`{{${v.id}}}`}</span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <RichTextEditor
                value={form.message}
                onChange={(html) => setForm((f) => ({ ...f, message: html }))}
                placeholder="Type your message… use Insert Variable for dynamic fields."
                onEditorReady={setEditorRef}
                fillHeight
                className="flex-1 min-h-0"
              />
            </div>
          </div>

          <DialogFooter className="shrink-0 px-6 py-4 border-t border-slate-100 gap-2 mt-0">
            <Button data-testid="compose-cancel" variant="outline" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button data-testid="save-draft-btn" variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-1.5" />
              Save Draft
            </Button>
            <Button
              data-testid="send-email-btn"
              onClick={handleSend}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              <Send className="h-4 w-4 mr-1.5" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent data-testid="details-dialog" className={EMAIL_DIALOG_SHELL}>
          {selected && (
            <>
              <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b border-slate-100">
                <DialogTitle className="font-display flex items-center gap-2 text-left">
                  <Mail className="h-4 w-4 text-slate-500" />
                  Email Details
                </DialogTitle>
                <DialogDescription className="text-left">
                  ID: <span className="font-mono text-slate-700">{selected.id}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 min-h-0 overflow-hidden px-6 py-4 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 shrink-0">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                      Recipient
                    </div>
                    <div className="text-sm font-medium text-slate-900">{selected.recipient.name}</div>
                    <div className="text-xs text-slate-500">{selected.recipient.email}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                      From
                    </div>
                    <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                      {fromOf(selected.from)?.name}
                      {fromOf(selected.from)?.verified && (
                        <BadgeCheck
                          className="h-4 w-4"
                          style={{ color: 'white', fill: '#3b82f6' }}
                        />
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{fromOf(selected.from)?.address}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                      Sent By
                    </div>
                    <div className="text-sm font-medium text-slate-900">{selected.sentBy}</div>
                    <div className="text-xs text-slate-500">
                      {formatDate(selected.sentAt)} · {relativeTime(selected.sentAt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                      Status
                    </div>
                    <StatusPill status={selected.status} />
                  </div>
                </div>

                <div className="shrink-0">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                    Subject
                  </div>
                  <h3
                    data-testid="details-subject"
                    className="font-display text-base font-semibold text-slate-900 leading-snug line-clamp-2"
                  >
                    {selected.subject}
                  </h3>
                </div>

                <div className="flex-1 min-h-0 flex flex-col gap-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 shrink-0">
                    Message
                  </div>
                  <div
                    data-testid="details-message"
                    className="flex-1 min-h-0 overflow-y-auto border border-slate-200 rounded-lg p-4 bg-slate-50/40 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selected.message }}
                  />
                </div>
              </div>

              <DialogFooter className="shrink-0 px-6 py-4 border-t border-slate-100 gap-2 mt-0">
                <Button data-testid="details-close" variant="outline" onClick={() => setDetailsOpen(false)}>
                  <X className="h-4 w-4 mr-1.5" />
                  Close
                </Button>
                <Button
                  data-testid="remove-email-btn"
                  variant="outline"
                  onClick={handleRemove}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Remove
                </Button>
                <Button data-testid="duplicate-draft-btn" variant="outline" onClick={handleDuplicateDraft}>
                  <Copy className="h-4 w-4 mr-1.5" />
                  Duplicate Draft
                </Button>
                <Button
                  data-testid="resend-email-btn"
                  onClick={handleResend}
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  Resend Email
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
