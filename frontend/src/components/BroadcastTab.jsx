import { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Pencil,
  CheckCircle2,
  X,
  Building2,
  ChevronDown,
  Clock,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BROADCAST_TYPES,
  BROADCAST_STATUSES,
  PRODUCT_CONDITIONS,
  MAIN_CATEGORIES,
  SUB_CATEGORIES_BY_MAIN,
  SEND_TO_OPTIONS,
  AUDIENCE_OPTIONS,
  REJECT_REASONS,
  HIDE_REASONS,
  formatDate,
} from "@/data/mockData";
import { toast } from "sonner";

const labelOf = (list, id) => list.find((x) => x.id === id)?.label || id;
const statusOf = (id) => BROADCAST_STATUSES.find((s) => s.id === id) || BROADCAST_STATUSES[0];

const StatusPill = ({ status }) => {
  const s = statusOf(status);
  return (
    <span
      data-testid={`broadcast-status-${status}`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${s.cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  );
};

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <Label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </Label>
    {children}
  </div>
);

const ReadField = ({ label, value }) => (
  <div>
    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </div>
    <div className="text-sm font-medium text-slate-900 mt-1.5 break-words">
      {value || <span className="text-slate-400">—</span>}
    </div>
  </div>
);

export const BroadcastTab = ({
  companyName,
  broadcasts,
  setBroadcasts,
  approvalRequired,
  setApprovalRequired,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState("view");
  const [form, setForm] = useState(null);

  // Reason dialog state (Reject / Hide)
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reasonAction, setReasonAction] = useState("reject");
  const [reasonId, setReasonId] = useState("");
  const [reasonNote, setReasonNote] = useState("");

  const selected = useMemo(
    () => broadcasts.find((b) => b.id === selectedId) || null,
    [broadcasts, selectedId]
  );

  const subOptions = useMemo(
    () => SUB_CATEGORIES_BY_MAIN[form?.mainCategory] || [],
    [form?.mainCategory]
  );

  const openRow = (b) => {
    setSelectedId(b.id);
    setForm({ ...b });
    setMode("view");
    setOpen(true);
  };

  const updateStatus = (newStatus, extra = {}) => {
    if (!selected) return;
    setBroadcasts((prev) =>
      prev.map((b) =>
        b.id === selected.id ? { ...b, status: newStatus, ...extra } : b
      )
    );
    toast.success(`Broadcast marked as ${labelOf(BROADCAST_STATUSES, newStatus)}`);
    setOpen(false);
  };

  const openReasonDialog = (action) => {
    setReasonAction(action);
    setReasonId("");
    setReasonNote("");
    setReasonOpen(true);
  };

  const reasonOptions = reasonAction === "reject" ? REJECT_REASONS : HIDE_REASONS;
  const reasonActionLabel = reasonAction === "reject" ? "Reject" : "Hide";

  const handleReasonConfirm = () => {
    if (!reasonId) {
      toast.error("Please select a reason");
      return;
    }
    const reasonLabel = labelOf(reasonOptions, reasonId);
    if (reasonId === "other" && !reasonNote.trim()) {
      toast.error("Please specify the reason");
      return;
    }
    const reasonText =
      reasonId === "other" ? reasonNote.trim() : reasonLabel + (reasonNote.trim() ? ` — ${reasonNote.trim()}` : "");
    if (reasonAction === "reject") {
      updateStatus("rejected", { rejectionReason: reasonText });
    } else {
      updateStatus("hide", { hideReason: reasonText });
    }
    setReasonOpen(false);
  };

  const handleSaveEdit = () => {
    if (!form?.message?.trim()) {
      toast.error("Broadcast message is required");
      return;
    }
    setBroadcasts((prev) => prev.map((b) => (b.id === form.id ? form : b)));
    setMode("view");
    toast.success("Broadcast updated");
  };

  const sortedBroadcasts = useMemo(
    () =>
      [...broadcasts].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
    [broadcasts]
  );

  return (
    <div className="space-y-5" data-testid="broadcast-tab">
      {/* Approval Required Switch */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-slate-700" />
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-900">Approval Required</Label>
            <p className="text-xs text-slate-500 mt-0.5">
              When ON, new broadcasts start as <span className="font-medium text-amber-700">Pending</span> and need admin approval to go Live.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            className={`text-xs font-medium ${
              approvalRequired ? "text-emerald-700" : "text-slate-500"
            }`}
          >
            {approvalRequired ? "Required" : "Not required"}
          </span>
          <Switch
            data-testid="approval-required-switch"
            checked={approvalRequired}
            onCheckedChange={setApprovalRequired}
          />
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900 tracking-tight">
              Broadcast History
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Click any row to view, edit, or change status.
            </p>
          </div>
          <span
            data-testid="broadcast-count"
            className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-md"
          >
            {sortedBroadcasts.length} broadcasts
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="broadcast-table">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100">
                <th className="px-6 py-3 w-12">Sr No</th>
                <th className="px-6 py-3">Date &amp; Time</th>
                <th className="px-6 py-3">Broadcast Message</th>
                <th className="px-6 py-3">Send to</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedBroadcasts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    data-testid="broadcast-empty"
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No broadcasts yet.
                  </td>
                </tr>
              ) : (
                sortedBroadcasts.map((b, i) => (
                  <tr
                    key={b.id}
                    data-testid={`broadcast-row-${b.id}`}
                    onClick={() => openRow(b)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-3.5 text-slate-500 font-mono text-xs">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="text-slate-900 font-medium">
                        {formatDate(b.submittedAt)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {b.submittedAgo}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-slate-100 text-slate-700 border-slate-200">
                          {BROADCAST_TYPES.find((t) => t.id === b.type)?.prefix || b.type}
                        </span>
                        <span className="text-slate-700 truncate max-w-[420px]">
                          {b.message}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 whitespace-nowrap">
                      {labelOf(SEND_TO_OPTIONS, b.sendTo)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <StatusPill status={b.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Information Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-testid="broadcast-dialog"
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {selected && form && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <DialogTitle className="font-display flex items-center gap-2">
                    <Radio className="h-4 w-4 text-slate-500" />
                    Broadcast Information
                  </DialogTitle>
                  <span
                    data-testid="broadcast-mode-badge"
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                      mode === "view"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {mode === "view" ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <Pencil className="h-3 w-3" />
                    )}
                    {mode === "view" ? "Viewing" : "Editing"}
                  </span>
                  {mode === "view" && (
                    <Button
                      type="button"
                      data-testid="broadcast-edit-btn"
                      variant="outline"
                      size="sm"
                      onClick={() => setMode("edit")}
                      className="ml-auto h-8 text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Pencil className="h-3 w-3 mr-1.5" />
                      Edit
                    </Button>
                  )}
                  {mode === "edit" && (
                    <Button
                      type="button"
                      data-testid="broadcast-save-edit-btn"
                      variant="outline"
                      size="sm"
                      onClick={handleSaveEdit}
                      className="ml-auto h-8"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1.5" />
                      Save changes
                    </Button>
                  )}
                </div>
                <DialogDescription className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {companyName} · ID: <span className="font-mono text-slate-700">{selected.id}</span>
                  </span>
                </DialogDescription>
              </DialogHeader>

              {mode === "view" ? (
                <div className="space-y-5 py-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ReadField
                      label="Broadcast Type"
                      value={labelOf(BROADCAST_TYPES, selected.type)}
                    />
                    <ReadField
                      label="Product Condition"
                      value={labelOf(PRODUCT_CONDITIONS, selected.productCondition)}
                    />
                    <ReadField
                      label="Main Category"
                      value={labelOf(MAIN_CATEGORIES, selected.mainCategory)}
                    />
                    <ReadField label="Sub Category" value={selected.subCategory} />
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-2">
                      Message
                    </div>
                    <div
                      data-testid="broadcast-message-view"
                      className="text-sm text-slate-900 border border-slate-200 bg-slate-50/60 rounded-lg p-3.5"
                    >
                      {selected.message}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ReadField label="Quantity" value={selected.quantity} />
                    <ReadField label="Price" value={selected.price} />
                    <ReadField
                      label="Sending Option"
                      value={labelOf(SEND_TO_OPTIONS, selected.sendTo)}
                    />
                    <ReadField
                      label="Audience"
                      value={labelOf(AUDIENCE_OPTIONS, selected.audience)}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      Submitted {selected.submittedAgo} · {formatDateTime(selected.submittedAt)}
                    </div>
                    <StatusPill status={selected.status} />
                  </div>

                  {(selected.rejectionReason || selected.hideReason) && (
                    <div
                      data-testid="broadcast-reason-note"
                      className={`px-3.5 py-2.5 rounded-lg border text-xs ${
                        selected.rejectionReason
                          ? "bg-red-50/60 border-red-100 text-red-700"
                          : "bg-slate-50/80 border-slate-200 text-slate-600"
                      }`}
                    >
                      <span className="font-semibold uppercase tracking-wider mr-1.5">
                        {selected.rejectionReason ? "Reject reason:" : "Hide reason:"}
                      </span>
                      {selected.rejectionReason || selected.hideReason}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5 py-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Broadcast Type">
                      <Select
                        value={form.type}
                        onValueChange={(v) => setForm({ ...form, type: v })}
                      >
                        <SelectTrigger data-testid="edit-broadcast-type" className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BROADCAST_TYPES.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Product Condition">
                      <Select
                        value={form.productCondition}
                        onValueChange={(v) => setForm({ ...form, productCondition: v })}
                      >
                        <SelectTrigger data-testid="edit-product-condition" className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_CONDITIONS.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Main Category">
                      <Select
                        value={form.mainCategory}
                        onValueChange={(v) =>
                          setForm({ ...form, mainCategory: v, subCategory: "" })
                        }
                      >
                        <SelectTrigger data-testid="edit-main-category" className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MAIN_CATEGORIES.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Sub Category">
                      <Select
                        value={form.subCategory}
                        onValueChange={(v) => setForm({ ...form, subCategory: v })}
                      >
                        <SelectTrigger data-testid="edit-sub-category" className="h-11">
                          <SelectValue placeholder="Select sub category" />
                        </SelectTrigger>
                        <SelectContent>
                          {subOptions.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <Field label="Message">
                    <Textarea
                      data-testid="edit-message"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={2}
                      className="resize-none"
                    />
                  </Field>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Quantity">
                      <Input
                        data-testid="edit-quantity"
                        value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                        className="h-11"
                      />
                    </Field>
                    <Field label="Price">
                      <Input
                        data-testid="edit-price"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="h-11"
                        placeholder="Fixed / Quote / number"
                      />
                    </Field>
                    <Field label="Sending Option">
                      <Select
                        value={form.sendTo}
                        onValueChange={(v) => setForm({ ...form, sendTo: v })}
                      >
                        <SelectTrigger data-testid="edit-send-to" className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SEND_TO_OPTIONS.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Audience">
                      <Select
                        value={form.audience}
                        onValueChange={(v) => setForm({ ...form, audience: v })}
                      >
                        <SelectTrigger data-testid="edit-audience" className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AUDIENCE_OPTIONS.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>
              )}

              <DialogFooter className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      data-testid="broadcast-actions-menu"
                      variant="outline"
                      className="h-10 border-slate-200 hover:bg-slate-50 hover:border-slate-300 w-full sm:w-auto justify-between sm:justify-start"
                    >
                      <span>Other Actions</span>
                      <ChevronDown className="h-4 w-4 ml-2 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[220px]">
                    <DropdownMenuItem
                      data-testid="action-reject"
                      onClick={() => openReasonDialog("reject")}
                      className="cursor-pointer text-red-700 focus:bg-red-50 focus:text-red-800"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject…
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      data-testid="action-hide"
                      onClick={() => openReasonDialog("hide")}
                      className="cursor-pointer text-slate-700 focus:bg-slate-100"
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide…
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center gap-2 justify-end">
                  <Button
                    data-testid="broadcast-cancel"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    data-testid="broadcast-approve"
                    onClick={() => updateStatus("live")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Approve
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reason Dialog (Reject / Hide) */}
      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent data-testid="reason-dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              {reasonAction === "reject" ? (
                <X className="h-4 w-4 text-red-500" />
              ) : (
                <EyeOff className="h-4 w-4 text-slate-500" />
              )}
              {reasonActionLabel} Broadcast
            </DialogTitle>
            <DialogDescription>
              Pick a reason{" "}
              <span className="text-slate-400">(reasons managed by admin)</span>. Optionally add a short note for the audit log.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Field label={`${reasonActionLabel} Reason`}>
              <Select value={reasonId} onValueChange={setReasonId}>
                <SelectTrigger data-testid="reason-select" className="h-11">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reasonOptions.map((r) => (
                    <SelectItem
                      key={r.id}
                      value={r.id}
                      data-testid={`reason-${r.id}`}
                    >
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {reasonId === "other" && (
              <Field label="Specify reason">
                <Textarea
                  data-testid="reason-other-note"
                  value={reasonNote}
                  onChange={(e) => setReasonNote(e.target.value)}
                  rows={2}
                  className="resize-none"
                  placeholder="Describe briefly…"
                />
              </Field>
            )}

            {reasonId && reasonId !== "other" && (
              <Field label="Note (optional)">
                <Textarea
                  data-testid="reason-note"
                  value={reasonNote}
                  onChange={(e) => setReasonNote(e.target.value)}
                  rows={2}
                  className="resize-none"
                  placeholder="Add an internal note (optional)…"
                />
              </Field>
            )}
          </div>

          <DialogFooter className="mt-2">
            <Button
              data-testid="reason-cancel"
              variant="outline"
              onClick={() => setReasonOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-testid="reason-confirm"
              onClick={handleReasonConfirm}
              className={
                reasonAction === "reject"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }
            >
              Confirm {reasonActionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
