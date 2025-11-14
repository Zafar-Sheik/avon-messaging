"use client";

import React from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { showError, showSuccess } from "@/utils/toast";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

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
  const [rawRows, setRawRows] = React.useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [mapping, setMapping] = React.useState<{ name: string; phone: string }>({ name: "", phone: "" });

  // Add a sentinel for "None" option
  const NONE_OPTION = "__none__";

  const getCell = (row: Record<string, any>, key: string): string => {
    const val = row?.[key];
    return val === undefined || val === null ? "" : String(val);
  };

  React.useEffect(() => {
    if (rawRows.length === 0 || !mapping.phone) {
      setParsed([]);
      return;
    }
    const contacts: ParsedContact[] = [];
    for (const row of rawRows) {
      const name = mapping.name ? getCell(row, mapping.name) : "";
      const phone = getCell(row, mapping.phone);
      if (phone.trim()) contacts.push({ name, phone });
    }
    setParsed(contacts);
  }, [rawRows, mapping]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "", raw: true });

    if (!rows || rows.length === 0) {
      showError("No rows found. Ensure your sheet has a header row and data.");
      setParsed([]);
      setRawRows([]);
      setHeaders([]);
      setMapping({ name: "", phone: "" });
      return;
    }

    // Build headers from the first row's keys (fallback: union of all keys)
    const firstKeys = Object.keys(rows[0]);
    const allKeys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
    const hdrs = firstKeys.length > 0 ? firstKeys : allKeys;

    // Guess mapping based on common header names
    const lower = hdrs.map((h) => h.toLowerCase().trim());
    const nameCandidates = ["name", "full name", "contact", "first name"];
    const phoneCandidates = ["phone", "phone number", "mobile", "whatsapp", "contact number"];

    const guess = (cands: string[], fallback = "") => {
      for (const cand of cands) {
        const idx = lower.findIndex((h) => h === cand || h.includes(cand));
        if (idx !== -1) return hdrs[idx];
      }
      return fallback;
    };

    const guessedName = guess(nameCandidates, hdrs.find((h) => h.toLowerCase().includes("name")) || "");
    const guessedPhone = guess(phoneCandidates, hdrs.find((h) => h.toLowerCase().includes("phone")) || hdrs[0] || "");

    setRawRows(rows);
    setHeaders(hdrs);
    setMapping({ name: guessedName, phone: guessedPhone });

    showSuccess(`Loaded ${rows.length} row(s). Choose columns to import.`);
  };

  const importContacts = () => {
    if (parsed.length === 0) {
      showError("No contacts to import. Please select the Phone column.");
      return;
    }
    onImported(parsed);
    setParsed([]);
    setRawRows([]);
    setHeaders([]);
    setMapping({ name: "", phone: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <Button
          variant="secondary"
          onClick={() => {
            setParsed([]);
            setRawRows([]);
            setHeaders([]);
            setMapping({ name: "", phone: "" });
          }}
        >
          Clear
        </Button>
        <Button onClick={importContacts} disabled={parsed.length === 0}>
          Import Contacts
        </Button>
      </div>

      {headers.length > 0 && (
        <div className="rounded-md border p-3 space-y-3">
          <div className="text-sm text-muted-foreground">
            Map your columns to the fields below, then review the preview.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="map-name">Name column (optional)</Label>
              <Select
                value={mapping.name}
                onValueChange={(val) => setMapping((m) => ({ ...m, name: val === NONE_OPTION ? "" : val }))}
              >
                <SelectTrigger id="map-name">
                  <SelectValue placeholder="Choose a column" />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((h) => (
                    <SelectItem key={`name-${h}`} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                  <SelectItem value={NONE_OPTION}>
                    (None)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="map-phone">Phone column</Label>
              <Select
                value={mapping.phone}
                onValueChange={(val) => setMapping((m) => ({ ...m, phone: val }))}
              >
                <SelectTrigger id="map-phone">
                  <SelectValue placeholder="Choose a column" />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((h) => (
                    <SelectItem key={`phone-${h}`} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border p-3">
            <div className="text-sm text-muted-foreground mb-2">
              Preview (first 10 mapped rows)
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{mapping.name ? `Name (${mapping.name})` : "Name"}</TableHead>
                  <TableHead>{mapping.phone ? `Phone (${mapping.phone})` : "Phone"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsed.slice(0, 10).map((c, i) => (
                  <TableRow key={i}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                  </TableRow>
                ))}
                {parsed.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground text-sm">
                      No rows to display. Select a Phone column to see results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {parsed.length > 0 && headers.length === 0 && (
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