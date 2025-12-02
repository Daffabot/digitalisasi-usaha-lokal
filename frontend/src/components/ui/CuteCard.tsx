import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

interface CuteCardProps extends HTMLMotionProps<"div"> {
  gradientBorder?: boolean;
}

const CuteCard: React.FC<CuteCardProps> = ({
  className,
  children,
  gradientBorder = false,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative rounded-3xl bg-white dark:bg-neutral-900 p-6",
        "shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none",
        "border border-neutral-100 dark:border-neutral-800",
        gradientBorder && "border-2 border-accentpink/30",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default CuteCard;
