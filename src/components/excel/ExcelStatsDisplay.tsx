"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  Calculator,
  BarChart3,
  Hash,
  ArrowUp,
  ArrowDown,
  TrendingUp,
} from "lucide-react";

interface ExcelStatsDisplayProps {
  numbers: number[];
  valueCol: string;
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
};

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
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

const ExcelStatsDisplay: React.FC<ExcelStatsDisplayProps> = ({ numbers, valueCol }) => {
  const count = numbers.length;
  const sum = numbers.reduce((s, n) => s + n, 0);
  const avg = count ? sum / count : 0;
  const min = count ? Math.min(...numbers) : 0;
  const max = count ? Math.max(...numbers) : 0;

  if (count === 0) {
    return (
      <Card className="p-8 text-center bg-blue-50 border border-blue-200 rounded-xl">
        <BarChart3 className="size-10 text-blue-600 mx-auto mb-3" />
        <h3 className="font-medium text-gray-900 mb-2">
          No numeric data found in "{valueCol}"
        </h3>
        <p className="text-gray-600">
          Please ensure the selected column contains valid numbers.
        </p>
      </Card>
    );
  }

  return (
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
  );
};

export default ExcelStatsDisplay;