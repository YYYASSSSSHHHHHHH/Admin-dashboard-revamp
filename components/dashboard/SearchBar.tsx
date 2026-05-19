'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export function SearchBar({ placeholder = 'Search by name, email, company...', onSearch }: SearchBarProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      <Input
        data-testid="members-search"
        placeholder={placeholder}
        onChange={(e) => onSearch?.(e.target.value)}
        className="h-10 pl-9 bg-white"
      />
    </div>
  );
}
