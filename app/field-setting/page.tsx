'use client';

import { useState, useMemo, useRef } from 'react';
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Folder,
  Tag,
  Coins,
  Scale,
  Briefcase,
  HelpCircle,
  X,
  FileText,
  Image as ImageIcon,
  Grid,
  FileCode,
  Globe,
  Upload,
  User,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
  AlertTriangle
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { SearchBar } from '@/components/dashboard/SearchBar';
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
import { toast } from 'sonner';

interface BaseFieldItem {
  id: string;
  name: string;
}

interface SubcategoryItem extends BaseFieldItem {
  category: string;
}

interface StampItem extends BaseFieldItem {
  image: string; // URL or base64 or placeholder
}

interface InvoiceSettingItem {
  id: string;
  startDate: string;
  endDate: string;
  prefix: string;
  invoiceNum: number;
  suffix: string;
}

interface TermsConditionItem {
  id: string;
  date: string;
  category: string;
  content: string;
}

type TabType =
  | 'category'
  | 'subcategory'
  | 'condition'
  | 'wtb-price'
  | 'wts-price'
  | 'uom'
  | 'designation'
  | 'inactive-status'
  | 'business-type'
  | 'address-title'
  | 'support-category'
  | 'stamp'
  | 'invoice-setting'
  | 'terms-condition';

interface TabConfig {
  key: TabType;
  title: string;
  icon: any;
  description: string;
}

const TABS: TabConfig[] = [
  { key: 'category', title: 'Product Category', icon: Folder, description: 'Manage primary item categories' },
  { key: 'subcategory', title: 'Product Sub Category', icon: Grid, description: 'Assign child-level groupings to categories' },
  { key: 'condition', title: 'Product Condition', icon: Tag, description: 'Set physical condition state options' },
  { key: 'wtb-price', title: 'WTB Price Settings', icon: Coins, description: 'Set ranges for Want-To-Buy quotes' },
  { key: 'wts-price', title: 'WTS Price Settings', icon: Scale, description: 'Set ranges for Want-To-Sell quotes' },
  { key: 'uom', title: 'Unit of Measure', icon: Briefcase, description: 'Standard packaging or transaction units' },
  { key: 'designation', title: 'Designation Settings', icon: User, description: 'Corporate contact job titles' },
  { key: 'inactive-status', title: 'Inactive Status Options', icon: AlertTriangle, description: 'Specify reasons for account pauses' },
  { key: 'business-type', title: 'Business Type Settings', icon: Globe, description: 'Corporate entity types' },
  { key: 'address-title', title: 'Address Title Options', icon: FileText, description: 'Titles for delivery/billing points' },
  { key: 'support-category', title: 'Support Category Settings', icon: HelpCircle, description: 'Inquiry ticket grouping fields' },
  { key: 'stamp', title: 'Product Stamp', icon: ImageIcon, description: 'Badges and verification labels' },
  { key: 'invoice-setting', title: 'Invoice Configuration', icon: Sliders, description: 'Prefix, suffix, and counter setups' },
  { key: 'terms-condition', title: 'Terms & Conditions', icon: FileCode, description: 'Regulatory, legal, and operational documents' },
];

export default function FieldSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('category');
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Mock Data Stores
  const [categories, setCategories] = useState<BaseFieldItem[]>([
    { id: '1', name: 'Electronics' },
    { id: '2', name: 'Office Supplies' },
    { id: '3', name: 'Home Appliances' },
  ]);

  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([
    { id: '1', name: 'Smartphones', category: 'Mobile' },
    { id: '2', name: 'Desktop Computers', category: 'PC' },
    { id: '3', name: 'Macbooks', category: 'Laptop' },
  ]);

  const [conditions, setConditions] = useState<BaseFieldItem[]>([
    { id: '1', name: 'Brand New (Unopened)' },
    { id: '2', name: 'Refurbished (Grade A)' },
    { id: '3', name: 'Gently Used' },
  ]);

  const [wtbPrices, setWtbPrices] = useState<BaseFieldItem[]>([
    { id: '1', name: '$100 - $500' },
    { id: '2', name: '$500 - $1,500' },
    { id: '3', name: '$1,500+' },
  ]);

  const [wtsPrices, setWtsPrices] = useState<BaseFieldItem[]>([
    { id: '1', name: '$80 - $450' },
    { id: '2', name: '$450 - $1,300' },
    { id: '3', name: '$1,300+' },
  ]);

  const [uoms, setUoms] = useState<BaseFieldItem[]>([
    { id: '1', name: 'Pieces (pcs)' },
    { id: '2', name: 'Kilograms (kg)' },
    { id: '3', name: 'Boxes (bx)' },
  ]);

  const [designations, setDesignations] = useState<BaseFieldItem[]>([
    { id: '1', name: 'Manager' },
    { id: '2', name: 'Administrator' },
    { id: '3', name: 'Staff Representative' },
  ]);

  const [inactiveStatuses, setInactiveStatuses] = useState<BaseFieldItem[]>([
    { id: '1', name: 'Temporary Account Freeze' },
    { id: '2', name: 'Billing Arrears Suspension' },
    { id: '3', name: 'Self-deactivated by Member' },
  ]);

  const [businessTypes, setBusinessTypes] = useState<BaseFieldItem[]>([
    { id: '1', name: 'Proprietorship' },
    { id: '2', name: 'Private Limited (Pvt Ltd)' },
    { id: '3', name: 'LLP Partnership' },
  ]);

  const [addressTitles, setAddressTitles] = useState<BaseFieldItem[]>([
    { id: '1', name: 'Corporate Headquarters' },
    { id: '2', name: 'Distribution Warehouse' },
    { id: '3', name: 'Registered Billing Address' },
  ]);

  const [supportCategories, setSupportCategories] = useState<BaseFieldItem[]>([
    { id: '1', name: 'Technical Server Error' },
    { id: '2', name: 'Subscription Plan Change' },
    { id: '3', name: 'Payment/Payout Settlement' },
  ]);

  const [stamps, setStamps] = useState<StampItem[]>([
    { id: '1', name: 'Super Seller Badge', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&auto=format&fit=crop&q=60' },
    { id: '2', name: 'Verified Partner', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60' },
  ]);

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettingItem[]>([
    { id: '1', startDate: '2026-04-01', endDate: '2027-03-31', prefix: 'INV-2026-', invoiceNum: 10042, suffix: '-HQ' }
  ]);

  const [termsConditions, setTermsConditions] = useState<TermsConditionItem[]>([
    { id: '1', date: '2026-05-15', category: 'Privacy Policy', content: 'Our comprehensive privacy document sets clean expectations...' },
    { id: '2', date: '2026-05-10', category: 'Terms & Condition', content: 'Use of the dashboard and admin templates is strictly regulated...' }
  ]);

  // Modal State Control
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null); // holds reference if editing

  // Dynamic Form Field State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Mobile');
  const [formImage, setFormImage] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formPrefix, setFormPrefix] = useState('');
  const [formInvoiceNum, setFormInvoiceNum] = useState<number>(1000);
  const [formSuffix, setFormSuffix] = useState('');
  const [formTermsDate, setFormTermsDate] = useState('');
  const [formTermsCategory, setFormTermsCategory] = useState('Terms & Condition');
  const [formTermsContent, setFormTermsContent] = useState('');

  // Filter lists based on Search bar term
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    switch (activeTab) {
      case 'category': return categories.filter(x => x.name.toLowerCase().includes(term));
      case 'subcategory': return subcategories.filter(x => x.name.toLowerCase().includes(term) || x.category.toLowerCase().includes(term));
      case 'condition': return conditions.filter(x => x.name.toLowerCase().includes(term));
      case 'wtb-price': return wtbPrices.filter(x => x.name.toLowerCase().includes(term));
      case 'wts-price': return wtsPrices.filter(x => x.name.toLowerCase().includes(term));
      case 'uom': return uoms.filter(x => x.name.toLowerCase().includes(term));
      case 'designation': return designations.filter(x => x.name.toLowerCase().includes(term));
      case 'inactive-status': return inactiveStatuses.filter(x => x.name.toLowerCase().includes(term));
      case 'business-type': return businessTypes.filter(x => x.name.toLowerCase().includes(term));
      case 'address-title': return addressTitles.filter(x => x.name.toLowerCase().includes(term));
      case 'support-category': return supportCategories.filter(x => x.name.toLowerCase().includes(term));
      case 'stamp': return stamps.filter(x => x.name.toLowerCase().includes(term));
      case 'invoice-setting': return invoiceSettings.filter(x => x.prefix.toLowerCase().includes(term) || x.suffix.toLowerCase().includes(term));
      case 'terms-condition': return termsConditions.filter(x => x.category.toLowerCase().includes(term) || x.content.toLowerCase().includes(term));
      default: return [];
    }
  }, [
    activeTab, searchTerm, categories, subcategories, conditions, wtbPrices, wtsPrices,
    uoms, designations, inactiveStatuses, businessTypes, addressTitles, supportCategories,
    stamps, invoiceSettings, termsConditions
  ]);

  // Handle open modal for either Add New or Edit
  const openModal = (item?: any) => {
    setEditingItem(item || null);
    if (item) {
      // populate forms based on activeTab
      setFormName(item.name || '');
      setFormCategory(item.category || 'Mobile');
      setFormImage(item.image || '');
      setFormStartDate(item.startDate || '');
      setFormEndDate(item.endDate || '');
      setFormPrefix(item.prefix || '');
      setFormInvoiceNum(item.invoiceNum || 1000);
      setFormSuffix(item.suffix || '');
      setFormTermsDate(item.date || '');
      setFormTermsCategory(item.category || 'Terms & Condition');
      setFormTermsContent(item.content || '');
    } else {
      // reset forms
      setFormName('');
      setFormCategory('Mobile');
      setFormImage('');
      setFormStartDate('');
      setFormEndDate('');
      setFormPrefix('');
      setFormInvoiceNum(1000);
      setFormSuffix('');
      setFormTermsDate(new Date().toISOString().split('T')[0]);
      setFormTermsCategory('Terms & Condition');
      setFormTermsContent('');
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    const isEdit = !!editingItem;
    const tabName = TABS.find(t => t.key === activeTab)?.title || 'Field';

    if (activeTab === 'subcategory') {
      if (!formName.trim()) { toast.error('Please enter name'); return; }
      if (isEdit) {
        setSubcategories(prev => prev.map(x => x.id === editingItem.id ? { ...x, name: formName, category: formCategory } : x));
      } else {
        setSubcategories(prev => [...prev, { id: String(Date.now()), name: formName, category: formCategory }]);
      }
    } else if (activeTab === 'stamp') {
      if (!formName.trim()) { toast.error('Please enter stamp name'); return; }
      const finalImg = formImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60';
      if (isEdit) {
        setStamps(prev => prev.map(x => x.id === editingItem.id ? { ...x, name: formName, image: finalImg } : x));
      } else {
        setStamps(prev => [...prev, { id: String(Date.now()), name: formName, image: finalImg }]);
      }
    } else if (activeTab === 'invoice-setting') {
      if (!formStartDate || !formEndDate) { toast.error('Dates are required'); return; }
      if (isEdit) {
        setInvoiceSettings(prev => prev.map(x => x.id === editingItem.id ? { ...x, startDate: formStartDate, endDate: formEndDate, prefix: formPrefix, invoiceNum: Number(formInvoiceNum), suffix: formSuffix } : x));
      } else {
        setInvoiceSettings(prev => [...prev, { id: String(Date.now()), startDate: formStartDate, endDate: formEndDate, prefix: formPrefix, invoiceNum: Number(formInvoiceNum), suffix: formSuffix }]);
      }
    } else if (activeTab === 'terms-condition') {
      if (!formTermsContent.trim()) { toast.error('Content is required'); return; }
      if (isEdit) {
        setTermsConditions(prev => prev.map(x => x.id === editingItem.id ? { ...x, date: formTermsDate, category: formTermsCategory, content: formTermsContent } : x));
      } else {
        setTermsConditions(prev => [...prev, { id: String(Date.now()), date: formTermsDate, category: formTermsCategory, content: formTermsContent }]);
      }
    } else {
      // 10 Standard Tabs
      if (!formName.trim()) { toast.error('Please enter name'); return; }
      const updateData = (prev: BaseFieldItem[]) => {
        if (isEdit) {
          return prev.map(x => x.id === editingItem.id ? { ...x, name: formName } : x);
        } else {
          return [...prev, { id: String(Date.now()), name: formName }];
        }
      };
      if (activeTab === 'category') setCategories(updateData);
      else if (activeTab === 'condition') setConditions(updateData);
      else if (activeTab === 'wtb-price') setWtbPrices(updateData);
      else if (activeTab === 'wts-price') setWtsPrices(updateData);
      else if (activeTab === 'uom') setUoms(updateData);
      else if (activeTab === 'designation') setDesignations(updateData);
      else if (activeTab === 'inactive-status') setInactiveStatuses(updateData);
      else if (activeTab === 'business-type') setBusinessTypes(updateData);
      else if (activeTab === 'address-title') setAddressTitles(updateData);
      else if (activeTab === 'support-category') setSupportCategories(updateData);
    }

    toast.success(`${tabName} config saved successfully!`);
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this setting?')) return;
    const tabName = TABS.find(t => t.key === activeTab)?.title || 'Field';

    if (activeTab === 'category') setCategories(prev => prev.filter(x => x.id !== id));
    else if (activeTab === 'subcategory') setSubcategories(prev => prev.filter(x => x.id !== id));
    else if (activeTab === 'condition') setConditions(prev => prev.filter(x => x.id !== id));
    else if (activeTab === 'wtb-price') setWtbPrices(prev => prev.filter(x => x.id !== id));
    else if (activeTab === 'wts-price') setWtsPrices(prev => prev.filter(x => x.id !== id));
    else if (activeTab === 'uom') setUoms(prev => prev.filter(x => x.id !== id));
    else if (activeTab === 'designation') setDesignations(prev => prev.filter(x => x.id !== id));
    else if (activeTab === 'inactive-status') setInactiveStatuses(prev => prev.filter(x => x.id !== id));
    else if (activeTab === 'business-type') setBusinessTypes(prev => prev.filter(x => x.id !== id));
    else if (activeTab === 'address-title') setAddressTitles(prev => prev.filter(x => x.id !== id));
    else if (activeTab === 'support-category') setSupportCategories(prev => prev.filter(x => x.id !== id));
    else if (activeTab === 'stamp') setStamps(prev => prev.filter(x => x.id !== id));
    else if (activeTab === 'invoice-setting') setInvoiceSettings(prev => prev.filter(x => x.id !== id));
    else if (activeTab === 'terms-condition') setTermsConditions(prev => prev.filter(x => x.id !== id));

    toast.success(`${tabName} deleted successfully.`);
  };

  const handleImageMock = () => {
    const urls = [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    ];
    const rand = urls[Math.floor(Math.random() * urls.length)];
    setFormImage(rand);
    toast.info('Mock stamp thumbnail uploaded!');
  };

  const handleEditorFormat = (action: string) => {
    toast.info(`Rich Text Editor formatted: ${action}`);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Header
            title="Field Settings"
            subtitle="Central administration portal for custom field options, taxonomies, price tags, and document templates."
          />
          <Button
            onClick={() => openModal()}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 h-10 flex items-center gap-1.5 shadow-sm rounded-lg shrink-0 self-start md:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New {TABS.find(t => t.key === activeTab)?.title}</span>
          </Button>
        </div>

        {/* Outer Split Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Left Navigation: 14 Tabs list with beautiful badges */}
          <div
            className="w-full lg:w-72 bg-white border shrink-0 flex flex-col gap-1.5 h-fit p-4 shadow-sm"
            style={{ borderColor: '#E5E7EB', borderRadius: '12px' }}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] px-3 mb-2 block">
              Configuration Tabs
            </span>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSearchTerm('');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-655 hover:bg-slate-55 hover:text-slate-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{tab.title}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Panel: Data Table */}
          <div
            className="flex-1 flex flex-col bg-white border overflow-hidden shadow-sm"
            style={{ borderColor: '#E5E7EB', borderRadius: '12px' }}
          >
            {/* Tab Description Header */}
            <div
              className="p-4 border-b bg-white flex flex-col md:flex-row md:items-center justify-between gap-3"
              style={{ borderColor: '#EEF2F6' }}
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {TABS.find(t => t.key === activeTab)?.title} Configuration
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {TABS.find(t => t.key === activeTab)?.description}. Add, modify, or remove settings.
                </p>
              </div>
              <div className="w-full md:w-72">
                <SearchBar
                  placeholder="Search settings..."
                  onSearch={setSearchTerm}
                />
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead className="bg-white border-b" style={{ borderColor: '#EEF2F6' }}>
                  <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {activeTab !== 'stamp' && activeTab !== 'invoice-setting' && activeTab !== 'terms-condition' && (
                      <>
                        <th className="px-6 py-3.5 font-semibold w-16 text-center">#</th>
                        <th className="px-6 py-3.5 font-semibold">Name</th>
                        {activeTab === 'subcategory' && <th className="px-6 py-3.5 font-semibold">Category</th>}
                        <th className="px-6 py-3.5 font-semibold w-24 text-right">Action</th>
                      </>
                    )}

                    {activeTab === 'stamp' && (
                      <>
                        <th className="px-6 py-3.5 font-semibold w-16 text-center">#</th>
                        <th className="px-6 py-3.5 font-semibold">Stamp Name</th>
                        <th className="px-6 py-3.5 font-semibold">Image</th>
                        <th className="px-6 py-3.5 font-semibold w-24 text-right">Action</th>
                      </>
                    )}

                    {activeTab === 'invoice-setting' && (
                      <>
                        <th className="px-6 py-3.5 font-semibold">Start Date</th>
                        <th className="px-6 py-3.5 font-semibold">End Date</th>
                        <th className="px-6 py-3.5 font-semibold">Prefix Detail</th>
                        <th className="px-6 py-3.5 font-semibold">Invoice Number</th>
                        <th className="px-6 py-3.5 font-semibold">Suffix Detail</th>
                        <th className="px-6 py-3.5 font-semibold w-24 text-right">Action</th>
                      </>
                    )}

                    {activeTab === 'terms-condition' && (
                      <>
                        <th className="px-6 py-3.5 font-semibold w-20 text-center">SR.NO</th>
                        <th className="px-6 py-3.5 font-semibold">Date</th>
                        <th className="px-6 py-3.5 font-semibold">Category</th>
                        <th className="px-6 py-3.5 font-semibold">Content Snippet</th>
                        <th className="px-6 py-3.5 font-semibold w-24 text-right">Action</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-sm text-slate-500">
                        No settings match your search. Click Add New to configure.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item: any, index) => {
                      return (
                        <tr
                          key={item.id}
                          className="border-b hover:bg-slate-55 transition-colors bg-white select-none"
                          style={{ borderColor: '#F1F5F9' }}
                        >
                          {/* Case A: Standard and Subcategory */}
                          {activeTab !== 'stamp' && activeTab !== 'invoice-setting' && activeTab !== 'terms-condition' && (
                            <>
                              <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs font-semibold">
                                {String(index + 1).padStart(2, '0')}
                              </td>
                              <td className="px-6 py-4">
                                <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '600' }} className="whitespace-nowrap">
                                  {item.name}
                                </span>
                              </td>
                              {activeTab === 'subcategory' && (
                                <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                                  {item.category}
                                </td>
                              )}
                            </>
                          )}

                          {/* Case B: Product Stamp */}
                          {activeTab === 'stamp' && (
                            <>
                              <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs font-semibold">
                                {String(index + 1).padStart(2, '0')}
                              </td>
                              <td className="px-6 py-4">
                                <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '600' }} className="whitespace-nowrap">
                                  {item.name}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-150 shadow-sm"
                                />
                              </td>
                            </>
                          )}

                          {/* Case C: Invoice Configurations */}
                          {activeTab === 'invoice-setting' && (
                            <>
                              <td className="px-6 py-4">
                                <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '600' }} className="whitespace-nowrap">
                                  {item.startDate}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '600' }} className="whitespace-nowrap">
                                  {item.endDate}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                                {item.prefix}
                              </td>
                              <td className="px-6 py-4">
                                <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '600' }} className="whitespace-nowrap">
                                  {item.invoiceNum}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                                {item.suffix}
                              </td>
                            </>
                          )}

                          {/* Case D: Terms & Conditions */}
                          {activeTab === 'terms-condition' && (
                            <>
                              <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs font-semibold">
                                {String(index + 1).padStart(2, '0')}
                              </td>
                              <td className="px-6 py-4">
                                <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '600' }} className="whitespace-nowrap">
                                  {item.date}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                                {item.category}
                              </td>
                              <td className="px-6 py-4 text-[13px] text-slate-650 font-medium max-w-xs truncate">
                                {item.content}
                              </td>
                            </>
                          )}

                          {/* Action Buttons */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                onClick={() => openModal(item)}
                                className="h-7 w-7 p-0 rounded-md hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => handleDelete(item.id)}
                                className="h-7 w-7 p-0 rounded-md hover:bg-red-50 hover:text-red-600 cursor-pointer"
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

        {/* Custom Form Add / Edit Popup Modal Container */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[100]">
            <DialogHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Sliders className="h-5 w-5 text-slate-500" />
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
                  {editingItem ? 'Edit' : 'Add New'} {TABS.find(t => t.key === activeTab)?.title}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-550 mt-1">
                Configure taxonomic metadata settings accurately for the dashboard setup.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
              {/* Render dynamic inputs based on ActiveTab */}

              {/* Form 1: Standard Modal (10 Standard Tabs) */}
              {activeTab !== 'subcategory' && activeTab !== 'stamp' && activeTab !== 'invoice-setting' && activeTab !== 'terms-condition' && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="standard-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Name
                  </Label>
                  <Input
                    id="standard-name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter Name"
                    className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white transition-colors border focus-visible:ring-slate-900 focus-visible:ring-1 focus-visible:border-slate-900 focus-visible:outline-none"
                  />
                </div>
              )}

              {/* Form 2: Product Sub Category Modal */}
              {activeTab === 'subcategory' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="sub-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Name
                    </Label>
                    <Input
                      id="sub-name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Enter Subcategory Name"
                      className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white transition-colors border focus-visible:ring-slate-900 focus-visible:ring-1 focus-visible:border-slate-900 focus-visible:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="sub-category-select" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Category
                    </Label>
                    <select
                      id="sub-category-select"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-slate-50/50 hover:bg-slate-100/50 transition-colors focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 cursor-pointer"
                    >
                      <option disabled value="">Choose any one</option>
                      <option value="Mobile">Mobile</option>
                      <option value="PC">PC</option>
                      <option value="Laptop">Laptop</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Form 3: Product Stamp Modal with premium file mock */}
              {activeTab === 'stamp' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="stamp-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Stamp Name
                    </Label>
                    <Input
                      id="stamp-name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Enter Stamp Name"
                      className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white transition-colors border focus-visible:ring-slate-900 focus-visible:ring-1 focus-visible:border-slate-900 focus-visible:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Image File</Label>
                    <div className="flex items-center gap-4">
                      {/* Avatar preview */}
                      <div className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                        {formImage ? (
                          <img src={formImage} alt="Stamp Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleImageMock}
                          className="h-9 px-3 text-xs border-slate-200 flex items-center gap-1.5 cursor-pointer hover:bg-slate-50"
                        >
                          <Upload className="h-3.5 w-3.5 text-slate-500" />
                          <span>Choose file</span>
                        </Button>
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          {formImage ? 'Stamp uploaded successfully' : 'No file chosen'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form 4: Invoice Configuration Modal */}
              {activeTab === 'invoice-setting' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="inv-start" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Start Date
                    </Label>
                    <Input
                      id="inv-start"
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white transition-colors border focus-visible:ring-slate-900"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="inv-end" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      End Date
                    </Label>
                    <Input
                      id="inv-end"
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white transition-colors border focus-visible:ring-slate-900"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="inv-prefix" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Prefix Detail
                    </Label>
                    <Input
                      id="inv-prefix"
                      value={formPrefix}
                      onChange={(e) => setFormPrefix(e.target.value)}
                      placeholder="Enter Prefix Detail"
                      className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white transition-colors border focus-visible:ring-slate-900"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="inv-num" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Invoice Number
                    </Label>
                    <Input
                      id="inv-num"
                      type="number"
                      value={formInvoiceNum}
                      onChange={(e) => setFormInvoiceNum(Number(e.target.value))}
                      placeholder="Enter Invoice Number"
                      className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white transition-colors border focus-visible:ring-slate-900"
                    />
                  </div>
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <Label htmlFor="inv-suffix" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Suffix Detail
                    </Label>
                    <Input
                      id="inv-suffix"
                      value={formSuffix}
                      onChange={(e) => setFormSuffix(e.target.value)}
                      placeholder="Enter Suffix Detail"
                      className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white transition-colors border focus-visible:ring-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Form 5: Terms & Conditions Modal with structured Rich Text Toolbar */}
              {activeTab === 'terms-condition' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="terms-date" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Date
                      </Label>
                      <Input
                        id="terms-date"
                        type="date"
                        value={formTermsDate}
                        onChange={(e) => setFormTermsDate(e.target.value)}
                        className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white transition-colors border focus-visible:ring-slate-900"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="terms-category" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Subject
                      </Label>
                      <select
                        id="terms-category"
                        value={formTermsCategory}
                        onChange={(e) => setFormTermsCategory(e.target.value)}
                        className="w-full h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-slate-50/50 hover:bg-slate-100/50 transition-colors focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 cursor-pointer"
                      >
                        <option disabled value="">Choose any one</option>
                        <option value="Privacy Policy">Privacy Policy</option>
                        <option value="Terms & Condition">Terms & Condition</option>
                      </select>
                    </div>
                  </div>

                  {/* Rich Text Editor Styling */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Content</Label>
                    <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col focus-within:ring-1 focus-within:ring-slate-900">
                      {/* Editor Toolbar with action buttons */}
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
                      {/* Editor Textarea */}
                      <textarea
                        value={formTermsContent}
                        onChange={(e) => setFormTermsContent(e.target.value)}
                        placeholder="Insert text here..."
                        rows={6}
                        className="w-full text-sm p-3 focus:outline-none resize-none bg-white text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 gap-2 flex items-center justify-end w-full mt-auto">
              <Button
                type="button"
                variant="outline"
                className="h-10 text-xs font-semibold hover:bg-slate-50 cursor-pointer border border-slate-200"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="h-10 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
