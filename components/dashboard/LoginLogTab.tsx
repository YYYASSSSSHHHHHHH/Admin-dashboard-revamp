'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/constants';

interface LoginRecord {
  id: string;
  serial: number;
  timestamp: string;
  ipAddress: string;
  deviceId: string;
  geoInfo: string;
  macAddress: string;
}

interface LoginLogTabProps {
  logs: LoginRecord[];
}

export function LoginLogTab({ logs }: LoginLogTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) => {
    const query = searchQuery.toLowerCase();
    return (
      log.ipAddress.toLowerCase().includes(query) ||
      log.deviceId.toLowerCase().includes(query) ||
      log.geoInfo.toLowerCase().includes(query) ||
      log.macAddress.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-5" data-testid="login-log-tab">
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4 bg-white">
          <div className="space-y-0.5">
            <h2 className="font-display text-xl font-semibold text-slate-900 tracking-tight">
              Login History
            </h2>
            <p className="text-sm text-slate-500">
              Authentication logs and session access records for this member.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                data-testid="login-log-search"
                type="text"
                placeholder="Search history logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs bg-white border-slate-200 focus-visible:ring-1"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg h-10 flex items-center justify-center">
              {filteredLogs.length} sessions
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="login-log-table">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100">
                <th className="px-6 py-3 w-16">SR.NO</th>
                <th className="px-6 py-3">DATE & TIME</th>
                <th className="px-6 py-3">IP ADDRESS</th>
                <th className="px-6 py-3">DEVICE ID</th>
                <th className="px-6 py-3">GEO INFORMATION</th>
                <th className="px-6 py-3">MAC ADDRESS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No matching history records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    data-testid={`login-log-row-${log.serial}`}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-400">
                      #{log.serial}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                      {formatDate(log.timestamp)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                      {log.ipAddress}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                      {log.deviceId}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                      {log.geoInfo}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                      {log.macAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
