'use client';

import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterSelectProps {
  label: string;
  options: string[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  showFilterIcon?: boolean;
}

export function FilterSelect({ label, options, defaultValue, onChange, showFilterIcon = false }: FilterSelectProps) {
  return (
    <Select value={defaultValue} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full sm:w-[160px] bg-white">
        {showFilterIcon && <Filter className="h-3.5 w-3.5 mr-1 text-slate-400" />}
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => {
          const label = option.charAt(0).toUpperCase() + option.slice(1).toLowerCase();
          return (
            <SelectItem key={option} value={option} className="text-xs">
              {label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
