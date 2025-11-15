"use client";

import React from "react";
import type { CompanyProfile } from "@/utils/companyStore";

type Props = {
  company: CompanyProfile | null;
  messages: string[];
  className?: string;
};

const SlipPreview: React.FC<Props> = ({ company, messages, className }) => {
  const now = new Date();

  // Build header fields
  const companyName = company?.name || "Company Name";
  const addressLine = company?.address || "Address line";
  const contactLine = `Contact: ${company?.phone || "-"}`;

  // Sample items (kept simple for preview)
  const items = [
    "SKU-001  Widget A   x1   @ 150.00   = 150.00",
    "SKU-002  Widget B   x2   @ 280.00   = 560.00",
  ];

  // Totals
  const subtotal = "710.00";
  const tax = "106.50";
  const total = "816.50";

  const footer = [
    ...messages.filter((m) => (m || "").trim() !== ""),
    "Thank you!",
  ];

  return (
    <div className={className}>
      <div className="rounded-md border bg-white p-3">
        <div className="text-xs font-medium mb-1">Slip Layout Preview (80×80mm)</div>
        <div
          className="rounded-md border bg-muted/30 p-3 mx-auto overflow-y-auto"
          style={{ width: "80mm", height: "80mm" }}
        >
          {/* Header with logo and emphasized company details */}
          <div className="text-center space-y-1">
            {company?.logoDataUrl ? (
              <img
                src={company.logoDataUrl}
                alt="Company Logo"
                className="mx-auto h-16 w-16 object-contain mb-1"
              />
            ) : null}
            <div className="text-base md:text-lg font-bold">{companyName}</div>
            <div className="text-sm md:text-base font-bold">{addressLine}</div>
            <div className="text-sm md:text-base font-bold">{contactLine}</div>
            <div className="text-[11px] md:text-xs text-muted-foreground mt-1">
              Date: {now.toLocaleDateString()} {now.toLocaleTimeString()}
            </div>
          </div>

          {/* Items section */}
          <div className="mt-3">
            <div className="text-[12px] font-semibold">Items:</div>
            <div className="mt-1 font-mono text-[12px] whitespace-pre-wrap leading-5">
              {items.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </div>

          {/* Totals aligned to the right */}
          <div className="mt-2 border-t pt-2">
            <div className="text-right space-y-1">
              <div className="text-[12px] font-semibold">Subtotal: {subtotal}</div>
              <div className="text-[12px] font-semibold">Tax: {tax}</div>
              <div className="text-sm md:text-base font-bold">Total: {total}</div>
            </div>
          </div>

          {/* Footer messages */}
          <div className="mt-3 text-center space-y-1">
            {footer.map((m, i) => (
              <div key={i} className="text-[12px]">{m}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlipPreview;