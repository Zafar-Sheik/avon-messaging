"use client";

import React from "react";
import * as XLSX from "xlsx";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { showError, showSuccess } from "@/utils/toast";
import {
  FileSpreadsheet,
  BarChart3,
  Calculator,
  Hash,
  ArrowUp,
  ArrowDown,
  Download,
  Trash2,
  TrendingUp,
} from "lucide-react";

type Row = Record<string, any>;

const StatCard = ({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
}) => (
  <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">{icon}</div>
        </div>
        <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="size-3 text-green-600" />
            <span className="text-xs font-medium text-green-600">{trend}</span>
          </div>
        )}
      </div>
    </div>
  </Card>
);

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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const clearAll = () => {
    setRows([]);
    setHeaders([]);
    setValueCol("");
    setGroupCol("");
    setNumbers([]);
    setGroupData([]);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  const handleFile = async (file: File | null) => {
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const out = XLSX.utils.sheet_to_json<Row>(sheet, {
        defval: "",
        raw: true,
      });

      if (!out || out.length === 0) {
        showError(
          "No rows found. Ensure your sheet has a header row and data."
        );
        clearAll();
        return;
      }

      const hdrs = Array.from(new Set(out.flatMap((r) => Object.keys(r))));
      const { value, group } = guessColumns(hdrs, out);

      setRows(out);
      setHeaders(hdrs);
      setValueCol(value);
      setGroupCol(group);
      setFileName(file.name);
      showSuccess(`Successfully loaded ${out.length} rows from ${file.name}`);
    } catch {
      showError("Failed to read file. Please upload a valid Excel file.");
      clearAll();
    }
  };

  const handleChooseFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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

  const count = numbers.length;
  const sum = numbers.reduce((s, n) => s + n, 0);
  const avg = count ? sum / count : 0;
  const min = count ? Math.min(...numbers) : 0;
  const max = count ? Math.max(...numbers) : 0;

  const chartConfig = {
    value: { label: valueCol || "Value", color: "hsl(var(--primary))" },
  };

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

      {/* File Upload Card */}
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
              className="max-w-md"
            />
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleChooseFileClick}
            >
              <Download className="size-4" />
              Choose File
            </Button>
          </div>
        </div>
      </Card>

      {/* Column Selection */}
      {headers.length > 0 && (
        <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="font-medium text-gray-900 mb-4">Data Configuration</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label
                htmlFor="val-col"
                className="text-sm font-medium text-gray-700"
              >
                Value Column
              </Label>
              <Select value={valueCol} onValueChange={(v) => setValueCol(v)}>
                <SelectTrigger id="val-col" className="w-full">
                  <SelectValue placeholder="Select numeric column" />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((h) => (
                    <SelectItem key={`val-${h}`} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Choose the column containing numeric values to analyze
              </p>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="group-col"
                className="text-sm font-medium text-gray-700"
              >
                Group By Column
              </Label>
              <Select
                value={groupCol}
                onValueChange={(v) => setGroupCol(v === "_NONE_" ? "" : v)}
              >
                <SelectTrigger id="group-col" className="w-full">
                  <SelectValue placeholder="Optional category column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_NONE_">{`(No grouping)`}</SelectItem>
                  {headers.map((h) => (
                    <SelectItem key={`grp-${h}`} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Optional: Group data by a category column
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Statistics Cards */}
      {valueCol && count > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={<Calculator className="size-5" />}
              label="Total Sum"
              value={sum.toLocaleString()}
              trend="Total"
            />
            <StatCard
              icon={<BarChart3 className="size-5" />}
              label="Average"
              value={avg.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
              trend="Mean"
            />
            <StatCard
              icon={<ArrowDown className="size-5" />}
              label="Minimum"
              value={min.toLocaleString()}
              trend="Lowest"
            />
            <StatCard
              icon={<ArrowUp className="size-5" />}
              label="Maximum"
              value={max.toLocaleString()}
              trend="Highest"
            />
            <StatCard
              icon={<Hash className="size-5" />}
              label="Valid Values"
              value={count.toLocaleString()}
              trend="Count"
            />
          </div>

          {/* Chart */}
          {groupCol && groupData.length > 0 && (
            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <BarChart3 className="size-5 text-blue-600" />
                    Data Visualization
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Sum of {valueCol} grouped by {groupCol}
                  </p>
                </div>
              </div>

              <div className="h-80">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={groupData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tickFormatter={(v) => String(v).slice(0, 20)}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                      />
                      <Bar
                        dataKey="value"
                        fill="var(--color-value)"
                        radius={[4, 4, 0, 0]}
                        className="hover:opacity-80 transition-opacity"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </Card>
          )}

          {/* Data Preview */}
          <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Data Preview</h3>
              <span className="text-sm text-gray-500">
                Showing first 10 rows
              </span>
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
                    <TableRow
                      key={i}
                      className="hover:bg-gray-50 transition-colors"
                    >
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
        </>
      )}

      {/* Empty State */}
      {rows.length === 0 && (
        <Card className="p-12 text-center bg-gray-50 border border-gray-200 rounded-xl">
          <FileSpreadsheet className="size-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">No Data Loaded</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Upload an Excel file to start analyzing your data. We'll
            automatically detect numeric columns and help you visualize
            insights.
          </p>
        </Card>
      )}

      {rows.length > 0 && !valueCol && (
        <Card className="p-8 text-center bg-blue-50 border border-blue-200 rounded-xl">
          <BarChart3 className="size-10 text-blue-600 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-2">
            Select a Value Column
          </h3>
          <p className="text-gray-600">
            Choose a numeric column from the dropdown above to generate
            statistics and visualizations.
          </p>
        </Card>
      )}
    </div>
  );
};

export default ExcelDashboard;