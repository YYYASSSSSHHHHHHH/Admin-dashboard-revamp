'use client';

import { useState, useMemo, Fragment } from 'react';
import {
  Radio,
  ChevronDown,
  ChevronUp,
  Edit2,
  Calendar as CalendarIcon,
  Tag,
  EyeOff,
  CheckCircle,
  Package,
  Layers,
  Filter,
  User,
  Settings2,
  Check,
  ListFilter,
  SlidersHorizontal,
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
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { formatDate, relativeTime } from '@/lib/mockData';
import { toast } from 'sonner';

interface BroadcastRecord {
  id: string;
  at: string;
  sender: string;
  companyName: string;
  type: 'WTB' | 'WTS';
  condition: 'New' | 'Used';
  mainCategory: string;
  subCategory: string;
  text: string;
  qty: number;
  unit: 'Pcs' | 'Kg' | 'MT';
  priceOption: 'Quote' | 'Fixed';
  priceAmount: number;
  sendingOption: 'Send to All' | 'Send to group';
  audience: string;
  status: 'Live' | 'Active' | 'Pending' | 'Suspended' | 'Hidden' | 'Rejected';
}

interface BroadcastTabProps {
  member: any;
  broadcasts: BroadcastRecord[];
  setBroadcasts: React.Dispatch<React.SetStateAction<BroadcastRecord[]>>;
}

const MAIN_CATEGORIES = ['Accessories', 'Electronics', 'Mobile'];

const SUB_CATEGORIES: Record<string, string[]> = {
  Accessories: ['Chargers', 'Cases', 'Cables'],
  Electronics: ['Laptops', 'Monitors', 'Keyboards'],
  Mobile: ['iPhone', 'Samsung Galaxy', 'Google Pixel'],
};

const AUDIENCES = ['All Members', 'Charger suppliers', 'Electronics distributors', 'Mobile buyers'];

// Subcategory inventory for Settings
const INVENTORY_SETTINGS: Record<string, string[]> = {
  'Stainless Steel': ['Circle', 'Plate', 'Pipe', 'Sheet', 'Coil', 'Strip'],
  'Mobile': ['Iphone', 'Samsung', 'Google Pixel', 'OnePlus', 'Xiaomi', 'Oppo'],
  'Components': ['Motherboard', 'Memory', 'Processor', 'Graphic Card', 'SSD', 'PSU'],
  'Aluminium': ['Sheet', 'Extrusion', 'Ingot', 'Foil', 'Plate', 'Rod'],
  'Server': ['Hard Drive', 'Rack', 'CPU', 'Power Supply', 'RAM', 'Chassis'],
  'PC': ['Monitor', 'Keyboard', 'Mouse', 'UPS', 'Speaker', 'Webcam'],
  'Laptop': ['Display', 'Battery', 'Keyboard', 'Touchpad', 'Charger', 'RAM'],
};

const SETTINGS_CATEGORIES = [
  { id: 'cat-1', name: 'Stainless Steel', displayName: '1. Stainless Steel', available: INVENTORY_SETTINGS['Stainless Steel'] },
  { id: 'cat-2', name: 'Mobile', displayName: '2. Mobile', available: INVENTORY_SETTINGS['Mobile'] },
  { id: 'cat-3', name: 'Components', displayName: '3. Components', available: INVENTORY_SETTINGS['Components'] },
  { id: 'cat-4', name: 'Aluminium', displayName: '4. Aluminium', available: INVENTORY_SETTINGS['Aluminium'] },
  { id: 'cat-5', name: 'Server', displayName: '5. Server', available: INVENTORY_SETTINGS['Server'] },
  { id: 'cat-6', name: 'PC', displayName: '6. PC', available: INVENTORY_SETTINGS['PC'] },
  { id: 'cat-7', name: 'Laptop', displayName: '7. Laptop', available: INVENTORY_SETTINGS['Laptop'] },
];

export function BroadcastTab({ member, broadcasts, setBroadcasts }: BroadcastTabProps) {
  const [activeSegment, setActiveSegment] = useState<'log' | 'settings'>('log');
  const [open, setOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [expandedSettingsIds, setExpandedSettingsIds] = useState<Record<string, boolean>>({});
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastRecord | null>(null);

  // Broadcast settings state
  const [categorySettings, setCategorySettings] = useState<Record<string, string[]>>({
    'Stainless Steel': ['Circle', 'Plate'],
    'Mobile': ['Iphone', 'Samsung', 'Google Pixel'],
    'Components': ['Motherboard', 'Memory'],
    'Aluminium': ['Sheet'],
    'Server': ['Hard Drive', 'Rack'],
    'PC': ['Monitor', 'Keyboard'],
    'Laptop': ['Display', 'Battery'],
  });

  // Edit form states
  const [type, setType] = useState<'WTB' | 'WTS'>('WTB');
  const [condition, setCondition] = useState<'New' | 'Used'>('New');
  const [mainCat, setMainCat] = useState('Accessories');
  const [subCat, setSubCat] = useState('Chargers');
  const [text, setText] = useState('');
  const [qty, setQty] = useState('100');
  const [unit, setUnit] = useState<'Pcs' | 'Kg' | 'MT'>('Pcs');
  const [priceOption, setPriceOption] = useState<'Quote' | 'Fixed'>('Quote');
  const [priceAmount, setPriceAmount] = useState('0');
  const [sendingOption, setSendingOption] = useState<'Send to All' | 'Send to group'>('Send to All');
  const [audience, setAudience] = useState('All Members');

  const availableSubCats = useMemo(() => {
    return SUB_CATEGORIES[mainCat] || [];
  }, [mainCat]);

  const handleEditClick = (b: BroadcastRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBroadcast(b);
    setType(b.type);
    setCondition(b.condition);
    setMainCat(b.mainCategory);
    setSubCat(b.subCategory);
    setText(b.text);
    setQty(b.qty.toString());
    setUnit(b.unit);
    setPriceOption(b.priceOption);
    setPriceAmount(b.priceAmount.toString());
    setSendingOption(b.sendingOption);
    setAudience(b.audience);
    setOpen(true);
  };

  const handleSave = () => {
    if (!text.trim()) {
      toast.error('Message details are required');
      return;
    }
    if (text.length > 500) {
      toast.error('Message details must be under 500 characters');
      return;
    }
    if (!qty || parseFloat(qty) <= 0) {
      toast.error('Quantity must be positive');
      return;
    }
    if (priceOption === 'Fixed' && (!priceAmount || parseFloat(priceAmount) < 0)) {
      toast.error('Price amount must be valid');
      return;
    }

    setBroadcasts((prev) =>
      prev.map((b) => {
        if (b.id === selectedBroadcast?.id) {
          return {
            ...b,
            type,
            condition,
            mainCategory: mainCat,
            subCategory: subCat,
            text,
            qty: parseFloat(qty) || 0,
            unit,
            priceOption,
            priceAmount: priceOption === 'Fixed' ? parseFloat(priceAmount) || 0 : 0,
            sendingOption,
            audience,
          };
        }
        return b;
      })
    );

    toast.success('Broadcast details updated');
    setOpen(false);
  };

  const updateStatus = (id: string, newStatus: BroadcastRecord['status'], label: string) => {
    setBroadcasts((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          return { ...b, status: newStatus };
        }
        return b;
      })
    );
    toast.success(`Broadcast is now ${label}`);
  };

  const toggleExpand = (id: string) => {
    const isExpanding = !expandedIds[id];
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));

    if (isExpanding) {
      setTimeout(() => {
        const el = document.getElementById(`broadcast-row-expand-${id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 150);
    }
  };

  const toggleSettingsExpand = (id: string) => {
    const isExpanding = !expandedSettingsIds[id];
    setExpandedSettingsIds((prev) => ({ ...prev, [id]: !prev[id] }));

    if (isExpanding) {
      setTimeout(() => {
        const el = document.getElementById(`settings-row-expand-${id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 150);
    }
  };

  // Toggle single subcategory
  const handleToggleSubcategory = (category: string, sub: string) => {
    setCategorySettings((prev) => {
      const currentList = prev[category] || [];
      const updated = currentList.includes(sub)
        ? currentList.filter((item) => item !== sub)
        : [...currentList, sub];

      return {
        ...prev,
        [category]: updated,
      };
    });
  };

  // Select all or deselect all
  const handleSelectAllCategory = (category: string, allSelected: boolean) => {
    setCategorySettings((prev) => {
      return {
        ...prev,
        [category]: allSelected ? [] : [...INVENTORY_SETTINGS[category]],
      };
    });
    toast.success(allSelected ? `Deselected all subcategories under ${category}` : `Selected all subcategories under ${category}`);
  };

  return (
    <div className="space-y-5" data-testid="broadcast-tab">
      {/* Embedded Single White Card Component */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        {/* Dynamic Card Header with Symmetric Button-styled Switchers */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4 bg-white">
          <div className="space-y-0.5">
            <h2 className="font-display text-xl font-semibold text-slate-900 tracking-tight">
              {activeSegment === 'log' ? 'Broadcast History Log' : 'Broadcast Category Settings'}
            </h2>
            <p className="text-sm text-slate-500">
              {activeSegment === 'log'
                ? 'Review and moderate active WTB/WTS request broadcasts published by this member.'
                : 'Control the exact market parameters and subcategory feeds enabled for this user.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeSegment === 'log' && (
              <span
                data-testid="broadcast-count"
                className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg h-10 flex items-center justify-center"
              >
                {broadcasts.length} Broadcasts
              </span>
            )}

            {/* Tab Swappers Styled EXACTLY like Manage Plan / Compose Email Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setActiveSegment('log')}
                data-testid="tab-history-log-btn"
                className={`h-10 px-4 font-semibold text-xs transition-all flex items-center gap-1.5 rounded-lg cursor-pointer ${
                  activeSegment === 'log'
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <ListFilter className="h-4 w-4" />
                History Log
              </Button>
              <Button
                onClick={() => setActiveSegment('settings')}
                data-testid="tab-settings-btn"
                className={`h-10 px-4 font-semibold text-xs transition-all flex items-center gap-1.5 rounded-lg cursor-pointer ${
                  activeSegment === 'settings'
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Settings2 className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Card Body with High-Performance Fade-and-Lift Switching Transition */}
        <div className="relative w-full">
          {/* Pane 1: Log Table */}
          <div
            className={`w-full transition-all duration-300 ease-in-out ${
              activeSegment === 'log'
                ? 'opacity-100 translate-y-0 pointer-events-auto block'
                : 'opacity-0 -translate-y-2 pointer-events-none hidden'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="broadcast-table">
                <thead>
                  <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100 bg-slate-50/20">
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Type / Condition</th>
                    <th className="px-6 py-3">Submission Date</th>
                    <th className="px-6 py-3">Quantity & Price</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {broadcasts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                        No broadcast records registered for this member.
                      </td>
                    </tr>
                  ) : (
                    broadcasts.map((b, index) => {
                      const isExpanded = !!expandedIds[b.id];
                      return (
                        <Fragment key={b.id}>
                          <tr
                            data-testid={`broadcast-row-${b.id}`}
                            className={`hover:bg-slate-50/50 transition-all duration-300 cursor-pointer ${
                              b.status === 'Hidden' ? 'opacity-60 bg-slate-50/30' : ''
                            }`}
                            onClick={() => toggleExpand(b.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-400">
                              #{index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    b.type === 'WTB'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {b.type === 'WTB' ? 'WTB' : 'WTS'}
                                </span>
                                <span className="text-xs text-slate-500">{b.condition}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                              <div>{formatDate(b.at)}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {relativeTime(b.at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                              <div className="font-medium text-slate-950">
                                {b.qty} {b.unit}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {b.priceOption === 'Fixed' ? `$${b.priceAmount.toFixed(2)}` : 'Quote'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={b.status.toUpperCase()} />
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  data-testid={`broadcast-edit-btn-${b.id}`}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2.5 text-slate-600 hover:text-slate-955 border-slate-200"
                                  onClick={(e) => handleEditClick(b, e)}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <button
                                  className="text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1 ml-2"
                                  onClick={() => toggleExpand(b.id)}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>

                          <tr
                            key={`expand-${b.id}`}
                            id={`broadcast-row-expand-${b.id}`}
                            className={`bg-slate-50/50 transition-all duration-300 ${
                              isExpanded ? 'border-t border-slate-100' : 'border-none'
                            }`}
                          >
                            <td colSpan={6} className="p-0">
                              <div
                                className={`grid transition-all duration-300 ease-in-out ${
                                  isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                }`}
                              >
                                <div className="overflow-hidden">
                                  <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left/Center Detail columns */}
                                    <div className="lg:col-span-2 space-y-6">
                                      <div>
                                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                          Broadcast Detail Copy
                                        </div>
                                        <div className="p-4 rounded-lg bg-white border border-slate-200 text-slate-800 font-normal leading-relaxed text-sm shadow-sm whitespace-pre-wrap">
                                          {b.text}
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                                            <Layers className="h-3.5 w-3.5 text-slate-400" />
                                            Categories
                                          </div>
                                          <div className="text-sm font-semibold text-slate-900 mt-1">
                                            {b.mainCategory} · <span className="font-normal text-slate-500">{b.subCategory}</span>
                                          </div>
                                        </div>

                                        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                                            <Filter className="h-3.5 w-3.5 text-slate-400" />
                                            Audience Scope
                                          </div>
                                          <div className="text-sm font-semibold text-slate-900 mt-1">
                                            {b.sendingOption} · <span className="font-normal text-slate-500">{b.audience}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right sidebar panel / Actions */}
                                    <div className="space-y-5 border-l border-slate-200 pl-8">
                                      <div>
                                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                                          <User className="h-3.5 w-3.5" />
                                          Broadcaster Details
                                        </div>
                                        <div className="space-y-1 text-sm bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                                          <div className="font-semibold text-slate-800">{b.sender}</div>
                                          <div className="text-xs text-slate-500">{b.companyName}</div>
                                        </div>
                                      </div>

                                      {/* Quick Actions Panel */}
                                      <div className="space-y-2 pt-2 border-t border-slate-200">
                                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                          Moderate / Actions
                                        </div>
                                        <div className="flex flex-col gap-2">
                                          {b.status === 'Live' ? (
                                            <Button
                                              data-testid={`action-hide-${b.id}`}
                                              variant="outline"
                                              onClick={() => updateStatus(b.id, 'Hidden', 'hidden')}
                                              className="w-full text-slate-600 hover:text-slate-955 border-slate-200 inline-flex items-center justify-center text-xs h-9"
                                            >
                                              <EyeOff className="h-3.5 w-3.5 mr-2" />
                                              Hide Broadcast
                                            </Button>
                                          ) : (
                                            <Button
                                              data-testid={`action-live-${b.id}`}
                                              onClick={() => updateStatus(b.id, 'Live', 'approved and live')}
                                              className="w-full bg-slate-900 hover:bg-slate-800 text-white inline-flex items-center justify-center text-xs h-9 font-semibold"
                                            >
                                              <CheckCircle className="h-3.5 w-3.5 mr-2 text-white/90" />
                                              Make Live
                                            </Button>
                                          )}
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

          {/* Pane 2: Settings Table */}
          <div
            className={`w-full transition-all duration-300 ease-in-out ${
              activeSegment === 'settings'
                ? 'opacity-100 translate-y-0 pointer-events-auto block'
                : 'opacity-0 -translate-y-2 pointer-events-none hidden'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="settings-table">
                <thead>
                  <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100 bg-slate-50/20">
                    <th className="px-6 py-3">Category Name</th>
                    <th className="px-6 py-3">Currently Active Subcategories</th>
                    <th className="px-6 py-3">Subscription Ratio</th>
                    <th className="px-6 py-3 text-right">Configure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SETTINGS_CATEGORIES.map((c) => {
                    const isExpanded = !!expandedSettingsIds[c.id];
                    const selected = categorySettings[c.name] || [];
                    const allSelected = selected.length === c.available.length;

                    return (
                      <Fragment key={c.id}>
                        <tr
                          data-testid={`settings-row-${c.id}`}
                          className="hover:bg-slate-50/50 transition-all duration-300 cursor-pointer"
                          onClick={() => toggleSettingsExpand(c.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                            {c.displayName}
                          </td>
                          <td className="px-6 py-4 text-slate-900 font-normal">
                            {selected.length === 0 ? (
                              <span className="text-slate-400 font-normal italic">None Selected</span>
                            ) : (
                              <span className="truncate max-w-[280px] block">{selected.join(', ')}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              allSelected
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : selected.length === 0
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {selected.length} of {c.available.length} Active
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button
                              className="text-slate-500 hover:text-slate-955 font-medium inline-flex items-center gap-1.5 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSettingsExpand(c.id);
                              }}
                            >
                              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Smooth Expanded Accordion Panel */}
                        <tr
                          key={`settings-expand-${c.id}`}
                          id={`settings-row-expand-${c.id}`}
                          className={`bg-slate-50/50 transition-all duration-300 ${
                            isExpanded ? 'border-t border-slate-100' : 'border-none'
                          }`}
                        >
                          <td colSpan={4} className="p-0">
                            <div
                              className={`grid transition-all duration-300 ease-in-out ${
                                isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                              }`}
                            >
                              <div className="overflow-hidden">
                                <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                                  {/* Left Quick configuration column */}
                                  <div className="space-y-4 pr-6 border-r border-slate-200/80">
                                    <div>
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Quick Management
                                      </div>
                                      <h4 className="text-sm font-semibold text-slate-900">
                                        {c.name} Feed Scope
                                      </h4>
                                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        Mass configure and toggle feed parameters. Outbound notifications will trigger only for checked feeds.
                                      </p>
                                    </div>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectAllCategory(c.name, allSelected);
                                      }}
                                      data-testid={`toggle-select-all-${c.name.replace(/\s+/g, '-').toLowerCase()}`}
                                      className="text-xs font-medium text-slate-700 hover:text-slate-955 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white shadow-sm transition-colors cursor-pointer w-full justify-center"
                                    >
                                      {allSelected ? 'Deselect All Feeds' : 'Select All Feeds'}
                                    </button>
                                  </div>

                                  {/* Right/Center Subcategory checkbox pills */}
                                  <div className="md:col-span-2 space-y-3">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      Subcategory Feeds Inventory
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                      {c.available.map((sub) => {
                                        const isChecked = selected.includes(sub);
                                        return (
                                          <button
                                            key={sub}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleSubcategory(c.name, sub);
                                            }}
                                            data-testid={`subcategory-pill-${sub.toLowerCase()}`}
                                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer select-none ${
                                              isChecked
                                                ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-sm'
                                                : 'bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200/80'
                                            }`}
                                          >
                                            {isChecked && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                                            {sub}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="edit-broadcast-dialog" className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Radio className="h-5 w-5 text-slate-500 animate-pulse" />
              Edit Request Broadcast
            </DialogTitle>
            <DialogDescription>
              Modify broadcast attributes, category mapping, scope limits, and text content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Type & Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Broadcast Type
                </Label>
                <Select value={type} onValueChange={(val: any) => setType(val)}>
                  <SelectTrigger data-testid="edit-broadcast-type" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WTB">Want to buy (WTB)</SelectItem>
                    <SelectItem value="WTS">Want to sell (WTS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Product Condition
                </Label>
                <Select value={condition} onValueChange={(val: any) => setCondition(val)}>
                  <SelectTrigger data-testid="edit-broadcast-condition" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Used">Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Main Category
                </Label>
                <Select
                  value={mainCat}
                  onValueChange={(val) => {
                    setMainCat(val);
                    const subList = SUB_CATEGORIES[val] || [];
                    setSubCat(subList[0] || '');
                  }}
                >
                  <SelectTrigger data-testid="edit-broadcast-maincat" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MAIN_CATEGORIES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Sub Category
                </Label>
                <Select value={subCat} onValueChange={setSubCat}>
                  <SelectTrigger data-testid="edit-broadcast-subcat" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubCats.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Text message detail */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Text Message Detail
                </Label>
                <span className={`text-[10px] ${text.length > 500 ? 'text-red-500' : 'text-slate-400'}`}>
                  {text.length} / 500
                </span>
              </div>
              <Textarea
                data-testid="edit-broadcast-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="resize-none bg-white leading-relaxed"
                placeholder="Details about what you are buying or selling…"
              />
            </div>

            {/* Quantity and unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Quantity
                </Label>
                <Input
                  data-testid="edit-broadcast-qty"
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="h-11 bg-white"
                  placeholder="e.g. 100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Unit of Quantity
                </Label>
                <Select value={unit} onValueChange={(val: any) => setUnit(val)}>
                  <SelectTrigger data-testid="edit-broadcast-unit" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pcs">Pcs (Pieces)</SelectItem>
                    <SelectItem value="Kg">Kg (Kilograms)</SelectItem>
                    <SelectItem value="MT">MT (Metric Tons)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Option & price amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Price Option
                </Label>
                <Select value={priceOption} onValueChange={(val: any) => setPriceOption(val)}>
                  <SelectTrigger data-testid="edit-broadcast-priceoption" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quote">Quote Required</SelectItem>
                    <SelectItem value="Fixed">Fixed Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Price Amount ($)
                </Label>
                <Input
                  data-testid="edit-broadcast-priceamount"
                  type="number"
                  disabled={priceOption === 'Quote'}
                  value={priceOption === 'Quote' ? '0' : priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                  className="h-11 bg-white disabled:bg-slate-50"
                  placeholder="e.g. 1500"
                />
              </div>
            </div>

            {/* Sending options & Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Sending Option
                </Label>
                <Select value={sendingOption} onValueChange={(val: any) => setSendingOption(val)}>
                  <SelectTrigger data-testid="edit-broadcast-sendingoption" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Send to All">Send to All</SelectItem>
                    <SelectItem value="Send to group">Send to group</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Target Audience
                </Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger data-testid="edit-broadcast-audience" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIENCES.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              data-testid="edit-broadcast-cancel"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-testid="edit-broadcast-confirm"
              onClick={handleSave}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
