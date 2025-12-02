import React from "react";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

interface CuteButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const CuteButton: React.FC<CuteButtonProps> = ({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  ...props
}) => {
  const variants = {
    primary:
      "bg-linear-to-r from-accentblue to-accentblue/80 hover:to-accentblue text-white shadow-md hover:shadow-lg shadow-accentblue/30 border-transparent",
    secondary:
      "bg-white dark:bg-neutral-800 text-accentpink border-2 border-accentpink hover:bg-accentpink/10",
    outline:
      "bg-transparent border-2 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-accentblue hover:text-accentblue",
    ghost:
      "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-red-500/30",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg font-bold",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "rounded-2xl font-yuruka tracking-wide transition-colors duration-200 flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "w-auto",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default CuteButton;
