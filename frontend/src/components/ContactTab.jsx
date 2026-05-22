import { useState } from "react";
import { Plus, Pencil, Phone, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DESIGNATIONS } from "@/data/mockData";
import { toast } from "sonner";

const MAX_CONTACTS = 3;

const emptyContact = {
  firstName: "",
  lastName: "",
  designation: "owner",
  mobile: "",
  status: "active",
  photo: "",
};

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <Label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </Label>
    {children}
  </div>
);

const initialsOf = (first = "", last = "") =>
  `${(first[0] || "").toUpperCase()}${(last[0] || "").toUpperCase()}` || "?";

const designationLabel = (id) =>
  DESIGNATIONS.find((d) => d.id === id)?.label || id;

const hasAnyMain = (list) => list.some((c) => c.isMain);
const withMainDefault = (list) =>
  hasAnyMain(list) ? list : list.map((c, i) => ({ ...c, isMain: i === 0 }));

export const ContactTab = ({ contacts: rawContacts, onChange }) => {
  const contacts = withMainDefault(rawContacts);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyContact);

  const openAdd = () => {
    if (contacts.length >= MAX_CONTACTS) return;
    setEditingId(null);
    setForm({ ...emptyContact, isMain: contacts.length === 0 });
    setOpen(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({ ...c });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }
    const photo = initialsOf(form.firstName, form.lastName);
    if (editingId) {
      let updated = contacts.map((c) =>
        c.id === editingId ? { ...form, id: editingId, photo } : c
      );
      // If this one became Main, demote others
      if (form.isMain) {
        updated = updated.map((c) =>
          c.id === editingId ? c : { ...c, isMain: false }
        );
      } else if (!updated.some((c) => c.isMain)) {
        // Always keep at least one Main — fallback to first
        updated = updated.map((c, i) => ({ ...c, isMain: i === 0 }));
      }
      onChange(updated);
      toast.success("Contact updated");
    } else {
      const isFirst = contacts.length === 0;
      const newContact = {
        ...form,
        id: `c${Date.now()}`,
        photo,
        isMain: form.isMain || isFirst,
      };
      let next = [...contacts, newContact];
      if (newContact.isMain) {
        next = next.map((c) =>
          c.id === newContact.id ? c : { ...c, isMain: false }
        );
      }
      onChange(next);
      toast.success("Contact added");
    }
    setOpen(false);
  };

  const handleDelete = (id) => {
    let next = contacts.filter((c) => c.id !== id);
    if (next.length && !next.some((c) => c.isMain)) {
      next = next.map((c, i) => ({ ...c, isMain: i === 0 }));
    }
    onChange(next);
    toast.success("Contact removed");
  };

  const handleMarkAsMain = (id) => {
    const next = contacts.map((c) => ({ ...c, isMain: c.id === id }));
    onChange(next);
    toast.success("Marked as Main Contact");
  };

  return (
    <div data-testid="contact-tab" className="space-y-5">
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900 tracking-tight">
              Contacts
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {contacts.length} of {MAX_CONTACTS} contacts · {MAX_CONTACTS - contacts.length} slot
              {MAX_CONTACTS - contacts.length === 1 ? "" : "s"} remaining
            </p>
          </div>
          <Button
            data-testid="add-contact-btn"
            onClick={openAdd}
            disabled={contacts.length >= MAX_CONTACTS}
            className="h-10 bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-100 disabled:text-slate-400"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Contact
          </Button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.length === 0 ? (
            <div
              data-testid="contact-empty"
              className="md:col-span-2 text-sm text-slate-500 text-center py-10 border border-dashed border-slate-200 rounded-lg"
            >
              No contacts yet. Add one to get started.
            </div>
          ) : (
            contacts.map((c) => (
              <div
                key={c.id}
                data-testid={`contact-card-${c.id}`}
                className="group border border-slate-200/80 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold border border-slate-200 shrink-0">
                    {c.photo}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-slate-900 truncate">
                        {c.firstName} {c.lastName}
                      </h3>
                      {c.isMain && (
                        <span
                          data-testid={`contact-main-badge-${c.id}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200"
                        >
                          <Star className="h-2.5 w-2.5 fill-current" />
                          Main
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                          c.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        <span className="h-1 w-1 rounded-full bg-current" />
                        {c.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {designationLabel(c.designation)}
                    </div>
                    <div className="text-xs text-slate-700 mt-2 flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-slate-400" />
                      {c.mobile}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    {!c.isMain && (
                      <button
                        type="button"
                        data-testid={`contact-mark-main-${c.id}`}
                        onClick={() => handleMarkAsMain(c.id)}
                        className="text-xs font-medium text-blue-700 hover:text-blue-800 px-2.5 py-1.5 rounded-md hover:bg-blue-50 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Star className="h-3 w-3" />
                        Mark as Main Contact
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-testid={`contact-delete-${c.id}`}
                      onClick={() => handleDelete(c.id)}
                      className="text-xs font-medium text-slate-500 hover:text-red-600 px-2.5 py-1.5 rounded-md hover:bg-red-50 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                    <button
                      type="button"
                      data-testid={`contact-edit-${c.id}`}
                      onClick={() => openEdit(c)}
                      className="text-xs font-medium text-slate-900 border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 px-2.5 py-1.5 rounded-md transition-all inline-flex items-center gap-1.5"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="contact-dialog" className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingId ? "Edit Contact" : "Add New Contact"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the contact details below."
                : `Add up to ${MAX_CONTACTS} contacts. Initials will be used as the photo.`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4 py-2">
            <div className="h-14 w-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-base font-display font-semibold">
              {initialsOf(form.firstName, form.lastName)}
            </div>
            <div className="text-xs text-slate-500">
              Photo auto-generated from initials.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name">
              <Input
                data-testid="contact-first-name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="h-11"
                placeholder="Aria"
              />
            </Field>
            <Field label="Last Name">
              <Input
                data-testid="contact-last-name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="h-11"
                placeholder="Lindqvist"
              />
            </Field>
            <Field label="Designation">
              <Select
                value={form.designation}
                onValueChange={(v) => setForm({ ...form, designation: v })}
              >
                <SelectTrigger data-testid="contact-designation" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DESIGNATIONS.map((d) => (
                    <SelectItem
                      key={d.id}
                      value={d.id}
                      data-testid={`contact-designation-${d.id}`}
                    >
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Mobile No.">
              <Input
                data-testid="contact-mobile"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="h-11"
                placeholder="+1 415-555-0142"
              />
            </Field>
            <div className="md:col-span-2 flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
              <div>
                <Label className="text-sm font-medium text-slate-900">Status</Label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inactive contacts won't receive notifications.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium ${
                    form.status === "active" ? "text-emerald-700" : "text-slate-500"
                  }`}
                >
                  {form.status === "active" ? "Active" : "Inactive"}
                </span>
                <Switch
                  data-testid="contact-status-switch"
                  checked={form.status === "active"}
                  onCheckedChange={(v) =>
                    setForm({ ...form, status: v ? "active" : "inactive" })
                  }
                />
              </div>
            </div>
            <div className="md:col-span-2">
              {form.isMain ? (
                <div
                  data-testid="dialog-main-contact-badge"
                  className="flex items-center justify-between p-3.5 rounded-lg border border-blue-200 bg-blue-50/60"
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-600 fill-blue-600" />
                    <div>
                      <Label className="text-sm font-medium text-blue-900">
                        Main Contact
                      </Label>
                      <p className="text-xs text-blue-700/80 mt-0.5">
                        This is the primary contact for the member.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  data-testid="dialog-mark-as-main"
                  variant="outline"
                  onClick={() => setForm({ ...form, isMain: true })}
                  className="w-full h-11 border-dashed border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Mark as Main Contact
                </Button>
              )}
            </div>
          </div>

          <DialogFooter className="mt-3">
            <Button
              data-testid="contact-dialog-cancel"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-testid="contact-dialog-save"
              onClick={handleSave}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {editingId ? "Update Contact" : "Save Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
