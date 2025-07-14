"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, LabelList
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ---------- Options ----------
const productOptions = {
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
  "แพ็ค 3", "แพ็ค 12", "ยกลัง (24)", "ยกลัง (36)", "แพ็ค 4", "ยกลัง (48)",
  "แพ็ค 6", "เดี่ยว", "ยกลัง",
];
const packColors = {
  "แพ็ค 3": "#B1D8B7", "แพ็ค 12": "#5EC576", "ยกลัง (24)": "#2E8B57",
  "ยกลัง (36)": "#3CB371", "แพ็ค 4": "#98FB98", "ยกลัง (48)": "#66CDAA",
  "แพ็ค 6": "#00FA9A", "เดี่ยว": "#20B2AA", "ยกลัง": "#008000",
};

function DashboardPage() {
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  // --------- State ---------
  const [reportData, setReportData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("sur_Omega369Gold1");
  const [chartData, setChartData] = useState([]);
  const [storeAccountData, setStoreAccountData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [total, setTotal] = useState({ MT: 0, GT: 0 });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchText, setSearchText] = useState("");

  // --------- Date default (ย้อนหลัง 30 วัน) ---------
  useEffect(() => {
    const past30 = new Date(today);
    past30.setDate(today.getDate() - 30);
    setStartDate(past30.toISOString().split("T")[0]);
    setEndDate(todayString);
  }, [todayString]);

  // --------- endDate ต้องไม่น้อยกว่า startDate ---------
  useEffect(() => {
    if (endDate && startDate && endDate < startDate) setEndDate(startDate);
  }, [startDate, endDate]);

  // --------- Fetch Data ---------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/get/sale_Report_Report");
        const json = await res.json();
        // filter LMT only
        const lmtData = json.filter(item => item.store_Account === "LMT");
        setReportData(lmtData);
      } catch (err) {
        console.error("❌ Error fetching report:", err);
      }
    };
    fetchData();
  }, []);

  // --------- Prepare chart/table data ---------
  useEffect(() => {
    const summaryByChannel = {};
    const storeAccountSummary = {};
    let totalMT = 0;
    let totalGT = 0;

    targetPacks.forEach((pack) => {
      summaryByChannel[pack] = { pack, MT: 0, GT: 0 };
    });

    // -- Filter ตามช่วงวันที่ --
    const filteredReports = reportData.filter((report) => {
      const date = new Date(report.report_SubmitAt);
      return (
        date >= new Date(startDate) &&
        date <= new Date(endDate + "T23:59:59")
      );
    });

    // -- Filter ตามสินค้า --
    const productKeys =
      selectedProduct === "ALL"
        ? Object.keys(productOptions).filter((key) => key !== "ALL")
        : [selectedProduct];

    // -- Table --
    const tableRows = filteredReports.map((report) => {
      const packData = {};
      targetPacks.forEach((pack) => { packData[pack] = 0; });
      productKeys.forEach((productKey) => {
        const productData = report.quantities?.[productKey];
        if (!productData) return;
        Object.entries(productData).forEach(([volume, packs]) => {
          Object.entries(packs).forEach(([packType, value]) => {
            if (
              typeof value === "number" &&
              !packType.includes("_price") &&
              !packType.includes("_status") &&
              targetPacks.includes(packType)
            ) {
              packData[packType] += value;
            }
          });
        });
      });
      return {
        store_Name: report.store_Name,
        store_Channel: report.store_Channel,
        store_Account: report.store_Account,
        store_Province: report.store_Province,
        store_Area2: report.store_Area2,
        report_SubmitAt: report.report_SubmitAt,
        ...packData,
      };
    });

    setTableData(tableRows);

    // -- Chart Data --
    filteredReports.forEach((report) => {
      const channel = report.store_Channel;
      const account = report.store_Account;

      productKeys.forEach((productKey) => {
        const productData = report.quantities?.[productKey];
        if (!productData) return;
        Object.entries(productData).forEach(([size, volumeObj]) => {
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

                if (!storeAccountSummary[account]) {
                  storeAccountSummary[account] = {};
                }
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
    });

    const filteredData = Object.values(summaryByChannel).filter(
      (item) => item.MT > 0 || item.GT > 0
    );

    const groupedStoreAccount = Object.entries(storeAccountSummary)
      .map(([account, sizeObj]) => {
        const filteredSize = targetPacks.reduce((acc, pack) => {
          if (sizeObj[pack] > 0) acc[pack] = sizeObj[pack];
          return acc;
        }, {});
        return Object.keys(filteredSize).length > 0
          ? { account, ...filteredSize }
          : null;
      })
      .filter((entry) => entry !== null);

    setChartData(filteredData);
    setStoreAccountData(groupedStoreAccount);
    setTotal({ MT: totalMT, GT: totalGT });
  }, [reportData, selectedProduct, startDate, endDate]);

  // --------- Number Format ---------
  const formatNumber = (num) => {
    if (typeof num !== "number") return "0";
    return num.toLocaleString();
  };

  // --------- Filter Table ด้วย keyword ทุกช่อง (real-time) ---------
  const filteredTableData = tableData.filter((item) => {
    const lower = searchText.toLowerCase();
    return (
      item.store_Name?.toLowerCase().includes(lower) ||
      item.store_Province?.toLowerCase().includes(lower) ||
      item.store_Area2?.toLowerCase().includes(lower) ||
      item.store_Account?.toLowerCase().includes(lower) ||
      item.store_Channel?.toLowerCase().includes(lower)
    );
  });

  // --------- Export Excel ---------
  const handleExportExcel = () => {
    const exportData = filteredTableData.map(
      ({
        store_Name, store_Channel, store_Account,
        store_Province, store_Area2, report_SubmitAt, ...packs
      }, idx) => ({
        ลำดับ: idx + 1,
        ชื่อร้าน: store_Name,
        ช่องทาง: store_Channel,
        Account: store_Account,
        จังหวัด: store_Province,
        เขต: store_Area2,
        วันที่ส่ง: report_SubmitAt,
        ...packs,
      })
    );
    const formatDateShort = (dateStr) => {
      const [year, month, day] = dateStr.split("-");
      return `${year.slice(2)}${month}${day}`;
    };
    const startFormatted = formatDateShort(startDate);
    const endFormatted = formatDateShort(endDate);

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "รายงาน");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx", type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `รายงานยอดขาย_${startFormatted}_${endFormatted}.xlsx`);
  };

  // --------- UI ---------
  return (
    <div className="p-6 bg-[#F3F9FF] min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-center text-[#005BAC]">
        เปรียบเทียบยอดขายสินค้าแยกตามขนาดและช่องทาง
      </h2>

      {/* filter row */}
      <div className="mb-6 flex flex-col lg:flex-row justify-center items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-[#005BAC] font-medium">วันที่เริ่มต้น:</label>
          <input
            type="date"
            value={startDate}
            max={todayString}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-[#005BAC] px-2 py-1 rounded-md"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[#005BAC] font-medium">ถึง:</label>
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={todayString}
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
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* charts */}
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
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
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
              <XAxis type="number" tickFormatter={formatNumber} stroke="#005BAC" />
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
                      <LabelList dataKey={pack} position="right" formatter={formatNumber} />
                    </Bar>
                  )
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* table */}
      <div className="mt-10">
        <h3 className="text-xl font-bold text-center text-[#005BAC] mb-4">
          รายละเอียดรายงานตามร้านค้า
        </h3>
        {/* 🔍 ช่องค้นหา */}
        <div className="flex justify-between items-center mb-3">
          <input
            type="text"
            placeholder="ค้นหาชื่อร้าน / จังหวัด / เขต / ช่องทาง / Account"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border border-[#005BAC] px-3 py-1 rounded-md text-sm w-full max-w-sm"
          />
          <button
            onClick={handleExportExcel}
            className="bg-[#005BAC] text-white px-4 py-1 rounded-md text-sm hover:bg-blue-700"
          >
            Export Excel
          </button>
        </div>
        <div className="overflow-auto border border-[#ccc] rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-[#005BAC] text-white">
              <tr>
                <th className="px-4 py-2 border text-center">#</th>
                <th className="px-4 py-2 border text-center">ชื่อร้าน</th>
                <th className="px-4 py-2 border text-center">ช่องทาง</th>
                <th className="px-4 py-2 border text-center">Account</th>
                <th className="px-4 py-2 border text-center">จังหวัด</th>
                <th className="px-4 py-2 border text-center">เขต</th>
                <th className="px-4 py-2 border text-center">วันที่ส่ง</th>
                {targetPacks.map((pack) => (
                  <th key={pack} className="px-4 py-2 border text-center">{pack}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTableData.length === 0 ? (
                <tr>
                  <td colSpan={7 + targetPacks.length} className="text-center py-4 text-gray-500">
                    ไม่พบข้อมูลในช่วงวันที่ที่เลือก
                  </td>
                </tr>
              ) : (
                filteredTableData.map((item, idx) => (
                  <tr key={item.store_Account + idx} className="hover:bg-[#F0F8FF]">
                    <td className="px-4 py-2 border text-center">{idx + 1}</td>
                    <td className="px-4 py-2 border">{item.store_Name}</td>
                    <td className="px-4 py-2 border text-center">{item.store_Channel}</td>
                    <td className="px-4 py-2 border text-center">{item.store_Account}</td>
                    <td className="px-4 py-2 border text-center">{item.store_Province}</td>
                    <td className="px-4 py-2 border text-center">{item.store_Area2}</td>
                    <td className="px-4 py-2 border text-center">
                      {item.report_SubmitAt
                        ? new Date(item.report_SubmitAt).toLocaleDateString("th-TH")
                        : "-"}
                    </td>
                    {targetPacks.map((pack) => (
                      <td key={pack} className="px-4 py-2 border text-center">
                        {item[pack] !== undefined ? formatNumber(item[pack]) : "-"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
