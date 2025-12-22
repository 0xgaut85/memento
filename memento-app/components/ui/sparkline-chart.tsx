"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  YAxis,
} from "recharts";
import { PoolChartData } from "@/types/pool";

interface SparklineChartProps {
  data: PoolChartData[];
  dataKey: "apy" | "tvlUsd";
  color?: string;
  timeRange: "7d" | "30d" | "1y";
  height?: number;
}

export function SparklineChart({
  data,
  dataKey,
  color = "#8B5CF6",
  timeRange,
  height = 60,
}: SparklineChartProps) {
  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let cutoffDate: Date;

    switch (timeRange) {
      case "7d":
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    return data
      .filter((d) => new Date(d.timestamp) >= cutoffDate)
      .map((d) => ({
        ...d,
        value: dataKey === "apy" ? d.apy : d.tvlUsd,
      }));
  }, [data, dataKey, timeRange]);

  if (filteredData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-muted-foreground"
        style={{ height }}
      >
        No data
      </div>
    );
  }

  const formatValue = (value: number) => {
    if (dataKey === "apy") {
      return `${value.toFixed(2)}%`;
    }
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={filteredData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={["dataMin", "dataMax"]} hide />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const value = payload[0].value as number;
              return (
                <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-2 py-1 text-xs shadow-lg">
                  <span className="font-medium">{formatValue(value)}</span>
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#gradient-${dataKey})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

