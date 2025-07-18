"use client";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const num = (n) => (isNaN(n) ? "-" : n.toLocaleString());
const target = 192;

// Sticky left value ตามลำดับ #, Store, Zone, จังหวัด
const stickyPos = {
  idx: 0,
  store: 48,
  zone: 256,
  province: 366,
};

function ByStorePage() {
  const [data, setData] = useState({});
  const [stores, setStores] = useState([]);
  const [dates, setDates] = useState([]);
  const [search, setSearch] = useState("");
  const [storeDetail, setStoreDetail] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      const storeRes = await fetch("/api/get/sale_Report_Store").then(res => res.json());
      const cheerStores = storeRes.filter(s => s.store_Account === "LMT");
      const storeMap = {};
      cheerStores.forEach(s => {
        storeMap[s.store_Name?.trim()] = s;
      });
      setStoreDetail(storeMap);

      const reportRes = await fetch("/api/get/sale_Report_Report").then(res => res.json());
      const filter = reportRes.filter((r) => !!storeMap[r.store_Name?.trim()]);

      const byStore = {};
      filter.forEach((r) => {
        const store = r.store_Name?.trim() || "-";
        const day = r.report_SubmitAt?.slice(0, 10);
        if (!byStore[store]) byStore[store] = {};
        byStore[store][day] = {
          serves: Number(r.report_sampleCups) || 0,
          target,
          vsTarget: Number(r.report_sampleCups)
            ? Math.round((Number(r.report_sampleCups) / target) * 100)
            : 0,
          bills: Number(r.report_billsSold) || 0,
          conversion: Number(r.report_sampleCups)
            ? Math.round(
                (Number(r.report_billsSold) / Number(r.report_sampleCups)) * 100
              )
            : 0,
        };
      });

      const storeList = Object.keys(byStore);
      const allDates = Array.from(
        new Set(
          filter
            .map((r) => r.report_SubmitAt?.slice(0, 10))
            .filter((d) => !!d)
        )
      ).sort();

      setStores(storeList);
      setDates(allDates);
      setData(byStore);
    };
    fetchAll();
  }, []);

  // ========== Zone Sorting ==========
  const zoneOrder = Array.from(
    new Set(
      Object.values(storeDetail)
        .map(s => s.store_Area2)
        .filter(Boolean)
    )
  );

  // filter by search
  // const filteredStores = stores.filter((store) =>
  //   store.toLowerCase().includes(search.toLowerCase())
  // );
  const filteredStores = stores.filter((store) => {
  const storeName = store.toLowerCase();
  const province = (storeDetail[store]?.store_Province ?? "").toLowerCase();
  const q = search.trim().toLowerCase();
  return storeName.includes(q) || province.includes(q);
});

  // sort by zone -> then store name
  const sortedStores = filteredStores.sort((a, b) => {
    const zoneA = storeDetail[a]?.store_Area2 || "";
    const zoneB = storeDetail[b]?.store_Area2 || "";
    const idxA = zoneA ? zoneOrder.indexOf(zoneA) : 999;
    const idxB = zoneB ? zoneOrder.indexOf(zoneB) : 999;
    if (idxA === idxB) {
      return a.localeCompare(b, "th");
    }
    return idxA - idxB;
  });

  // Progress bar cell
  const BarCell = ({ value }) => {
    if (!value || value <= 0) return <span>-</span>;
    return (
      <div className="relative h-6 flex items-center justify-center w-full px-2">
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-4 rounded bg-green-400"
          style={{
            width: `${Math.min(value, 100)}%`,
            opacity: 0.85,
            transition: "width 0.5s",
            zIndex: 1,
          }}
        ></div>
        <span className="relative z-10 font-semibold text-gray-700">
          {value}%
        </span>
      </div>
    );
  };

  // Export Excel (Pivot Matrix)
  const handleExportPivot = () => {
    const headRow1 = ["#", "Store", "Zone", "Province"];
    dates.forEach(date => {
      const dateLabel = new Date(date).toLocaleDateString("th-TH", {
        year: "2-digit",
        month: "short",
        day: "numeric",
      });
      for (let i = 0; i < 5; i++) headRow1.push(dateLabel);
    });

    const subHeaders = ["Serves", "Target", "%vsTarget", "ปิดการขาย", "%Conversion"];
    const headRow2 = ["", "", "", ""];
    dates.forEach(() => {
      headRow2.push(...subHeaders);
    });

    const formatPercent = (v) =>
      v !== undefined && v !== null && v !== "-" ? `${v}%` : "-";

    const rows = sortedStores.map((store, i) => {
      let row = [
        i + 1,
        store,
        storeDetail[store]?.store_Area2 ?? "-",
        storeDetail[store]?.store_Province ?? "-"
      ];
      dates.forEach(date => {
        const d = data[store]?.[date] || {};
        row.push(
          d.serves ?? "-",
          target,
          formatPercent(d.vsTarget),
          d.bills ?? "-",
          formatPercent(d.conversion)
        );
      });
      return row;
    });

    const ws_data = [headRow1, headRow2, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // merge header (date) colspan=5
    let col = 4;
    const merges = [];
    dates.forEach(() => {
      merges.push({ s: { r: 0, c: col }, e: { r: 0, c: col + 4 } });
      col += 5;
    });
    ws["!merges"] = merges;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "sale_report_matrix.xlsx");
  };

  return (
    <div className="p-4 w-full">
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
        <input
          className="border rounded px-3 py-2 text-sm w-full md:w-80"
          placeholder="ค้นหาชื่อร้าน..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded shadow"
          onClick={handleExportPivot}
        >
          Export Excel
        </button>
      </div>
      <div className="w-full overflow-x-auto rounded-xl shadow">
        <table className="border-collapse min-w-[1500px] w-full text-xs bg-white">
          <thead>
            <tr>
              <th
                className="sticky z-[50] bg-yellow-300 border font-semibold text-gray-700 px-2 py-2"
                style={{
                  left: stickyPos.idx,
                  minWidth: 48,
                  width: 48,
                  background: "#fde047"
                }}
                rowSpan={2}
              >
                #
              </th>
              <th
                className="sticky z-[45] bg-yellow-300 border font-semibold text-gray-700 px-3 py-2"
                style={{
                  left: stickyPos.store,
                  minWidth: 208,
                  width: 208,
                  background: "#fde047"
                }}
                rowSpan={2}
              >
                Store
              </th>
              <th
                className="sticky z-[40] bg-yellow-200 border font-semibold text-gray-700 px-2 py-2"
                style={{
                  left: stickyPos.zone,
                  minWidth: 110,
                  width: 110,
                  background: "#fef08a"
                }}
                rowSpan={2}
              >
                Zone
              </th>
              <th
                className="sticky z-[35] bg-yellow-200 border font-semibold text-gray-700 px-2 py-2"
                style={{
                  left: stickyPos.province,
                  minWidth: 110,
                  width: 110,
                  background: "#fef08a"
                }}
                rowSpan={2}
              >
                จังหวัด
              </th>
              {dates.map((date) => (
                <th
                  key={date}
                  className="bg-blue-100 border px-2 py-1 text-center font-semibold text-gray-700"
                  colSpan={5}
                >
                  {new Date(date).toLocaleDateString("th-TH", {
                    year: "2-digit",
                    month: "short",
                    day: "numeric",
                  })}
                </th>
              ))}
            </tr>
            <tr>
              {dates.map((date) => (
                <React.Fragment key={date + "_sub"}>
                  <th className="bg-blue-50 border px-2 py-1 font-medium text-gray-600">Serves</th>
                  <th className="bg-blue-50 border px-2 py-1 font-medium text-gray-600">Target</th>
                  <th className="bg-blue-50 border px-2 py-1 font-medium text-gray-600">%vsTarget</th>
                  <th className="bg-blue-50 border px-2 py-1 font-medium text-gray-600">ปิดการขาย</th>
                  <th className="bg-blue-50 border px-2 py-1 font-medium text-gray-600">%Conversion</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedStores.length === 0 && (
              <tr>
                <td colSpan={4 + dates.length * 5} className="text-center py-8 text-gray-400">
                  ไม่พบข้อมูลร้าน
                </td>
              </tr>
            )}
            {sortedStores.map((store, i) => (
              <tr key={store} className="even:bg-gray-50">
                <td
                  className="sticky z-[50] bg-white border text-center font-semibold"
                  style={{
                    left: stickyPos.idx,
                    minWidth: 48,
                    width: 48,
                    background: "#fff"
                  }}
                >
                  {i + 1}
                </td>
                <td
                  className="sticky z-[45] bg-white border px-2 font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{
                    left: stickyPos.store,
                    minWidth: 208,
                    width: 208,
                    background: "#fff"
                  }}
                  title={store}
                >
                  {store}
                </td>
                <td
                  className="sticky z-[40] bg-white border text-center font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{
                    left: stickyPos.zone,
                    minWidth: 110,
                    width: 110,
                    background: "#fff"
                  }}
                >
                  {storeDetail[store]?.store_Area2 ?? "-"}
                </td>
                <td
                  className="sticky z-[35] bg-white border text-center font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{
                    left: stickyPos.province,
                    minWidth: 110,
                    width: 110,
                    background: "#fff"
                  }}
                >
                  {storeDetail[store]?.store_Province ?? "-"}
                </td>
                {dates.map((date) =>
                  data[store][date] ? (
                    <React.Fragment key={date}>
                      <td className="border text-center bg-white">{num(data[store][date].serves)}</td>
                      <td className="border text-center bg-white">{target}</td>
                      <td className="border text-center p-0 bg-white">
                        <BarCell value={data[store][date].vsTarget} />
                      </td>
                      <td className="border text-center bg-white">{num(data[store][date].bills)}</td>
                      <td className="border text-center p-0 bg-white">
                        <BarCell value={data[store][date].conversion} />
                      </td>
                    </React.Fragment>
                  ) : (
                    <React.Fragment key={date}>
                      <td className="border text-center bg-gray-100" colSpan={5}>
                        -
                      </td>
                    </React.Fragment>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style jsx global>{`
        th, td { border: 1px solid #d9d9d9; }
        th.sticky, td.sticky { box-shadow: 2px 0 0 #ececec; }
      `}</style>
    </div>
  );
}

export default ByStorePage;
