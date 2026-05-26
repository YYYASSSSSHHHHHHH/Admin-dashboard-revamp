'use client';

import { useState } from 'react';
import { Search, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { PlanBadge } from '@/components/dashboard/PlanBadge';

interface AccountMatchTabProps {
  member: any;
  companyName: string;
  city: string;
  firstName: string;
  lastName: string;
  mobile: string;
}

interface SearchConfig {
  companyName: boolean;
  firstName: boolean;
  lastName: boolean;
  city: boolean;
  mobile: boolean;
  email: boolean;
  ipAddress: boolean;
  deviceId: boolean;
}

interface SearchData {
  companyName: string;
  firstName: string;
  lastName: string;
  city: string;
  mobile: string;
  email: string;
  ipAddress: string;
  deviceId: string;
}

export function AccountMatchTab({ member, companyName, city, firstName, lastName, mobile }: AccountMatchTabProps) {
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [searchData, setSearchData] = useState<SearchData>({
    companyName: companyName || '',
    firstName: firstName || '',
    lastName: lastName || '',
    city: city || '',
    mobile: mobile || '',
    email: member?.email || '',
    ipAddress: member?.joinIp || '',
    deviceId: member?.loginLogs?.[0]?.id || 'LOG-01',
  });

  const [searchConfig, setSearchConfig] = useState<SearchConfig>({
    companyName: true,
    firstName: true,
    lastName: true,
    city: true,
    mobile: true,
    email: true,
    ipAddress: true,
    deviceId: true,
  });

  const handleSearch = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setHasSearched(true);
    setLoading(false);
  };

  const handleConfigChange = (key: keyof SearchConfig) => {
    setSearchConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDataChange = (key: keyof SearchData, value: string) => {
    setSearchData(prev => ({ ...prev, [key]: value }));
  };

  // Mock results dynamically matching the current user input to simulate duplicates
  const MOCK_RESULTS = [
    {
      id: 'similar-1',
      companyName: searchData.companyName || 'Match Co 1',
      firstName: searchData.firstName || 'MatchFirst',
      lastName: searchData.lastName || 'MatchLast',
      city: searchData.city || 'MatchCity',
      mobile: searchData.mobile || '098-765-4321',
      email: searchData.email || `${(searchData.firstName || 'user').toLowerCase()}.1@example.com`,
      ipAddress: searchData.ipAddress || '192.168.1.1',
      deviceId: searchData.deviceId || 'dev-1111',
      plan: 'Enterprise',
      status: 'ACTIVE',
      score: 100,
    },
    {
      id: 'similar-2',
      companyName: searchData.companyName || 'Match Co 2',
      firstName: searchData.firstName || 'MatchFirst',
      lastName: searchData.lastName || 'MatchLast',
      city: searchData.city || 'MatchCity',
      mobile: '555-000-1111',
      email: `${(searchData.firstName || 'user').toLowerCase()}.2@example.com`,
      ipAddress: '10.0.0.5',
      deviceId: searchData.deviceId || 'dev-2222',
      plan: 'Growth',
      status: 'SUSPENDED',
      score: 85,
    },
    {
      id: 'similar-3',
      companyName: 'Different Company LLC',
      firstName: searchData.firstName || 'MatchFirst',
      lastName: 'DifferentLast',
      city: searchData.city || 'MatchCity',
      mobile: searchData.mobile || '098-765-4321',
      email: `${(searchData.firstName || 'user').toLowerCase()}.3@example.com`,
      ipAddress: searchData.ipAddress || '192.168.1.1',
      deviceId: 'dev-3333',
      plan: 'Scale',
      status: 'ACTIVE',
      score: 65,
    },
  ];

  const Field = ({ label, fieldKey }: { label: string; fieldKey: keyof SearchData & keyof SearchConfig }) => (
    <div className="flex flex-col gap-1.5 min-w-[130px] flex-1">
      <Label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 truncate">
        {label}
      </Label>
      <div className="relative flex items-center">
        <Input
          data-testid={`match-input-${fieldKey}`}
          value={searchData[fieldKey]}
          onChange={(e) => handleDataChange(fieldKey, e.target.value)}
          readOnly={!searchConfig[fieldKey]}
          className="h-9 pr-8 bg-white text-xs text-slate-900 transition-colors"
        />
        <div className="absolute right-2 flex items-center justify-center">
          <Checkbox
            id={`chk-${fieldKey}`}
            checked={searchConfig[fieldKey]}
            onCheckedChange={() => handleConfigChange(fieldKey)}
            className="h-3.5 w-3.5"
            title="Include in search"
          />
        </div>
      </div>
    </div>
  );

  const colSpanCount = 10;

  return (
    <div data-testid="account-match-tab" className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <h2 className="font-display text-xl font-semibold text-slate-900 tracking-tight">
          Account Match Search
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Search for similar accounts based on selected criteria to identify duplicates or related entities.
        </p>
      </div>

      {/* Search Fields */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-5">
        <div className="flex flex-nowrap overflow-x-auto gap-3 pb-1">
          <Field label="Company" fieldKey="companyName" />
          <Field label="First Name" fieldKey="firstName" />
          <Field label="Last Name" fieldKey="lastName" />
          <Field label="City" fieldKey="city" />
          <Field label="Mobile No" fieldKey="mobile" />
          <Field label="Email" fieldKey="email" />
          <Field label="IP Address" fieldKey="ipAddress" />
          <Field label="Device ID" fieldKey="deviceId" />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Searching...</>
            ) : (
              <><Search className="h-4 w-4 mr-2" /> Search Matches</>
            )}
          </Button>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100 bg-white">
              <th className="px-4 py-4 whitespace-nowrap">Match Score</th>
              <th className="px-4 py-4 whitespace-nowrap">Company</th>
              <th className="px-4 py-4 whitespace-nowrap">Name</th>
              <th className="px-4 py-4 whitespace-nowrap">City</th>
              <th className="px-4 py-4 whitespace-nowrap">Mobile</th>
              <th className="px-4 py-4 whitespace-nowrap">Email</th>
              <th className="px-4 py-4 whitespace-nowrap">IP Address</th>
              <th className="px-4 py-4 whitespace-nowrap">Device ID</th>
              <th className="px-4 py-4 whitespace-nowrap">Plan</th>
              <th className="px-4 py-4 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!hasSearched ? (
              <tr>
                <td colSpan={colSpanCount} className="px-6 py-12 text-center text-sm text-slate-500 bg-white">
                  Click the search button to find matching accounts.
                </td>
              </tr>
            ) : MOCK_RESULTS.length === 0 ? (
              <tr>
                <td colSpan={colSpanCount} className="px-6 py-12 text-center text-sm text-slate-500 bg-white">
                  No matching accounts found.
                </td>
              </tr>
            ) : (
              MOCK_RESULTS.map((result) => (
                <tr key={result.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                  {/* Score */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full border-[3px] border-slate-100 flex items-center justify-center relative">
                        <div
                          className={`absolute inset-0 rounded-full border-[3px] ${
                            result.score > 80 ? 'border-emerald-500' : result.score > 50 ? 'border-amber-500' : 'border-slate-300'
                          }`}
                          style={{ clipPath: `polygon(0 0, 100% 0, 100% ${result.score}%, 0 ${result.score}%)` }}
                        />
                        <span className="text-[11px] font-bold text-slate-900 z-10">{result.score}</span>
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">/ 100</span>
                    </div>
                  </td>
                  {/* Company */}
                  <td className="px-4 py-4">
                    <Link
                      href={`/members/${result.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-black hover:underline text-sm whitespace-nowrap"
                    >
                      {result.companyName}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </Link>
                  </td>
                  {/* Name */}
                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-700 whitespace-nowrap">
                      {result.firstName} {result.lastName}
                    </div>
                  </td>
                  {/* City */}
                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-700">{result.city || '—'}</div>
                  </td>
                  {/* Mobile */}
                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-700 whitespace-nowrap">{result.mobile || '—'}</div>
                  </td>
                  {/* Email */}
                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-700 whitespace-nowrap">{result.email || '—'}</div>
                  </td>
                  {/* IP Address */}
                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-700 whitespace-nowrap">{result.ipAddress || '—'}</div>
                  </td>
                  {/* Device ID */}
                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-700 whitespace-nowrap">{result.deviceId || '—'}</div>
                  </td>
                  {/* Plan */}
                  <td className="px-4 py-4">
                    <PlanBadge plan={result.plan} />
                  </td>
                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusBadge status={result.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
