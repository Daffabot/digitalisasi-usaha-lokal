import React, { useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

interface CuteInputProps extends Omit<HTMLMotionProps<"input">, "children"> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const CuteInput = React.forwardRef<HTMLInputElement, CuteInputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="w-full space-y-1.5">
        {/* Label: Abu gelap di light mode, Abu terang di dark mode */}
        {label && (
          <label className="ml-1 text-sm font-bold text-neutral-600 dark:text-neutral-400">
            {label}
          </label>
        )}

        <motion.div
          animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative group"
        >
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-accentblue transition-colors pointer-events-none">
              {icon}
            </div>
          )}
          <motion.input
            ref={ref}
            type={type}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              "flex w-full rounded-2xl border-2 py-3.5 text-sm transition-all duration-200",
              icon ? "pl-10 pr-4" : "px-4",
              "bg-white border-neutral-200 placeholder:text-neutral-400 text-neutral-900 dark:bg-neutral-950 dark:border-neutral-800 dark:placeholder:text-neutral-600 dark:text-neutral-100 focus:border-accentblue dark:focus:border-accentblue focus:outline-none focus:ring-4 focus:ring-accentblue/10",

              // Error State (Merah)
              error &&
                "border-red-400 focus:border-red-500 focus:ring-red-100 dark:border-red-900 dark:focus:ring-red-900/30",

              className
            )}
            {...props}
          />
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="ml-2 text-xs font-medium text-red-500 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

CuteInput.displayName = "CuteInput";

export default CuteInput;
