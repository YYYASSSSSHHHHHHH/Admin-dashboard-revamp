'use client';

import { Edit, Mail, Download, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface InvoiceRowActionsMenuProps {
  onUpdateStatus: () => void;
  onSendEmail: () => void;
  onDownloadPdf: () => void;
  onDelete: () => void;
  testIdPrefix?: string;
}

export function InvoiceRowActionsMenu({
  onUpdateStatus,
  onSendEmail,
  onDownloadPdf,
  onDelete,
  testIdPrefix = 'invoice',
}: InvoiceRowActionsMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          data-testid={`${testIdPrefix}-actions-menu`}
          className="h-8 w-8 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:text-blue-800 rounded-md cursor-pointer bg-blue-50"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-44 p-1.5 border border-slate-200 bg-white shadow-lg rounded-lg z-50 focus:outline-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-0.5 text-xs">
          <button
            type="button"
            data-testid={`${testIdPrefix}-action-update-status`}
            onClick={onUpdateStatus}
            className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-slate-50 text-slate-700 rounded-md transition-colors text-left cursor-pointer font-semibold"
          >
            <Edit className="h-3.5 w-3.5 text-slate-400" />
            Update Status
          </button>
          <button
            type="button"
            data-testid={`${testIdPrefix}-action-send-email`}
            onClick={onSendEmail}
            className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-slate-50 text-slate-700 rounded-md transition-colors text-left cursor-pointer font-semibold"
          >
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            Send Email
          </button>
          <button
            type="button"
            data-testid={`${testIdPrefix}-action-download-pdf`}
            onClick={onDownloadPdf}
            className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-slate-50 text-slate-700 rounded-md transition-colors text-left cursor-pointer font-semibold"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            Download PDF
          </button>
          <div className="h-px bg-slate-100 my-1" />
          <button
            type="button"
            data-testid={`${testIdPrefix}-action-delete`}
            onClick={onDelete}
            className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-red-50 text-red-650 hover:text-red-750 rounded-md transition-colors text-left cursor-pointer font-semibold"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
            Delete
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
