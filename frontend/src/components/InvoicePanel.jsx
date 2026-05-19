import { useState, useEffect } from "react";
import { FileText, CheckCircle2, Receipt, Undo2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, INVOICE_TYPES } from "@/data/mockData";

const StatusPill = ({ status }) => {
  const map = {
    paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    overdue: { label: "Overdue", cls: "bg-red-50 text-red-700 border-red-200" },
    draft: { label: "Draft", cls: "bg-slate-100 text-slate-700 border-slate-200" },
    refunded: { label: "Refunded", cls: "bg-violet-50 text-violet-700 border-violet-200" },
    none: { label: "No invoice", cls: "bg-slate-100 text-slate-500 border-slate-200" },
  };
  const { label, cls } = map[status] || map.none;
  return (
    <span
      data-testid="invoice-status-pill"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const t = INVOICE_TYPES.find((x) => x.id === type) || INVOICE_TYPES[1];
  return (
    <span
      data-testid="invoice-type-badge"
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${t.cls}`}
    >
      {type === "proforma" ? "Proforma" : "Final"}
    </span>
  );
};

export const InvoicePanel = ({ invoice, history = [], member, onGenerate, onMarkPaid, onRefund }) => {
  const hasInvoice = !!invoice;
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setShowHistory(false);
  }, [member.id]);

  return (
    <div
      data-testid="invoice-panel"
      className="lg:col-span-4 bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col"
    >
      <div className="p-6 border-b border-slate-100 flex items-start justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900 tracking-tight">
            Invoice
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Latest billing cycle</p>
        </div>
        <div className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
          <Receipt className="h-4 w-4 text-slate-700" />
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-5">
        {hasInvoice ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-slate-500" data-testid="invoice-id">
                    {invoice.id}
                  </span>
                  <TypeBadge type={invoice.type} />
                </div>
                <div className="font-display text-3xl font-semibold tracking-tight text-slate-900 mt-1.5">
                  ${invoice.amount.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {member.plan.name} · {member.plan.billing}
                </div>
              </div>
              <StatusPill status={invoice.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-dashed border-slate-200">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Issued
                </div>
                <div className="text-sm text-slate-900 mt-1">{formatDate(invoice.issuedAt)}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Due
                </div>
                <div className="text-sm text-slate-900 mt-1">{formatDate(invoice.dueDate)}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="border border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center text-center gap-2">
            <FileText className="h-6 w-6 text-slate-400" />
            <div className="text-sm font-medium text-slate-700">No active invoice</div>
            <div className="text-xs text-slate-500">
              Generate an invoice for the current cycle.
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                data-testid="generate-invoice-btn"
                variant="outline"
                className="h-11 justify-center border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Invoice
                <ChevronDown className="h-4 w-4 ml-2 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[280px]">
              {INVOICE_TYPES.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  data-testid={`generate-invoice-${t.id}`}
                  onClick={() => onGenerate(t.id)}
                  className="flex flex-col items-start gap-0.5 py-2.5 cursor-pointer"
                >
                  <span className="font-medium text-slate-900">{t.label}</span>
                  <span className="text-xs text-slate-500">{t.description}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {invoice?.status === "paid" ? (
            <Button
              data-testid="refund-btn"
              onClick={onRefund}
              variant="outline"
              className="h-11 justify-center border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300 transition-colors"
            >
              <Undo2 className="h-4 w-4 mr-2" />
              Refund Invoice
            </Button>
          ) : (
            <Button
              data-testid="mark-paid-btn"
              onClick={onMarkPaid}
              disabled={!hasInvoice || invoice?.status === "refunded"}
              className="h-11 justify-center bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:bg-slate-100 disabled:text-slate-400"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {invoice?.status === "refunded" ? "Refunded" : "Mark as Paid"}
            </Button>
          )}
        </div>

        {history.length > 0 && (
          <div className="border-t border-slate-100 pt-4 -mx-6 px-6 -mb-6 pb-6">
            <button
              type="button"
              data-testid="invoice-history-toggle"
              onClick={() => setShowHistory((v) => !v)}
              className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 hover:text-slate-700 transition-colors"
            >
              <span>Invoice History · {history.length}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${showHistory ? "rotate-180" : ""}`}
              />
            </button>
            {showHistory && (
              <ul className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200" data-testid="invoice-history-list">
                {history.map((h) => (
                  <li
                    key={h.id}
                    data-testid={`invoice-history-${h.id}`}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-slate-50/60 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-slate-700">{h.id}</span>
                        <TypeBadge type={h.type} />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {formatDate(h.issuedAt)} · ${h.amount.toFixed(2)}
                      </div>
                    </div>
                    <StatusPill status={h.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
