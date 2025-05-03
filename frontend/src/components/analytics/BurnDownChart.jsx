import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", ideal: 100, actual: 95 },
  { day: "Tue", ideal: 80, actual: 75 },
  { day: "Wed", ideal: 60, actual: 50 },
  { day: "Thu", ideal: 40, actual: 35 },
  { day: "Fri", ideal: 20, actual: 15 },
  { day: "Sat", ideal: 0, actual: 5 },
];

export default function BurnDownChart() {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="ideal" stroke="#10b981" />
          <Line type="monotone" dataKey="actual" stroke="#ef4444" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
