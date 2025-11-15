"use client";

import React from "react";

const FloatingCornerLogo: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <div className="flex items-end">
        <img
          src="/images/output-onlinepngtools.png"
          alt="Contact Online Solutions"
          className="h-48 md:h-64 w-auto drop-shadow-2xl select-none"
        />
      </div>
    </div>
  );
};

export default FloatingCornerLogo;