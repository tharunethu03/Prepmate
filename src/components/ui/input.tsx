import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Search } from "lucide-react";

type InputProps = React.ComponentProps<"input"> & {
  passwordToggle?: boolean;
  searchIcon?: boolean;
};

function Input({
  className,
  type,
  passwordToggle,
  searchIcon,
  ...props
}: InputProps) {
  const [show, setShow] = React.useState(false);

  const isPassword = passwordToggle === true;
  const isSearch = searchIcon === true;

  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="relative w-full">
      <input
        type={inputType}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-tertiary selection:bg-accent/50 selection:text-primary border-border h-[45px] w-[350px] md:w-[450px] min-w-0 rounded-[12px] border bg-foreground py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-accent",
          "aria-invalid:border-destructive",
          isSearch ? "pl-10 pr-3" : "px-3", 
          isPassword && "pr-10",
          className
        )}
        {...props}
      />

      {isSearch && (
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"
        />
      )}

      {isPassword && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-accent"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
}

export { Input };