"use client";

import React from "react";
import * as XLSX from "xlsx";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { showError, showSuccess } from "@/utils/toast";
import { FileSpreadsheet, BarChart3, Calculator, Hash, ArrowUp, ArrowDown } from "lucide-react";

type Row = Record<string, any>;

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <Card className="p-4 flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-md bg-muted text-muted-foreground">{icon}</div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
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
  const [groupData, setGroupData] = React.useState<{ category: string; value: number }[]>([]);

  const clearAll = () => {
    setRows([]);
    setHeaders([]);
    setValueCol("");
    setGroupCol("");
    setNumbers([]);
    setGroupData([]);
  };

  const guessColumns = (hdrs: string[], data: Row[]) => {
    if (hdrs.length === 0 || data.length === 0) return { value: "", group: "" };
    // Guess numeric value column: most numeric hits in first 50 rows
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
    // Guess group column: first header with more text than numbers
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
      const out = XLSX.utils.sheet_to_json<Row>(sheet, { defval: "", raw: true });
      if (!out || out.length === 0) {
        showError("No rows found. Ensure your sheet has a header row and data.");
        clearAll();
        return;
      }
      const hdrs = Array.from(new Set(out.flatMap((r) => Object.keys(r))));
      const { value, group } = guessColumns(hdrs, out);

      setRows(out);
      setHeaders(hdrs);
      setValueCol(value);
      setGroupCol(group);
      showSuccess(`Loaded ${out.length} row(s). Select columns to build insights.`);
    } catch {
      showError("Failed to read file. Please upload a valid .xlsx/.xls/.csv file.");
      clearAll();
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
        const key = keyRaw === undefined || keyRaw === null || String(keyRaw).trim() === "" ? "(Unspecified)" : String(keyRaw);
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
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Excel Insights</h2>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="max-w-xs"
          />
          <Button variant="secondary" onClick={clearAll}>
            Clear
          </Button>
        </div>

        {headers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="val-col">Value column</Label>
              <Select value={valueCol} onValueChange={(v) => setValueCol(v)}>
                <SelectTrigger id="val-col">
                  <SelectValue placeholder="Choose numeric column" />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((h) => (
                    <SelectItem key={`val-${h}`} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-col">Group by column (optional)</Label>
              <Select value={groupCol} onValueChange={(v) => setGroupCol(v)}>
                <SelectTrigger id="group-col">
                  <SelectValue placeholder="Choose category column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{`(None)`}</SelectItem>
                  {headers.map((h) => (
                    <SelectItem key={`grp-${h}`} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </Card>

      {valueCol ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCard icon={<Calculator className="size-5" />} label="Sum" value={sum.toLocaleString()} />
            <StatCard icon={<BarChart3 className="size-5" />} label="Average" value={avg.toLocaleString()} />
            <StatCard icon={<ArrowDown className="size-5" />} label="Min" value={min.toLocaleString()} />
            <StatCard icon={<ArrowUp className="size-5" />} label="Max" value={max.toLocaleString()} />
            <StatCard icon={<Hash className="size-5" />} label="Count" value={count.toLocaleString()} />
          </div>

          {groupCol && groupData.length > 0 && (
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-5 text-muted-foreground" />
                <h3 className="text-base font-semibold">Sum by {groupCol}</h3>
              </div>
              <ChartContainer config={chartConfig}>
                <BarChart data={groupData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    height={50}
                    tickFormatter={(v) => String(v).slice(0, 16)}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </Card>
          )}

          <Card className="p-4 space-y-3">
            <div className="text-sm text-muted-foreground">
              Preview (first 10 rows for selected columns)
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  {groupCol ? <TableHead>{groupCol}</TableHead> : null}
                  <TableHead>{valueCol}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 10).map((r, i) => (
                  <TableRow key={i}>
                    {groupCol ? <TableCell>{String(r[groupCol] ?? "")}</TableCell> : null}
                    <TableCell>{String(r[valueCol] ?? "")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      ) : (
        rows.length > 0 && (
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">
              Choose a Value column to see summary cards and charts.
            </div>
          </Card>
        )
      )}

      {rows.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Tip: Use a sheet with a header row. Pick a numeric Value column and an optional Group By column to visualize totals.
        </p>
      )}
    </div>
  );
};

export default ExcelDashboard;