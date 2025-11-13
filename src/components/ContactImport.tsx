"use client";

import React from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { showError, showSuccess } from "@/utils/toast";

type ParsedContact = { name: string; phone: string };

type Props = {
  onImported: (contacts: ParsedContact[]) => void;
};

const normalizeHeaders = (obj: Record<string, any>): ParsedContact | null => {
  const entries = Object.entries(obj).reduce<Record<string, any>>((acc, [k, v]) => {
    acc[k.toLowerCase().trim()] = v;
    return acc;
  }, {});
  const name = (entries["name"] ?? entries["full name"] ?? entries["contact"] ?? "").toString();
  const phone = (entries["phone"] ?? entries["phone number"] ?? entries["mobile"] ?? "").toString();
  if (!phone) return null;
  return { name, phone };
};

const ContactImport: React.FC<Props> = ({ onImported }) => {
  const [parsed, setParsed] = React.useState<ParsedContact[]>([]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

    const contacts: ParsedContact[] = [];
    for (const row of rows) {
      const mapped = normalizeHeaders(row);
      if (mapped) contacts.push(mapped);
    }

    if (contacts.length === 0) {
      showError("No contacts found. Make sure your sheet has 'Name' and 'Phone' columns.");
      setParsed([]);
      return;
    }
    setParsed(contacts);
    showSuccess(`Parsed ${contacts.length} contacts from file.`);
  };

  const importContacts = () => {
    if (parsed.length === 0) {
      showError("Nothing to import.");
      return;
    }
    onImported(parsed);
    setParsed([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <Button variant="secondary" onClick={() => setParsed([])}>
          Clear
        </Button>
        <Button onClick={importContacts} disabled={parsed.length === 0}>
          Import Contacts
        </Button>
      </div>

      {parsed.length > 0 && (
        <div className="rounded-md border p-3">
          <div className="text-sm text-muted-foreground mb-2">
            Preview (first 10)
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsed.slice(0, 10).map((c, i) => (
                <TableRow key={i}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Tip: Phone numbers should be in international format (country code + number) without the "+" sign for best results.
      </p>
    </div>
  );
};

export default ContactImport;