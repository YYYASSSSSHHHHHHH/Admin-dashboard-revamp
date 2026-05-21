import { useState, useEffect } from "react";
import { ArrowRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ACTIONS, PLANS, SUSPEND_REASONS, INVOICE_TYPES, formatDate } from "@/data/mockData";
import { cn } from "@/lib/utils";

const Field = ({ label, hint, children }) => (
  <div className="flex flex-col gap-2">
    <Label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </Label>
    <div className="w-full">{children}</div>
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
);

export const ActionPanel = ({ member, onApply }) => {
  const [action, setAction] = useState("assign");
  const [submitting, setSubmitting] = useState(false);

  const [planId, setPlanId] = useState(member.plan.id);
  const [startDate, setStartDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  });
  const [duration, setDuration] = useState("30");
  const [reasonId, setReasonId] = useState("policy_violation");
  const [reasonOther, setReasonOther] = useState("");
  const [note, setNote] = useState("");
  const [proration, setProration] = useState("yes");
  const [generateInvoice, setGenerateInvoice] = useState(false);
  const [invoiceType, setInvoiceType] = useState("final");

  useEffect(() => {
    setPlanId(member.plan.id);
    const s = new Date();
    setStartDate(s);
    const e = new Date(s);
    e.setDate(e.getDate() + 30);
    setExpiryDate(e);
    setDuration("30");
    setReasonId("policy_violation");
    setReasonOther("");
    setNote("");
    setProration("yes");
    setGenerateInvoice(false);
    setInvoiceType("final");
  }, [member.id, action]);

  useEffect(() => {
    if (expiryDate < startDate) {
      const e = new Date(startDate);
      e.setDate(e.getDate() + 30);
      setExpiryDate(e);
    }
  }, [startDate]);

  const currentAction = ACTIONS.find((a) => a.id === action);

  const handleApply = async () => {
    setSubmitting(true);
    const payload = { action };
    if (action === "assign") {
      payload.plan = PLANS.find((p) => p.id === planId);
      payload.startDate = startDate.toISOString();
      payload.expiryDate = expiryDate.toISOString();
    }
    if (action === "upgrade") {
      payload.plan = PLANS.find((p) => p.id === planId);
      payload.startDate = startDate.toISOString();
      payload.proration = proration === "yes";
    }
    if (action === "extend") {
      payload.days = parseInt(duration, 10) || 30;
    }
    if (action === "suspend") {
      const reasonObj = SUSPEND_REASONS.find((r) => r.id === reasonId);
      payload.reason =
        reasonId === "other"
          ? reasonOther.trim() || "Other"
          : reasonObj?.label || "No reason provided";
    }
    if (action === "reactivate") {
      payload.note = note.trim() || "Member reactivated";
    }
    if (
      generateInvoice &&
      (action === "assign" || action === "extend" || action === "upgrade")
    ) {
      payload.generateInvoice = true;
      payload.invoiceType = invoiceType;
    }
    await new Promise((r) => setTimeout(r, 350));
    onApply(payload);
    setSubmitting(false);
  };

  const isDisabled = () => {
    if (submitting) return true;
    if (action === "suspend" && member.status === "suspended") return true;
    if (action === "reactivate" && member.status === "active") return true;
    if (action === "suspend" && reasonId === "other" && !reasonOther.trim()) return true;
    return false;
  };

  const disabledReason = () => {
    if (action === "suspend" && member.status === "suspended") return "Member is already suspended";
    if (action === "reactivate" && member.status === "active") return "Member is already active";
    if (action === "suspend" && reasonId === "other" && !reasonOther.trim()) return "Please specify the reason";
    return null;
  };

  return (
    <div
      data-testid="action-panel"
      className="lg:col-span-8 bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900 tracking-tight">
              Plan Actions
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Apply a single change. Form below adapts to your selection.
            </p>
          </div>
          <div className="w-full sm:w-[260px]">
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger
                data-testid="action-dropdown"
                className="bg-white border-slate-200 hover:border-slate-300 transition-colors h-11"
              >
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                {ACTIONS.map((a) => (
                  <SelectItem
                    key={a.id}
                    value={a.id}
                    data-testid={`action-option-${a.id}`}
                  >
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div key={action} className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mb-5 flex items-start gap-3 px-3.5 py-3 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="h-2 w-2 mt-1.5 rounded-full bg-slate-900" />
          <p className="text-sm text-slate-700">{currentAction?.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(action === "assign" || action === "upgrade") && (
            <>
              <Field label="Plan" hint={action === "upgrade" ? "Choose a higher tier" : "Select the plan to assign"}>
                <Select value={planId} onValueChange={setPlanId}>
                  <SelectTrigger data-testid="plan-select" className="h-11">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANS.map((p) => (
                      <SelectItem key={p.id} value={p.id} data-testid={`plan-option-${p.id}`}>
                        <div className="flex items-center justify-between gap-6 w-full">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-xs text-slate-500">${p.price}/mo</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Start Date">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      data-testid="start-date-trigger"
                      variant="outline"
                      className={cn(
                        "h-11 w-full justify-start font-normal",
                        !startDate && "text-slate-500"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2 text-slate-500" />
                      {startDate ? formatDate(startDate.toISOString()) : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(d) => d && setStartDate(d)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </Field>
              {action === "assign" && (
                <Field label="Expiry Date" hint="Defaults to 30 days after start date. Editable.">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        data-testid="expiry-date-trigger"
                        variant="outline"
                        className={cn(
                          "h-11 w-full justify-start font-normal",
                          !expiryDate && "text-slate-500"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4 mr-2 text-slate-500" />
                        {expiryDate ? formatDate(expiryDate.toISOString()) : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={expiryDate}
                        onSelect={(d) => d && setExpiryDate(d)}
                        disabled={(d) => d <= startDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
              )}
              {action === "upgrade" && (
                <Field label="Proration" hint="Apply prorated charge for the remaining cycle?">
                  <Select value={proration} onValueChange={setProration}>
                    <SelectTrigger data-testid="proration-select" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes" data-testid="proration-yes">Yes, prorate</SelectItem>
                      <SelectItem value="no" data-testid="proration-no">No, charge next cycle</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </>
          )}

          {action === "extend" && (
            <>
              <Field label="Extend by" hint="Number of days to add to current expiry">
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger data-testid="duration-select" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7" data-testid="duration-7">7 days</SelectItem>
                    <SelectItem value="14" data-testid="duration-14">14 days</SelectItem>
                    <SelectItem value="30" data-testid="duration-30">30 days</SelectItem>
                    <SelectItem value="60" data-testid="duration-60">60 days</SelectItem>
                    <SelectItem value="90" data-testid="duration-90">90 days</SelectItem>
                    <SelectItem value="365" data-testid="duration-365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="New expiry preview">
                <div
                  data-testid="extend-preview"
                  className="h-11 px-3 flex items-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-700 font-medium"
                >
                  {formatDate(
                    new Date(
                      new Date(member.expiry).getTime() +
                        parseInt(duration, 10) * 24 * 60 * 60 * 1000
                    ).toISOString()
                  )}
                </div>
              </Field>
            </>
          )}

          {action === "suspend" && (
            <div className="md:col-span-2 grid grid-cols-1 gap-5">
              <Field label="Suspension Reason" hint="Pick the closest reason. Visible in the activity timeline.">
                <Select value={reasonId} onValueChange={setReasonId}>
                  <SelectTrigger data-testid="suspend-reason-select" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUSPEND_REASONS.map((r) => (
                      <SelectItem
                        key={r.id}
                        value={r.id}
                        data-testid={`suspend-reason-${r.id}`}
                      >
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {reasonId === "other" && (
                <Field label="Specify reason" hint="Required when 'Other' is selected.">
                  <Textarea
                    data-testid="suspend-reason-other"
                    placeholder="Describe the reason briefly…"
                    value={reasonOther}
                    onChange={(e) => setReasonOther(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </Field>
              )}
            </div>
          )}

          {action === "reactivate" && (
            <div className="md:col-span-2">
              <Field label="Note (optional)" hint="Add an internal note about why access was restored.">
                <Textarea
                  data-testid="reactivate-note"
                  placeholder="e.g. Payment cleared, manual override…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </Field>
            </div>
          )}
        </div>

        {(action === "assign" || action === "extend" || action === "upgrade") && (
          <div className="mt-6 pt-5 border-t border-dashed border-slate-200 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="generate-invoice-checkbox"
                data-testid="generate-invoice-checkbox"
                checked={generateInvoice}
                onCheckedChange={(v) => setGenerateInvoice(!!v)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label
                  htmlFor="generate-invoice-checkbox"
                  className="text-sm font-medium text-slate-900 cursor-pointer"
                >
                  Generate invoice?
                </Label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create a billing record alongside this action.
                </p>
              </div>
            </div>
            {generateInvoice && (
              <div className="ml-7 max-w-sm animate-in fade-in slide-in-from-top-1 duration-200">
                <Field label="Invoice Type">
                  <Select value={invoiceType} onValueChange={setInvoiceType}>
                    <SelectTrigger data-testid="invoice-type-select" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVOICE_TYPES.map((t) => (
                        <SelectItem
                          key={t.id}
                          value={t.id}
                          data-testid={`invoice-type-${t.id}`}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{t.label}</span>
                            <span className="text-xs text-slate-500">{t.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            )}
          </div>
        )}

        <div className="mt-7 flex items-center justify-between gap-4 pt-5 border-t border-slate-100">
          <p className="text-xs text-slate-500" data-testid="action-disabled-reason">
            {disabledReason() || "Changes are applied immediately to the member's account."}
          </p>
          <Button
            data-testid="apply-action-btn"
            onClick={handleApply}
            disabled={isDisabled()}
            className="h-11 px-5 bg-slate-900 hover:bg-slate-800 text-white transition-colors group"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying…
              </>
            ) : (
              <>
                Apply {currentAction?.label}
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
