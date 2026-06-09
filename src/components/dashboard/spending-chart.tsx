"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#6366f1", // indigo
  "#ec4899", // pink
  "#14b8a6", // teal
];

const CATEGORY_EMOJIS: Record<string, string> = {
  "Food & Dining": "🍽️",
  Travel: "✈️",
  Utilities: "💡",
  Groceries: "🛒",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Health: "💊",
  Other: "📦",
};

interface CategoryData {
  name: string;
  value: number;
}

interface SpendingChartProps {
  data: CategoryData[];
  currency: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: CategoryData }[];
}) {
  if (active && payload && payload.length) {
    const item = payload[0];
    const emoji = CATEGORY_EMOJIS[item.name] || "📦";
    return (
      <div className="glass-card rounded-xl px-4 py-3 border border-white/[0.10] shadow-xl text-sm">
        <p className="text-white font-semibold mb-0.5">
          {emoji} {item.name}
        </p>
        <p className="text-neutral-400 tabular-nums">
          {currency}{" "}
          <span className="text-white font-bold">
            {item.value.toFixed(2)}
          </span>
        </p>
      </div>
    );
  }
  return null;
}

// We need to capture currency in scope for the tooltip
let currency = "₹";

export function SpendingChart({ data, currency: cur }: SpendingChartProps) {
  currency = cur;

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-neutral-600">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-sm text-center">
          No spending data yet. Add some expenses!
        </p>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  opacity={0.9}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-neutral-500 uppercase tracking-wider">
            Total
          </span>
          <span className="text-xl font-extrabold text-white tabular-nums">
            {cur}
            {total.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-1.5">
        {data.map((item, index) => {
          const pct = ((item.value / total) * 100).toFixed(1);
          const emoji = CATEGORY_EMOJIS[item.name] || "📦";
          return (
            <div
              key={item.name}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-neutral-400 truncate flex-1">
                {emoji} {item.name}
              </span>
              <span className="text-xs text-neutral-500 tabular-nums shrink-0">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
