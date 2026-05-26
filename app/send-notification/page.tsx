'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Send,
  Save,
  Variable,
  Search,
  Check,
  ChevronsUpDown,
  Smartphone,
  Users,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { EMAIL_TYPES, EMAIL_VARIABLES, MEMBERS } from '@/lib/dashboard-mock-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PUSH_SENDERS = [
  { id: 'app', name: 'Northgate App', subtitle: 'Default app notifications' },
  { id: 'alerts', name: 'Security Alerts', subtitle: 'Account & login alerts' },
  { id: 'billing', name: 'Billing Updates', subtitle: 'Invoices & renewals' },
];

const PUSH_CHAR_LIMIT = 240;

interface ApiTemplate {
  id: string;
  name: string;
  subject?: string;
  body?: string;
  content?: string;
  categoryId: string | number;
}

type MemberOption = {
  id: string;
  name: string;
  email: string;
  company: string;
  avatar: string;
  status?: string;
  verified?: boolean;
};

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

const AUDIENCE_PRESETS = [
  { id: 'all', label: 'All members' },
  { id: 'active', label: 'Active members' },
  { id: 'verified', label: 'Verified members' },
] as const;

export default function SendNotificationPage() {
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [recipientOpen, setRecipientOpen] = useState(false);
  const [senderId, setSenderId] = useState('app');
  const [typeId, setTypeId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [varOpen, setVarOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pushTemplates, setPushTemplates] = useState<ApiTemplate[]>([]);
  const [members, setMembers] = useState<MemberOption[]>(MEMBERS);
  const [audiencePreset, setAudiencePreset] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [templatesRes, membersRes] = await Promise.all([
          fetch('/api/templates'),
          fetch('/api/members'),
        ]);
        if (templatesRes.ok) {
          const data = await templatesRes.json();
          const pushCategories = (data.categories || []).filter(
            (c: { channel: string }) => c.channel === 'push',
          );
          setPushTemplates(
            (data.templates || []).filter((t: ApiTemplate) =>
              pushCategories.some((c: { id: string | number }) => c.id === t.categoryId),
            ),
          );
        }
        if (membersRes.ok) {
          const data = await membersRes.json();
          setMembers(
            data.map(
              (m: {
                id: string;
                name: string;
                email: string;
                companyName: string;
                initials: string;
                status: string;
              }) => ({
                id: m.id,
                name: m.name,
                email: m.email,
                company: m.companyName,
                avatar: m.initials,
                status: m.status,
                verified: ['aria-lindqvist', 'mateo-ferrari', 'sarah-jenkins', 'yuki-tanaka'].includes(
                  m.id,
                ),
              }),
            ),
          );
        }
      } catch (error) {
        console.error('Failed to load notification data:', error);
      }
    }
    loadData();
  }, []);

  const selectedMembers = useMemo(
    () => members.filter((m) => recipientIds.includes(m.id)),
    [members, recipientIds],
  );

  const applyTemplate = (tplId: string) => {
    if (!tplId) {
      setTemplateId('');
      return;
    }
    const tpl = pushTemplates.find((t) => t.id === tplId);
    if (!tpl) return;
    setTemplateId(tplId);
    setTitle(tpl.subject || tpl.name);
    setMessage(tpl.body || tpl.content || '');
    toast.success(`Template applied: ${tpl.name}`);
  };

  const applyAudiencePreset = (preset: string) => {
    setAudiencePreset(preset);
    if (preset === 'all') setRecipientIds(members.map((m) => m.id));
    else if (preset === 'active')
      setRecipientIds(members.filter((m) => m.status === 'ACTIVE').map((m) => m.id));
    else if (preset === 'verified')
      setRecipientIds(members.filter((m) => m.verified).map((m) => m.id));
    else setAudiencePreset('');
  };

  const toggleRecipient = (id: string) => {
    setAudiencePreset('');
    setRecipientIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const insertVariable = (varId: string) => {
    const token = `{{${varId}}}`;
    setMessage((prev) => {
      const next = prev + token;
      return next.length > PUSH_CHAR_LIMIT ? next.slice(0, PUSH_CHAR_LIMIT) : next;
    });
    setVarOpen(false);
  };

  const validateForm = () => {
    if (recipientIds.length === 0) {
      toast.error('Select at least one recipient');
      return false;
    }
    if (!title.trim()) {
      toast.error('Notification title is required');
      return false;
    }
    if (!message.trim()) {
      toast.error('Message is required');
      return false;
    }
    return true;
  };

  const saveDraft = async () => {
    if (!validateForm()) return;
    await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientIds,
        sender: senderId,
        type: typeId || 'transactional',
        title,
        body: message,
        status: 'DRAFT',
      }),
    });
    toast.success('Draft saved', { description: `${recipientIds.length} device(s) · ${title}` });
  };

  const sendNotification = async () => {
    if (!validateForm()) return;
    setIsSending(true);
    try {
      await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientIds,
          sender: senderId,
          type: typeId || 'transactional',
          title,
          body: message,
          status: 'QUEUED',
        }),
      });
      toast.success('Push notifications queued', {
        description: `${title} → ${recipientIds.length} recipient(s)`,
      });
      setRecipientIds([]);
      setAudiencePreset('');
      setTitle('');
      setMessage('');
      setTemplateId('');
      setTypeId('');
    } catch {
      toast.error('Failed to send notifications');
    } finally {
      setIsSending(false);
    }
  };

  const charCount = message.length;

  return (
    <DashboardLayout>
      <div data-testid="send-notification-page" className="p-6 md:p-8 lg:p-10">
        <div className="mb-5">
          <Header
            title="Send Notification"
            subtitle="Compose and deliver push alerts to members' phones — same workflow as bulk email."
          />
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <h2 className="font-display text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-500" />
              Compose Push Notification
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Pick recipients, load a push template, and send a short message to mobile devices.
            </p>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 pb-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mr-1">
                Quick audience
              </span>
              {AUDIENCE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyAudiencePreset(preset.id)}
                  className={cn(
                    'h-8 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer',
                    audiencePreset === preset.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Recipients" hint={`${recipientIds.length} selected`}>
                <Popover open={recipientOpen} onOpenChange={setRecipientOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="h-10 justify-between font-normal w-full">
                      {recipientIds.length > 0 ? (
                        <span className="flex items-center gap-2 min-w-0 truncate">
                          <Users className="h-4 w-4 text-slate-400 shrink-0" />
                          {recipientIds.length} recipient{recipientIds.length === 1 ? '' : 's'}
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-2">
                          <Search className="h-3.5 w-3.5" />
                          Search members…
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search by name, email…" className="h-11" />
                      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-100">
                        <button
                          type="button"
                          className="text-xs font-semibold text-slate-700"
                          onClick={() => {
                            setAudiencePreset('all');
                            setRecipientIds(members.map((m) => m.id));
                          }}
                        >
                          Select all
                        </button>
                        <button
                          type="button"
                          className="text-xs font-semibold text-slate-500"
                          onClick={() => {
                            setAudiencePreset('');
                            setRecipientIds([]);
                          }}
                        >
                          Clear
                        </button>
                      </div>
                      <CommandList className="max-h-[280px]">
                        <CommandEmpty>No members found.</CommandEmpty>
                        <CommandGroup heading="Members">
                          {members.map((m) => (
                            <CommandItem
                              key={m.id}
                              value={`${m.name} ${m.email}`}
                              onSelect={() => toggleRecipient(m.id)}
                              className="flex items-center gap-3 py-2 cursor-pointer"
                            >
                              <div className="h-7 w-7 rounded-full bg-slate-100 text-[10px] font-semibold flex items-center justify-center border border-slate-200">
                                {m.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{m.name}</div>
                                <div className="text-xs text-slate-500 truncate">{m.email}</div>
                              </div>
                              <Check
                                className={cn(
                                  'h-4 w-4',
                                  recipientIds.includes(m.id) ? 'opacity-100' : 'opacity-0',
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </Field>

              <Field label="Send From">
                <Select value={senderId} onValueChange={setSenderId}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PUSH_SENDERS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{s.name}</span>
                          <span className="text-xs text-slate-500">{s.subtitle}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Notification Type">
                <Select
                  value={typeId || 'none'}
                  onValueChange={(v) => {
                    setTypeId(v === 'none' ? '' : v);
                    setTemplateId('');
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="No type" />
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

              <Field label="Push Template">
                <Select
                  value={templateId || 'none'}
                  onValueChange={(v) => applyTemplate(v === 'none' ? '' : v)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="No template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No template</SelectItem>
                    {pushTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Title" hint="Shown on the lock screen and notification tray">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10"
                placeholder="e.g. Your plan renews tomorrow"
                disabled={isSending}
                maxLength={80}
              />
            </Field>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Message
                </Label>
                <Popover open={varOpen} onOpenChange={setVarOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs">
                      <Variable className="h-3 w-3 mr-1.5" />
                      Insert variable
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-[260px] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 px-2 py-1.5">
                      Variables
                    </div>
                    {EMAIL_VARIABLES.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => insertVariable(v.id)}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-100 text-sm flex justify-between"
                      >
                        <span>{v.label}</span>
                        <span className="text-[10px] font-mono text-slate-400">{`{{${v.id}}}`}</span>
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, PUSH_CHAR_LIMIT))}
                placeholder="Short message for mobile push…"
                disabled={isSending}
                rows={4}
                className="resize-none text-sm min-h-[100px]"
              />
              <p
                className={cn(
                  'text-xs text-right',
                  charCount > PUSH_CHAR_LIMIT - 20 ? 'text-amber-600' : 'text-slate-500',
                )}
              >
                {charCount}/{PUSH_CHAR_LIMIT} characters
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {selectedMembers.length > 0 && (
                <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-2">
                    Sending to
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.slice(0, 6).map((m) => (
                      <span
                        key={m.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium"
                      >
                        {m.name}
                      </span>
                    ))}
                    {selectedMembers.length > 6 && (
                      <span className="text-xs text-slate-500">+{selectedMembers.length - 6} more</span>
                    )}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 flex gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Preview
                  </p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {title || 'Notification title'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3">
                    {message || 'Your message will appear here on member devices.'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {PUSH_SENDERS.find((s) => s.id === senderId)?.name ?? 'Northgate App'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap justify-end gap-2">
            <Button variant="outline" disabled={isSending} onClick={saveDraft} className="h-10">
              <Save className="h-4 w-4 mr-1.5" />
              Save Draft
            </Button>
            <Button
              disabled={isSending}
              onClick={sendNotification}
              className="h-10 bg-slate-900 hover:bg-slate-800 text-white min-w-[140px]"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1.5" />
                  Send Notification
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
