'use client';

import { useState } from 'react';
import { Award, Plus, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatDate } from '@/lib/mockData';

// Import standard Button
import { Button as UIButton } from '@/components/ui/button';

interface StampRecord {
  id: string;
  serial: number;
  appliedDate: string;
  badges: string[];
  remark: string;
  verifiedBy: string;
}

interface StampTabProps {
  stamps: StampRecord[];
  setStamps: React.Dispatch<React.SetStateAction<StampRecord[]>>;
}

const AVAILABLE_BADGES = ['Identity', 'Email', 'Documents', 'Account'];

// Elegant SVG Stamp Seals as Data URLs
const STAMP_IMAGES: Record<string, string> = {
  Identity: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="20" r="18" fill="%23eff6ff" stroke="%232563eb" stroke-width="1.5"/><circle cx="20" cy="20" r="15" fill="none" stroke="%232563eb" stroke-width="0.5" stroke-dasharray="2,2"/><path d="M20 11a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-6 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="%232563eb" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M25 18l2 2 4-4" stroke="%2310b981" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  Email: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="20" r="18" fill="%23ecfdf5" stroke="%23059669" stroke-width="1.5"/><circle cx="20" cy="20" r="15" fill="none" stroke="%23059669" stroke-width="0.5" stroke-dasharray="2,2"/><rect x="12" y="14" width="16" height="12" rx="1.5" stroke="%23059669" stroke-width="1.5" fill="none"/><path d="M12 16l8 5 8-5" stroke="%23059669" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`,
  Documents: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="20" r="18" fill="%23fffbeb" stroke="%23d97706" stroke-width="1.5"/><circle cx="20" cy="20" r="15" fill="none" stroke="%23d97706" stroke-width="0.5" stroke-dasharray="2,2"/><path d="M14 12h9l5 5v11a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2v-14a2 2 0 0 1 2-2z" stroke="%23d97706" stroke-width="1.5" fill="none"/><path d="M23 12v5h5M16 20h8M16 24h6" stroke="%23d97706" stroke-width="1.5" fill="none"/></svg>`,
  Account: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="20" r="18" fill="%23faf5ff" stroke="%237c3aed" stroke-width="1.5"/><circle cx="20" cy="20" r="15" fill="none" stroke="%237c3aed" stroke-width="0.5" stroke-dasharray="2,2"/><path d="M20 11l7 3v6c0 4.3-3 8.3-7 9.5-4-1.2-7-5.2-7-9.5v-6l7-3z" stroke="%237c3aed" stroke-width="1.5" fill="none" stroke-linejoin="round"/></svg>`,
};

export function StampTab({ stamps, setStamps }: StampTabProps) {
  const [open, setOpen] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState<Record<string, boolean>>({
    Identity: false,
    Email: false,
    Documents: false,
    Account: false,
  });
  const [remark, setRemark] = useState('');

  const handleAddStamp = () => {
    const activeBadges = Object.entries(selectedBadges)
      .filter(([_, checked]) => checked)
      .map(([badgeName]) => badgeName);

    if (activeBadges.length === 0) {
      toast.error('Please select at least one verification badge.');
      return;
    }

    const newStamp: StampRecord = {
      id: `STMP-${Math.floor(Math.random() * 9000) + 1000}`,
      serial: stamps.length + 1,
      appliedDate: new Date().toISOString(),
      badges: activeBadges,
      remark: remark.trim() || 'Verified',
      verifiedBy: 'Jayesh Jain',
    };

    setStamps((prev) => [newStamp, ...prev]);
    toast.success('Verification stamp registered successfully!');

    // Reset Form
    setSelectedBadges({
      Identity: false,
      Email: false,
      Documents: false,
      Account: false,
    });
    setRemark('');
    setOpen(false);
  };

  const handleDeleteStamp = (id: string) => {
    setStamps((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      // Re-index serials
      return remaining.map((s, idx) => ({
        ...s,
        serial: remaining.length - idx,
      }));
    });
    toast.success('Verification stamp deleted.');
  };

  return (
    <div className="space-y-5" data-testid="stamp-tab">
      {/* Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4 bg-white">
          <div className="space-y-0.5">
            <h2 className="font-display text-xl font-semibold text-slate-900 tracking-tight">
              Verification Stamps History
            </h2>
            <p className="text-sm text-slate-500">
              Audit trail of credentials, checks, and certifications issued for this member.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg h-10 flex items-center justify-center">
              {stamps.length} Stamps
            </span>
            <UIButton
              data-testid="add-stamp-btn"
              onClick={() => setOpen(true)}
              className="h-10 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Stamp
            </UIButton>
          </div>
        </div>

        {/* High Density Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="stamp-table">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100">
                <th className="px-6 py-3 w-16">SR.NO</th>
                <th className="px-6 py-3">APPLIED DATE</th>
                <th className="px-6 py-3">BADGES APPLIED</th>
                <th className="px-6 py-3">REMARK / NOTE</th>
                <th className="px-6 py-3">VERIFIED BY</th>
                <th className="px-6 py-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stamps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No verification stamps registered. Click "Add Stamp" to record certification history.
                  </td>
                </tr>
              ) : (
                stamps.map((stamp) => (
                  <tr
                    key={stamp.id}
                    data-testid={`stamp-row-${stamp.id}`}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Serial Number */}
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-400">
                      #{stamp.serial}
                    </td>

                    {/* Applied Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                      {formatDate(stamp.appliedDate)}
                    </td>

                    {/* Badges Applied - Small Elegant Production Stamp Images */}
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-2.5">
                        {stamp.badges.map((b) => (
                          <div key={b} className="group relative cursor-help">
                            <img
                              src={STAMP_IMAGES[b]}
                              alt={b}
                              className="h-8 w-8 transition-transform duration-200 hover:scale-110 active:scale-95 shrink-0"
                            />
                            {/* Hover Tooltip */}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-md whitespace-nowrap z-10">
                              {b} Verified
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Remark / Note */}
                    <td className="px-6 py-4 text-slate-650 max-w-xs truncate">
                      {stamp.remark}
                    </td>

                    {/* Verified By */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                      {stamp.verifiedBy}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <UIButton
                        variant="ghost"
                        size="icon"
                        data-testid={`delete-stamp-${stamp.id}`}
                        onClick={() => handleDeleteStamp(stamp.id)}
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </UIButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stamp Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="add-stamp-dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Award className="h-5 w-5 text-slate-950" />
              Add Verification Stamp
            </DialogTitle>
            <DialogDescription>
              Select the credentials verified during this check and append custom notes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Badges Checklist */}
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Verification Badges
              </Label>
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                {AVAILABLE_BADGES.map((b) => (
                  <div key={b} className="flex items-center justify-between p-1.5 rounded bg-white border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`badge-check-${b}`}
                        data-testid={`badge-check-${b}`}
                        checked={selectedBadges[b]}
                        onCheckedChange={(checked) =>
                          setSelectedBadges((prev) => ({ ...prev, [b]: !!checked }))
                        }
                        className="h-4 w-4 border-slate-350"
                      />
                      <label
                        htmlFor={`badge-check-${b}`}
                        className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
                      >
                        {b}
                      </label>
                    </div>
                    <img
                      src={STAMP_IMAGES[b]}
                      alt={b}
                      className="h-6 w-6 opacity-85 shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Remark TextArea */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stamp-remark" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Remark / Note
              </Label>
              <Textarea
                id="stamp-remark"
                data-testid="stamp-remark"
                placeholder="Enter notes, verification details, e.g., verified incorporation docs."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="min-h-24 text-xs resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <UIButton
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-9 px-4 text-xs font-semibold"
              >
                Cancel
              </UIButton>
              <UIButton
                onClick={handleAddStamp}
                className="h-9 px-4 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
              >
                Add Stamp
              </UIButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
