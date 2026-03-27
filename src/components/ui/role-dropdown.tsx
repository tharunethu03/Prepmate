"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { INDUSTRIES } from "@/data/industries";

type RoleDropdownProps = {
  userIndustry?: string | null; // session.user.field
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (role: string, industry: string) => void;
};

// Given a role name, find which industry it belongs to
export function findIndustryForRole(role: string): string {
  for (const [industry, roles] of Object.entries(INDUSTRIES)) {
    if (roles.includes(role)) return industry;
  }
  return "";
}

export function RoleDropdown({
  userIndustry,
  placeholder = "Choose a role",
  className,
  value,
  onChange,
}: RoleDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>(value ?? "");
  const [search, setSearch] = React.useState("");
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (value !== undefined) setSelected(value);
  }, [value]);

  // Focus search when dropdown opens
  React.useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (role: string) => {
    setSelected(role);
    setOpen(false);
    const industry = findIndustryForRole(role);
    onChange?.(role, industry);
  };

  // Split industries: user's first, then rest alphabetically
  const userRoles = userIndustry ? (INDUSTRIES[userIndustry] ?? []) : [];
  const otherIndustries = Object.entries(INDUSTRIES).filter(
    ([ind]) => ind !== userIndustry,
  );

  // Build filtered groups based on search
  const query = search.toLowerCase().trim();

  const filteredUserRoles = userRoles.filter((r) =>
    r.toLowerCase().includes(query),
  );

  const filteredOtherGroups = otherIndustries
    .map(([ind, roles]) => ({
      industry: ind,
      roles: roles.filter((r) => r.toLowerCase().includes(query)),
    }))
    .filter((g) => g.roles.length > 0);

  const hasResults =
    filteredUserRoles.length > 0 || filteredOtherGroups.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full mt-2">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "border-border h-[45px] w-full rounded-[12px] border bg-foreground px-3 py-1 text-base shadow-xs flex justify-between items-center transition outline-none",
          "focus-visible:border-accent",
          open && "border-accent",
          className,
        )}
      >
        <span
          className={cn(
            "truncate text-sm",
            selected ? "text-primary" : "text-tertiary",
          )}
        >
          {selected || placeholder}
        </span>
        {open ? (
          <ChevronUp className="text-tertiary shrink-0" size={18} />
        ) : (
          <ChevronDown className="text-tertiary shrink-0" size={18} />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute mt-2 w-full rounded-[14px] bg-foreground border border-border shadow-lg z-50 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border shrink-0">
            <Search size={14} className="text-tertiary shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-tertiary text-primary"
            />
          </div>

          {/* Scrollable list */}
          <div className="overflow-y-auto max-h-72 py-1">
            {!hasResults && (
              <p className="text-xs text-tertiary text-center py-4">
                No roles found
              </p>
            )}

            {/* ── User's industry first ── */}
            {userIndustry && filteredUserRoles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-4 py-1.5">
                  <span className="text-[11px] font-semibold text-accent uppercase tracking-widest shrink-0">
                    {userIndustry}
                  </span>
                  <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded-full shrink-0">
                    Your industry
                  </span>
                </div>
                {filteredUserRoles.map((role) => (
                  <RoleOption
                    key={role}
                    role={role}
                    selected={selected}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}

            {/* ── Other industries ── */}
            {filteredOtherGroups.length > 0 && (
              <>
                {userIndustry && filteredUserRoles.length > 0 && (
                  <div className="border-t border-border mt-1 mb-1" />
                )}
                {filteredOtherGroups.map(({ industry, roles }) => (
                  <div key={industry}>
                    <p className="text-[11px] font-semibold text-tertiary uppercase tracking-widest px-4 py-1.5">
                      {industry}
                    </p>
                    {roles.map((role) => (
                      <RoleOption
                        key={role}
                        role={role}
                        selected={selected}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RoleOption({
  role,
  selected,
  onSelect,
}: {
  role: string;
  selected: string;
  onSelect: (r: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className={cn(
        "w-full text-left text-secondary px-4 py-2 text-sm hover:bg-accent/15 hover:text-primary transition",
        selected === role && "bg-accent/25 text-primary font-medium",
      )}
    >
      {role}
    </button>
  );
}
