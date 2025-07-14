"use client";
import React, { useEffect, useState } from "react";
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
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import WishStoreTable from "./WishStoreTable";
dayjs.extend(isoWeek);

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#FFBB28"];

function getUniqueStoresByWeek(reportData = []) {
  const weekMap = {};
  reportData.forEach((r) => {
    const date = dayjs(r.report_SubmitAt);
    const week = date.isoWeek();
    const year = date.year();
    const weekKey = `${year}-W${week}`;
    if (!weekMap[weekKey]) weekMap[weekKey] = new Set();
    weekMap[weekKey].add(r.store_Name);
  });
  return Object.entries(weekMap)
    .map(([weekKey, storeSet]) => ({
      week: weekKey,
      count: storeSet.size,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

function OverviewPage() {
  const [stores, setStores] = useState([]);
  const [billSum, setBillSum] = useState(0);
  const [cupSum, setCupSum] = useState(0);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [zoneOrder, setZoneOrder] = useState([]);
  const [top5Bills, setTop5Bills] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [storeRes, reportRes] = await Promise.all([
        fetch("/api/get/sale_Report_Store").then((res) => res.json()),
        fetch("/api/get/sale_Report_Report").then((res) => res.json()),
      ]);
      const storesFiltered = storeRes.filter((s) => s.store_Account === "LMT");
      setStores(storesFiltered);

      // Map ชื่อร้าน -> โซน
      const storeNameToArea = {};
      storesFiltered.forEach(s => {
        storeNameToArea[s.store_Name] = s.store_Area2;
      });

      // Pie data
      const areaCount = {};
      storesFiltered.forEach((s) => {
        areaCount[s.store_Area2] = (areaCount[s.store_Area2] || 0) + 1;
      });
      const zones = Object.keys(areaCount);

      const pieArr = zones.map((area) => ({
        name: area,
        value: areaCount[area],
      }));
      setPieData(pieArr);
      setZoneOrder(zones);

      // Filter report เฉพาะร้านที่มีใน storesFiltered
      const matchedReports = reportRes.filter((r) => storeNameToArea[r.store_Name]);

      // Sum Bill/Cup รวม
      const bills = matchedReports.reduce((sum, r) => sum + (r.report_billsSold || 0), 0);
      const cups = matchedReports.reduce((sum, r) => sum + (r.report_sampleCups || 0), 0);

      setBillSum(bills);
      setCupSum(cups);

      // Bar Chart: ยอดบิลแยกโซน
      const areaBills = {};
      matchedReports.forEach((r) => {
        const area = storeNameToArea[r.store_Name] || "ไม่ระบุโซน";
        areaBills[area] = (areaBills[area] || 0) + (r.report_billsSold || 0);
      });
      const barArr = zones.map((area) => ({
        area,
        billsSold: areaBills[area] || 0,
      }));
      setBarData(barArr);

      // ===== Top 5 Store (By Bills) =====
      const storeBills = {};
      matchedReports.forEach(r => {
        if (!storeBills[r.store_Name]) storeBills[r.store_Name] = 0;
        storeBills[r.store_Name] += (r.report_billsSold || 0);
      });
      const top5Arr = Object.entries(storeBills)
        .map(([name, billsSold]) => ({
          store_Name: name,
          store_Area2: storeNameToArea[name] || "-",
          billsSold,
        }))
        .sort((a, b) => b.billsSold - a.billsSold)
        .slice(0, 5);
      setTop5Bills(top5Arr);

      // ===== Line Chart: Unique stores per week =====
      const weekData = getUniqueStoresByWeek(matchedReports);
      setLineData(weekData);

      setLoading(false);
    };
    fetchAll();
  }, []);

  // % bill/cup
  const billCupPercent = cupSum > 0 ? ((billSum / cupSum) * 100).toFixed(1) : "-";

  return (
    <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2">
      {/* KPI Card */}
      <div className="col-span-1 flex flex-col md:flex-row gap-4">
        <Card className="flex-1 p-4 flex flex-col items-center justify-center">
          <div className="text-2xl font-extrabold">{stores.length}</div>
          <div className="text-sm text-muted-foreground">จำนวนร้าน (เชียร์ขาย & ชงชิม)</div>
        </Card>
        <Card className="flex-1 p-4 flex flex-col items-center justify-center">
          <div className="text-2xl font-extrabold">
            {billSum.toLocaleString()} / {cupSum.toLocaleString()}
          </div>
          <div className="text-base font-medium text-blue-600 mt-1">
            {billCupPercent !== "-" ? `${billCupPercent}%` : "-"}
          </div>
          <div className="text-sm text-muted-foreground">Bill : Cup Serves</div>
        </Card>
      </div>
      {/* Pie Chart */}
      <Card className="p-4">
        <div className="font-semibold mb-2">สัดส่วนจำนวนร้านแต่ละโซน</div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              label={({ name, value }) => {
                const total = pieData.reduce((sum, d) => sum + d.value, 0);
                const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                return `${name} ${value} (${percent}%)`;
              }}
              labelLine={false}
              outerRadius={80}
            >
              {pieData.map((entry, idx) => (
                <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => {
                const total = pieData.reduce((sum, d) => sum + d.value, 0);
                const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                return [`${value} ร้าน (${percent}%)`, name];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>
      {/* 2 กราฟคู่: Bar Chart และ Line Chart */}
      <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bar Chart (ยอดบิลรวมแต่ละโซน) */}
        <Card className="p-4">
          <div className="font-semibold mb-2">ยอดบิลรวมแต่ละโซน</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <XAxis dataKey="area" />
              <YAxis />
              <Tooltip
                formatter={(value, name, props) => {
                  const total = barData.reduce((sum, d) => sum + d.billsSold, 0);
                  const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                  return [`${Number(value).toLocaleString()} (${percent}%)`, "ยอดบิลรวม"];
                }}
              />
              <Legend />
              <Bar dataKey="billsSold" name="ยอดบิลรวม">
                {barData.map((entry, idx) => (
                  <Cell
                    key={entry.area}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
                <LabelList
                  dataKey="billsSold"
                  position="top"
                  content={({ x, y, width, value, index }) => {
                    const total = barData.reduce((sum, d) => sum + d.billsSold, 0);
                    const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                    return (
                      <text
                        x={x + width / 2}
                        y={y - 6}
                        textAnchor="middle"
                        fill="#222"
                        fontSize={12}
                        fontWeight={600}
                      >
                        {`${Number(value).toLocaleString()} (${percent}%)`}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        {/* Line Chart (จำนวนร้าน unique ต่อสัปดาห์) */}
        <Card className="p-4">
          <div className="font-semibold mb-2">จำนวนร้าน (Unique) ต่อสัปดาห์ vs Target</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tickFormatter={w => w.replace(/^20\d{2}-W/, "W")}
                fontSize={12}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                name="Actual"
                stroke="#0070f3"
                strokeWidth={3}
                dot
              />
              <Line
                type="monotone"
                dataKey={() => 85}
                name="Target (85 ร้าน)"
                stroke="#FF6B6B"
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
          {loading && <div className="text-center text-sm text-muted-foreground mt-2">กำลังโหลด...</div>}
        </Card>
      </div>
      {/* Top 5 Store Table */}
      <Card className="p-4 col-span-1 md:col-span-2">
        <div className="font-semibold mb-2">Top 5 Store (ยอดบิลสูงสุด)</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-center">#</th>
                <th className="text-left">ชื่อร้าน</th>
                <th className="text-center">โซน</th>
                <th className="text-right">ยอดบิล</th>
              </tr>
            </thead>
            <tbody>
              {top5Bills.map((s, idx) => (
                <tr key={idx} className="hover:bg-blue-50 transition">
                  <td className="text-center font-bold">{idx + 1}</td>
                  <td>{s.store_Name}</td>
                  <td className="text-center">{s.store_Area2}</td>
                  <td className="text-right">{s.billsSold.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

         {/* ------- Section ใหม่: Wish Store Table ------- */}
      <div className="col-span-1 md:col-span-2">
        <WishStoreTable />
      </div>
    </div>
  );
}

export default OverviewPage;
