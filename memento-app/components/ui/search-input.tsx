"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, placeholder = "Search...", ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-9 pr-9 py-2 text-sm",
            "bg-white/60 backdrop-blur-xl border border-white/30 rounded-xl",
            "placeholder:text-muted-foreground",
            "hover:bg-white/80 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
            className
          )}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              onClear?.();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted/50 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };

