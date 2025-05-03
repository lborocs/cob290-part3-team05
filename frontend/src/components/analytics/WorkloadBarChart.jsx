import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Vanessa", assigned: 10, completed: 9 },
  { name: "Sawan", assigned: 12, completed: 11 },
  { name: "Kubby", assigned: 8, completed: 8 },
  { name: "Jesse", assigned: 15, completed: 13 },
];

export default function WorkloadBarChart() {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="assigned" fill="#E6589F" />
          <Bar dataKey="completed" fill="#5A2777" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
