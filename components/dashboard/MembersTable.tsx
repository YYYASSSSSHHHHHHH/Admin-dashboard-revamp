'use client';

import { TableRow } from './TableRow';

interface Member {
  id: string;
  initials: string;
  name: string;
  email: string;
  plan: string;
  planPrice: string;
  status: string;
  payment: string;
  expiryDate: string;
  daysLeft: string;
}

interface MembersTableProps {
  members: Member[];
}

export function MembersTable({ members }: MembersTableProps) {
  return (
    <div className="bg-white border overflow-hidden" style={{ borderColor: '#E5E7EB', borderTopLeftRadius: '0', borderTopRightRadius: '0', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
      <table className="w-full">
        <thead className="bg-white border-b" style={{ borderColor: '#EEF2F6' }}>
          <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            <th className="px-6 py-3 font-semibold">
              MEMBER
            </th>
            <th className="px-6 py-3 font-semibold">
              PLAN
            </th>
            <th className="px-6 py-3 font-semibold">
              STATUS
            </th>
            <th className="px-6 py-3 font-semibold">
              PAYMENT
            </th>
            <th className="px-6 py-3 font-semibold">
              EXPIRY
            </th>
            <th className="px-6 py-3 font-semibold text-right">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {members.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500" data-testid="members-empty">
                No members match your filters.
              </td>
            </tr>
          ) : (
            members.map((member) => (
              <TableRow key={member.id} member={member} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
