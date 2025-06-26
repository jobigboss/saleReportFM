"use client";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  LabelList,
} from "recharts";

const COLORS = ["#005BAC", "#00B9F1", "#7DD8FF", "#BFE9FF", "#E0F4FF"];

const CustomTooltipPie = ({ active, payload }) => {
  if (active && payload?.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-white p-2 rounded shadow text-sm">
        <p className="font-semibold text-[#005BAC]">{name}</p>
        <p>{value.toLocaleString("th-TH")} ครั้ง</p>
      </div>
    );
  }
  return null;
};

function PerformancePage() {
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [data, setData] = useState([]);

  const numberOfDays = Math.max(
    1,
    Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
  );

  useEffect(() => {
    if (startDate && endDate) {
      const query = `start=${startDate.toISOString().split("T")[0]}&end=${endDate.toISOString().split("T")[0]}`;
      fetch(`/api/get/sale_Report_Performance?${query}`)
        .then((res) => res.json())
        .then((json) => setData(json))
        .catch((err) => console.error("❌ Load failed", err));
    }
  }, [startDate, endDate]);

  const cheerTypeCounts = data.reduce((acc, cur) => {
    const key = cur.report_cheerType || "ไม่ระบุ";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const cheerTypeData = Object.entries(cheerTypeCounts).map(([key, value]) => ({
    name: key,
    value,
  }));

  const totalCupServe = data.reduce(
    (sum, cur) => sum + (Number(cur.report_sampleCups) || 0),
    0
  );
  const totalBillsSold = data.reduce(
    (sum, cur) => sum + (Number(cur.report_billsSold) || 0),
    0
  );
  const storeCount = data.filter(
    (item) => item.report_cheerType === "เชียร์ขาย & ชงชิม"
  ).length;

  const target = numberOfDays * storeCount * 180;
  const conversionRate = totalCupServe
    ? ((totalBillsSold / totalCupServe) * 100).toFixed(1)
    : 0;

  const dataCompare = [
    {
      name: "เปรียบเทียบถ้วยชิม",
      CupServe: totalCupServe,
      Target: target,
    },
  ];

  const dataCompareServeVsBills = [
    {
      name: "Cup Serve vs Bills",
      CupServe: totalCupServe,
      BillsSold: totalBillsSold,
    },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <label className="font-medium">จากวันที่:</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="dd/MM/yyyy"
          className="border rounded px-2 py-1"
        />
        <label className="font-medium">ถึงวันที่:</label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          dateFormat="dd/MM/yyyy"
          className="border rounded px-2 py-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-2 text-[#005BAC]">ประเภทกิจกรรม</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cheerTypeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                labelLine={false}
                label={({ name, value }) => {
                  const total = cheerTypeData.reduce((sum, d) => sum + d.value, 0);
                  const percent = ((value / total) * 100).toFixed(1);
                  return `${name}: ${value.toLocaleString("th-TH")} (${percent}%)`;
                }}
              >
                {cheerTypeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize={15}
                fontWeight="bold"
                stroke="#000000"
                strokeWidth={0.9}
                paintOrder="stroke"
              >
                รวมทั้งหมด
              </text>
              <text
                x="50%"
                y="60%"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize={18}
                fontWeight="bold"
                stroke="#000000"
                strokeWidth={0.9}
                paintOrder="stroke"
              >
                {cheerTypeData.reduce((sum, d) => sum + d.value, 0).toLocaleString("th-TH")} ครั้ง
              </text>
              <Tooltip content={<CustomTooltipPie />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-2 text-[#005BAC]">สรุปเป้าชงชิม</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataCompare}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `${value.toLocaleString("th-TH")} แก้ว`,
                  name === "CupServe" ? "Cup Serve" : "Target",
                ]}
              />
              <Legend />
              <Bar dataKey="CupServe" fill="#00B9F1" name="Cup Serve">
                <LabelList
                  dataKey="CupServe"
                  position="top"
                  formatter={(value) => `${value.toLocaleString("th-TH")} Cup Serve`}
                />
              </Bar>
              <Bar dataKey="Target" fill="#005BAC" name="Target">
                <LabelList
                  dataKey="Target"
                  position="top"
                  formatter={(value) => `${value.toLocaleString("th-TH")} Target`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <p className="text-sm text-gray-600">
            ร้านที่ทำกิจกรรม "เชียร์ขาย & ชงชิม": <span className="text-[#005BAC] font-semibold">{storeCount.toLocaleString("th-TH")} ร้าน</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            จำนวนวัน: <span className="text-[#005BAC] font-semibold">{numberOfDays} วัน</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            เป้าหมายถ้วยชิมทั้งหมด (180 แก้ว/ร้าน/วัน): <span className="text-[#005BAC] font-semibold">{target.toLocaleString("th-TH")} แก้ว</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            ถ้วยชิมรวมที่ทำได้จริง: <span className="text-[#00B9F1] font-semibold">{totalCupServe.toLocaleString("th-TH")} แก้ว</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <div className="bg-white p-4 rounded-2xl shadow">
         <h3 className="text-lg font-semibold mb-2 text-[#005BAC]">เปรียบเทียบ Cup Serve กับ บิลขาย</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataCompareServeVsBills} margin={{ top: 40 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                `${value.toLocaleString("th-TH")}`,
                name === "CupServe" ? "Cup Serve" : "Bills Sold",
              ]}
            />
            <Legend />
            <Bar dataKey="CupServe" fill="#00B9F1" name="Cup Serve">
              <LabelList
                dataKey="CupServe"
                position="top"
                formatter={(value) => `${value.toLocaleString("th-TH")} แก้ว`}
              />
            </Bar>
            <Bar
              dataKey="BillsSold"
              name="Bills Sold"
              fill={conversionRate >= 20 ? "#28a745" : "#FF8C42"}
            >
              <LabelList
                dataKey="BillsSold"
                position="top"
                formatter={(value) => `${value.toLocaleString("th-TH")} บิล`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600">
          อัตราแปลง (Conversion Rate): {" "}
          <span className={`font-semibold ${conversionRate >= 20 ? "text-green-600" : "text-orange-500"}`}>
            {conversionRate}% {conversionRate >= 20 ? "✅ ดี" : "⚠ ต่ำ"}
          </span>
        </div>
        </div>

      </div>

    </div>
  );
}

export default PerformancePage;
