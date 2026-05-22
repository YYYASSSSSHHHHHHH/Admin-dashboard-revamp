'use client';

import { useState, useEffect } from 'react';
import {
  Send,
  Save,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link as LinkIcon,
  Loader2,
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

interface Template {
  id: string;
  name: string;
  subject: string;
  body?: string;
  content?: string;
  categoryId: string | number;
}

const CATEGORIES = [
  { id: 0, name: 'All Categories' },
  { id: 1, name: 'Welcome Emails' },
  { id: 2, name: 'Billing Updates' },
  { id: 3, name: 'System Announcements' },
];

export default function SendEmailPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('0');
  const [categories, setCategories] = useState(CATEGORIES);
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);

  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const response = await fetch('/api/templates');
        if (!response.ok) throw new Error('Failed to load email templates');
        const data = await response.json();
        const emailCategories = (data.categories || []).filter((category: any) => category.channel === 'email');
        setCategories([
          { id: 0, name: 'All Categories' },
          ...emailCategories.map((category: any) => ({ id: category.id, name: category.name })),
        ]);
        setAllTemplates((data.templates || []).filter((template: any) =>
          emailCategories.some((category: any) => category.id === template.categoryId)
        ));
      } catch (error) {
        console.error('Failed to load email templates:', error);
        toast.error('Failed to load email templates');
      }
    }

    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedCategoryId === '0') {
      setFilteredTemplates(allTemplates);
    } else {
      setFilteredTemplates(allTemplates.filter((t) => String(t.categoryId) === selectedCategoryId));
    }
  }, [selectedCategoryId, allTemplates]);

  const selectTemplate = (template: Template) => {
    setEmailSubject(template.subject);
    setEmailBody(template.body || template.content || '');
    setActiveTemplateId(template.id);
    toast.success('Template loaded');
  };

  const saveDraft = async () => {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: emailTo, subject: emailSubject, body: emailBody, status: 'DRAFT' }),
    });
    toast.success('Draft saved successfully.');
  };

  const sendEmail = async () => {
    if (!emailTo.trim() || !emailSubject.trim() || !emailBody.trim()) {
      toast.error('All fields (To, Subject, and Body) are required.');
      return;
    }
    setIsSending(true);
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailTo, subject: emailSubject, body: emailBody, status: 'QUEUED' }),
      });
      toast.success('Email sent successfully!');
      setEmailTo('');
      setEmailSubject('');
      setEmailBody('');
      setActiveTemplateId(null);
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div data-testid="send-email-page" className="p-6 md:p-8 lg:p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
          <Header
            title="Send Email Notification"
            subtitle="Draft custom notifications or launch predefined templates to members."
          />
          <div className="flex items-center gap-2 shrink-0 pb-8">
            <Button
              id="btn-save-draft"
              variant="outline"
              disabled={isSending}
              onClick={saveDraft}
              className="h-9 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              Save Draft
            </Button>
            <Button
              id="btn-send-now"
              disabled={isSending}
              onClick={sendEmail}
              className="h-9 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer flex items-center gap-1.5 min-w-[100px]"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send Now
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">Templates Catalog</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Select a category to filter layouts</p>
            </div>

            <div className="p-3 border-b border-slate-100">
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="h-9 w-full bg-slate-50/50 border-slate-200 text-xs">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 z-50">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {filteredTemplates.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-[11px]">
                  No templates match this category.
                </div>
              ) : (
                filteredTemplates.map((template) => {
                  const isActive = activeTemplateId === template.id;
                  const categoryName = categories.find((c) => String(c.id) === String(template.categoryId))?.name ?? '';
                  return (
                    <button
                      key={template.id}
                      onClick={() => selectTemplate(template)}
                      className={`w-full text-left p-3.5 transition-colors cursor-pointer flex flex-col gap-1.5 ${
                        isActive
                          ? 'bg-slate-50 border-l-2 border-slate-900 pl-3'
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 self-start">
                        {categoryName}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{template.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{template.subject}</p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">Email Composer</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Compose custom messages or edit a loaded template</p>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-[52px_1fr] items-center gap-3">
                <Label htmlFor="email-to" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">
                  To:
                </Label>
                <Input
                  id="email-to"
                  type="text"
                  placeholder="recipient@example.com"
                  className="h-9 text-xs bg-slate-50/50 border-slate-200 focus:bg-white animate-none"
                  value={emailTo}
                  disabled={isSending}
                  onChange={(e) => setEmailTo(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-[52px_1fr] items-center gap-3">
                <Label htmlFor="email-subject" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">
                  Subject:
                </Label>
                <Input
                  id="email-subject"
                  type="text"
                  placeholder="Enter email subject line..."
                  className="h-9 text-xs bg-slate-50/50 border-slate-200 focus:bg-white animate-none"
                  value={emailSubject}
                  disabled={isSending}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <div className="border-b border-slate-200 px-3 py-1.5 flex items-center gap-0.5 overflow-x-auto bg-slate-50/50 select-none">
                  <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors w-7 h-7 flex items-center justify-center"><Bold className="h-3.5 w-3.5" /></button>
                  <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors w-7 h-7 flex items-center justify-center"><Italic className="h-3.5 w-3.5" /></button>
                  <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors w-7 h-7 flex items-center justify-center"><Underline className="h-3.5 w-3.5" /></button>
                  <div className="w-px h-4 bg-slate-200 mx-1.5" />
                  <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors w-7 h-7 flex items-center justify-center"><AlignLeft className="h-3.5 w-3.5" /></button>
                  <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors w-7 h-7 flex items-center justify-center"><AlignCenter className="h-3.5 w-3.5" /></button>
                  <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors w-7 h-7 flex items-center justify-center"><AlignRight className="h-3.5 w-3.5" /></button>
                  <div className="w-px h-4 bg-slate-200 mx-1.5" />
                  <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors w-7 h-7 flex items-center justify-center"><List className="h-3.5 w-3.5" /></button>
                  <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors w-7 h-7 flex items-center justify-center"><ListOrdered className="h-3.5 w-3.5" /></button>
                  <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors w-7 h-7 flex items-center justify-center"><LinkIcon className="h-3.5 w-3.5" /></button>
                </div>

                <textarea
                  id="email-body"
                  className="w-full border-0 focus:outline-none min-h-[260px] resize-none text-xs text-slate-700 p-4 leading-relaxed bg-transparent focus:bg-white transition-colors"
                  placeholder="Write the email body here..."
                  value={emailBody}
                  disabled={isSending}
                  onChange={(e) => setEmailBody(e.target.value)}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
