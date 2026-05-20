'use client';

import { useState, useRef } from 'react';
import { Building2, Mail, Phone, Globe, FileText, Pencil, Check, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CompanyDetails {
  photo?: string;
  website?: string;
  email?: string;
  phone?: string;
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
          setForm((prev) => ({ ...prev, photo: event.target!.result as string }));
          toast.success('Logo uploaded successfully');
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper to determine if photo string is an image URL/data URL
  const isImage = (val?: string) => {
    if (!val) return false;
    return val.startsWith('http') || val.startsWith('/') || val.startsWith('data:');
  };

  return (
    <div
      data-testid="company-tab"
      className="bg-white border border-slate-200/80 rounded-xl shadow-sm"
    >
      <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-display text-lg font-semibold overflow-hidden shrink-0 border border-slate-200">
            {isImage(details.photo) ? (
              <img src={details.photo} alt={companyName} className="h-full w-full object-cover" />
            ) : (
              '?'
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
            <Row icon={Mail} label="Email" value={details.email} />
            <Row icon={Phone} label="Phone" value={details.phone} />
            <Row icon={Globe} label="Website" value={details.website} />
            <Row icon={FileText} label="GST No." value={details.gstNo} />
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
            {/* Branding / Logo Editor */}
            <div className="md:col-span-2 border-b border-slate-100 pb-5 mb-1">
              <Field label="Company Logo">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 mt-2">
                  <div className="h-16 w-16 rounded-xl bg-slate-900 text-white flex items-center justify-center font-display text-lg font-semibold overflow-hidden shrink-0 border border-slate-200/50 shadow-sm">
                    {isImage(form.photo) ? (
                      <img src={form.photo} alt="Logo preview" className="h-full w-full object-cover" />
                    ) : (
                      '?'
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 relative overflow-hidden"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-3.5 w-3.5 mr-2" />
                        Upload Image
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </Button>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-sm">
                      Upload an image file (SVG, PNG, JPG). Recommended size is 120x120px.
                    </p>
                  </div>
                </div>
              </Field>
            </div>

            <Field label="Company Name">
              <Input
                data-testid="company-name-input"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
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
            <Field label="Phone No.">
              <Input
                data-testid="company-phone-input"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
            <Field label="GST No.">
              <Input
                data-testid="company-gst-input"
                value={form.gstNo || ''}
                onChange={(e) => setForm({ ...form, gstNo: e.target.value })}
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
