'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  Layers,
  AlertTriangle,
  Check,
  X,
  PlusCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { FilterSelect } from '@/components/dashboard/FilterSelect';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { toast } from 'sonner';

interface FeaturePrivilege {
  key: string;
  type: 'yes' | 'no' | 'value';
  value: string;
}

interface MembershipLabel {
  id: string;
  labelName: string;
  hexColor: string;
  planName: string;
  planRate: string;
  duration: string;
  status: 'active' | 'inactive';
  features: FeaturePrivilege[];
}



export default function MembershipLabelPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [labels, setLabels] = useState<MembershipLabel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanRate, setNewPlanRate] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newHexColor, setNewHexColor] = useState('#e2e8f0');
  const [newFeatures, setNewFeatures] = useState<FeaturePrivilege[]>([
    { key: 'Daily Broadcast', type: 'value', value: '5' },
    { key: 'Send to all', type: 'no', value: '' },
    { key: 'Send within State', type: 'yes', value: '' }
  ]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editLabelName, setEditLabelName] = useState('');
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanRate, setEditPlanRate] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editHexColor, setEditHexColor] = useState('#e2e8f0');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');
  const [editFeatures, setEditFeatures] = useState<FeaturePrivilege[]>([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingLabel, setDeletingLabel] = useState<MembershipLabel | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const fetchLabels = async () => {
      try {
        const response = await fetch('/api/membership-labels');
        if (response.ok) {
          const data = await response.json();
          setLabels(data);
        }
      } catch (error) {
        console.error('Failed to fetch membership labels:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLabels();
  }, []);

  const isHexValid = (color: string) => {
    return /^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/.test(color);
  };

  const addFeatureRow = (isEdit: boolean) => {
    const emptyRow: FeaturePrivilege = { key: '', type: 'yes', value: '' };
    if (isEdit) {
      setEditFeatures([...editFeatures, emptyRow]);
    } else {
      setNewFeatures([...newFeatures, emptyRow]);
    }
  };

  const removeFeatureRow = (index: number, isEdit: boolean) => {
    if (isEdit) {
      setEditFeatures(editFeatures.filter((_, idx) => idx !== index));
    } else {
      setNewFeatures(newFeatures.filter((_, idx) => idx !== index));
    }
  };

  const updateFeatureRow = (index: number, field: keyof FeaturePrivilege, val: string, isEdit: boolean) => {
    const list = isEdit ? editFeatures : newFeatures;
    const updated = list.map((item, idx) => {
      if (idx === index) {
        const updatedItem = { ...item, [field]: val };
        if (field === 'type' && val !== 'value') {
          updatedItem.value = '';
        }
        return updatedItem;
      }
      return item;
    });

    if (isEdit) setEditFeatures(updated);
    else setNewFeatures(updated);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLabelName.trim()) { toast.error('Label Name is required'); return; }
    if (!newPlanName.trim()) { toast.error('Plan Name is required'); return; }
    if (!newPlanRate.trim()) { toast.error('Plan Rate is required'); return; }
    if (!newDuration.trim()) { toast.error('Duration is required'); return; }

    const hexCode = isHexValid(newHexColor) ? newHexColor : '#e2e8f0';

    try {
      const response = await fetch('/api/membership-labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labelName: newLabelName.trim(),
          hexColor: hexCode,
          planName: newPlanName.trim(),
          planRate: newPlanRate.trim(),
          duration: newDuration.trim(),
          status: 'active',
          features: newFeatures.filter(f => f.key.trim() !== '')
        })
      });
      const createdLabel = await response.json();
      
      setLabels([createdLabel, ...labels]);
      toast.success(`Label "${createdLabel.labelName}" created successfully`);

      setNewLabelName('');
      setNewPlanName('');
      setNewPlanRate('');
      setNewDuration('');
      setNewHexColor('#e2e8f0');
      setNewFeatures([
        { key: 'Daily Broadcast', type: 'value', value: '5' },
        { key: 'Send to all', type: 'no', value: '' },
        { key: 'Send within State', type: 'yes', value: '' }
      ]);
      setCreateDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create label');
    }
  };

  const triggerEdit = (lbl: MembershipLabel) => {
    setEditingLabelId(lbl.id);
    setEditLabelName(lbl.labelName);
    setEditPlanName(lbl.planName);
    setEditPlanRate(lbl.planRate);
    setEditDuration(lbl.duration);
    setEditHexColor(lbl.hexColor);
    setEditStatus(lbl.status);
    setEditFeatures([...lbl.features]);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLabelId) return;

    if (!editLabelName.trim()) { toast.error('Label Name is required'); return; }
    if (!editPlanName.trim()) { toast.error('Plan Name is required'); return; }
    if (!editPlanRate.trim()) { toast.error('Plan Rate is required'); return; }
    if (!editDuration.trim()) { toast.error('Duration is required'); return; }

    const hexCode = isHexValid(editHexColor) ? editHexColor : '#e2e8f0';

    try {
      const response = await fetch(`/api/membership-labels/${editingLabelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labelName: editLabelName.trim(),
          hexColor: hexCode,
          planName: editPlanName.trim(),
          planRate: editPlanRate.trim(),
          duration: editDuration.trim(),
          status: editStatus,
          features: editFeatures.filter(f => f.key.trim() !== '')
        })
      });
      const updatedLabel = await response.json();

      setLabels(labels.map(l => l.id === editingLabelId ? updatedLabel : l));
      toast.success('Label settings saved successfully');
      setEditDialogOpen(false);
      setEditingLabelId(null);
    } catch (error) {
      toast.error('Failed to update label');
    }
  };

  const handleDelete = async () => {
    if (!deletingLabel) return;
    try {
      await fetch(`/api/membership-labels/${deletingLabel.id}`, { method: 'DELETE' });
      setLabels(labels.filter(l => l.id !== deletingLabel.id));
      toast.success(`Label "${deletingLabel.labelName}" deleted successfully`);
      setDeleteDialogOpen(false);
      setDeletingLabel(null);
    } catch (error) {
      toast.error('Failed to delete label');
    }
  };

  const filteredLabels = useMemo(() => {
    return labels.filter((lbl) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        lbl.labelName.toLowerCase().includes(query) ||
        lbl.planName.toLowerCase().includes(query) ||
        lbl.planRate.toLowerCase().includes(query) ||
        lbl.duration.toLowerCase().includes(query) ||
        lbl.id.includes(query);

      const matchesStatus =
        statusFilter === 'All statuses' ||
        (statusFilter === 'Active' && lbl.status === 'active') ||
        (statusFilter === 'Inactive' && lbl.status === 'inactive');

      return matchesSearch && matchesStatus;
    });
  }, [labels, searchQuery, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: labels.length,
      active: labels.filter(l => l.status === 'active').length,
      inactive: labels.filter(l => l.status === 'inactive').length
    };
  }, [labels]);

  const statusOptions = ['All statuses', 'Active', 'Inactive'];

  if (!isMounted) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 lg:p-10 flex items-center justify-center min-h-[50vh]">
          <p className="text-slate-500 font-medium animate-pulse">Loading App Labels...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div data-testid="membership-labels-page" className="p-6 md:p-8 lg:p-10 space-y-0">
        
        <div className="mb-5">
          <Header
            title="App Membership Label"
            subtitle="Administer system membership labels, linked plans, validity parameters, and dynamic feature privileges."
          />
        </div>

        <div 
          className="p-4 border bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
          style={{ borderColor: '#E5E7EB', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', borderBottomWidth: '0' }}
        >
          <SearchBar
            placeholder="Search by label name, validity, price..."
            onSearch={setSearchQuery}
          />
          
          <FilterSelect
            label="All statuses"
            options={statusOptions}
            defaultValue={statusFilter}
            onChange={setStatusFilter}
            showFilterIcon={true}
          />

          <Button
            onClick={() => setCreateDialogOpen(true)}
            data-testid="add-label-btn"
            className="h-10 bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all duration-150 shrink-0 shadow-sm rounded-md flex items-center gap-2 cursor-pointer px-4 text-xs sm:ml-auto"
          >
            <Plus className="h-4 w-4" />
            Add New Label
          </Button>
        </div>

        <div
          className="bg-white border overflow-hidden"
          style={{ borderColor: '#E5E7EB', borderTopLeftRadius: '0', borderTopRightRadius: '0', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}
        >
          <table className="w-full">
            <thead className="bg-white border-b" style={{ borderColor: '#EEF2F6' }}>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                <th className="px-6 py-3.5 font-semibold w-20 text-center whitespace-nowrap">SR.NO</th>
                <th className="px-6 py-3.5 font-semibold">LABEL NAME</th>
                <th className="px-6 py-3.5 font-semibold">PLAN NAME</th>
                <th className="px-6 py-3.5 font-semibold">PLAN RATE</th>
                <th className="px-6 py-3.5 font-semibold">PLAN VALIDITY</th>
                <th className="px-6 py-3.5 font-semibold">STATUS</th>
                <th className="px-6 py-3.5 font-semibold text-center w-28">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    Loading membership labels...
                  </td>
                </tr>
              ) : filteredLabels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    No membership labels found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLabels.map((lbl, index) => {
                  return (
                    <tr
                      key={lbl.id}
                      data-testid={`label-row-${lbl.id}`}
                      className="border-b hover:bg-slate-50/70 transition-colors bg-white"
                      style={{ borderColor: '#F1F5F9' }}
                    >
                      <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs font-semibold">
                        {lbl.id}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: lbl.hexColor }}
                          />
                          <span className="text-[13px] font-semibold text-slate-900 whitespace-nowrap">
                            {lbl.labelName}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                        {lbl.planName}
                      </td>

                      <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                        {lbl.planRate}
                      </td>

                      <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                        {lbl.duration}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={lbl.status} />
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Button
                          onClick={() => triggerEdit(lbl)}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-md cursor-pointer bg-white"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>


        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[100]">
            <DialogHeader>
              <DialogTitle className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <Tag className="h-5 w-5 text-slate-500" />
                Add New Membership Label
              </DialogTitle>
              <DialogDescription className="text-slate-550 text-xs">
                Build a new system label, link standard plan billing metrics, and customize feature allowances.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateSubmit} className="space-y-5 py-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="create-label-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Label Name</Label>
                  <Input id="create-label-name" placeholder="e.g. TK lite" value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="create-plan-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Linked Plan Name</Label>
                  <Input id="create-plan-name" placeholder="e.g. Tk-Lite" value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="create-plan-rate" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Plan Rate</Label>
                  <Input id="create-plan-rate" placeholder="e.g. Free Trial or 1000" value={newPlanRate} onChange={(e) => setNewPlanRate(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="create-duration" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Duration</Label>
                  <Input id="create-duration" placeholder="e.g. 15 Days or 3 months" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label htmlFor="create-hex" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hex Color Code</Label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-full border border-slate-250 shadow-xs shrink-0 transition-all duration-150"
                      style={{ backgroundColor: isHexValid(newHexColor) ? newHexColor : '#e2e8f0' }}
                    />
                    <Input id="create-hex" placeholder="e.g. #4880FF" value={newHexColor} onChange={(e) => setNewHexColor(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white font-mono animate-none flex-1" required />
                  </div>
                  <p className="text-[10px] text-slate-450">Color circle preview dynamically updates if valid format starts with #.</p>
                </div>

              </div>

              <div className="pt-4 border-t border-dashed border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-450 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> Form Dynamic Feature Privileges Grid
                  </h4>
                  <Button type="button" variant="outline" size="sm" onClick={() => addFeatureRow(false)} className="h-8 text-[11px] border-slate-200 text-slate-850 bg-white hover:bg-slate-50 cursor-pointer">
                    <Plus className="h-3 w-3 mr-1" /> Add Feature Row
                  </Button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {newFeatures.length === 0 ? (
                    <p className="text-center py-4 text-xs text-slate-400">No feature privileges defined. Click Add Row.</p>
                  ) : (
                    newFeatures.map((feat, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg border border-slate-100 bg-slate-50/50">
                        <div className="col-span-5">
                          <Input placeholder="Feature Privilege Text (e.g. Daily Broadcast)" value={feat.key} onChange={(e) => updateFeatureRow(index, 'key', e.target.value, false)} className="h-9 bg-white text-xs border-slate-200 animate-none" required />
                        </div>
                        <div className="col-span-3">
                          <Select value={feat.type} onValueChange={(val: any) => updateFeatureRow(index, 'type', val, false)}>
                            <SelectTrigger className="h-9 bg-white text-xs border-slate-200"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white border border-slate-200 z-[120]">
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                              <SelectItem value="value">Value</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          {feat.type === 'yes' && (
                            <span className="h-9 w-9 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto" title="Checkmark (Yes)">
                              <Check className="h-4.5 w-4.5 stroke-[3.5]" />
                            </span>
                          )}
                          {feat.type === 'no' && (
                            <span className="h-9 w-9 rounded-md bg-red-50 border border-red-100 text-red-550 flex items-center justify-center mx-auto" title="Red Cross (No)">
                              <X className="h-4.5 w-4.5 stroke-[3.5]" />
                            </span>
                          )}
                          {feat.type === 'value' && (
                            <Input placeholder="Limit (e.g. 5)" value={feat.value} onChange={(e) => updateFeatureRow(index, 'value', e.target.value, false)} className="h-9 bg-white text-xs border-slate-250 animate-none text-center font-mono font-bold" required />
                          )}
                        </div>
                        <div className="col-span-1 text-center">
                          <Button type="button" variant="outline" size="icon" onClick={() => removeFeatureRow(index, false)} className="h-9 w-9 border-slate-200 text-red-650 hover:text-red-750 hover:bg-red-50 cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} className="h-10 text-xs font-semibold hover:bg-slate-50 cursor-pointer">Cancel</Button>
                <Button type="submit" className="h-10 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer">Save Label</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[100]">
            <DialogHeader>
              <DialogTitle className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-slate-550" />
                Edit Membership Label Settings
              </DialogTitle>
              <DialogDescription className="text-slate-550 text-xs">
                Update linked metadata, custom branding colors, and dynamic privilege rules.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-5 py-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-label-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Label Name</Label>
                  <Input id="edit-label-name" value={editLabelName} onChange={(e) => setEditLabelName(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-plan-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Linked Plan Name</Label>
                  <Input id="edit-plan-name" value={editPlanName} onChange={(e) => setEditPlanName(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-plan-rate" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Plan Rate</Label>
                  <Input id="edit-plan-rate" value={editPlanRate} onChange={(e) => setEditPlanRate(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-duration" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Duration</Label>
                  <Input id="edit-duration" value={editDuration} onChange={(e) => setEditDuration(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label htmlFor="edit-hex" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hex Color Code</Label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-full border border-slate-250 shadow-xs shrink-0 transition-all duration-150"
                      style={{ backgroundColor: isHexValid(editHexColor) ? editHexColor : '#e2e8f0' }}
                    />
                    <Input id="edit-hex" value={editHexColor} onChange={(e) => setEditHexColor(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white font-mono animate-none flex-1" required />
                  </div>
                  <p className="text-[10px] text-slate-450">Color circle preview dynamically updates if valid format starts with #.</p>
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status</Label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-xs text-slate-800 font-semibold cursor-pointer select-none">
                      <input type="radio" name="edit-status" checked={editStatus === 'active'} onChange={() => setEditStatus('active')} className="h-4 w-4 accent-slate-900 cursor-pointer" />
                      Active
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-800 font-semibold cursor-pointer select-none">
                      <input type="radio" name="edit-status" checked={editStatus === 'inactive'} onChange={() => setEditStatus('inactive')} className="h-4 w-4 accent-slate-900 cursor-pointer" />
                      Inactive
                    </label>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-dashed border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-450 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> Form Dynamic Feature Privileges Grid
                  </h4>
                  <Button type="button" variant="outline" size="sm" onClick={() => addFeatureRow(true)} className="h-8 text-[11px] border-slate-200 text-slate-850 bg-white hover:bg-slate-50 cursor-pointer">
                    <Plus className="h-3 w-3 mr-1" /> Add Feature Row
                  </Button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {editFeatures.length === 0 ? (
                    <p className="text-center py-4 text-xs text-slate-400">No feature privileges defined. Click Add Row.</p>
                  ) : (
                    editFeatures.map((feat, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg border border-slate-100 bg-slate-50/50">
                        <div className="col-span-5">
                          <Input placeholder="Feature Name" value={feat.key} onChange={(e) => updateFeatureRow(index, 'key', e.target.value, true)} className="h-9 bg-white text-xs border-slate-200 animate-none" required />
                        </div>
                        <div className="col-span-3">
                          <Select value={feat.type} onValueChange={(val: any) => updateFeatureRow(index, 'type', val, true)}>
                            <SelectTrigger className="h-9 bg-white text-xs border-slate-200"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white border border-slate-200 z-[120]">
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                              <SelectItem value="value">Value</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          {feat.type === 'yes' && (
                            <span className="h-9 w-9 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                              <Check className="h-4.5 w-4.5 stroke-[3.5]" />
                            </span>
                          )}
                          {feat.type === 'no' && (
                            <span className="h-9 w-9 rounded-md bg-red-50 border border-red-100 text-red-550 flex items-center justify-center mx-auto">
                              <X className="h-4.5 w-4.5 stroke-[3.5]" />
                            </span>
                          )}
                          {feat.type === 'value' && (
                            <Input placeholder="Limit (e.g. 5)" value={feat.value} onChange={(e) => updateFeatureRow(index, 'value', e.target.value, true)} className="h-9 bg-white text-xs border-slate-250 animate-none text-center font-mono font-bold" required />
                          )}
                        </div>
                        <div className="col-span-1 text-center">
                          <Button type="button" variant="outline" size="icon" onClick={() => removeFeatureRow(index, true)} className="h-9 w-9 border-slate-200 text-red-650 hover:text-red-750 hover:bg-red-50 cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="h-10 text-xs font-semibold hover:bg-slate-50 cursor-pointer">Cancel</Button>
                <Button type="submit" className="h-10 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[150]">
            <DialogHeader>
              <DialogTitle className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-655" /> Delete Membership Label?
              </DialogTitle>
              <DialogDescription className="text-slate-550 text-xs mt-1">
                Are you absolutely sure you want to delete label <span className="font-semibold text-slate-850">"{deletingLabel ? deletingLabel.labelName : ''}"</span>? This action is permanent.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeletingLabel(null); }} className="h-9 text-xs font-semibold hover:bg-slate-50 cursor-pointer">Cancel</Button>
              <Button type="button" onClick={handleDelete} className="h-9 text-xs font-semibold bg-red-650 hover:bg-red-700 text-white cursor-pointer">Delete Label</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
