import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const MemberSelector = ({ members, selectedId, onSelect }) => {
  const [open, setOpen] = useState(false);
  const selected = members.find((m) => m.id === selectedId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          data-testid="member-selector-trigger"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full md:w-[340px] justify-between h-12 px-3 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
        >
          {selected ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-medium font-display">
                {selected.avatar}
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium text-slate-900 truncate max-w-[220px]">
                  {selected.name}
                </span>
                <span className="text-xs text-slate-500 truncate max-w-[220px]">
                  {selected.email}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500">
              <Search className="h-4 w-4" />
              <span className="text-sm">Select a member…</span>
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start">
        <Command>
          <CommandInput
            data-testid="member-selector-search"
            placeholder="Search by name, email, company…"
            className="h-11"
          />
          <CommandList>
            <CommandEmpty>No member found.</CommandEmpty>
            <CommandGroup heading="Members">
              {members.map((m) => (
                <CommandItem
                  key={m.id}
                  value={`${m.name} ${m.email} ${m.company}`}
                  data-testid={`member-option-${m.id}`}
                  onSelect={() => {
                    onSelect(m.id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 py-2.5 cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-medium font-display border border-slate-200">
                    {m.avatar}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium text-slate-900 truncate">{m.name}</span>
                    <span className="text-xs text-slate-500 truncate">{m.company}</span>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 text-slate-900",
                      selectedId === m.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
