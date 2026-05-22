'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import {
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Download,
  Trash2,
  Edit,
  DollarSign,
  AlertTriangle,
  Building,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Plus,
  MoreVertical,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  BadgeCheck,
  Save,
  Send,
  Link
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { toast } from 'sonner';

interface BankSettlement {
  settlementDate: string;
  amountPaid: string;
  recipientBank: string;
  paymentMode: 'Bank Transfer' | 'Cash' | 'Check' | 'UPI / QR' | '';
  referenceNumber: string;
}

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  creationDate: string;
  companyName: string;
  location: string;
  clientEmail: string;
  billingAmount: string;
  associatedPlan: string;
  validityStart: string;
  validityEnd: string;
  status: 'Paid' | 'Unpaid' | 'Cancel';
  settlementDetails: BankSettlement | null;
}



export default function InvoicesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Paid' | 'Unpaid' | 'Cancel'>('All');
  
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [editStatus, setEditStatus] = useState<'Paid' | 'Unpaid' | 'Cancel'>('Unpaid');
  
  const [payDate, setPayDate] = useState('');
  const [payMode, setPayMode] = useState<'Bank Transfer' | 'Cash' | 'Check' | 'UPI / QR' | ''>('Bank Transfer');
  const [payRef, setPayRef] = useState('');
  const [payAmt, setPayAmt] = useState('');
  const [payBank, setPayBank] = useState('');

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailInvoice, setEmailInvoice] = useState<InvoiceRecord | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfInvoice, setPdfInvoice] = useState<InvoiceRecord | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState<InvoiceRecord | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/invoices');
        if (response.ok) {
          const data = await response.json();
          setInvoices(data);
        }
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const toggleRow = (id: string) => {
    if (expandedInvoiceId === id) {
      setExpandedInvoiceId(null);
    } else {
      setExpandedInvoiceId(id);
    }
  };

  
  const triggerStatusEdit = (inv: InvoiceRecord) => {
    setSelectedInvoice(inv);
    setEditStatus(inv.status);
    
    if (inv.status === 'Paid' && inv.settlementDetails) {
      setPayDate(inv.settlementDetails.settlementDate);
      setPayMode(inv.settlementDetails.paymentMode);
      setPayRef(inv.settlementDetails.referenceNumber);
      setPayAmt(inv.settlementDetails.amountPaid);
      setPayBank(inv.settlementDetails.recipientBank);
    } else {
      setPayDate(inv.creationDate);
      setPayMode('Bank Transfer');
      setPayRef('');
      setPayAmt(inv.billingAmount);
      setPayBank('HDFC Bank');
    }
    setStatusDialogOpen(true);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    if (editStatus === 'Paid') {
      if (!payDate.trim()) { toast.error('Payment Date is required'); return; }
      if (!payAmt.trim()) { toast.error('Settlement Amount is required'); return; }
      if (!payBank.trim()) { toast.error('Recipient Bank is required'); return; }
      if (!payRef.trim()) { toast.error('Transaction Reference Number is required'); return; }
    }

    try {
      const settlementDetails = editStatus === 'Paid' ? {
        settlementDate: payDate,
        amountPaid: payAmt,
        recipientBank: payBank,
        paymentMode: payMode,
        referenceNumber: payRef
      } : null;

      await fetch(`/api/invoices/${selectedInvoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus, settlementDetails })
      });

      const updated = invoices.map((inv) => {
        if (inv.id === selectedInvoice.id) {
          return { ...inv, status: editStatus, settlementDetails };
        }
        return inv;
      });

      setInvoices(updated);
      toast.success(`Invoice "${selectedInvoice.invoiceNumber}" status set to ${editStatus}`);
      setStatusDialogOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const triggerSendEmail = (inv: InvoiceRecord) => {
    setEmailInvoice(inv);
    setRecipientEmail(inv.clientEmail);
    setEmailSubject(`Invoice ${inv.invoiceNumber} - ${inv.companyName}`);
    setEmailBody(`Hi ${inv.companyName} Team,\n\nPlease find attached the invoice "${inv.invoiceNumber}" for your subscription plan ${inv.associatedPlan} (Billing Amount: ${inv.billingAmount}).\n\nBest regards,\nNorthgate Billing Operations`);
    setEmailDialogOpen(true);
  };

  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInvoice) return;

    if (!recipientEmail.trim()) {
      toast.error('Recipient Email is required');
      return;
    }

    try {
      await fetch(`/api/invoices/${emailInvoice.id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipientEmail, subject: emailSubject, body: emailBody })
      });
      toast.success(`Invoice email successfully dispatched to ${recipientEmail}`);
      setEmailDialogOpen(false);
      setEmailInvoice(null);
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const triggerPdfDownload = (inv: InvoiceRecord) => {
    setPdfInvoice(inv);
    setPdfDialogOpen(true);
  };

  const handlePdfDownloadSubmit = () => {
    if (!pdfInvoice) return;
    
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`Invoice: ${pdfInvoice.invoiceNumber}\nAmount: ${pdfInvoice.billingAmount}\nCompany: ${pdfInvoice.companyName}`);
    link.setAttribute('download', `${pdfInvoice.invoiceNumber.replace(/\//g, '_')}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Invoice document ${pdfInvoice.invoiceNumber} downloaded successfully`);
    setPdfDialogOpen(false);
    setPdfInvoice(null);
  };

  const handleDeleteSubmit = async () => {
    if (!deletingInvoice) return;

    try {
      await fetch(`/api/invoices/${deletingInvoice.id}`, { method: 'DELETE' });
      const updated = invoices.filter(inv => inv.id !== deletingInvoice.id);
      setInvoices(updated);
      toast.success(`Invoice "${deletingInvoice.invoiceNumber}" has been permanently deleted`);
      setDeleteDialogOpen(false);
      setDeletingInvoice(null);
      if (expandedInvoiceId === deletingInvoice.id) {
        setExpandedInvoiceId(null);
      }
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  const counts = useMemo(() => {
    return {
      All: invoices.length,
      Paid: invoices.filter(inv => inv.status === 'Paid').length,
      Unpaid: invoices.filter(inv => inv.status === 'Unpaid').length,
      Cancel: invoices.filter(inv => inv.status === 'Cancel').length,
    };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesTab = activeTab === 'All' || inv.status === activeTab;
      
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.companyName.toLowerCase().includes(query) ||
        inv.location.toLowerCase().includes(query) ||
        inv.associatedPlan.toLowerCase().includes(query) ||
        inv.billingAmount.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [invoices, activeTab, searchQuery]);

  if (!isMounted) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 lg:p-10 flex items-center justify-center min-h-[50vh]">
          <p className="text-slate-500 font-medium animate-pulse">Loading Invoice Ledger...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div data-testid="invoice-management-page" className="p-6 md:p-8 lg:p-10 space-y-0">
        
        <div className="mb-5">
          <Header
            title="Invoice Ledger"
            subtitle="Track client payments, audit detailed bank settlements, download physical invoices, and manage payment statuses."
          />
        </div>

        <div 
          className="p-4 border bg-white flex flex-col md:flex-row gap-3 items-stretch md:items-center"
          style={{ borderColor: '#E5E7EB', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', borderBottomWidth: '0' }}
        >
          <div className="flex-1 max-w-sm">
            <SearchBar
              placeholder="Search invoice number, plan, amount..."
              onSearch={setSearchQuery}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 sm:ml-auto">
            {(['All', 'Paid', 'Unpaid', 'Cancel'] as const).map((tab) => {
              const isActive = activeTab === tab;
              const countVal = counts[tab];
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`h-9 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all duration-150 cursor-pointer select-none ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{tab}</span>
                  <span 
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none ${
                      isActive 
                        ? 'bg-slate-800 text-slate-200' 
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {countVal}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div 
          className="bg-white border overflow-hidden" 
          style={{ borderColor: '#E5E7EB', borderTopLeftRadius: '0', borderTopRightRadius: '0', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}
        >
          <table className="w-full">
            <thead className="bg-white border-b animate-none" style={{ borderColor: '#EEF2F6' }}>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                <th className="px-6 py-3.5 font-semibold w-12 text-center"></th>
                <th className="px-6 py-3.5 font-semibold w-16 text-center whitespace-nowrap">SR.NO</th>
                <th className="px-6 py-3.5 font-semibold">COMPANY INFORMATION</th>
                <th className="px-6 py-3.5 font-semibold">INVOICE DATE</th>
                <th className="px-6 py-3.5 font-semibold">INVOICE NUMBER</th>
                <th className="px-6 py-3.5 font-semibold">PLAN & VALIDITY</th>
                <th className="px-6 py-3.5 font-semibold">BILLING AMOUNT</th>
                <th className="px-6 py-3.5 font-semibold">STATUS</th>
                <th className="px-6 py-3.5 font-semibold text-center w-28 whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-slate-500">
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-slate-500">
                    No transactions found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, index) => {
                  const isExpanded = expandedInvoiceId === inv.id;
                  const displayIndex = String(index + 1).padStart(2, '0');
                  
                  return (
                    <Fragment key={inv.id}>
                      <tr 
                        className="hover:bg-slate-50/40 bg-white border-b transition-colors cursor-pointer select-none"
                        style={{ borderColor: '#F1F5F9' }}
                        onClick={() => toggleRow(inv.id)}
                      >
                        <td className="px-6 py-4 text-center w-12 text-slate-400">
                          <div className="flex justify-center">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs font-semibold w-16">
                          {displayIndex}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-900 text-[13px] flex items-center gap-1.5">
                              <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              {inv.companyName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              {inv.location}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 w-36 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {inv.creationDate}
                          </span>
                        </td>

                        <td className="px-6 py-4 w-44 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                          {inv.invoiceNumber}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-900 text-[13px]">
                              {inv.associatedPlan}
                            </span>
                            <span className="text-xs text-slate-500 mt-0.5">
                              {inv.validityStart} to {inv.validityEnd}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 w-32 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                          {inv.billingAmount}
                        </td>

                        <td className="px-6 py-4 w-28">
                          <StatusBadge status={inv.status} />
                        </td>

                        <td 
                          className="px-6 py-4 text-center w-28"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-slate-750 border border-slate-200 hover:bg-slate-50 rounded-md cursor-pointer bg-white"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-44 p-1.5 border border-slate-200 bg-white shadow-lg rounded-lg z-50 focus:outline-hidden">
                              <div className="flex flex-col gap-0.5 text-xs">
                                <button
                                  onClick={() => triggerStatusEdit(inv)}
                                  className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-slate-50 text-slate-700 rounded-md transition-colors text-left cursor-pointer font-semibold"
                                >
                                  <Edit className="h-3.5 w-3.5 text-slate-400" />
                                  Update Status
                                </button>
                                <button
                                  onClick={() => triggerSendEmail(inv)}
                                  className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-slate-50 text-slate-700 rounded-md transition-colors text-left cursor-pointer font-semibold"
                                >
                                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                                  Send Email
                                </button>
                                <button
                                  onClick={() => triggerPdfDownload(inv)}
                                  className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-slate-50 text-slate-700 rounded-md transition-colors text-left cursor-pointer font-semibold"
                                >
                                  <Download className="h-3.5 w-3.5 text-slate-400" />
                                  Download PDF
                                </button>
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                  onClick={() => {
                                    setDeletingInvoice(inv);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-red-50 text-red-650 hover:text-red-750 rounded-md transition-colors text-left cursor-pointer font-semibold"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                  Delete
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={9} className="p-5 pl-18 border-b" style={{ borderColor: '#EEF2F6' }}>
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5 text-slate-400" /> Bank Settlement Details
                              </h4>
                              
                              {inv.status !== 'Paid' || !inv.settlementDetails ? (
                                <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg max-w-lg">
                                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                                  <p className="text-xs text-slate-500">
                                    No transaction audit ledger available. These fields remain empty/hidden for unpaid or cancelled records.
                                  </p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                                  
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Settlement Date</span>
                                    <span className="text-xs font-semibold text-slate-800">{inv.settlementDetails.settlementDate}</span>
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Amount Paid</span>
                                    <span className="text-xs font-bold text-emerald-700 font-mono">{inv.settlementDetails.amountPaid}</span>
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Recipient Bank</span>
                                    <span className="text-xs font-semibold text-slate-800">{inv.settlementDetails.recipientBank}</span>
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Payment Mode</span>
                                    <span className="text-xs font-semibold text-slate-850">{inv.settlementDetails.paymentMode}</span>
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Reference Number</span>
                                    <span className="text-xs font-bold text-slate-700 font-mono">{inv.settlementDetails.referenceNumber}</span>
                                  </div>

                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>


        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent className="sm:max-w-2xl bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[100] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit className="h-5 w-5 text-slate-500" />
                Update Payment Status
              </DialogTitle>
              <DialogDescription className="text-slate-550 text-xs">
                Modify transaction payment details and complete bank settlement audits.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleStatusSubmit} className="space-y-5 py-2">
              
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Select Status</Label>
                <div className="flex items-center gap-6">
                  {(['Unpaid', 'Paid', 'Cancel'] as const).map((stat) => (
                    <label 
                      key={stat} 
                      className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer select-none"
                    >
                      <input 
                        type="radio" 
                        name="edit-status-group" 
                        checked={editStatus === stat} 
                        onChange={() => setEditStatus(stat)} 
                        className="h-4 w-4 accent-slate-900 cursor-pointer" 
                      />
                      {stat}
                    </label>
                  ))}
                </div>
              </div>

              {editStatus === 'Paid' && (
                <div className="pt-4 border-t border-dashed border-slate-200 space-y-4 animate-none">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Bank Settlement Audit Variables
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pay-date" className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Payment Date</Label>
                      <Input 
                        id="pay-date" 
                        type="text" 
                        placeholder="e.g. 24-Apr-2026" 
                        value={payDate} 
                        onChange={(e) => setPayDate(e.target.value)} 
                        className="h-10 text-xs bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" 
                        required 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pay-amt" className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Amount Paid</Label>
                      <Input 
                        id="pay-amt" 
                        type="text" 
                        placeholder="e.g. ₹ 5,000" 
                        value={payAmt} 
                        onChange={(e) => setPayAmt(e.target.value)} 
                        className="h-10 text-xs bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none font-mono" 
                        required 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pay-bank" className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Recipient Bank</Label>
                      <Input 
                        id="pay-bank" 
                        placeholder="e.g. HDFC Bank" 
                        value={payBank} 
                        onChange={(e) => setPayBank(e.target.value)} 
                        className="h-10 text-xs bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" 
                        required 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Payment Mode</Label>
                      <Select 
                        value={payMode} 
                        onValueChange={(val: any) => setPayMode(val)}
                      >
                        <SelectTrigger className="h-10 bg-slate-50/50 text-xs border-slate-200"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white border border-slate-200 z-[120]">
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Check">Check</SelectItem>
                          <SelectItem value="UPI / QR">UPI / QR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <Label htmlFor="pay-ref" className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Transaction Reference Number</Label>
                      <Input 
                        id="pay-ref" 
                        placeholder="e.g. TXN9928341" 
                        value={payRef} 
                        onChange={(e) => setPayRef(e.target.value)} 
                        className="h-10 text-xs bg-slate-50/50 border-slate-200 text-sm focus:bg-white font-mono animate-none" 
                        required 
                      />
                    </div>

                  </div>
                </div>
              )}

              <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStatusDialogOpen(false)} 
                  className="h-10 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="h-10 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                >
                  Save Changes
                </Button>
              </DialogFooter>

            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogContent className="sm:max-w-2xl bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[150] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="h-5 w-5 text-slate-500" />
                Compose Invoice Email
              </DialogTitle>
              <DialogDescription className="text-slate-550 text-xs">
                Draft a billing transaction dispatch, customize variables, and send standard physical invoice details.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSendEmailSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Recipient</Label>
                  <Select value="default">
                    <SelectTrigger className="h-10 w-full bg-slate-50/50 border-slate-200 text-xs">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-slate-100 text-[9px] font-bold flex items-center justify-center text-slate-600">CL</div>
                          <span className="truncate font-semibold text-slate-700">{recipientEmail}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 z-[160]">
                      <SelectItem value="default">{recipientEmail}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">From</Label>
                  <Select value="default">
                    <SelectTrigger className="h-10 w-full bg-slate-50/50 border-slate-200 text-xs">
                      <SelectValue>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">Northgate Ops</span>
                          <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-slate-400 font-mono text-[10px]">ops@northgate.io</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 z-[160]">
                      <SelectItem value="default">Northgate Ops</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Subject</Label>
                <Input
                  placeholder="What's this email about?"
                  className="h-10 text-xs bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Message</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setEmailBody(prev => prev + ' {{invoice_link}}');
                      toast.info('Variable tag added to body');
                    }}
                    className="h-7 px-2.5 text-[10px] font-bold bg-white border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="font-mono bg-slate-100 border border-slate-200 rounded px-1 text-[9px] mr-1.5">{'{x}'}</span>
                    Insert Link Variable
                  </Button>
                </div>
                
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <div className="border-b border-slate-200 px-3 py-1.5 flex items-center gap-0.5 overflow-x-auto bg-slate-50/50">
                    <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><Bold className="h-4 w-4" /></button>
                    <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><Italic className="h-4 w-4" /></button>
                    <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><Underline className="h-4 w-4" /></button>
                    <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><Strikethrough className="h-4 w-4" /></button>
                    <div className="w-px h-4 bg-slate-200 mx-1.5" />
                    <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center font-bold">H1</button>
                    <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center font-bold">H2</button>
                    <div className="w-px h-4 bg-slate-200 mx-1.5" />
                    <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><List className="h-4 w-4" /></button>
                    <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><ListOrdered className="h-4 w-4" /></button>
                    <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><Quote className="h-4 w-4" /></button>
                    <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><Link className="h-4 w-4" /></button>
                    <div className="w-px h-4 bg-slate-200 mx-1.5" />
                    <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><Undo className="h-4 w-4" /></button>
                    <button type="button" className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-xs font-semibold w-7 h-7 flex items-center justify-center"><Redo className="h-4 w-4" /></button>
                  </div>
                  
                  <textarea
                    className="w-full border-0 focus-visible:ring-0 rounded-none min-h-[180px] resize-none text-xs text-slate-700 p-3 leading-relaxed focus:outline-hidden"
                    value={emailBody}
                    placeholder="Compose invoice notification message details..."
                    onChange={(e) => setEmailBody(e.target.value)}
                    required
                  />
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100 gap-2 sm:space-x-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEmailDialogOpen(false)} 
                  className="h-10 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    toast.success('Invoice draft template saved successfully');
                    setEmailDialogOpen(false);
                  }} 
                  className="h-10 text-xs font-semibold hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" /> Save Draft
                </Button>

                <Button 
                  type="submit" 
                  className="h-10 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" /> Send Email
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[150]">
            <DialogHeader>
              <DialogTitle className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Download className="h-5 w-5 text-slate-500" /> Download Physical Invoice
              </DialogTitle>
              <DialogDescription className="text-slate-550 text-xs mt-1">
                Generate dynamic PDF document billing transaction package for <span className="font-semibold text-slate-850">{pdfInvoice?.invoiceNumber}</span>.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setPdfDialogOpen(false)} 
                className="h-9 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handlePdfDownloadSubmit} 
                className="h-9 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[150]">
            <DialogHeader>
              <DialogTitle className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-655" /> Purge Invoice Record?
              </DialogTitle>
              <DialogDescription className="text-slate-550 text-xs mt-1">
                Are you sure you want to delete invoice <span className="font-bold text-slate-850">"{deletingInvoice?.invoiceNumber}"</span>? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setDeleteDialogOpen(false); setDeletingInvoice(null); }} 
                className="h-9 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleDeleteSubmit} 
                className="h-9 text-xs font-semibold bg-red-650 hover:bg-red-700 text-white cursor-pointer"
              >
                Delete Invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
