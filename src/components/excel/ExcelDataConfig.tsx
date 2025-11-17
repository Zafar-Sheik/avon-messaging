"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface ExcelDataConfigProps {
  headers: string[];
  valueCol: string;
  onValueColChange: (col: string) => void;
  groupCol: string;
  onGroupColChange: (col: string) => void;
}

const ExcelDataConfig: React.FC<ExcelDataConfigProps> = ({
  headers,
  valueCol,
  onValueColChange,
  groupCol,
  onGroupColChange,
}) => {
  return (
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
          <Select value={valueCol} onValueChange={onValueColChange}>
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
            onValueChange={(v) => onGroupColChange(v === "_NONE_" ? "" : v)}
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
  );
};

export default ExcelDataConfig;