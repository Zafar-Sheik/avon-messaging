"use client";

import React from "react";

type PoweredByProps = {
  className?: string;
  small?: boolean;
};

const PoweredBy: React.FC<PoweredByProps> = ({ className, small = false }) => {
  return (
    <div className={`flex items-center justify-center gap-2 ${className || ""}`}>
      <span className="text-xs text-muted-foreground">
        Powered by Contact Online Solutions
      </span>
      <img
        src="/images/contact-online-solutions.png"
        alt="Contact Online Solutions logo"
        className={small ? "h-4 w-auto" : "h-5 w-auto"}
      />
    </div>
  );
};

export default PoweredBy;