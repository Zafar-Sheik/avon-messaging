"use client";

import React from "react";

const FloatingCornerLogo: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center">
      <div className="flex items-center justify-center translate-x-12 md:translate-x-24">
        <img
          src="/images/contact-online-solutions-logo.png"
          alt="Contact Online Solutions"
          className="w-[85vw] md:w-[60vw] h-auto opacity-20 select-none"
        />
      </div>
    </div>
  );
};

export default FloatingCornerLogo;