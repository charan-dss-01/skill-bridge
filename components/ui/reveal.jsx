"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  duration = 0.72,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
