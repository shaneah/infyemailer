import * as React from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartProps {
  data: any[];
  height?: number | string;
  className?: string;
  colors?: string[];
  series: { name: string; type: "line" | "bar" | "area" }[];
  showLegend?: boolean;
}

export function Chart({
  data,
  height = 300,
  className,
  colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"],
  series,
  showLegend = true,
}: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            fontSize={12}
            stroke="#888"
          />
          <YAxis axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="#888" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "4px",
              borderColor: "#ddd",
              boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
            }}
            labelStyle={{
              fontWeight: "bold",
              marginBottom: "4px",
            }}
          />
          {showLegend && <Legend verticalAlign="top" height={36} iconType="circle" />}
          {series.map((s, i) => {
            if (s.type === "line") {
              return <Line key={s.name} type="monotone" dataKey={s.name} stroke={colors[i % colors.length]} strokeWidth={2} dot={{ r: 4 }} />;
            } else if (s.type === "bar") {
              return <Bar key={s.name} dataKey={s.name} fill={colors[i % colors.length]} barSize={20} radius={[4, 4, 0, 0]} />;
            } else if (s.type === "area") {
              return <Area key={s.name} type="monotone" dataKey={s.name} fill={colors[i % colors.length]} stroke={colors[i % colors.length]} fillOpacity={0.2} />;
            }
            return null;
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
