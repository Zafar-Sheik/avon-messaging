"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, FileSpreadsheet } from "lucide-react";
import ExcelFileUpload from "@/components/excel/ExcelFileUpload";
import ExcelDataConfig from "@/components/excel/ExcelDataConfig";
import ExcelStatsDisplay from "@/components/excel/ExcelStatsDisplay";
import ExcelChartDisplay from "@/components/excel/ExcelChartDisplay";
import ExcelDataPreview from "@/components/excel/ExcelDataPreview";

type Row = Record<string, any>;

const extractNumber = (val: unknown): number | null => {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return Number.isFinite(val) ? val : null;
  const s = String(val).trim();
  if (!s) return null;
  const n = parseFloat(s.replace(/[^0-9.\-eE]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const ExcelDashboard: React.FC = () => {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [valueCol, setValueCol] = React.useState<string>("");
  const [groupCol, setGroupCol] = React.useState<string>("");
  const [numbers, setNumbers] = React.useState<number[]>([]);
  const [groupData, setGroupData] = React.useState<
    { category: string; value: number }[]
  >([]);
  const [fileName, setFileName] = React.useState<string>("");

  const clearAll = () => {
    setRows([]);
    setHeaders([]);
    setValueCol("");
    setGroupCol("");
    setNumbers([]);
    setGroupData([]);
    setFileName("");
  };

  const guessColumns = (hdrs: string[], data: Row[]) => {
    if (hdrs.length === 0 || data.length === 0) return { value: "", group: "" };

    let bestVal = "";
    let bestCount = -1;
    for (const h of hdrs) {
      let c = 0;
      for (const r of data.slice(0, 50)) {
        const n = extractNumber(r[h]);
        if (n !== null) c++;
      }
      if (c > bestCount) {
        bestCount = c;
        bestVal = h;
      }
    }

    const isMostlyText = (h: string) => {
      let textish = 0;
      let numeric = 0;
      for (const r of data.slice(0, 50)) {
        const v = r[h];
        if (v === null || v === undefined) continue;
        if (extractNumber(v) !== null) numeric++;
        else if (String(v).trim()) textish++;
      }
      return textish > numeric;
    };

    const groupGuess = hdrs.find((h) => h !== bestVal && isMostlyText(h)) || "";
    return { value: bestVal, group: groupGuess };
  };

  const handleFileLoaded = (loadedRows: Row[], loadedHeaders: string[], loadedFileName: string) => {
    setRows(loadedRows);
    setHeaders(loadedHeaders);
    setFileName(loadedFileName);
    const { value, group } = guessColumns(loadedHeaders, loadedRows);
    setValueCol(value);
    setGroupCol(group);
  };

  React.useEffect(() => {
    if (!rows.length || !valueCol) {
      setNumbers([]);
      setGroupData([]);
      return;
    }

    const nums: number[] = [];
    const groups = new Map<string, number>();

    for (const r of rows) {
      const n = extractNumber(r[valueCol]);
      if (n === null) continue;
      nums.push(n);

      if (groupCol) {
        const keyRaw = r[groupCol];
        const key =
          keyRaw === undefined ||
          keyRaw === null ||
          String(keyRaw).trim() === ""
            ? "(Unspecified)"
            : String(keyRaw);
        groups.set(key, (groups.get(key) ?? 0) + n);
      }
    }

    setNumbers(nums);

    if (groupCol) {
      const arr = Array.from(groups.entries())
        .map(([category, value]) => ({ category, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 12);
      setGroupData(arr);
    } else {
      setGroupData([]);
    }
  }, [rows, valueCol, groupCol]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-blue-600" />
            Excel Insights
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Analyze and visualize your spreadsheet data
          </p>
        </div>

        {rows.length > 0 && (
          <Button
            variant="outline"
            onClick={clearAll}
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="size-4" />
            Clear All
          </Button>
        )}
      </div>

      <ExcelFileUpload
        onFileLoaded={handleFileLoaded}
        onClearAll={clearAll}
        fileName={fileName}
      />

      {headers.length > 0 && (
        <ExcelDataConfig
          headers={headers}
          valueCol={valueCol}
          onValueColChange={setValueCol}
          groupCol={groupCol}
          onGroupColChange={setGroupCol}
        />
      )}

      {valueCol && numbers.length > 0 && (
        <>
          <ExcelStatsDisplay numbers={numbers} valueCol={valueCol} />
          {groupCol && groupData.length > 0 && (
            <ExcelChartDisplay
              groupData={groupData}
              valueCol={valueCol}
              groupCol={groupCol}
            />
          )}
          <ExcelDataPreview
            rows={rows}
            valueCol={valueCol}
            groupCol={groupCol}
          />
        </>
      )}

      {rows.length === 0 && (
        <ExcelDataPreview
          rows={rows}
          valueCol={valueCol}
          groupCol={groupCol}
        />
      )}

      {rows.length > 0 && !valueCol && (
        <ExcelDataPreview
          rows={rows}
          valueCol={valueCol}
          groupCol={groupCol}
        />
      )}
    </div>
  );
};

export default ExcelDashboard;