"use client";

import React from "react";
import { Card } from "@/components/ui/card";
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
import { BarChart3 } from "lucide-react";

interface ExcelChartDisplayProps {
  groupData: { category: string; value: number }[];
  valueCol: string;
  groupCol: string;
}

const ExcelChartDisplay: React.FC<ExcelChartDisplayProps> = ({
  groupData,
  valueCol,
  groupCol,
}) => {
  const chartConfig = {
    value: { label: valueCol || "Value", color: "hsl(var(--primary))" },
  };

  if (groupData.length === 0) {
    return (
      <Card className="p-8 text-center bg-blue-50 border border-blue-200 rounded-xl">
        <BarChart3 className="size-10 text-blue-600 mx-auto mb-3" />
        <h3 className="font-medium text-gray-900 mb-2">
          No grouped data to display
        </h3>
        <p className="text-gray-600">
          Ensure you have selected a 'Group By Column' and that it contains
          valid data.
        </p>
      </Card>
    );
  }

  return (
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
  );
};

export default ExcelChartDisplay;