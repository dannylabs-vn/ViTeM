import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, LineChart, Line
} from "recharts";

const COLORS_URGENCY = { RED: "#991B1B", YELLOW: "#D97706", GREEN: "#059669" };
const COLORS_ARRAY = ["#991B1B", "#D97706", "#059669", "#2563EB", "#7C3AED", "#EC4899"];

/* ================= PIE CHART — Urgency Distribution ================= */
export function UrgencyPieChart({ redCount = 0, yellowCount = 0, greenCount = 0 }) {
  const data = [
    { name: "Ca Đỏ (Bác sĩ)", value: redCount, color: COLORS_URGENCY.RED },
    { name: "Ca Vàng (Nữ hộ sinh)", value: yellowCount, color: COLORS_URGENCY.YELLOW },
    { name: "Ca Xanh (Tự động)", value: greenCount, color: COLORS_URGENCY.GREEN },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    data.push({ name: "Chưa có dữ liệu", value: 1, color: "#D1D5DB" });
  }

  const renderLabel = ({ name, value, percent }) => `${value} (${(percent * 100).toFixed(0)}%)`;

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            label={renderLabel}
            labelLine={true}
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} stroke="white" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            formatter={(value, name) => [`${value} ca`, name]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ================= BAR CHART — Weekly Cases ================= */
export function WeeklyBarChart({ data }) {
  const defaultData = data || [
    { day: "T2", cases: 12, completed: 10 },
    { day: "T3", cases: 18, completed: 15 },
    { day: "T4", cases: 8, completed: 7 },
    { day: "T5", cases: 22, completed: 19 },
    { day: "T6", cases: 15, completed: 12 },
    { day: "T7", cases: 9, completed: 8 },
    { day: "CN", cases: 5, completed: 4 },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <BarChart data={defaultData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#6B7280' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            cursor={{ fill: 'rgba(139, 30, 50, 0.05)' }}
          />
          <Bar dataKey="cases" name="Tổng ca" fill="#991B1B" radius={[6, 6, 0, 0]} maxBarSize={32} animationDuration={800} />
          <Bar dataKey="completed" name="Đã xử lý" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={32} animationDuration={800} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingBottom: '8px' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ================= AREA CHART — Trend Over Time ================= */
export function TrendAreaChart({ data }) {
  const defaultData = data || [
    { date: "13/06", red: 3, yellow: 5, green: 8 },
    { date: "14/06", red: 2, yellow: 7, green: 10 },
    { date: "15/06", red: 5, yellow: 4, green: 6 },
    { date: "16/06", red: 1, yellow: 8, green: 12 },
    { date: "17/06", red: 4, yellow: 6, green: 9 },
    { date: "18/06", red: 3, yellow: 5, green: 11 },
    { date: "19/06", red: 2, yellow: 7, green: 8 },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <AreaChart data={defaultData}>
          <defs>
            <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#991B1B" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#991B1B" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradYellow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D97706" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#D97706" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#6B7280' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          />
          <Area type="monotone" dataKey="red" name="Ca Đỏ" stroke="#991B1B" fill="url(#gradRed)" strokeWidth={2} dot={{ r: 3 }} animationDuration={800} />
          <Area type="monotone" dataKey="yellow" name="Ca Vàng" stroke="#D97706" fill="url(#gradYellow)" strokeWidth={2} dot={{ r: 3 }} animationDuration={800} />
          <Area type="monotone" dataKey="green" name="Ca Xanh" stroke="#059669" fill="url(#gradGreen)" strokeWidth={2} dot={{ r: 3 }} animationDuration={800} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingBottom: '8px' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ================= STATUS PIE — Generic (for patient/community) ================= */
export function StatusPieChart({ data, colors }) {
  const chartColors = colors || COLORS_ARRAY;
  const renderLabel = ({ name, value, percent }) => `${value} (${(percent * 100).toFixed(0)}%)`;

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            label={renderLabel}
            labelLine={true}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color || chartColors[index % chartColors.length]} stroke="white" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ================= SIMPLE LINE CHART ================= */
export function SimpleLineChart({ data, dataKey, name, color }) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#6B7280' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          />
          <Line
            type="monotone"
            dataKey={dataKey || "value"}
            name={name || "Giá trị"}
            stroke={color || "#991B1B"}
            strokeWidth={2.5}
            dot={{ r: 4, fill: color || "#991B1B", strokeWidth: 2, stroke: "white" }}
            activeDot={{ r: 6 }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
