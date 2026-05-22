'use client';

import { useState } from 'react';
import { Plus, Pencil, MapPin, Home, Briefcase, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ADDRESS_TITLES } from '@/lib/constants';
import { toast } from 'sonner';

const MAX_ADDRESSES = 3;

interface Address {
  id: string;
  title: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  isDefault?: boolean;
}

interface AddressTabProps {
  addresses: Address[];
  onChange: (addresses: Address[]) => void;
}

const emptyAddress: Omit<Address, 'id'> = {
  title: 'work',
  line1: '',
  line2: '',
  city: '',
  state: '',
  country: 'in',
  pinCode: '',
  isDefault: false,
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-2">
    <Label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </Label>
    {children}
  </div>
);

const titleLabel = (id: string) => ADDRESS_TITLES.find((t) => t.id === id)?.label || id;

// Logic to ensure there is always a default address
const hasAnyDefault = (list: Address[]) => list.some((a) => a.isDefault);
const withDefaultFallback = (list: Address[]) =>
  hasAnyDefault(list) ? list : list.map((a, i) => ({ ...a, isDefault: i === 0 }));

export function AddressTab({ addresses: rawAddresses = [], onChange }: AddressTabProps) {
  const addresses = withDefaultFallback(rawAddresses);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Address, 'id'> & { isDefault?: boolean }>({ ...emptyAddress });

  const openAdd = () => {
    if (addresses.length >= MAX_ADDRESSES) return;
    setEditingId(null);
    setForm({ ...emptyAddress, isDefault: addresses.length === 0 });
    setOpen(true);
  };

  const openEdit = (a: Address) => {
    setEditingId(a.id);
    setForm({ ...a });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.line1.trim()) {
      toast.error('Address Line 1 is required');
      return;
    }
    if (!form.city.trim() || !form.pinCode.trim()) {
      toast.error('City and pin code are required');
      return;
    }

    if (editingId) {
      let updated = addresses.map((a) => (a.id === editingId ? { ...form, id: editingId } : a));
      
      // If this one became Default, demote others
      if (form.isDefault) {
        updated = updated.map((a) =>
          a.id === editingId ? a : { ...a, isDefault: false }
        );
      } else if (!updated.some((a) => a.isDefault)) {
        // Always keep at least one Default — fallback to first
        updated = updated.map((a, i) => ({ ...a, isDefault: i === 0 }));
      }
      
      onChange(updated);
      toast.success('Address updated');
    } else {
      const isFirst = addresses.length === 0;
      const newAddress: Address = { 
        ...form, 
        id: `a${Date.now()}`, 
        isDefault: !!form.isDefault || isFirst 
      };
      
      let next = [...addresses, newAddress];
      if (newAddress.isDefault) {
        next = next.map((a) =>
          a.id === newAddress.id ? a : { ...a, isDefault: false }
        );
      }
      onChange(next);
      toast.success('Address added');
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    let next = addresses.filter((a) => a.id !== id);
    if (next.length && !next.some((a) => a.isDefault)) {
      next = next.map((a, i) => ({ ...a, isDefault: i === 0 }));
    }
    onChange(next);
    toast.success('Address removed');
  };

  const handleMarkAsDefault = (id: string) => {
    const next = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    onChange(next);
    toast.success('Marked as Default Address');
  };

  return (
    <div data-testid="address-tab" className="space-y-5">
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900 tracking-tight">
              Addresses
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {addresses.length} of {MAX_ADDRESSES} addresses ·{' '}
              {MAX_ADDRESSES - addresses.length} slot
              {MAX_ADDRESSES - addresses.length === 1 ? '' : 's'} remaining
            </p>
          </div>
          <Button
            data-testid="add-address-btn"
            onClick={openAdd}
            disabled={addresses.length >= MAX_ADDRESSES}
            className="h-10 bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-100 disabled:text-slate-400"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.length === 0 ? (
            <div
              data-testid="address-empty"
              className="md:col-span-2 text-sm text-slate-500 text-center py-10 border border-dashed border-slate-200 rounded-lg"
            >
              No addresses yet. Add one to get started.
            </div>
          ) : (
            addresses.map((a) => {
              // Determine Icon
              const Icon = a.title === 'home' ? Home : (a.title === 'company' || a.title === 'work' ? Briefcase : MapPin);
              
              // Determine Colour based on title (matching frontend folder design)
              let iconColorClass = 'bg-slate-50 text-slate-600 border-slate-100';
              if (a.title === 'home') {
                iconColorClass = 'bg-violet-50 text-violet-600 border-violet-100';
              } else if (a.title === 'company' || a.title === 'work') {
                iconColorClass = 'bg-blue-50 text-blue-600 border-blue-100';
              }

              return (
                <div
                  key={a.id}
                  data-testid={`address-card-${a.id}`}
                  className={`group border rounded-xl p-5 hover:shadow-sm transition-all ${
                    a.isDefault
                      ? 'border-blue-200 bg-blue-50/10'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border ${iconColorClass}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-slate-100 text-slate-700 border-slate-200">
                          {titleLabel(a.title)}
                        </span>
                        {a.isDefault && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-900 mt-1.5 leading-relaxed">
                        {a.line1}
                        {a.line2 ? <>, {a.line2}</> : null}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {a.city} · {a.pinCode}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-slate-600">
                    <div>
                      {!a.isDefault && (
                        <button
                          type="button"
                          data-testid={`address-mark-default-${a.id}`}
                          onClick={() => handleMarkAsDefault(a.id)}
                          className="text-xs font-medium text-blue-700 hover:text-blue-800 px-2.5 py-1.5 rounded-md hover:bg-blue-50 transition-colors inline-flex items-center gap-1.5"
                        >
                          <Star className="h-3 w-3" />
                          Mark as Default
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        data-testid={`address-delete-${a.id}`}
                        onClick={() => handleDelete(a.id)}
                        className="text-xs font-medium text-slate-500 hover:text-red-600 px-2.5 py-1.5 rounded-md hover:bg-red-50 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                      <button
                        type="button"
                        data-testid={`address-edit-${a.id}`}
                        onClick={() => openEdit(a)}
                        className="text-xs font-medium text-slate-900 border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 px-2.5 py-1.5 rounded-md transition-all inline-flex items-center gap-1.5"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="address-dialog" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              {editingId ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the address details below.'
                : `Add up to ${MAX_ADDRESSES} addresses for this member.`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="Address Title">
                <Select
                  value={form.title}
                  onValueChange={(v) => setForm({ ...form, title: v })}
                >
                  <SelectTrigger data-testid="address-title-select" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADDRESS_TITLES.map((t) => (
                      <SelectItem
                        key={t.id}
                        value={t.id}
                        data-testid={`address-title-${t.id}`}
                      >
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Address Line 1">
                <Input
                  data-testid="address-line1"
                  value={form.line1}
                  onChange={(e) => setForm({ ...form, line1: e.target.value })}
                  className="h-11"
                  placeholder="Street address, building, plot…"
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Address Line 2">
                <Input
                  data-testid="address-line2"
                  value={form.line2 || ''}
                  onChange={(e) => setForm({ ...form, line2: e.target.value })}
                  className="h-11"
                  placeholder="Apartment, suite, landmark (optional)"
                />
              </Field>
            </div>

            <Field label="City">
              <Input
                data-testid="address-city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="h-11"
                placeholder="e.g. Chennai"
              />
            </Field>

            <Field label="Pincode">
              <Input
                data-testid="address-pincode"
                value={form.pinCode}
                onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
                className="h-11"
                placeholder="e.g. 600058"
              />
            </Field>

            <div className="md:col-span-2 mt-2">
              {form.isDefault ? (
                <div
                  data-testid="dialog-default-address-badge"
                  className="flex items-center justify-between p-3.5 rounded-lg border border-blue-200 bg-blue-50/60"
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-600 fill-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <Label className="text-sm font-medium text-blue-900">
                        Default Address
                      </Label>
                      <p className="text-xs text-blue-700/80 mt-0.5">
                        This is the primary address for the member.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  data-testid="dialog-mark-as-default"
                  variant="outline"
                  onClick={() => setForm({ ...form, isDefault: true })}
                  className="w-full h-11 border-dashed border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Mark as Default Address
                </Button>
              )}
            </div>
          </div>

          <DialogFooter className="mt-3">
            <Button
              data-testid="address-dialog-cancel"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-testid="address-dialog-save"
              onClick={handleSave}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {editingId ? 'Update' : 'Save Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}