import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

type InputProps = React.ComponentProps<"input"> & {
  passwordToggle?: boolean;
};

function Input({ className, type, passwordToggle, ...props }: InputProps) {
  const [show, setShow] = React.useState(false);

  const isPassword = passwordToggle === true;
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="relative w-fit">
      <input
        type={inputType}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-tertiary selection:bg-primary selection:text-primary dark:bg-input/30 border-border h-[45px] w-[350px] md:w-[450px] min-w-0 rounded-[12px] border bg-foreground px-3 pr-10 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-accent",
          "aria-invalid:border-destructive",
          className
        )}
        {...props}
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-accent focus:outline-none"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
}

export { Input };
