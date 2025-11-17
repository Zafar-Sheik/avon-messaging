"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, Download, Trash2, CheckCircle } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";

type Row = Record<string, any>;

interface ExcelFileUploadProps {
  onFileLoaded: (rows: Row[], headers: string[], fileName: string) => void;
  onClearAll: () => void;
  fileName: string;
}

const ExcelFileUpload: React.FC<ExcelFileUploadProps> = ({ onFileLoaded, onClearAll, fileName }) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToJson = async (file: File): Promise<{ rows: Row[]; headers: string[] }> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonRows = XLSX.utils.sheet_to_json<Row>(sheet, { raw: true, defval: "" });
    const sheetHeaders = (XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[]) || [];
    return { rows: jsonRows, headers: sheetHeaders.filter(Boolean) };
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setLoading(true);
    try {
      const { rows: jsonRows, headers: sheetHeaders } = await fileToJson(file);

      if (!jsonRows || jsonRows.length === 0) {
        showError("No rows found. Ensure your sheet has a header row and data.");
        onClearAll();
        return;
      }

      onFileLoaded(jsonRows, sheetHeaders, file.name);
      showSuccess(`Successfully loaded ${jsonRows.length} rows from ${file.name}`);
    } catch (err) {
      console.error(err);
      showError("Failed to read file. Please upload a valid Excel file.");
      onClearAll();
    } finally {
      setLoading(false);
    }
  };

  const handleChooseFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Upload Excel File</h3>
            <p className="text-sm text-gray-600 mt-1">
              Supported formats: .xlsx, .xls, .csv
            </p>
          </div>
          {fileName && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
              <FileSpreadsheet className="size-4" />
              <span className="text-sm font-medium truncate max-w-32">
                {fileName}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            disabled={loading}
            className="max-w-md"
          />
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleChooseFileClick}
            disabled={loading}
          >
            <Download className="size-4" />
            {loading ? "Processing..." : "Choose File"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ExcelFileUpload;