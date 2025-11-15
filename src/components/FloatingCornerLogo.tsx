"use client";

import React from "react";

const FloatingCornerLogo: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <img
        src="/images/output-onlinepngtools.png"
        alt="Contact Online Solutions"
        className="h-20 md:h-24 w-auto float-3d drop-shadow-2xl select-none"
      />
    </div>
  );
};

export default FloatingCornerLogo;