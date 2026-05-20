'use client';

import { useState, useMemo, Fragment } from 'react';
import {
  Radio,
  ChevronDown,
  ChevronUp,
  Edit2,
  CheckCircle,
  Settings2,
  Check,
  ListFilter,
  SlidersHorizontal,
  Clock,
  Building2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { BroadcastSettings } from '@/components/dashboard/BroadcastSettings';
import { formatDate, relativeTime } from '@/lib/mockData';
import { toast } from 'sonner';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

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

export function BroadcastTab({ member, broadcasts, setBroadcasts }: BroadcastTabProps) {
  const [activeSegment, setActiveSegment] = useState<'log' | 'settings'>('log');
  const [approvalRequired, setApprovalRequired] = useState(false);

  // Modal state
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastRecord | null>(null);

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

  const handleRowClick = (b: BroadcastRecord) => {
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
    setIsEditing(false);
    setOpen(true);
  };

  const handleSaveEdit = () => {
    if (!text.trim()) {
      toast.error('Message details are required');
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
    setIsEditing(false);
    setOpen(false); // Can also keep it open in viewing mode, but typical flow is to close
  };

  const updateStatus = (id: string, newStatus: BroadcastRecord['status']) => {
    setBroadcasts((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    toast.success(`Broadcast marked as ${newStatus}`);
  };

  const handleApprove = () => {
    if (selectedBroadcast) {
      updateStatus(selectedBroadcast.id, 'Live');
      setOpen(false);
    }
  };

  const handleActionChange = (action: string) => {
    if (!selectedBroadcast) return;
    if (action === 'hide') {
      updateStatus(selectedBroadcast.id, 'Hidden');
    } else if (action === 'reject') {
      updateStatus(selectedBroadcast.id, 'Rejected');
    }
    setOpen(false);
  };

  return (
    <div className="space-y-5" data-testid="broadcast-tab">
      {/* Main Broadcast Container */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        {/* Header with Segment Toggle */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4 bg-white">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xl font-semibold text-slate-900 tracking-tight">
                {activeSegment === 'log' ? 'Broadcast History' : 'Broadcast Setting'}
              </h2>
              {activeSegment === 'log' && (
                <div className="flex items-center gap-2.5 bg-slate-50/80 px-4 py-1.5 rounded-full border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ml-2 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setApprovalRequired(!approvalRequired)}>
                  <Checkbox
                    checked={approvalRequired}
                    onCheckedChange={(checked) => setApprovalRequired(checked as boolean)}
                    className="h-4 w-4 data-[state=checked]:bg-[#0f172a] data-[state=checked]:text-white border-slate-300 rounded-[4px]"
                  />
                  <span className="text-[13px] font-semibold text-[#164e87] select-none">Approval Required</span>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {activeSegment === 'log'
                ? 'Click any row to view, edit, or change status. When approval is ON, new broadcasts start as Pending.'
                : 'Control the exact market parameters and subcategory feeds enabled for this user.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeSegment === 'log' && (
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg h-10 flex items-center justify-center">
                {broadcasts.length} broadcasts
              </span>
            )}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setActiveSegment('log')}
                className={`h-10 px-4 font-semibold text-xs transition-all flex items-center gap-1.5 rounded-lg cursor-pointer ${activeSegment === 'log'
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm'
                  }`}
              >
                <ListFilter className="h-4 w-4" />
                History Log
              </Button>
              <Button
                onClick={() => setActiveSegment('settings')}
                className={`h-10 px-4 font-semibold text-xs transition-all flex items-center gap-1.5 rounded-lg cursor-pointer ${activeSegment === 'settings'
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm'
                  }`}
              >
                <Settings2 className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="relative w-full">
          {/* LOG TAB */}
          <div
            className={`w-full transition-all duration-300 ease-in-out ${activeSegment === 'log' ? 'opacity-100 pointer-events-auto block' : 'hidden opacity-0'
              }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100">
                    <th className="px-6 py-3 w-16">SR NO</th>
                    <th className="px-6 py-3">DATE & TIME</th>
                    <th className="px-6 py-3">BROADCAST MESSAGE</th>
                    <th className="px-6 py-3">SEND TO</th>
                    <th className="px-6 py-3 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {broadcasts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                        No broadcasts found.
                      </td>
                    </tr>
                  ) : (
                    broadcasts.map((b, i) => (
                      <tr
                        key={b.id}
                        className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                        onClick={() => handleRowClick(b)}
                      >
                        <td className="px-6 py-4 text-slate-400 font-medium text-xs">
                          {String(i + 1).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 text-[13px]">{formatDate(b.at)}</div>
                          <div className="text-[11px] font-medium text-slate-400 mt-0.5">{relativeTime(b.at)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase border border-slate-200/80 shrink-0">
                              {b.type}
                            </span>
                            <span className="text-slate-600 text-[13px] truncate max-w-[320px]">
                              {b.text}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-[13px]">
                          {b.sendingOption === 'Send to All' ? 'Send to All' : b.audience}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end">
                            <StatusBadge status={b.status.toUpperCase()} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SETTINGS TAB */}
          <div
            className={`w-full transition-all duration-300 ease-in-out ${activeSegment === 'settings' ? 'opacity-100 pointer-events-auto block' : 'hidden opacity-0'
              }`}
          >
            <BroadcastSettings />
          </div>
        </div>
      </div>

      {/* Broadcast Details Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl h-[690px] max-h-[90vh] flex flex-col justify-between overflow-hidden p-0">
          {selectedBroadcast && (
            <>
              <DialogHeader className="pt-6 px-6 pb-2">
                <div className="flex items-center gap-2.5 pr-6">
                  <DialogTitle className="text-lg font-semibold leading-none tracking-tight font-display flex items-center gap-2">
                    <Radio className="h-4 w-4 text-slate-500" />
                    Broadcast Information
                  </DialogTitle>
                  {isEditing ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-200">
                      <Edit2 className="h-3 w-3" />
                      Editing
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200">
                      <Eye className="h-3 w-3" />
                      Viewing
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <DialogDescription className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      <span style={{ display: 'contents' }}>{selectedBroadcast.companyName}</span> · ID: <span className="font-mono text-slate-700">{selectedBroadcast.id}</span>
                    </span>
                  </DialogDescription>
                  {!isEditing ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-7 px-3 text-xs text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-3 w-3 mr-1.5" />
                      Edit
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-7 px-3 text-xs text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      onClick={handleSaveEdit}
                    >
                      <CheckCircle className="h-3 w-3 mr-1.5" />
                      Save
                    </Button>
                  )}
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-6 my-2 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Broadcast Type</div>
                    {!isEditing ? (
                      <div className="text-sm font-medium text-slate-900 mt-1.5 break-words">{selectedBroadcast.type === 'WTB' ? 'Want to buy' : 'Want to sell'}</div>
                    ) : (
                      <Select value={type} onValueChange={(val: any) => setType(val)}>
                        <SelectTrigger className="h-9 mt-1.5 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WTB">Want to buy</SelectItem>
                          <SelectItem value="WTS">Want to sell</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Product Condition</div>
                    {!isEditing ? (
                      <div className="text-sm font-medium text-slate-900 mt-1.5 break-words">{selectedBroadcast.condition}</div>
                    ) : (
                      <Select value={condition} onValueChange={(val: any) => setCondition(val)}>
                        <SelectTrigger className="h-9 mt-1.5 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Used">Used</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Main Category</div>
                    {!isEditing ? (
                      <div className="text-sm font-medium text-slate-900 mt-1.5 break-words">{selectedBroadcast.mainCategory}</div>
                    ) : (
                      <Select
                        value={mainCat}
                        onValueChange={(val) => {
                          setMainCat(val);
                          const subList = SUB_CATEGORIES[val] || [];
                          setSubCat(subList[0] || '');
                        }}
                      >
                        <SelectTrigger className="h-9 mt-1.5 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {MAIN_CATEGORIES.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Sub Category</div>
                    {!isEditing ? (
                      <div className="text-sm font-medium text-slate-900 mt-1.5 break-words">{selectedBroadcast.subCategory}</div>
                    ) : (
                      <Select value={subCat} onValueChange={setSubCat}>
                        <SelectTrigger className="h-9 mt-1.5 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {availableSubCats.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-2">Message</div>
                  {!isEditing ? (
                    <div className="text-sm text-slate-900 border border-slate-200 bg-slate-50/60 rounded-lg p-3.5">
                      {selectedBroadcast.text}
                    </div>
                  ) : (
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={3}
                      className="resize-none bg-white text-sm border-slate-200"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Quantity</div>
                    {!isEditing ? (
                      <div className="text-sm font-medium text-slate-900 mt-1.5 break-words">{selectedBroadcast.qty} {selectedBroadcast.unit}</div>
                    ) : (
                      <Input
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        className="h-9 mt-1.5 bg-white text-sm"
                      />
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Price</div>
                    {!isEditing ? (
                      <div className="text-sm font-medium text-slate-900 mt-1.5 break-words">{selectedBroadcast.priceOption === 'Fixed' ? `$${selectedBroadcast.priceAmount}` : 'Quote'}</div>
                    ) : (
                      <Select value={priceOption} onValueChange={(val: any) => setPriceOption(val)}>
                        <SelectTrigger className="h-9 mt-1.5 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Quote">Quote</SelectItem>
                          <SelectItem value="Fixed">Fixed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Sending Option</div>
                    {!isEditing ? (
                      <div className="text-sm font-medium text-slate-900 mt-1.5 break-words">{selectedBroadcast.sendingOption}</div>
                    ) : (
                      <Select value={sendingOption} onValueChange={(val: any) => setSendingOption(val)}>
                        <SelectTrigger className="h-9 mt-1.5 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Send to All">Send to All</SelectItem>
                          <SelectItem value="Send to group">Send to group</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Audience</div>
                    {!isEditing ? (
                      <div className="text-sm font-medium text-slate-900 mt-1.5 break-words">{selectedBroadcast.audience}</div>
                    ) : (
                      <Select value={audience} onValueChange={setAudience}>
                        <SelectTrigger className="h-9 mt-1.5 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {AUDIENCES.map((a) => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    Submitted <span style={{ display: 'contents' }}>{relativeTime(selectedBroadcast.at)}</span> · <span style={{ display: 'contents' }}>{formatDate(selectedBroadcast.at)}</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Live
                  </span>
                </div>
              </div>

              <DialogFooter className="pb-6 px-6 pt-4 border-t border-slate-100 mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full sm:space-x-0">
                <Select onValueChange={handleActionChange}>
                  <SelectTrigger className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border shadow-sm hover:text-accent-foreground px-4 py-2 h-10 border-slate-200 hover:bg-slate-50 hover:border-slate-300 w-full sm:w-auto justify-between sm:justify-start">
                    <SelectValue placeholder="Other Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hide">Hide Broadcast</SelectItem>
                    <SelectItem value="reject" className="text-red-600 focus:text-red-600">Reject</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="outline"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-9 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleApprove}
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Approve
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
