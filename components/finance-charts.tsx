"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/lib/analytics/money";
import type { CategoryTotal } from "@/lib/analytics";

const colors = ["#15956d", "#3aa982", "#73c7a3", "#a6dfc3", "#142c3b", "#7795a3", "#b2c0c4", "#e2b866", "#82a4c4", "#bc9cce", "#ea9a7a", "#9cb49a"];
type BarDatum = { label: string; amount: number };

function EmptyChart({ message }: { message: string }) {
  return <div className="grid h-[260px] place-items-center rounded-xl bg-canvas px-4 text-center text-sm text-muted">{message}</div>;
}

export function CategoryChart({ data }: { data: CategoryTotal[] }) {
  if (!data.length) return <EmptyChart message="Add transactions to see a category breakdown." />;
  const chartData = data.map((item) => ({ name: item.category, amount: Number(item.amount) }));
  return (
    <div className="h-[290px] w-full min-w-0" role="img" aria-label="Spending by category chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="amount" nameKey="name" innerRadius="57%" outerRadius="82%" paddingAngle={2}>
            {chartData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
          </Pie>
          <Tooltip formatter={(value) => formatMoney(Number(value))} />
          <Legend verticalAlign="bottom" height={38} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SpendingBarChart({ data, label = "Daily spending" }: { data: BarDatum[]; label?: string }) {
  if (!data.length) return <EmptyChart message="Add transactions to see your spending trend." />;
  return (
    <div className="h-[290px] w-full min-w-0" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 8, left: -14, bottom: 2 }}>
          <CartesianGrid stroke="#edf1ef" vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#77858b", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#77858b", fontSize: 10 }} tickFormatter={(value: number) => value >= 1000 ? `₹${Math.round(value / 1000)}k` : `₹${value}`} />
          <Tooltip formatter={(value) => formatMoney(Number(value))} />
          <Bar dataKey="amount" fill="#15956d" radius={[6, 6, 0, 0]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
