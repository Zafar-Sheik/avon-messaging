"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";

export type ImportedContact = {
  id: string;
  name: string;
  phone: string;
};

type Props = {
  onImported: (contacts: ImportedContact[]) => void;
};

export default function ContactImport({ onImported }: Props) {
  const [loading, setLoading] = useState(false);

  const parseValue = (v: any): string => {
    if (!v) return "";
    return String(v).trim();
  };

  const normalizeHeaders = (headers: string[]) => {
    return headers.map((h) => h.toLowerCase().replace(/\s+/g, ""));
  };

  const fileToJson = async (file: File): Promise<any[]> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { raw: false });
  };

  const handleFile = async (file: File) => {
    try {
      setLoading(true);
      const rows = await fileToJson(file);

      if (!rows || rows.length === 0) {
        alert("No rows found in file.");
        return;
      }

      // Normalize keys
      const headers = normalizeHeaders(Object.keys(rows[0]));

      const nameKey =
        headers.find((h) => ["name", "fullname", "contactname"].includes(h)) ||
        null;

      const phoneKey =
        headers.find((h) =>
          ["phone", "phonenumber", "mobile", "cell"].includes(h)
        ) || null;

      if (!phoneKey) {
        alert("No phone column found. Accepted: phone, mobile, cell.");
        return;
      }

      // parse contacts safely
      const contacts: ImportedContact[] = rows
        .map((row) => {
          const keys = Object.keys(row).map((k) =>
            k.toLowerCase().replace(/\s+/g, "")
          );
          const mapped: any = {};

          keys.forEach((key, i) => {
            mapped[key] = row[Object.keys(row)[i]];
          });

          const name = nameKey ? parseValue(mapped[nameKey]) : "";
          const phone = parseValue(mapped[phoneKey]).replace(/[^0-9+]/g, "");

          if (!phone) return null;

          return {
            id: crypto.randomUUID(),
            name,
            phone,
          };
        })
        .filter(Boolean) as ImportedContact[];

      if (contacts.length === 0) {
        alert("No valid contacts found.");
        return;
      }

      onImported(contacts);
    } catch (err) {
      console.error(err);
      alert("Failed to import file.");
    } finally {
      setLoading(false);
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFile(file);
  };

  return (
    <div className="p-4 rounded border bg-white shadow-sm w-full">
      <label className="font-medium mb-2 block">
        Import Contacts (CSV/XLSX)
      </label>

      <input
        type="file"
        accept=".csv, .xlsx, .xls"
        onChange={onSelectFile}
        disabled={loading}
        className="border rounded p-2 w-full cursor-pointer"
      />

      {loading && <p className="text-sm mt-2">Processing…</p>}
    </div>
  );
}
