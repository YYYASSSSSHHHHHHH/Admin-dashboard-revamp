'use client';

import { useMemo, useState } from 'react';
import { Plus, Pencil, MapPin, Home, Briefcase, Trash2 } from 'lucide-react';
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
import { ADDRESS_TITLES, COUNTRIES, STATES_BY_COUNTRY } from '@/lib/mockData';
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
const countryLabel = (id: string) => COUNTRIES.find((c) => c.id === id)?.label || id;

export function AddressTab({ addresses, onChange }: AddressTabProps) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Address, 'id'>>({ ...emptyAddress });

  const availableStates = useMemo(
    () => STATES_BY_COUNTRY[form.country] || [],
    [form.country]
  );

  const openAdd = () => {
    if (addresses.length >= MAX_ADDRESSES) return;
    setEditingId(null);
    setForm(emptyAddress);
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
    if (!form.city.trim() || !form.state || !form.pinCode.trim()) {
      toast.error('City, state, and pin code are required');
      return;
    }
    if (editingId) {
      onChange(addresses.map((a) => (a.id === editingId ? { ...form, id: editingId } : a)));
      toast.success('Address updated');
    } else {
      onChange([...addresses, { ...form, id: `a${Date.now()}` }]);
      toast.success('Address added');
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    onChange(addresses.filter((a) => a.id !== id));
    toast.success('Address removed');
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
              const Icon = a.title === 'home' ? Home : Briefcase;
              return (
                <div
                  key={a.id}
                  data-testid={`address-card-${a.id}`}
                  className="group border border-slate-200/80 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                        a.title === 'home'
                          ? 'bg-violet-50 text-violet-600 border border-violet-100'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-slate-100 text-slate-700 border-slate-200">
                          {titleLabel(a.title)}
                        </span>
                      </div>
                      <div className="text-sm text-slate-900 mt-1.5 leading-relaxed">
                        {a.line1}
                        {a.line2 ? <>, {a.line2}</> : null}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {a.city}, {a.state} · {countryLabel(a.country)} · {a.pinCode}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-slate-600">
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

            <Field label="Country">
              <Select
                value={form.country}
                onValueChange={(v) => setForm({ ...form, country: v, state: '' })}
              >
                <SelectTrigger data-testid="address-country-select" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem
                      key={c.id}
                      value={c.id}
                      data-testid={`address-country-${c.id}`}
                    >
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="State">
              <Select
                value={form.state}
                onValueChange={(v) => setForm({ ...form, state: v })}
              >
                <SelectTrigger data-testid="address-state-select" className="h-11">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {availableStates.map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                      data-testid={`address-state-${s.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="City">
              <Input
                data-testid="address-city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="h-11"
                placeholder="e.g. Mumbai"
              />
            </Field>

            <Field label="Pin Code">
              <Input
                data-testid="address-pincode"
                value={form.pinCode}
                onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
                className="h-11"
                placeholder="e.g. 400052"
              />
            </Field>
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
              {editingId ? 'Update Address' : 'Save Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
