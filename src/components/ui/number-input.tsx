"use client";

import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type NumberInputProps = {
  min?: number;
  max?: number;
  step?: number;
  initial?: number | "";
  placeholder?: string;
  className?: string;
  onChange?: (value: number) => void; // ✅ NUMBER, not event, not string
};

const NumberInput: React.FC<NumberInputProps> = ({
  min = 0,
  max = 100,
  step = 1,
  initial = "",
  placeholder,
  className,
  onChange,
}) => {
  const [value, setValue] = React.useState<number | "">(initial);

  const handleDecrease = () => {
    setValue((prev) => {
      const next = prev === "" ? min : Math.max(prev - step, min);
      onChange?.(next);
      return next;
    });
  };

  const handleIncrease = () => {
    setValue((prev) => {
      const next = prev === "" ? min : Math.min(prev + step, max);
      onChange?.(next);
      return next;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (val === "") {
      setValue("");
    } else {
      const num = Number(val);
      if (!isNaN(num)) {
        const next = Math.min(Math.max(num, min), max);
        setValue(next);
        onChange?.(next);
      }
    }
  };

  return (
    <div className={cn("w-full min-w-md relative", className)}>
      <div className="flex items-center border border-border h-[45px] rounded-[12px] bg-transparent shadow-xs focus-within:ring-accent px-3 py-2 transition-[color,box-shadow]">
        {/* Number input on left */}
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-tertiary disabled:cursor-not-allowed disabled:opacity-50"
        />

        {/* Chevron buttons on right */}
        <div className="flex flex-col ml-1 space-y-1">
          <button
            type="button"
            onClick={handleIncrease}
            className="w-7 flex items-center justify-center rounded text-tertiary hover:text-accent hover:border border-accent/50 transition"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDecrease}
            className="w-7 flex items-center justify-center rounded text-tertiary hover:text-accent hover:border border-accent/50 transition"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export { NumberInput };
