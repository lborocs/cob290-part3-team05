import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const data = [
  { week: "Week 1", features: 20, bugs: 10, support: 5 },
  { week: "Week 2", features: 25, bugs: 15, support: 7 },
  { week: "Week 3", features: 22, bugs: 9, support: 12 },
  { week: "Week 4", features: 30, bugs: 20, support: 10 },
];

export default function StackedAreaChart() {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="features" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
          <Area type="monotone" dataKey="bugs" stackId="1" stroke="#f97316" fill="#f97316" />
          <Area type="monotone" dataKey="support" stackId="1" stroke="#10b981" fill="#10b981" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
