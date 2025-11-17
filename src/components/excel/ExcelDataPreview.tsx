"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { FileSpreadsheet } from "lucide-react";

type Row = Record<string, any>;

interface ExcelDataPreviewProps {
  rows: Row[];
  valueCol: string;
  groupCol: string;
}

const extractNumber = (val: unknown): number | null => {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return Number.isFinite(val) ? val : null;
  const s = String(val).trim();
  if (!s) return null;
  const n = parseFloat(s.replace(/[^0-9.\-eE]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const ExcelDataPreview: React.FC<ExcelDataPreviewProps> = ({
  rows,
  valueCol,
  groupCol,
}) => {
  if (rows.length === 0) {
    return (
      <Card className="p-8 text-center bg-gray-50 border border-gray-200 rounded-xl">
        <FileSpreadsheet className="size-12 text-gray-300 mx-auto mb-4" />
        <h3 className="font-medium text-gray-900 mb-2">No Data Loaded</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Upload an Excel file to start analyzing your data.
        </p>
      </Card>
    );
  }

  if (!valueCol) {
    return (
      <Card className="p-8 text-center bg-blue-50 border border-blue-200 rounded-xl">
        <FileSpreadsheet className="size-10 text-blue-600 mx-auto mb-3" />
        <h3 className="font-medium text-gray-900 mb-2">
          Select a Value Column
        </h3>
        <p className="text-gray-600">
          Choose a numeric column from the dropdown above to generate
          statistics and visualizations.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Data Preview</h3>
        <span className="text-sm text-gray-500">Showing first 10 rows</span>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              {groupCol && (
                <TableHead className="font-semibold text-gray-700">
                  {groupCol}
                </TableHead>
              )}
              <TableHead className="font-semibold text-gray-700">
                {valueCol}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 10).map((r, i) => (
              <TableRow key={i} className="hover:bg-gray-50 transition-colors">
                {groupCol && (
                  <TableCell className="font-medium text-gray-900">
                    {String(r[groupCol] ?? "").slice(0, 50)}
                    {String(r[groupCol] ?? "").length > 50 && "..."}
                  </TableCell>
                )}
                <TableCell
                  className={
                    extractNumber(r[valueCol]) !== null
                      ? "text-blue-600 font-semibold"
                      : "text-gray-500"
                  }
                >
                  {String(r[valueCol] ?? "")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ExcelDataPreview;