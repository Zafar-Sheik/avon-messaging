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
  const headerLines = [
    company?.name || "Company Name",
    company?.address || "Address line",
    `Contact: ${company?.phone || "-"}`,
    company?.licenseNumber ? `License: ${company.licenseNumber}` : undefined,
    company?.vatNumber ? `VAT No: ${company.vatNumber}` : undefined,
    company?.regNumber ? `Reg No: ${company.regNumber}` : undefined,
  ].filter(Boolean) as string[];

  const sampleLines = [
    "Items:",
    "SKU-001 Widget A  x1  @ 150.00  = 150.00",
    "SKU-002 Widget B  x2  @ 280.00  = 560.00",
    "",
    "Subtotal: 710.00",
    "Tax: 106.50",
    "Total: 816.50",
  ];

  const footer = [
    ...messages.filter((m) => (m || "").trim() !== ""),
    "Thank you!",
  ];

  const text = [
    `Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
    ...headerLines,
    "",
    ...sampleLines,
    "",
    ...footer,
  ].join("\n");

  return (
    <div className={className}>
      <div className="rounded-md border bg-white p-3">
        <div className="text-xs font-medium mb-1">Slip Layout Preview</div>
        <div className="rounded-md border bg-muted/30 p-3">
          <pre className="text-xs whitespace-pre-wrap font-mono leading-5">{text}</pre>
        </div>
      </div>
    </div>
  );
};

export default SlipPreview;