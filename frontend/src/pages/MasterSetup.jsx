import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  SlidersHorizontal,
  MapPin,
  Briefcase,
  Ruler,
  UserCog,
  CircleSlash,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MOCK_ADDRESS_LABELS,
  MOCK_BUSINESS_TYPES,
  MOCK_UOM,
  MOCK_DESIGNATIONS_SETUP,
  MOCK_INACTIVE_STATUS,
} from "@/data/mockData";

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const StatusBadge = ({ status }) => {
  const isActive = status === "Active";
  return (
    <span
      data-testid={`status-badge-${status.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
        isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {status}
    </span>
  );
};

const SetupSection = ({
  testidPrefix,
  itemLabel,
  items,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [query, setQuery] = useState("");
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(query.trim().toLowerCase())
  );
  const activeCount = items.filter((i) => i.status === "Active").length;
  const inactiveCount = items.length - activeCount;

  return (
    <div className="space-y-5" data-testid={`${testidPrefix}-section`}>
      {/* Section header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-900">
            {itemLabel}s
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {items.length} total · {activeCount} active · {inactiveCount} inactive
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

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-slate-200">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {itemLabel} Name
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 w-40">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 w-48">
                Updated On
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 w-36 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-sm text-slate-500 py-12"
                >
                  {query
                    ? `No ${itemLabel.toLowerCase()}s match "${query}".`
                    : `No ${itemLabel.toLowerCase()}s yet. Click Add New to create one.`}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow
                  key={item.id}
                  data-testid={`${testidPrefix}-row-${item.id}`}
                  className="border-slate-100"
                >
                  <TableCell className="font-medium text-slate-900">
                    {item.name}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {formatDate(item.updatedOn)}
                  </TableCell>
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
};

const SetupDialog = ({
  open,
  onOpenChange,
  mode, // "add" | "edit"
  itemLabel,
  initial,
  onSave,
  testidPrefix,
}) => {
  const isEdit = mode === "edit";
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (open) {
      setName(initial?.name || "");
      setActive(isEdit ? initial?.status === "Active" : true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id, mode, open]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(`${itemLabel} name is required.`);
      return;
    }
    onSave({
      name: trimmed,
      status: isEdit ? (active ? "Active" : "Inactive") : "Active",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid={`${testidPrefix}-dialog`}
        className="sm:max-w-md p-0 gap-0"
      >
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
            <Label
              htmlFor="ms-name"
              className="text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              {itemLabel} Name
            </Label>
            <Input
              id="ms-name"
              data-testid={`${testidPrefix}-name-input`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              placeholder={`Enter ${itemLabel.toLowerCase()} name`}
              className="h-10"
              autoFocus
            />
          </div>

          {isEdit && (
            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50/60">
              <div>
                <div className="text-sm font-medium text-slate-900">Status</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {active
                    ? "Visible and selectable across the workspace."
                    : "Hidden from new entries."}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium ${
                    active ? "text-emerald-600" : "text-slate-500"
                  }`}
                >
                  {active ? "Active" : "Inactive"}
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
          <Button
            data-testid={`${testidPrefix}-dialog-cancel`}
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {isEdit ? "Cancel" : "Close"}
          </Button>
          <Button
            data-testid={`${testidPrefix}-dialog-save`}
            onClick={handleSave}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            {isEdit ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const useSetupList = (initial, itemLabel, testidPrefix) => {
  const [items, setItems] = useState(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openAdd = () => {
    setMode("add");
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (item) => {
    setMode("edit");
    setEditing(item);
    setDialogOpen(true);
  };

  const handleSave = ({ name, status }) => {
    if (mode === "add") {
      const newItem = {
        id: `${testidPrefix}_${Date.now()}`,
        name,
        status,
        updatedOn: new Date().toISOString(),
      };
      setItems((prev) => [newItem, ...prev]);
      toast.success(`${itemLabel} added successfully.`);
    } else if (editing) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editing.id
            ? { ...it, name, status, updatedOn: new Date().toISOString() }
            : it
        )
      );
      toast.success(`${itemLabel} updated successfully.`);
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((it) => it.id !== deleteTarget.id));
    toast.success(`${itemLabel} deleted.`);
    setDeleteTarget(null);
  };

  return {
    items,
    dialogOpen,
    setDialogOpen,
    mode,
    editing,
    openAdd,
    openEdit,
    handleSave,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
  };
};

const TAB_DEFS = [
  {
    value: "address-labels",
    label: "Address Labels",
    icon: MapPin,
    itemLabel: "Address Label",
    testidPrefix: "address-label",
    seed: MOCK_ADDRESS_LABELS,
  },
  {
    value: "business-types",
    label: "Business Types",
    icon: Briefcase,
    itemLabel: "Business Type",
    testidPrefix: "business-type",
    seed: MOCK_BUSINESS_TYPES,
  },
  {
    value: "uom",
    label: "UOM",
    icon: Ruler,
    itemLabel: "UOM",
    testidPrefix: "uom",
    seed: MOCK_UOM,
  },
  {
    value: "designation",
    label: "Designation",
    icon: UserCog,
    itemLabel: "Designation",
    testidPrefix: "designation",
    seed: MOCK_DESIGNATIONS_SETUP,
  },
  {
    value: "inactive-status",
    label: "Inactive Status",
    icon: CircleSlash,
    itemLabel: "Inactive Status",
    testidPrefix: "inactive-status",
    seed: MOCK_INACTIVE_STATUS,
  },
];

const MasterSetup = () => {
  // One controller per tab
  const addressLabels = useSetupList(MOCK_ADDRESS_LABELS, "Address Label", "address-label");
  const businessTypes = useSetupList(MOCK_BUSINESS_TYPES, "Business Type", "business-type");
  const uom = useSetupList(MOCK_UOM, "UOM", "uom");
  const designation = useSetupList(MOCK_DESIGNATIONS_SETUP, "Designation", "designation");
  const inactiveStatus = useSetupList(MOCK_INACTIVE_STATUS, "Inactive Status", "inactive-status");

  const controllers = {
    "address-labels": addressLabels,
    "business-types": businessTypes,
    uom,
    designation,
    "inactive-status": inactiveStatus,
  };

  return (
    <div className="p-6 lg:p-8 w-full" data-testid="master-setup-page">
      {/* Page header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
          <SlidersHorizontal className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Configuration
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 mt-1">
            Master Setup
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Maintain the reference data used by member profiles, addresses,
            company classifications, units of measure, designations and
            inactive-status reasons.
          </p>
        </div>
      </div>

      <Tabs defaultValue="address-labels" className="w-full">
        <TabsList
          data-testid="master-setup-tabs"
          className="bg-white border border-slate-200 p-1 h-auto flex flex-wrap gap-1"
        >
          {TAB_DEFS.map((t) => {
            const Icon = t.icon;
            return (
              <TabsTrigger
                key={t.value}
                data-testid={`tab-${t.value}`}
                value={t.value}
                className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4 py-2"
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TAB_DEFS.map((t) => {
          const ctl = controllers[t.value];
          return (
            <TabsContent key={t.value} value={t.value} className="mt-6">
              <SetupSection
                testidPrefix={t.testidPrefix}
                itemLabel={t.itemLabel}
                items={ctl.items}
                onAdd={ctl.openAdd}
                onEdit={ctl.openEdit}
                onDelete={ctl.setDeleteTarget}
              />
            </TabsContent>
          );
        })}
      </Tabs>

      {/* One Dialog per tab */}
      {TAB_DEFS.map((t) => {
        const ctl = controllers[t.value];
        return (
          <SetupDialog
            key={`dlg-${t.value}`}
            open={ctl.dialogOpen}
            onOpenChange={ctl.setDialogOpen}
            mode={ctl.mode}
            itemLabel={t.itemLabel}
            initial={ctl.editing}
            onSave={ctl.handleSave}
            testidPrefix={t.testidPrefix}
          />
        );
      })}

      {/* Shared delete confirm dialog */}
      <AlertDialog
        open={TAB_DEFS.some((t) => !!controllers[t.value].deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            TAB_DEFS.forEach((t) => controllers[t.value].setDeleteTarget(null));
          }
        }}
      >
        <AlertDialogContent data-testid="delete-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete entry?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete{" "}
              <span className="font-medium text-slate-900">
                {TAB_DEFS.map((t) => controllers[t.value].deleteTarget?.name).find(Boolean)}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete-cancel-btn">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-testid="delete-confirm-btn"
              onClick={() => {
                const active = TAB_DEFS.find((t) => !!controllers[t.value].deleteTarget);
                if (active) controllers[active.value].confirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MasterSetup;
