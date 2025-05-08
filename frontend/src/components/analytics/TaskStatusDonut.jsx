import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const data = [
  { name: "On-Time", value: 65 },
  { name: "In Progress", value: 25 },
  { name: "Overdue", value: 10 },
];

const COLORS = ["#10b981", "#facc15", "#ef4444"];

export default function TaskStatusDonut() {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="square"
            wrapperStyle={{
              paddingTop: '10px',
              fontSize: '14px',
            }}
            payload={data.map((entry, index) => ({
              value: entry.name,
              type: 'square',
              color: COLORS[index],
            }))}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
