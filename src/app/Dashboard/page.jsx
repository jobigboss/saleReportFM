"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const productOptions = {
  sur_Omega369Gold1: "Omega369 Gold 1+",
  sur_Omega369Gold4: "Omega369 Gold 4+",
  sur_Omega369Smart1: "Omega369 Smart 1+",
  sur_Omega369Smart4: "Omega369 Smart 4+",
  sur_Omega369Plain: "Omega369 (regular) รสจืด",
  sur_Omega369Choco: "Omega369 (regular) รสช็อกโกแลต",
  sur_Omega369Sweet: "Omega369 (regular) รสหวาน",
  sur_Foremost100: "Foremost 100%",
  sur_Foremost100low0: "Foremost 100% ไขมัน 0%",
  sur_Foremost100low: "Foremost 100% ไขมันต่ำ",
  sur_ForemostChocolate: "Foremost รสช็อกโกแลต",
  sur_ForemostChocolate01: "Foremost รสช็อกโกแลต พร่องไขมัน",
  sur_ForemostStrawberryflavor: "Foremost รสสตอเบอรี่",
  sur_ForemostSweetTaste: "Foremost รสหวาน",
  sur_ForemostBanana: "Foremost รสกล้วยหอม",
  surveyYogurtMixed: "โยเกิร์ตดริ้งค์ รสผลไม้รวม",
  surveyYogurtStrawberry: "โยเกิร์ตดริ้งค์ รสสตอเบอร์รี่",
  surveyYogurtOrange: "โยเกิร์ตดริ้งค์ รสส้ม",
  surveyTFDMuti: "TFD Muti-grain ช็อกโกแลตธัญญพืช",
};

const targetPacks = [
  "แพ็ค 3",
  "แพ็ค 12",
  "ยกลัง (24)",
  "ยกลัง (36)",
  "แพ็ค 4",
  "ยกลัง (48)",
  "แพ็ค 6",
  "เดี่ยว",
  "ยกลัง",
];

const packColors = {
  "แพ็ค 3": "#B1D8B7",
  "แพ็ค 12": "#5EC576",
  "ยกลัง (24)": "#2E8B57",
  "ยกลัง (36)": "#3CB371",
  "แพ็ค 4": "#98FB98",
  "ยกลัง (48)": "#66CDAA",
  "แพ็ค 6": "#00FA9A",
  "เดี่ยว": "#20B2AA",
  "ยกลัง": "#008000",
};

function DashboardPage() {
  const [reportData, setReportData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("sur_Omega369Gold1");
  const [chartData, setChartData] = useState([]);
  const [storeAccountData, setStoreAccountData] = useState([]);
  const [total, setTotal] = useState({ MT: 0, GT: 0 });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const past30 = new Date();
    past30.setDate(today.getDate() - 30);
    setStartDate(past30.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/get/sale_Report_Report");
        const json = await res.json();
        setReportData(json);
      } catch (err) {
        console.error("❌ Error fetching report:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const summaryByChannel = {};
    const storeAccountSummary = {};
    let totalMT = 0;
    let totalGT = 0;

    targetPacks.forEach((pack) => {
      summaryByChannel[pack] = { pack, MT: 0, GT: 0 };
    });

    const filteredReports = reportData.filter((report) => {
      const date = new Date(report.report_SubmitAt);
      return (
        date >= new Date(startDate) &&
        date <= new Date(endDate + "T23:59:59")
      );
    });

    filteredReports.forEach((report) => {
      const channel = report.store_Channel;
      const account = report.store_Account;
      const productData = report.quantities?.[selectedProduct];
      if (!productData) return;

      Object.entries(productData).forEach(([size, volumeObj]) => {
        if (!storeAccountSummary[account]) {
          storeAccountSummary[account] = {};
        }

        Object.entries(volumeObj).forEach(([packType, value]) => {
          if (
            typeof value === "number" &&
            value > 0 &&
            !packType.includes("_price") &&
            !packType.includes("_status") &&
            targetPacks.includes(packType)
          ) {
            if (channel === "MT" || channel === "GT") {
              summaryByChannel[packType][channel] += value;
              if (!storeAccountSummary[account][packType]) {
                storeAccountSummary[account][packType] = 0;
              }
              storeAccountSummary[account][packType] += value;
              if (channel === "MT") totalMT += value;
              if (channel === "GT") totalGT += value;
            }
          }
        });
      });
    });

    const filteredData = Object.values(summaryByChannel).filter(
      (item) => item.MT > 0 || item.GT > 0
    );

    const groupedStoreAccount = Object.entries(storeAccountSummary)
      .map(([account, sizeObj]) => {
        const filteredSize = targetPacks.reduce((acc, pack) => {
          if (sizeObj[pack] > 0) {
            acc[pack] = sizeObj[pack];
          }
          return acc;
        }, {});
        return Object.keys(filteredSize).length > 0
          ? {
              account,
              ...filteredSize,
            }
          : null;
      })
      .filter((entry) => entry !== null);

    setChartData(filteredData);
    setStoreAccountData(groupedStoreAccount);
    setTotal({ MT: totalMT, GT: totalGT });
  }, [reportData, selectedProduct, startDate, endDate]);

  const formatNumber = (num) => {
    if (typeof num !== "number") return "0";
    return num.toLocaleString();
  };

  return (
    <div className="p-6 bg-[#F3F9FF] min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-center text-[#005BAC]">
        เปรียบเทียบยอดขายสินค้าแยกตามขนาดและช่องทาง
      </h2>

      <div className="mb-6 flex flex-col lg:flex-row justify-center items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-[#005BAC] font-medium">วันที่เริ่มต้น:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-[#005BAC] px-2 py-1 rounded-md"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[#005BAC] font-medium">ถึง:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-[#005BAC] px-2 py-1 rounded-md"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[#005BAC] font-medium">เลือกสินค้า:</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="border border-[#005BAC] px-3 py-1 rounded-md"
          >
            {Object.entries(productOptions).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
        <div className="lg:w-1/2 w-full h-[420px] justify-center">
          <div className="flex justify-center gap-10 text-sm font-medium mb-6">
            <div className="text-[#007BFF]">MT รวม: {formatNumber(total.MT)}</div>
            <div className="text-[#FFA500]">GT รวม: {formatNumber(total.GT)}</div>
          </div>
          <ResponsiveContainer width="95%" height="100%">
            <BarChart
              data={chartData}
              margin={{ left: 30, right: 30, top: 20 }}
              barCategoryGap="25%"
              barGap={0}
            >
              <XAxis dataKey="pack" stroke="#005BAC" />
              <YAxis tickFormatter={formatNumber} stroke="#005BAC" />
              <Tooltip
                formatter={(value) => formatNumber(value)}
                contentStyle={{ backgroundColor: "#ffffff", borderColor: "#005BAC" }}
                labelStyle={{ color: "#005BAC" }}
              />
              <Legend wrapperStyle={{ color: "#005BAC" }} />
              <Bar dataKey="MT" fill="#007BFF">
                <LabelList dataKey="MT" position="top" formatter={formatNumber} />
              </Bar>
              <Bar dataKey="GT" fill="#FFA500">
                <LabelList dataKey="GT" position="top" formatter={formatNumber} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:w-1/2 w-full h-[420px] flex flex-col justify-center">
          <h3 className="text-xl font-bold text-center text-[#005BAC] mb-4">
            สรุปยอดขายรายขนาดในแต่ละ Store Account
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={storeAccountData}
              layout="vertical"
              margin={{ left: 80, right: 20 }}
              barCategoryGap="10%"
            >
              <XAxis
                type="number"
                tickFormatter={formatNumber}
                stroke="#005BAC"
                domain={[0, "dataMax + 50"]}
              />
              <YAxis dataKey="account" type="category" stroke="#005BAC" />
              <Tooltip formatter={(value, name) => [`${formatNumber(value)} ${name}`, name]} />
              <Legend />
              {targetPacks.map(
                (pack) =>
                  storeAccountData.some((d) => d[pack] > 0) && (
                    <Bar
                      key={pack}
                      dataKey={pack}
                      fill={packColors[pack] || "#009A3E"}
                      name={pack}
                    >
                      <LabelList
                        dataKey={pack}
                        position="right"
                        formatter={(value) => formatNumber(value)}
                      />
                    </Bar>
                  )
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
