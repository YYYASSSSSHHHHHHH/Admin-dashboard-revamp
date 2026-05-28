'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  FileCode,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Bell,
  FolderPlus,
  Variable,
  Sliders,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { RichTextEditor } from '@/components/dashboard/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EMAIL_VARIABLES } from '@/lib/dashboard-mock-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TemplateCategory {
  id: string;
  name: string;
  channel: 'email' | 'push';
  status: 'active' | 'inactive';
}

interface TemplateItem {
  id: string;
  categoryId: string;
  name: string;
  subject?: string;
  type: 'Transactional' | 'Marketing';
  content: string;
}

const TEMPLATE_DIALOG_SHELL =
  'sm:max-w-3xl w-[calc(100%-2rem)] max-h-[min(720px,calc(100vh-2rem))] flex flex-col gap-0 p-0 overflow-hidden bg-white border border-slate-200 shadow-xl rounded-xl';

const PLACEHOLDER_TOKENS = [
  { token: '{name}', label: 'Name' },
  { token: '{company}', label: 'Company' },
  { token: '{plan}', label: 'Plan' },
  { token: '{expiry}', label: 'Expiry' },
  { token: '{invoiceNum}', label: 'Invoice #' },
];

const PUSH_CHAR_LIMIT = 240;

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

export default function TemplatesPage() {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);

  const [channelFilter, setChannelFilter] = useState<'email' | 'push'>('email');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TemplateCategory | null>(null);

  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);

  const [catFormName, setCatFormName] = useState('');
  const [catFormStatus, setCatFormStatus] = useState<string>('active');

  const [tempFormName, setTempFormName] = useState('');
  const [tempFormCategoryId, setTempFormCategoryId] = useState('');
  const [tempFormSubject, setTempFormSubject] = useState('');
  const [tempFormType, setTempFormType] = useState<'Transactional' | 'Marketing'>('Transactional');
  const [tempFormContent, setTempFormContent] = useState('');
  const [editorRef, setEditorRef] = useState<any>(null);
  const [varOpen, setVarOpen] = useState(false);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const response = await fetch('/api/templates');
        if (!response.ok) throw new Error('Failed to load templates');
        const data = await response.json();
        setCategories(data.categories || []);
        setTemplates(data.templates || []);
        const firstEmail = data.categories?.find((c: TemplateCategory) => c.channel === 'email');
        if (firstEmail) setSelectedCategoryId(firstEmail.id);
      } catch (error) {
        console.error('Failed to load templates:', error);
        toast.error('Failed to load template settings');
      }
    }
    loadTemplates();
  }, []);

  const saveTemplateState = (nextCategories: TemplateCategory[], nextTemplates: TemplateItem[]) => {
    fetch('/api/templates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: nextCategories, templates: nextTemplates }),
    }).catch((error) => console.error('Failed to save template settings:', error));
  };

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.channel === channelFilter),
    [categories, channelFilter],
  );

  const categoryTemplateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((cat) => {
      counts[cat.id] = templates.filter((t) => t.categoryId === cat.id).length;
    });
    return counts;
  }, [categories, templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesCategory = t.categoryId === selectedCategoryId;
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        t.name.toLowerCase().includes(q) ||
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        t.content.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategoryId, searchTerm]);

  const handleChannelTabChange = (channel: 'email' | 'push') => {
    setChannelFilter(channel);
    const firstCat = categories.find((c) => c.channel === channel);
    setSelectedCategoryId(firstCat?.id || '');
    setSearchTerm('');
  };

  const openCategoryModal = (cat?: TemplateCategory) => {
    setEditingCategory(cat || null);
    setCatFormName(cat?.name || '');
    setCatFormStatus(cat?.status || 'active');
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!catFormName.trim()) {
      toast.error('Category name is required.');
      return;
    }

    if (editingCategory) {
      const nextCategories = categories.map((c) =>
        c.id === editingCategory.id
          ? { ...c, name: catFormName, status: catFormStatus as 'active' | 'inactive' }
          : c,
      );
      setCategories(nextCategories);
      saveTemplateState(nextCategories, templates);
      toast.success('Category updated');
    } else {
      const newCat: TemplateCategory = {
        id: String(Date.now()),
        name: catFormName,
        channel: channelFilter,
        status: catFormStatus as 'active' | 'inactive',
      };
      const nextCategories = [...categories, newCat];
      setCategories(nextCategories);
      saveTemplateState(nextCategories, templates);
      setSelectedCategoryId(newCat.id);
      toast.success('Category created');
    }
    setCategoryModalOpen(false);
  };

  const handleDeleteCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this category and all its templates?')) return;

    const nextCategories = categories.filter((c) => c.id !== id);
    const nextTemplates = templates.filter((t) => t.categoryId !== id);
    setCategories(nextCategories);
    setTemplates(nextTemplates);
    saveTemplateState(nextCategories, nextTemplates);

    if (selectedCategoryId === id) {
      const remaining = categories.filter((c) => c.channel === channelFilter && c.id !== id);
      setSelectedCategoryId(remaining[0]?.id || '');
    }
    toast.success('Category deleted');
  };

  const openTemplateModal = (temp?: TemplateItem) => {
    setEditingTemplate(temp || null);
    setTempFormName(temp?.name || '');
    setTempFormCategoryId(temp?.categoryId || selectedCategoryId);
    setTempFormSubject(temp?.subject || '');
    setTempFormType(temp?.type || 'Transactional');
    setTempFormContent(temp?.content || '');
    setTemplateModalOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!tempFormName.trim()) {
      toast.error('Template name is required.');
      return;
    }
    if (channelFilter === 'email' && !tempFormSubject.trim()) {
      toast.error('Subject is required for email templates.');
      return;
    }
    if (!tempFormContent.trim()) {
      toast.error('Template content is required.');
      return;
    }

    if (editingTemplate) {
      const nextTemplates = templates.map((t) =>
        t.id === editingTemplate.id
          ? {
              ...t,
              name: tempFormName,
              categoryId: tempFormCategoryId,
              subject: channelFilter === 'email' ? tempFormSubject : tempFormSubject || tempFormName,
              type: tempFormType,
              content: tempFormContent,
            }
          : t,
      );
      setTemplates(nextTemplates);
      saveTemplateState(categories, nextTemplates);
      toast.success('Template updated');
    } else {
      const newTemp: TemplateItem = {
        id: String(Date.now()),
        categoryId: tempFormCategoryId,
        name: tempFormName,
        subject: channelFilter === 'email' ? tempFormSubject : tempFormSubject || tempFormName,
        type: tempFormType,
        content: tempFormContent,
      };
      const nextTemplates = [...templates, newTemp];
      setTemplates(nextTemplates);
      saveTemplateState(categories, nextTemplates);
      toast.success('Template created');
    }
    setTemplateModalOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    if (!confirm('Delete this template?')) return;
    const nextTemplates = templates.filter((t) => t.id !== id);
    setTemplates(nextTemplates);
    saveTemplateState(categories, nextTemplates);
    toast.success('Template deleted');
  };

  const insertPlaceholder = (token: string) => {
    if (channelFilter === 'email' && editorRef) {
      editorRef.chain().focus().insertContent(token).run();
    } else {
      setTempFormContent((prev) => {
        const next = prev + token;
        return channelFilter === 'push' ? next.slice(0, PUSH_CHAR_LIMIT) : next;
      });
    }
  };

  const insertVariable = (varId: string) => {
    const token = `{{${varId}}}`;
    insertPlaceholder(token);
    setVarOpen(false);
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const channelTemplates = templates.filter((t) => {
    const cat = categories.find((c) => c.id === t.categoryId);
    return cat?.channel === channelFilter;
  });

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 lg:p-10 flex flex-col gap-6" data-testid="templates-page">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <Header
            title="Templates"
            subtitle="Manage email and push notification layouts used across Communication."
          />
          <Button
            onClick={() => openTemplateModal()}
            disabled={!selectedCategoryId}
            className="h-10 bg-slate-900 hover:bg-slate-800 text-white shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <aside className="w-full lg:w-72 shrink-0 bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-2">
                Channel
              </p>
              <div className="flex items-center bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => handleChannelTabChange('email')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer',
                    channelFilter === 'email'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800',
                  )}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => handleChannelTabChange('push')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer',
                    channelFilter === 'push'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800',
                  )}
                >
                  <Bell className="h-3.5 w-3.5" />
                  Push
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Categories
              </span>
              <button
                type="button"
                onClick={() => openCategoryModal()}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            <div className="p-2 flex flex-col gap-0.5 max-h-[420px] overflow-y-auto">
              {filteredCategories.length === 0 ? (
                <p className="text-center py-8 text-sm text-slate-500">No categories yet.</p>
              ) : (
                filteredCategories.map((cat) => {
                  const isActive = selectedCategoryId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setSearchTerm('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedCategoryId(cat.id);
                          setSearchTerm('');
                        }
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm transition-all cursor-pointer group border',
                        isActive
                          ? 'bg-slate-100 border-slate-200 text-slate-950 font-semibold'
                          : 'bg-white border-transparent text-slate-600 hover:bg-slate-50 font-medium',
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full shrink-0',
                            cat.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400',
                          )}
                        />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="hidden group-hover:flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCategoryModal(cat);
                            }}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCategory(cat.id, e)}
                            className="p-1 rounded hover:bg-red-50 text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[10px] font-semibold',
                            isActive ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-600',
                          )}
                        >
                          {categoryTemplateCounts[cat.id] || 0}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          <div className="flex-1 min-w-0 bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 tracking-tight">
                  {selectedCategory?.name || 'Templates'}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {channelTemplates.length} {channelFilter} template
                  {channelTemplates.length === 1 ? '' : 's'} · {filteredTemplates.length} in this category
                </p>
              </div>
              <div className="w-full sm:w-72">
                <SearchBar placeholder="Search templates…" onSearch={setSearchTerm} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100">
                    <th className="px-6 py-3 w-14 text-center">Sr No</th>
                    <th className="px-6 py-3">Template Name</th>
                    <th className="px-6 py-3">
                      {channelFilter === 'email' ? 'Subject' : 'Title'}
                    </th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTemplates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                        No templates in this category. Click Add Template to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredTemplates.map((temp, index) => (
                      <tr key={temp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-3.5 text-center text-slate-400 font-mono text-xs">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-3.5 font-medium text-slate-900">{temp.name}</td>
                        <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate">
                          {temp.subject || '—'}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={cn(
                              'inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border',
                              temp.type === 'Transactional'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-violet-50 text-violet-700 border-violet-200',
                            )}
                          >
                            {temp.type}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openTemplateModal(temp)}
                            >
                              <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50"
                              onClick={() => handleDeleteTemplate(temp.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
          <DialogContent className="sm:max-w-md bg-white rounded-xl p-6">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <Sliders className="h-4 w-4 text-slate-500" />
                {editingCategory ? 'Edit' : 'New'} Category
              </DialogTitle>
              <DialogDescription>
                {channelFilter === 'email' ? 'Email' : 'Push'} template group for Communication.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Field label="Category Name">
                <Input
                  value={catFormName}
                  onChange={(e) => setCatFormName(e.target.value)}
                  className="h-10"
                  placeholder="e.g. Billing Receipts"
                />
              </Field>
              <Field label="Status">
                <RadioGroup value={catFormStatus} onValueChange={setCatFormStatus} className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="active" id="cat-active" />
                    <Label htmlFor="cat-active" className="text-sm font-medium cursor-pointer">
                      Active
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="inactive" id="cat-inactive" />
                    <Label htmlFor="cat-inactive" className="text-sm font-medium cursor-pointer">
                      Inactive
                    </Label>
                  </div>
                </RadioGroup>
              </Field>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setCategoryModalOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white" onClick={handleSaveCategory}>
                Save Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
          <DialogContent className={TEMPLATE_DIALOG_SHELL}>
            <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b border-slate-100">
              <DialogTitle className="font-display flex items-center gap-2 text-left">
                <FileCode className="h-4 w-4 text-slate-500" />
                {editingTemplate ? 'Edit' : 'New'}{' '}
                {channelFilter === 'email' ? 'Email' : 'Push'} Template
              </DialogTitle>
              <DialogDescription className="text-left">
                {channelFilter === 'email'
                  ? 'Rich HTML body with variables for bulk and member email.'
                  : 'Short push copy for phone notifications (max 240 characters).'}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Template Name">
                  <Input
                    value={tempFormName}
                    onChange={(e) => setTempFormName(e.target.value)}
                    className="h-10"
                    placeholder="e.g. Payment receipt"
                  />
                </Field>
                <Field label="Category">
                  <Select value={tempFormCategoryId} onValueChange={setTempFormCategoryId}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.channel === channelFilter)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label={channelFilter === 'email' ? 'Subject' : 'Notification Title'}>
                  <Input
                    value={tempFormSubject}
                    onChange={(e) => setTempFormSubject(e.target.value)}
                    className="h-10"
                    placeholder={
                      channelFilter === 'email'
                        ? "e.g. Welcome, {name}!"
                        : 'e.g. Plan renewal reminder'
                    }
                  />
                </Field>
                <Field label="Template Type">
                  <Select
                    value={tempFormType}
                    onValueChange={(v) => setTempFormType(v as 'Transactional' | 'Marketing')}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Transactional">Transactional</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {PLACEHOLDER_TOKENS.map((p) => (
                  <button
                    key={p.token}
                    type="button"
                    onClick={() => insertPlaceholder(p.token)}
                    className="px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-[10px] font-mono font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    {p.token}
                  </button>
                ))}
                <Popover open={varOpen} onOpenChange={setVarOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs ml-auto">
                      <Variable className="h-3 w-3 mr-1" />
                      Variables
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-[260px] p-2">
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

              {channelFilter === 'email' ? (
                <div className="min-h-[220px] flex flex-col">
                  <RichTextEditor
                    value={tempFormContent}
                    onChange={setTempFormContent}
                    placeholder="Draft email HTML content…"
                    onEditorReady={setEditorRef}
                    fillHeight
                    className="min-h-[220px]"
                  />
                </div>
              ) : (
                <Field
                  label="Push Message"
                  hint={`${tempFormContent.length}/${PUSH_CHAR_LIMIT} characters`}
                >
                  <Textarea
                    value={tempFormContent}
                    onChange={(e) =>
                      setTempFormContent(e.target.value.slice(0, PUSH_CHAR_LIMIT))
                    }
                    rows={5}
                    className="resize-none text-sm"
                    placeholder="Short alert text for mobile devices…"
                  />
                </Field>
              )}
            </div>

            <DialogFooter className="shrink-0 px-6 py-4 border-t border-slate-100 gap-2">
              <Button variant="outline" onClick={() => setTemplateModalOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white" onClick={handleSaveTemplate}>
                Save Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
