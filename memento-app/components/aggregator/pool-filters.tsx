"use client";

import { useMemo } from "react";
import { ArrowUpDown, RotateCcw } from "lucide-react";
import { PoolFilters, SortOption } from "@/types/pool";
import { Dropdown, DropdownOption } from "@/components/ui/dropdown";
import { SearchInput } from "@/components/ui/search-input";
import { GlassButton } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";

interface PoolFiltersProps {
  filters: PoolFilters;
  chains: string[];
  projects: string[];
  onFilterChange: <K extends keyof PoolFilters>(key: K, value: PoolFilters[K]) => void;
  onReset: () => void;
  className?: string;
}

const sortOptions: DropdownOption[] = [
  { value: "apy", label: "APY (High to Low)" },
  { value: "tvl", label: "TVL (High to Low)" },
  { value: "apyChange", label: "24h Change" },
];

export function PoolFiltersComponent({
  filters,
  chains,
  projects,
  onFilterChange,
  onReset,
  className,
}: PoolFiltersProps) {
  const chainOptions: DropdownOption[] = useMemo(
    () => chains.map((chain) => ({ value: chain, label: chain })),
    [chains]
  );

  const projectOptions: DropdownOption[] = useMemo(
    () => projects.map((project) => ({ value: project, label: project })),
    [projects]
  );

  const hasActiveFilters =
    filters.chain !== null ||
    filters.project !== null ||
    filters.search !== "" ||
    filters.stablecoin !== null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search bar - full width on mobile */}
      <SearchInput
        value={filters.search}
        onChange={(value) => onFilterChange("search", value)}
        placeholder="Search by project, symbol, or chain..."
        className="w-full"
      />

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Chain dropdown */}
        <Dropdown
          options={chainOptions}
          value={filters.chain}
          onChange={(value) => onFilterChange("chain", value)}
          placeholder="All Chains"
          className="w-full sm:w-40"
        />

        {/* Project dropdown */}
        <Dropdown
          options={projectOptions}
          value={filters.project}
          onChange={(value) => onFilterChange("project", value)}
          placeholder="All Projects"
          className="w-full sm:w-44"
        />

        {/* Sort dropdown */}
        <Dropdown
          options={sortOptions}
          value={filters.sortBy}
          onChange={(value) => onFilterChange("sortBy", value as SortOption)}
          placeholder="Sort by"
          showClear={false}
          className="w-full sm:w-44"
        />

        {/* Show all toggle (default is stablecoins only) */}
        <button
          type="button"
          onClick={() =>
            onFilterChange(
              "stablecoin",
              filters.stablecoin === true ? null : true
            )
          }
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-xl border transition-all",
            filters.stablecoin !== true
              ? "bg-purple-100 border-purple-200 text-purple-700"
              : "bg-white/60 backdrop-blur-xl border-white/30 text-muted-foreground hover:bg-white/80"
          )}
        >
          Show All Assets
        </button>

        {/* Sort direction toggle */}
        <button
          type="button"
          onClick={() =>
            onFilterChange(
              "sortDirection",
              filters.sortDirection === "desc" ? "asc" : "desc"
            )
          }
          className={cn(
            "p-2 rounded-xl border transition-all",
            "bg-white/60 backdrop-blur-xl border-white/30 text-muted-foreground hover:bg-white/80"
          )}
          title={filters.sortDirection === "desc" ? "Sort Descending" : "Sort Ascending"}
        >
          <ArrowUpDown
            className={cn(
              "w-4 h-4 transition-transform",
              filters.sortDirection === "asc" && "rotate-180"
            )}
          />
        </button>

        {/* Reset button */}
        {hasActiveFilters && (
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </GlassButton>
        )}
      </div>
    </div>
  );
}

