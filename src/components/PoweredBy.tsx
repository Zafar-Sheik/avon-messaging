"use client";

import React from "react";
import { cn } from "@/lib/utils";

type PoweredByProps = {
  className?: string;
  small?: boolean;
};

const PoweredBy: React.FC<PoweredByProps> = ({ className, small = false }) => {
  return (
    <div className={cn("fixed bottom-4 left-1/2 -translate-x-1/2 z-50", className)}>
      <div
        className={cn(
          "flex items-center justify-center gap-3 px-4 py-2 rounded-xl",
          "bg-white/95 dark:bg-neutral-900/90 backdrop-blur-md",
          "shadow-2xl ring-1 ring-black/10 dark:ring-white/10",
          "border border-white/60 dark:border-neutral-800"
        )}
      >
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Powered by Contact Online Solutions
        </span>
        <img
          src="/images/contact-online-solutions.png"
          alt="Contact Online Solutions logo"
          className={small ? "h-6 w-auto" : "h-8 w-auto"}
        />
      </div>
    </div>
  );
};

export default PoweredBy;