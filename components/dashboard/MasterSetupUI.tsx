'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type SetupItem = {
  id: string;
  name: string;
  status?: string;
  updatedOn?: string;
};

const formatSetupDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

export function SetupStatusBadge({ status }: { status: string }) {
  const isActive = status === 'Active';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-slate-100 text-slate-600 border-slate-200'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {status}
    </span>
  );
}

export function SetupSection({
  testidPrefix,
  itemLabel,
  items,
  isLoading,
  showStatus = true,
  showUpdatedOn = true,
  onAdd,
  onEdit,
  onDelete,
}: {
  testidPrefix: string;
  itemLabel: string;
  items: SetupItem[];
  isLoading?: boolean;
  showStatus?: boolean;
  showUpdatedOn?: boolean;
  onAdd: () => void;
  onEdit: (item: SetupItem) => void;
  onDelete: (item: SetupItem) => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, query]);

  const activeCount = items.filter((i) => i.status === 'Active').length;
  const inactiveCount = items.length - activeCount;

  return (
    <div className="space-y-5" data-testid={`${testidPrefix}-section`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-900">{itemLabel}s</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {showStatus
              ? `${items.length} total · ${activeCount} active · ${inactiveCount} inactive`
              : `${items.length} total`}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              data-testid={`${testidPrefix}-search`}
              placeholder={`Search ${itemLabel.toLowerCase()}s...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-10 bg-white"
            />
          </div>
          <Button
            data-testid={`${testidPrefix}-add-btn`}
            onClick={onAdd}
            className="gap-2 bg-slate-900 hover:bg-slate-800 text-white h-10 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-slate-200">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {itemLabel} Name
              </TableHead>
              {showStatus && (
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 w-40">
                  Status
                </TableHead>
              )}
              {showUpdatedOn && (
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 w-48">
                  Updated On
                </TableHead>
              )}
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 w-36 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={showStatus && showUpdatedOn ? 4 : showStatus || showUpdatedOn ? 3 : 2} className="text-center text-sm text-slate-500 py-12">
                  Loading…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showStatus && showUpdatedOn ? 4 : showStatus || showUpdatedOn ? 3 : 2}
                  className="text-center text-sm text-slate-500 py-12"
                >
                  {query
                    ? `No ${itemLabel.toLowerCase()}s match "${query}".`
                    : `No ${itemLabel.toLowerCase()}s yet. Click Add New to create one.`}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} data-testid={`${testidPrefix}-row-${item.id}`} className="border-slate-100">
                  <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                  {showStatus && (
                    <TableCell>
                      <SetupStatusBadge status={item.status || 'Active'} />
                    </TableCell>
                  )}
                  {showUpdatedOn && (
                    <TableCell className="text-sm text-slate-600">{formatSetupDate(item.updatedOn)}</TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        data-testid={`${testidPrefix}-edit-${item.id}`}
                        onClick={() => onEdit(item)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        data-testid={`${testidPrefix}-delete-${item.id}`}
                        onClick={() => onDelete(item)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function SetupDialog({
  open,
  onOpenChange,
  mode,
  itemLabel,
  initial,
  showStatus = true,
  onSave,
  testidPrefix,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  itemLabel: string;
  initial: SetupItem | null;
  showStatus?: boolean;
  onSave: (payload: { name: string; status?: string }) => void;
  testidPrefix: string;
}) {
  const isEdit = mode === 'edit';
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (open) {
      setName(initial?.name || '');
      setActive(isEdit ? initial?.status !== 'Inactive' : true);
    }
  }, [initial?.id, mode, open, isEdit, initial?.name, initial?.status]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(`${itemLabel} name is required.`);
      return;
    }
    onSave({
      name: trimmed,
      status: showStatus ? (isEdit ? (active ? 'Active' : 'Inactive') : 'Active') : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid={`${testidPrefix}-dialog`} className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogTitle className="font-display text-xl text-slate-900">
            {isEdit ? `Edit ${itemLabel}` : `Add New ${itemLabel}`}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {isEdit
              ? `Update the ${itemLabel.toLowerCase()} details below.`
              : `Create a new ${itemLabel.toLowerCase()} option for the workspace.`}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="ms-name" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {itemLabel} Name
            </Label>
            <Input
              id="ms-name"
              data-testid={`${testidPrefix}-name-input`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              placeholder={`Enter ${itemLabel.toLowerCase()} name`}
              className="h-10"
              autoFocus
            />
          </div>

          {isEdit && showStatus && (
            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50/60">
              <div>
                <div className="text-sm font-medium text-slate-900">Status</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {active
                    ? 'Visible and selectable across the workspace.'
                    : 'Hidden from new entries.'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${active ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {active ? 'Active' : 'Inactive'}
                </span>
                <Switch
                  data-testid={`${testidPrefix}-status-toggle`}
                  checked={active}
                  onCheckedChange={setActive}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 sm:justify-end gap-2">
          <Button data-testid={`${testidPrefix}-dialog-cancel`} variant="outline" onClick={() => onOpenChange(false)}>
            {isEdit ? 'Cancel' : 'Close'}
          </Button>
          <Button
            data-testid={`${testidPrefix}-dialog-save`}
            onClick={handleSave}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            {isEdit ? 'Update' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SetupDeleteDialog({
  open,
  itemName,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  itemName?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent data-testid="delete-confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete entry?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete{' '}
            <span className="font-medium text-slate-900">{itemName || 'this item'}</span>. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="delete-cancel-btn" onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-testid="delete-confirm-btn"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function withSetupMeta(item: { id: string; name: string; status?: string; updatedOn?: string }) {
  return {
    ...item,
    status: item.status || 'Active',
    updatedOn: item.updatedOn || new Date().toISOString(),
  };
}
