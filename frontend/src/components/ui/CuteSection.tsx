import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { BaseProps } from "../../types/types";

interface CuteSectionProps extends BaseProps {
  delay?: number;
}

const CuteSection: React.FC<CuteSectionProps> = ({
  children,
  className,
  delay = 0,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn("w-full mb-6", className)}
    >
      {children}
    </motion.section>
  );
};

export default CuteSection;
