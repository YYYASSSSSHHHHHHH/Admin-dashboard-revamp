'use client';

import { useState, useMemo } from 'react';
import {
  FileCode,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Bell,
  FolderPlus,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
  Tag,
  Info,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { StatusBadge } from '@/components/dashboard/StatusBadge';
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

export default function TemplatesPage() {
  const [categories, setCategories] = useState<TemplateCategory[]>([
    { id: '1', name: 'Welcome Series', channel: 'email', status: 'active' },
    { id: '2', name: 'Billing Receipts', channel: 'email', status: 'active' },
    { id: '3', name: 'Account Security Alerts', channel: 'push', status: 'active' },
    { id: '4', name: 'Promo Broadcasts', channel: 'email', status: 'inactive' },
    { id: '5', name: 'System Maintenance Notices', channel: 'push', status: 'active' },
  ]);

  const [templates, setTemplates] = useState<TemplateItem[]>([
    {
      id: '1',
      categoryId: '1',
      name: 'New Signup Confirmation',
      subject: 'Welcome to Northgate, {name}!',
      type: 'Transactional',
      content: 'Hello {name},\n\nThank you for signing up at {company}! Your registration is successfully confirmed under the {plan} plan.'
    },
    {
      id: '2',
      categoryId: '1',
      name: 'Onboarding Checklist Guide',
      subject: 'Quick onboarding guide to set up your account',
      type: 'Marketing',
      content: 'Hey {name},\n\nTo help you get the most out of your {plan} plan, we have prepared a quick start dashboard checklist.'
    },
    {
      id: '3',
      categoryId: '2',
      name: 'Invoice Payment Receipt',
      subject: 'Receipt for your invoice #{invoiceNum}',
      type: 'Transactional',
      content: 'Dear Partner,\n\nWe have received your payment. A confirmation statement has been sent to your account.'
    },
    {
      id: '4',
      categoryId: '2',
      name: 'Subscription Renewal Alert',
      subject: 'Your plan {plan} will renew soon',
      type: 'Transactional',
      content: 'Hello {name},\n\nThis is a friendly reminder that your subscription will auto-renew on {expiry}.'
    },
    {
      id: '5',
      categoryId: '3',
      name: 'Failed Login Alert Notification',
      type: 'Transactional',
      content: 'Alert: Unrecognized login attempt detected on your corporate account.'
    },
    {
      id: '6',
      categoryId: '3',
      name: 'Security Settings Updated',
      type: 'Transactional',
      content: 'Your master account credentials have been changed successfully.'
    }
  ]);

  const [channelFilter, setChannelFilter] = useState<'email' | 'push'>('email');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('1');
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

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.channel === channelFilter);
  }, [categories, channelFilter]);

  const categoryTemplateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(cat => {
      counts[cat.id] = templates.filter(t => t.categoryId === cat.id).length;
    });
    return counts;
  }, [categories, templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesCategory = t.categoryId === selectedCategoryId;
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (t.subject && t.subject.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategoryId, searchTerm]);

  const handleChannelTabChange = (channel: 'email' | 'push') => {
    setChannelFilter(channel);
    const firstCat = categories.find(c => c.channel === channel);
    if (firstCat) {
      setSelectedCategoryId(firstCat.id);
    } else {
      setSelectedCategoryId('');
    }
    setSearchTerm('');
  };

  const openCategoryModal = (cat?: TemplateCategory) => {
    setEditingCategory(cat || null);
    if (cat) {
      setCatFormName(cat.name);
      setCatFormStatus(cat.status);
    } else {
      setCatFormName('');
      setCatFormStatus('active');
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!catFormName.trim()) {
      toast.error('Category Name is required.');
      return;
    }

    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name: catFormName, status: catFormStatus as 'active' | 'inactive' } : c));
      toast.success('Category updated successfully!');
    } else {
      const newCat: TemplateCategory = {
        id: String(Date.now()),
        name: catFormName,
        channel: channelFilter,
        status: catFormStatus as 'active' | 'inactive'
      };
      setCategories(prev => [...prev, newCat]);
      setSelectedCategoryId(newCat.id);
      toast.success('New communication category created!');
    }
    setCategoryModalOpen(false);
  };

  const handleDeleteCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this category? All its templates will be lost.')) return;

    setCategories(prev => prev.filter(c => c.id !== id));
    setTemplates(prev => prev.filter(t => t.categoryId !== id));

    if (selectedCategoryId === id) {
      const remaining = categories.filter(c => c.channel === channelFilter && c.id !== id);
      if (remaining.length > 0) {
        setSelectedCategoryId(remaining[0].id);
      } else {
        setSelectedCategoryId('');
      }
    }
    toast.success('Category deleted successfully.');
  };

  const openTemplateModal = (temp?: TemplateItem) => {
    setEditingTemplate(temp || null);
    if (temp) {
      setTempFormName(temp.name);
      setTempFormCategoryId(temp.categoryId);
      setTempFormSubject(temp.subject || '');
      setTempFormType(temp.type);
      setTempFormContent(temp.content);
    } else {
      setTempFormName('');
      setTempFormCategoryId(selectedCategoryId);
      setTempFormSubject('');
      setTempFormType('Transactional');
      setTempFormContent('');
    }
    setTemplateModalOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!tempFormName.trim()) {
      toast.error('Template Name is required.');
      return;
    }
    if (channelFilter === 'email' && !tempFormSubject.trim()) {
      toast.error('Subject line is required for Email templates.');
      return;
    }

    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? {
        ...t,
        name: tempFormName,
        categoryId: tempFormCategoryId,
        subject: channelFilter === 'email' ? tempFormSubject : undefined,
        type: tempFormType,
        content: tempFormContent
      } : t));
      toast.success('Template updated successfully!');
    } else {
      const newTemp: TemplateItem = {
        id: String(Date.now()),
        categoryId: tempFormCategoryId,
        name: tempFormName,
        subject: channelFilter === 'email' ? tempFormSubject : undefined,
        type: tempFormType,
        content: tempFormContent
      };
      setTemplates(prev => [...prev, newTemp]);
      toast.success('New template draft saved successfully!');
    }
    setTemplateModalOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success('Template deleted successfully.');
  };

  const insertPlaceholder = (tag: string) => {
    setTempFormContent(prev => prev + ` ${tag}`);
    toast.info(`Placeholder ${tag} added to content.`);
  };

  const handleEditorFormat = (action: string) => {
    toast.info(`Format triggered: ${action}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 lg:p-10 flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Header
            title="Template Settings"
            subtitle="Draft, edit, and categorize transactional notifications and automated communication layouts."
          />
          <Button
            onClick={() => openTemplateModal()}
            disabled={!selectedCategoryId}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 h-10 flex items-center gap-1.5 shadow-sm rounded-lg shrink-0 self-start md:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Template</span>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          <div
            className="w-full lg:w-72 bg-white border shrink-0 flex flex-col gap-1.5 h-fit p-4 shadow-sm"
            style={{ borderColor: '#E5E7EB', borderRadius: '12px' }}
          >
            <div className="px-1 mb-2">
              <div className="flex items-center bg-slate-50/80 p-1 rounded-lg border border-slate-200/60">
                <button
                  onClick={() => handleChannelTabChange('email')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    channelFilter === 'email'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Mail className="h-3.5 w-3.5 font-bold" />
                  <span>Email</span>
                </button>
                <button
                  onClick={() => handleChannelTabChange('push')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    channelFilter === 'push'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Bell className="h-3.5 w-3.5 font-bold" />
                  <span>Push</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-1 border-b mb-1" style={{ borderColor: '#EEF2F6' }}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">
                Categories
              </span>
              <button
                onClick={() => openCategoryModal()}
                className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                <span>Add New</span>
              </button>
            </div>

            <div className="flex flex-col gap-1 overflow-y-auto max-h-[380px] pr-1">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-medium">
                  No active categories.
                </div>
              ) : (
                filteredCategories.map((cat) => {
                  const isActive = selectedCategoryId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setSearchTerm('');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs transition-all duration-150 cursor-pointer select-none group border ${
                        isActive
                          ? 'bg-slate-100 border-slate-200/80 text-slate-950 font-bold shadow-xs'
                          : 'bg-white border-transparent text-slate-655 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          cat.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`} />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); openCategoryModal(cat); }}
                            className="p-0.5 rounded transition-colors hover:bg-slate-200 text-slate-500"
                          >
                            <Edit2 className="h-2.5 w-2.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id, e); }}
                            className="p-0.5 rounded transition-colors hover:bg-red-50 text-red-550"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                          isActive ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {categoryTemplateCounts[cat.id] || 0}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div
            className="flex-1 flex flex-col bg-white border overflow-hidden shadow-sm"
            style={{ borderColor: '#E5E7EB', borderRadius: '12px' }}
          >
            <div
              className="p-4 border-b bg-white flex flex-col md:flex-row md:items-center justify-between gap-3"
              style={{ borderColor: '#EEF2F6' }}
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {categories.find(c => c.id === selectedCategoryId)?.name || 'Templates'} List
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Select and manage templates inside this communication category.
                </p>
              </div>
              <div className="w-full md:w-72">
                <SearchBar
                  placeholder="Search template name..."
                  onSearch={setSearchTerm}
                />
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead className="bg-white border-b" style={{ borderColor: '#EEF2F6' }}>
                  <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-6 py-3.5 font-semibold w-16 text-center">S.No</th>
                    <th className="px-6 py-3.5 font-semibold">Template Name</th>
                    {channelFilter === 'email' && <th className="px-6 py-3.5 font-semibold">Subject Line</th>}
                    <th className="px-6 py-3.5 font-semibold">Type</th>
                    <th className="px-6 py-3.5 font-semibold w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTemplates.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-sm text-slate-500 font-medium">
                        No templates found in this category. Click Add New Template to start drafting.
                      </td>
                    </tr>
                  ) : (
                    filteredTemplates.map((temp, index) => {
                      return (
                        <tr
                          key={temp.id}
                          className="border-b hover:bg-slate-55 transition-colors bg-white select-none"
                          style={{ borderColor: '#F1F5F9' }}
                        >
                          <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs font-semibold">
                            {String(index + 1).padStart(2, '0')}
                          </td>
                          <td className="px-6 py-4">
                            <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '600' }} className="whitespace-nowrap">
                              {temp.name}
                            </span>
                          </td>
                          {channelFilter === 'email' && (
                            <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                              {temp.subject || '-'}
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                              temp.type === 'Transactional'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {temp.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                onClick={() => openTemplateModal(temp)}
                                className="h-7 w-7 p-0 rounded-md hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => handleDeleteTemplate(temp.id)}
                                className="h-7 w-7 p-0 rounded-md hover:bg-red-50 hover:text-red-650 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              </Button>
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
        </div>

        <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col overflow-hidden bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[100]">
            <DialogHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Sliders className="h-5 w-5 text-slate-500" />
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
                  {editingCategory ? 'Edit' : 'Create'} Category
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-550 mt-1">
                Configure taxonomic metadata categories filtered under the active channel.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-5 space-y-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Category Name
                </Label>
                <Input
                  id="cat-name"
                  value={catFormName}
                  onChange={(e) => setCatFormName(e.target.value)}
                  placeholder="e.g. Account Registration Alerts"
                  className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white transition-colors border focus-visible:ring-slate-900 focus-visible:ring-1 focus-visible:border-slate-900 focus-visible:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Active Status
                </Label>
                <RadioGroup
                  value={catFormStatus}
                  onValueChange={setCatFormStatus}
                  className="flex gap-6 mt-1.5"
                >
                  <div className="flex items-center gap-2 cursor-pointer select-none">
                    <RadioGroupItem
                      value="active"
                      id="status-active"
                      className="border-slate-400 border-2"
                    />
                    <Label
                      htmlFor="status-active"
                      className="text-xs font-semibold cursor-pointer text-emerald-700"
                    >
                      Active
                    </Label>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer select-none">
                    <RadioGroupItem
                      value="inactive"
                      id="status-inactive"
                      className="border-slate-400 border-2"
                    />
                    <Label
                      htmlFor="status-inactive"
                      className="text-xs font-semibold cursor-pointer text-slate-500"
                    >
                      Inactive
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <DialogFooter className="pb-6 px-6 pt-4 border-t border-slate-100 mt-auto flex items-center justify-end gap-2 w-full">
              <Button
                variant="outline"
                className="h-9 px-4 text-xs font-semibold"
                onClick={() => setCategoryModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="h-9 px-4 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
                onClick={handleSaveCategory}
              >
                Save Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
          <DialogContent className="sm:max-w-4xl lg:max-w-[900px] max-h-[90vh] flex flex-col overflow-hidden bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[100]">
            <DialogHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <FileCode className="h-5 w-5 text-slate-500" />
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
                  {editingTemplate ? 'Modify' : 'Draft New'} Transactional Layout
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-550 mt-1">
                Configure template content variables and customize template layouts.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="temp-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Template Name
                  </Label>
                  <Input
                    id="temp-name"
                    value={tempFormName}
                    onChange={(e) => setTempFormName(e.target.value)}
                    placeholder="e.g. Account Security Code"
                    className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white transition-colors border focus-visible:ring-slate-900 focus-visible:ring-1"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="temp-category" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Linked Category
                  </Label>
                  <select
                    id="temp-category"
                    value={tempFormCategoryId}
                    onChange={(e) => setTempFormCategoryId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-slate-50/50 hover:bg-slate-100/50 transition-colors focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.channel.toUpperCase()})</option>
                    ))}
                  </select>
                </div>
              </div>

              {channelFilter === 'email' && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="temp-subject" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Subject Line
                  </Label>
                  <Input
                    id="temp-subject"
                    value={tempFormSubject}
                    onChange={(e) => setTempFormSubject(e.target.value)}
                    placeholder="e.g. Verification details for {name}"
                    className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white transition-colors border focus-visible:ring-slate-900"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="temp-type" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Template Type
                </Label>
                <select
                  id="temp-type"
                  value={tempFormType}
                  onChange={(e) => setTempFormType(e.target.value as any)}
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-slate-50/50 hover:bg-slate-100/50 transition-colors focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Transactional">Transactional</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Template Content & Variables
                  </Label>
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Info className="h-3 w-3 text-slate-450" />
                    Click placeholder badges below to inject variables
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-slate-50/50 mb-1">
                  <button
                    type="button"
                    onClick={() => insertPlaceholder('{name}')}
                    className="px-2 py-1 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-55 rounded text-[10px] font-mono font-bold text-slate-700 cursor-pointer flex items-center gap-1"
                  >
                    <Tag className="h-2.5 w-2.5 text-blue-500" />
                    <span>{`{name}`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertPlaceholder('{company}')}
                    className="px-2 py-1 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-55 rounded text-[10px] font-mono font-bold text-slate-700 cursor-pointer flex items-center gap-1"
                  >
                    <Tag className="h-2.5 w-2.5 text-blue-500" />
                    <span>{`{company}`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertPlaceholder('{plan}')}
                    className="px-2 py-1 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-55 rounded text-[10px] font-mono font-bold text-slate-700 cursor-pointer flex items-center gap-1"
                  >
                    <Tag className="h-2.5 w-2.5 text-blue-500" />
                    <span>{`{plan}`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertPlaceholder('{expiry}')}
                    className="px-2 py-1 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-55 rounded text-[10px] font-mono font-bold text-slate-700 cursor-pointer flex items-center gap-1"
                  >
                    <Tag className="h-2.5 w-2.5 text-blue-500" />
                    <span>{`{expiry}`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertPlaceholder('{invoiceNum}')}
                    className="px-2 py-1 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-55 rounded text-[10px] font-mono font-bold text-slate-700 cursor-pointer flex items-center gap-1"
                  >
                    <Tag className="h-2.5 w-2.5 text-blue-500" />
                    <span>{`{invoiceNum}`}</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col focus-within:ring-1 focus-within:ring-slate-900">
                  <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEditorFormat('bold')}
                      className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditorFormat('italic')}
                      className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditorFormat('underline')}
                      className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      <Underline className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditorFormat('strikethrough')}
                      className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      <Strikethrough className="h-3.5 w-3.5" />
                    </button>
                    <div className="h-4 w-px bg-slate-200 mx-1" />
                    <button
                      type="button"
                      onClick={() => handleEditorFormat('bulletList')}
                      className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditorFormat('orderedList')}
                      className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      <ListOrdered className="h-3.5 w-3.5" />
                    </button>
                    <div className="h-4 w-px bg-slate-200 mx-1" />
                    <button
                      type="button"
                      onClick={() => handleEditorFormat('image')}
                      className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditorFormat('link')}
                      className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={tempFormContent}
                    onChange={(e) => setTempFormContent(e.target.value)}
                    placeholder="Draft template content details here..."
                    rows={8}
                    className="w-full text-sm p-3 focus:outline-none resize-none bg-white text-slate-800 font-sans"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pb-6 px-6 pt-4 border-t border-slate-100 mt-auto flex items-center justify-end gap-2 w-full">
              <Button
                variant="outline"
                className="h-9 px-4 text-xs font-semibold"
                onClick={() => setTemplateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="h-9 px-4 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
                onClick={handleSaveTemplate}
              >
                Save Layout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
