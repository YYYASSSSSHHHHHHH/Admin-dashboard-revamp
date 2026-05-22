'use client';

import { useState, useRef } from 'react';
import { Building2, Mail, Phone, Globe, FileText, Pencil, Check, X, UserPen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CompanyDetails {
  photo?: string;
  website?: string;
  email?: string;
  contactNo1?: string;
  contactNo2?: string;
  gstNo?: string;
  aboutUs?: string;
}

interface CompanyTabProps {
  companyName: string;
  details: CompanyDetails;
  onSave: (form: { companyName: string } & CompanyDetails) => void;
}

const Row = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | undefined }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-slate-500" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="text-sm text-slate-900 mt-0.5 break-words">
        {value || <span className="text-slate-400">—</span>}
      </div>
    </div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-2">
    <Label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </Label>
    {children}
  </div>
);

export function CompanyTab({ companyName, details, onSave }: CompanyTabProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ companyName, ...details });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave(form);
    setEditing(false);
    toast.success('Company details updated');
  };

  const handleCancel = () => {
    setForm({ companyName, ...details });
    setEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          setForm((prev) => ({ ...prev, photo: base64 }));
          if (editing) {
            toast.success('Logo updated (click Save to apply all changes)');
          } else {
            onSave({ companyName, ...details, photo: base64 });
            toast.success('Logo uploaded successfully');
          }
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImage = (val?: string) => {
    if (!val) return false;
    return val.startsWith('http') || val.startsWith('/') || val.startsWith('data:');
  };

  return (
    <div
      data-testid="company-tab"
      className="bg-white border border-slate-200/80 rounded-xl shadow-sm"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div
            onClick={() => {
              fileInputRef.current?.click();
            }}
            className="h-14 w-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-display text-lg font-semibold overflow-hidden shrink-0 border border-slate-200 relative cursor-pointer hover:bg-slate-800 transition-colors group"
          >
            {isImage(editing ? form.photo : details.photo) ? (
              <>
                <img
                  src={editing ? form.photo : details.photo}
                  alt={companyName}
                  className="h-full w-full object-cover"
                />
                <div
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity duration-200 ${
                    editing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <UserPen className="h-6 w-6" />
                </div>
              </>
            ) : (
              <UserPen className="h-6 w-6" />
            )}
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900 tracking-tight">
              {companyName}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{details.website || '—'}</p>
          </div>
        </div>
        {!editing ? (
          <Button
            data-testid="company-edit-btn"
            variant="outline"
            onClick={() => setEditing(true)}
            className="h-9"
          >
            <Pencil className="h-3.5 w-3.5 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              data-testid="company-cancel-btn"
              variant="outline"
              onClick={handleCancel}
              className="h-9"
            >
              <X className="h-3.5 w-3.5 mr-2" />
              Cancel
            </Button>
            <Button
              data-testid="company-save-btn"
              onClick={handleSave}
              className="h-9 bg-slate-900 hover:bg-slate-800 text-white"
            >
              <Check className="h-3.5 w-3.5 mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="p-6">
        {!editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8">
            <Row icon={Building2} label="Company Name" value={companyName} />
            <Row icon={FileText} label="GST No." value={details.gstNo} />
            <Row icon={Mail} label="Email" value={details.email} />
            <Row icon={Globe} label="Website" value={details.website} />
            <Row icon={Phone} label="Phone No. 1" value={details.contactNo1} />
            <Row icon={Phone} label="Phone No. 2" value={details.contactNo2} />
            <div className="md:col-span-2 pt-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
                About Us
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {details.aboutUs || <span className="text-slate-400">No description provided.</span>}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Company Name">
              <Input
                data-testid="company-name-input"
                value={form.companyName || ''}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="h-11"
              />
            </Field>
            <Field label="GST No.">
              <Input
                data-testid="company-gst-input"
                value={form.gstNo || ''}
                onChange={(e) => setForm({ ...form, gstNo: e.target.value })}
                className="h-11"
              />
            </Field>
            <Field label="Email">
              <Input
                data-testid="company-email-input"
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-11"
              />
            </Field>
            <Field label="Website">
              <Input
                data-testid="company-website-input"
                value={form.website || ''}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="h-11"
              />
            </Field>
            <Field label="Phone No. 1">
              <Input
                data-testid="company-contact1-input"
                value={form.contactNo1 || ''}
                onChange={(e) => setForm({ ...form, contactNo1: e.target.value })}
                className="h-11"
              />
            </Field>
            <Field label="Phone No. 2">
              <Input
                data-testid="company-contact2-input"
                value={form.contactNo2 || ''}
                onChange={(e) => setForm({ ...form, contactNo2: e.target.value })}
                className="h-11"
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="About Us">
                <Textarea
                  data-testid="company-about-input"
                  value={form.aboutUs || ''}
                  onChange={(e) => setForm({ ...form, aboutUs: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </Field>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

