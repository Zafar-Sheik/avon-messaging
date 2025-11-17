"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import ColumnMappingDialog, { type Mapping } from "@/components/ColumnMappingDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, CheckCircle } from "lucide-react";
import { showError } from "@/utils/toast";

export type ImportedContact = {
  id: string;
  name: string;
  phone: string;
};

type Props = {
  onImported: (contacts: ImportedContact[]) => void;
};

const parseValue = (v: any): string => {
  if (v === null || v === undefined) return "";
  return String(v).trim();
};

const normalizePhone = (phone: string): string => {
  return (phone || "").replace(/[^0-9+]/g, "");
};

export default function ContactImport({ onImported }: Props) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for mapping dialog
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [isMappingOpen, setIsMappingOpen] = useState(false);
  const [initialMapping, setInitialMapping] = useState<Mapping>({ name: "", phone: "" });

  const fileToJson = async (file: File): Promise<{ rows: any[]; headers: string[] }> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonRows = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });
    const sheetHeaders = (XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[]) || [];
    return { rows: jsonRows, headers: sheetHeaders.filter(Boolean) };
  };

  const guessMapping = (headers: string[]): Mapping => {
    const lowerHeaders = headers.map(h => (h || "").toLowerCase().replace(/\s+/g, ""));
    const headerMap = new Map(lowerHeaders.map((lh, i) => [lh, headers[i]]));

    const nameKey = ["name", "fullname", "contactname"].find(k => headerMap.has(k));
    const phoneKey = ["phone", "phonenumber", "mobile", "cell"].find(k => headerMap.has(k));

    return {
      name: nameKey ? headerMap.get(nameKey) || "" : "",
      phone: phoneKey ? headerMap.get(phoneKey) || "" : "",
    };
  };

  const handleFile = async (file: File) => {
    try {
      setLoading(true);
      setFileName(file.name);
      const { rows: jsonRows, headers: sheetHeaders } = await fileToJson(file);

      if (!jsonRows || jsonRows.length === 0) {
        showError("No data rows found in the file.");
        reset();
        return;
      }

      setHeaders(sheetHeaders);
      setRows(jsonRows);
      setInitialMapping(guessMapping(sheetHeaders));
      setIsMappingOpen(true);
    } catch (err) {
      console.error(err);
      showError("Failed to read the file. Please ensure it's a valid Excel or CSV file.");
      reset();
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMapping = (mapping: Mapping) => {
    setIsMappingOpen(false);
    setLoading(true);

    try {
      const contacts: ImportedContact[] = rows
        .map((row) => {
          const name = mapping.name ? parseValue(row[mapping.name]) : "";
          const phone = normalizePhone(parseValue(row[mapping.phone]));

          if (!phone) return null;

          return {
            id: crypto.randomUUID(),
            name,
            phone,
          };
        })
        .filter((c): c is ImportedContact => c !== null);

      if (contacts.length === 0) {
        showError("No valid contacts found with the selected mapping.");
        return;
      }

      onImported(contacts);
    } catch (err) {
      console.error(err);
      showError("An error occurred while processing the contacts.");
    } finally {
      setLoading(false);
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFile(file);
  };

  const reset = () => {
    setFileName(null);
    setHeaders([]);
    setRows([]);
    setIsMappingOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 rounded border bg-white shadow-sm w-full">
      <div className="flex items-center justify-between mb-2">
        <Label className="font-medium">Import Contacts (CSV/XLSX)</Label>
        {fileName && (
          <Button variant="link" size="sm" onClick={reset} className="text-xs">
            Clear file
          </Button>
        )}
      </div>

      {fileName ? (
        <div className="flex items-center gap-3 p-3 rounded-md border bg-green-50 text-green-800">
          <CheckCircle className="size-5" />
          <div className="flex-1">
            <div className="font-medium">{fileName}</div>
            <div className="text-xs">Ready to map columns.</div>
          </div>
          <Button size="sm" onClick={() => setIsMappingOpen(true)}>
            Map Columns
          </Button>
        </div>
      ) : (
        <div>
          <Input
            ref={fileInputRef}
            id="contact-import-file"
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={onSelectFile}
            disabled={loading}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full"
          >
            <FileUp className="mr-2 size-4" />
            {loading ? "Processing..." : "Choose File to Upload"}
          </Button>
        </div>
      )}

      <ColumnMappingDialog
        open={isMappingOpen}
        onOpenChange={setIsMappingOpen}
        headers={headers}
        initialMapping={initialMapping}
        onConfirm={handleConfirmMapping}
      />
    </div>
  );
}