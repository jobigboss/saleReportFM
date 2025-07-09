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

// -------------------------
// Chart color & Custom label (StoreAnalysisSection)
const BRAND_ACC_COLORS = {
  "Makro": "#E53935",          // แดง
  "Lotus": "#22BFBF",          // เขียวฟ้า
  "Big C": "#99D800",          // เขียวมะนาว
  "Lotus (โฟร์โมท)": "#FF9800"
};
const DEFAULT_ACC_COLORS = [
  "#00B9F1", "#FFA500", "#7DD8FF", "#BFE9FF", "#FF69B4", "#6A5ACD", "#20B2AA", "#005BAC"
];

const CHANNEL_COLORS = [
  "#005BAC", "#FFA500", "#00B9F1", "#20B2AA", "#FF69B4", "#3CB371", "#8A2BE2"
];
const COLORS = ["#005BAC", "#00B9F1", "#7DD8FF", "#BFE9FF", "#E0F4FF"];

const topN = (arr, key, n = 6) =>
  [...arr].sort((a, b) => b[key] - a[key]).slice(0, n);

const CustomChannelBarLabel = (props) => {
  const { x, y, width, height, value, percent, fontSize = 14 } = props;
  if (percent < 0.05) return null;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2 + 4}
      fill="#005BAC"
      fontSize={fontSize}
      fontWeight="bold"
      textAnchor="start"
    >
      {`${value} (${(percent * 100).toFixed(1)}%)`}
    </text>
  );
};

const CustomAccountBarLabel = (props) => {
  const { x, y, width, height, value, acc, percent, fontSize = 13 } = props;
  if (percent < 0.05) return null;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2 + 4}
      fill="#009CDE"
      fontSize={fontSize}
      fontWeight="bold"
      textAnchor="start"
    >
      {`${acc}: ${value} (${(percent * 100).toFixed(1)}%)`}
    </text>
  );
};

// ---------------------
// Pie Chart Tooltip
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
// ฟังก์ชันนับเฉพาะเสาร์-อาทิตย์
const countWeekendDays = (start, end) => {
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day === 0 || day === 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
};

// -------------------------------------------------
// StoreAnalysisSection
function StoreAnalysisSection() {
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/get/sale_Report_Store");
        const json = await res.json();
        setStoreData(json);
      } catch (e) {
        console.error("❌ Error fetching store data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, []);

  // Channel chart data
  const channelCounts = {};
  storeData.forEach((s) => {
    const ch = s.store_Channel || "ไม่ระบุ";
    channelCounts[ch] = (channelCounts[ch] || 0) + 1;
  });
  const channelArrRaw = Object.entries(channelCounts)
    .map(([store_Channel, count], i) => ({
      store_Channel,
      count,
      fill: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
    }));
  const totalChannel = channelArrRaw.reduce((sum, d) => sum + d.count, 0);
  const channelArrTop = topN(channelArrRaw, "count", 6).map((item) => ({
    ...item,
    percent: totalChannel > 0 ? item.count / totalChannel : 0,
  }));

  // Account summary
  const accountTotalArr = Object.entries(
    storeData.reduce((acc, cur) => {
      const k = cur.store_Account || "ไม่ระบุ";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  ).map(([a, c]) => ({ a, c }));
  const accTopList = topN(accountTotalArr, "c", 6).map((x) => x.a);
  const mostAccount = accountTotalArr[0]?.a || "-";
  const mostAccountCount = accountTotalArr[0]?.c || 0;

  // Stack bar data: type by account
  const typeObj = {};
  storeData.forEach((store) => {
    const type = store.store_Type || "ไม่ระบุ";
    const acc = store.store_Account || "ไม่ระบุ";
    if (!typeObj[type]) typeObj[type] = {};
    if (accTopList.includes(acc)) {
      typeObj[type][acc] = (typeObj[type][acc] || 0) + 1;
    }
  });
  const typeArrRaw = Object.entries(typeObj).map(([type, accObj]) => {
    const row = { store_Type: type };
    let sum = 0;
    accTopList.forEach((acc) => {
      row[acc] = accObj[acc] || 0;
      sum += row[acc];
    });
    row._sum = sum;
    return row;
  });
  const typeArr = typeArrRaw.map((row) => ({
    ...row,
    percent: row._sum > 0 ? row._sum / (typeArrRaw.reduce((s, r) => s + r._sum, 0) || 1) : 0,
  }));

  // จำนวนร้านค้าทั้งหมด
  const totalStoreCount = storeData.length;

  if (loading)
    return (
      <div className="text-center p-4 text-gray-500">
        กำลังโหลดข้อมูลร้านค้า...
      </div>
    );

  return (
    <div className="my-10 p-4 bg-white rounded-xl shadow-md">
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <span className="bg-[#F3F9FF] text-[#005BAC] rounded-full px-4 py-1 text-base font-semibold shadow">
          ร้านค้าทั้งหมด: <b>{totalStoreCount}</b> ร้าน
        </span>
      </div>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Chart 1: Horizontal Bar */}
        <div className="w-full lg:w-1/2 h-[300px]">
          <div className="font-semibold mb-2 text-[#005BAC]">จำนวนร้านค้าต่อ Channel (Top 6)</div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={channelArrTop}
              layout="vertical"
              margin={{ left: 30, right: 30, top: 20, bottom: 10 }}
              barCategoryGap="30%"
            >
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="store_Channel" type="category" width={110} />
              <Tooltip
                formatter={(v, n, { payload }) =>
                  `${v} ร้าน (${((payload?.percent || 0) * 100).toFixed(1)}%)`
                }
              />
              <Bar dataKey="count">
                {channelArrTop.map((entry, idx) => (
                  <Cell key={entry.store_Channel} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="count"
                  content={(props) => (
                    <CustomChannelBarLabel {...props} percent={props.payload?.percent || 0} />
                  )}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Chart 2: Grouped Stacked Bar (vertical) */}
        <div className="w-full lg:w-1/2 h-[300px]">
          <div className="font-semibold mb-2 text-[#005BAC]">
            ประเภทสโตร์แยกตาม Account (Top 6 Account)
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={typeArr}
              layout="vertical"
              margin={{ left: 30, right: 30, top: 20, bottom: 10 }}
              barCategoryGap="25%"
            >
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="store_Type" type="category" width={110} />
              <Tooltip
                formatter={(v, acc, { payload }) => {
                  const row = payload || {};
                  const sum = accTopList.reduce((s, a) => s + (row[a] || 0), 0);
                  const percent = sum > 0 ? (v / sum) : 0;
                  return [
                    `Account: ${acc} - ${v} ร้าน (${(percent * 100).toFixed(1)}%)`,
                    `ประเภท: ${row.store_Type || "-"}`
                  ];
                }}
              />
              <Legend />
              {accTopList.map((acc, idx) => (
                <Bar
                  key={acc}
                  dataKey={acc}
                  stackId="a"
                  fill={BRAND_ACC_COLORS[acc] || DEFAULT_ACC_COLORS[idx % DEFAULT_ACC_COLORS.length]}
                  name={acc}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey={acc}
                    content={(props) => {
                      const row = typeArr?.[props.index] || {};
                      const sum = accTopList.reduce((s, a) => s + (row[a] || 0), 0);
                      const percent = sum > 0 ? (props.value / sum) : 0;
                      return props.value > 0 ? (
                        <CustomAccountBarLabel {...props} acc={acc} percent={percent} fontSize={13} />
                      ) : null;
                    }}
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        * จำนวนร้านค้าทั้งหมดจะไม่เท่ากับยอดช่องทางหรือ Account ที่พบมากสุด เพราะแต่ละกลุ่มนับจาก field คนละประเภท
      </div>
    </div>
  );
}

// -------------------------------------------------
// PerformancePage
function PerformancePage() {
  const today = new Date();
  const prev7 = new Date();
  prev7.setDate(today.getDate() - 6);

  // default วันที่: 7 วันย้อนหลัง -> วันนี้
  const [startDate, setStartDate] = useState(prev7);
  const [endDate, setEndDate] = useState(today);
  const [data, setData] = useState([]);

  // Re-calculate endDate if user เลือก startDate > endDate
  useEffect(() => {
    if (endDate < startDate) setEndDate(startDate);
  }, [startDate]);

  // fetch data
  useEffect(() => {
    if (startDate && endDate) {
      const query = `start=${startDate.toISOString().split("T")[0]}&end=${endDate.toISOString().split("T")[0]}`;
      fetch(`/api/get/sale_Report_Performance?${query}`)
        .then((res) => res.json())
        .then((json) => setData(json))
        .catch((err) => console.error("❌ Load failed", err));
    }
  }, [startDate, endDate]);

  // สรุปประเภทกิจกรรม (Pie)
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

  // ใช้ numberOfDays (เฉพาะเสาร์-อาทิตย์) คูณ storeCount
  const numberOfDays = countWeekendDays(startDate, endDate);
  const target = numberOfDays * storeCount * 192;
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

  // รวมข้อมูล Switch Brand
  const brandTotals = {};
  data.forEach((item) => {
    const brands = item.report_ChangeBrands || {};
    Object.entries(brands).forEach(([brand, val]) => {
      if (typeof val === "number" && !isNaN(val)) {
        brandTotals[brand] = (brandTotals[brand] || 0) + val;
      }
    });
  });
  const brandChartData = Object.entries(brandTotals).map(([name, value]) => ({
    name,
    value,
  }));
  const totalSwitch = brandChartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="p-4">
      {/* Date Picker */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <label className="font-medium">จากวันที่:</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          maxDate={today}
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
          maxDate={today}
          dateFormat="dd/MM/yyyy"
          className="border rounded px-2 py-1"
        />
      </div>

      {/* ------ Store Analysis (ต่อท้ายเลย) ------- */}
      <StoreAnalysisSection />

      {/* ---- Performance Main Chart ---- */}
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
            จำนวนวัน (เฉพาะเสาร์-อาทิตย์): <span className="text-[#005BAC] font-semibold">{numberOfDays} วัน</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            เป้าหมายถ้วยชิมทั้งหมด (192 แก้ว/ร้าน/วัน): <span className="text-[#005BAC] font-semibold">{target.toLocaleString("th-TH")} แก้ว</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            ถ้วยชิมรวมที่ทำได้จริง: <span className="text-[#00B9F1] font-semibold">{totalCupServe.toLocaleString("th-TH")} แก้ว</span>
          </p>
        </div>
      </div>
      
      {/* ---- Performance Other ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 items-stretch">
        {/* กราฟเปรียบเทียบ Cup Serve กับ บิลขาย */}
        <div className="bg-white p-4 rounded-2xl shadow h-full flex flex-col">
          <h3 className="text-lg font-semibold mb-2 text-[#005BAC]">
            เปรียบเทียบ Bills Sold กับ Cup Serve
          </h3>
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
              <Bar dataKey="CupServe" fill="#00B9F1" name="Cup Serve">
                <LabelList
                  dataKey="CupServe"
                  position="top"
                  formatter={(value) => `${value.toLocaleString("th-TH")} แก้ว`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600">
            อัตราแปลง (Conversion Rate):{" "}
            <span className={`font-semibold ${conversionRate >= 20 ? "text-green-600" : "text-orange-500"}`}>
              {conversionRate}% {conversionRate >= 20 ? "✅ ดี" : "⚠ ต่ำ"}
            </span>
          </div>
        </div>

        {/* กราฟเปรียบเทียบ Switch Brand */}
        <div className="bg-white p-4 rounded-2xl shadow h-full flex flex-col">
          <h3 className="text-lg font-semibold mb-2 text-[#005BAC]">
            เปรียบเทียบจำนวนลูกค้าที่เปลี่ยนแบรนด์ (Switch Brand)
          </h3>
          <div className="mb-5">
            <span className="inline-block bg-[#E0F4FF] px-5 py-2 rounded-xl text-[#00B9F1] font-bold text-base shadow">
              รวมทั้งหมด: {totalSwitch.toLocaleString("th-TH")} คน
            </span>
          </div>
          {brandChartData.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              ไม่มีข้อมูลเปลี่ยนแบรนด์ในช่วงวันที่เลือก
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={brandChartData}  margin={{ top: 32, right: 20, left: 0, bottom: 0 }} >
                
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => value.toLocaleString("th-TH") + " คน"} />
                <Bar dataKey="value" fill="#FF8C42" name="จำนวนที่เปลี่ยนแบรนด์">
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(value) => `${value.toLocaleString("th-TH")} คน`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      
    </div>
  );
}

export default PerformancePage;
