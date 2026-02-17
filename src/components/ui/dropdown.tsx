"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type DropdownProps = {
  options: string[];
  colors?: string[];
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
};

export function Dropdown({
  options,
  colors,
  placeholder = "Select",
  className,
  onChange,
}: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>("");

  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const toggle = () => setOpen(!open);

  const handleSelect = (value: string) => {
    setSelected(value);
    setOpen(false);
    onChange?.(value);
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-fit">
      {/* Button */}
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "border-border h-[45px] w-[350px] md:w-[450px] rounded-[12px] border bg-foreground px-3 py-1 text-base shadow-xs flex justify-between items-center transition outline-none",
          "focus-visible:border-accent",
          className,
        )}
      >
        <span
          className={cn(
            selected ? "text-primary text-sm" : "text-tertiary text-sm",
            "truncate",
          )}
        >
          {selected || placeholder}
        </span>

        {open ? (
          <ChevronUp className="text-tertiary" size={18} />
        ) : (
          <ChevronDown className="text-tertiary" size={18} />
        )}
      </button>

      {/* Options */}
      {open && (
        <div className="absolute mt-2 w-full rounded-[12px] bg-foreground border border-border shadow-md overflow-hidden z-20">
          {options.map((option, index) => {
            const color = colors?.[index];

            return (
              <button
                type="button"
                key={index}
                onClick={() => handleSelect(option)}
                className={cn(
                  "w-full text-left text-secondary px-4 py-2 text-sm hover:bg-accent/20 hover:text-primary transition flex items-center gap-3",
                  selected === option && "bg-accent/30 text-primary text-sm",
                )}
              >
                {color && (
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                )}

                <span className="text-sm">{option}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
