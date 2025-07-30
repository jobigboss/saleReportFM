"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Nevbar from "../Menu/components/Nevbar";

// debounce hook สำหรับ search
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function DataReportListPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter states
  const [selectedChannel, setSelectedChannel] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState([]);
  const [selectedArea2, setSelectedArea2] = useState([]);
  const [selectedCheerType, setSelectedCheerType] = useState([]);
  const [showCheerType, setShowCheerType] = useState(false);

  // Accordion state
  const [showChannel, setShowChannel] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showArea2, setShowArea2] = useState(false);

  // Search state + debounce
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  // Date range state
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Validate date input
  useEffect(() => {
    const today = todayStr();
    if (dateFrom && dateFrom > today) setDateFrom(today);
    if (dateFrom && dateTo && dateTo < dateFrom) setDateTo(dateFrom);
    if (dateTo && dateTo > today) setDateTo(today);
  }, [dateFrom, dateTo]);

  // ดึงข้อมูลแต่ละหน้าแบบ filter/query
  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("perPage", perPage);
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      selectedChannel.forEach(v => params.append("store_Channel", v));
      selectedAccount.forEach(v => params.append("store_Account", v));
      selectedArea2.forEach(v => params.append("store_Area2", v));
      selectedCheerType.forEach(v => params.append("report_cheerType", v));

      const repRes = await fetch(`/api/get/sale_Report_Report?${params.toString()}`);
      const { rows, total } = await repRes.json();
      setReports(Array.isArray(rows) ? rows : []);
      setTotal(total || 0);
      setLoading(false);
    }
    fetchPage();
  }, [
    page, perPage,
    debouncedSearch,
    selectedChannel, selectedAccount, selectedArea2, selectedCheerType,
    dateFrom, dateTo
  ]);

  // unique options สำหรับ filter group
  // (ควรสร้าง endpoint แยกสำหรับดึง unique options เพื่อความเร็วในระบบใหญ่)
  const uniqueChannels = [...new Set(reports.map(r => r.store_Channel).filter(Boolean))];
  const uniqueAccounts = [...new Set(reports.map(r => r.store_Account).filter(Boolean))];
  const uniqueArea2 = [...new Set(reports.map(r => r.store_Area2).filter(Boolean))];

  function formatThaiDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const bangkok = new Date(utc + 7 * 60 * 60000);
    const year = bangkok.getFullYear();
    const month = (bangkok.getMonth() + 1).toString().padStart(2, "0");
    const day = bangkok.getDate().toString().padStart(2, "0");
    return `${day}/${month}/${year}`;
  }

  // Options
  const cheerTypeOptions = [
    "เชียร์ขาย & ชงชิม",
    "เชียร์ขายอย่างเดียว"
  ];

  // Pagination logic
  const totalPages = Math.ceil(total / perPage);
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  // Reset page if filter/search/perPage เปลี่ยน
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCheerType, selectedChannel, selectedAccount, selectedArea2, dateFrom, dateTo, perPage]);

  // ฟังก์ชันลบ (ถ้ายังต้องการ)
  async function handleDelete(reportId) {
    if (!window.confirm("ยืนยันการลบรายการนี้? ลบแล้วไม่สามารถย้อนคืนได้!")) return;
    try {
      const res = await fetch(`/api/admin/sale-report/${reportId}`, { method: "DELETE" });
      if (res.ok) {
        setReports(reports => reports.filter(r => r.report_ID !== reportId));
        alert("ลบสำเร็จ");
      } else {
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  }

  if (loading)
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center text-lg">
        Loading...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto my-8 px-3">
      <div className="bg-gradient-to-br from-[#f8fafc] to-white rounded-2xl shadow p-6 border border-gray-100">
        <Nevbar />
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2 mt-2 tracking-tight">
          รายการรายงานทั้งหมด
        </h1>
        <div className="text-sm text-gray-500 mb-4">{`แสดง ${total} รายการ`}</div>

        {/* Search + Date + Filter */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end gap-4">
          {/* Search */}
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="ค้นหาทุกช่อง (ชื่อร้าน, จังหวัด, ฯลฯ)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-base"
            />
          </div>
          {/* Date range */}
          <div className="flex gap-2 items-center w-full md:w-auto">
            <label className="text-gray-600 text-sm font-medium">วันที่:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-2 py-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-200"
              max={todayStr()}
            />
            <span className="text-gray-500 mx-1">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-2 py-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-200"
              min={dateFrom || undefined}
              max={todayStr()}
              disabled={!dateFrom}
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="ml-2 text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >ล้างวันที่</button>
            )}
          </div>
          {/* Filter group */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
            <FilterGroup
              label="ประเภทเชียร์"
              show={showCheerType}
              setShow={setShowCheerType}
              options={cheerTypeOptions}
              selected={selectedCheerType}
              setSelected={setSelectedCheerType}
              color="orange"
            />
            <FilterGroup
              label="ช่องทาง"
              show={showChannel}
              setShow={setShowChannel}
              options={uniqueChannels}
              selected={selectedChannel}
              setSelected={setSelectedChannel}
              color="blue"
            />
            <FilterGroup
              label="Account"
              show={showAccount}
              setShow={setShowAccount}
              options={uniqueAccounts}
              selected={selectedAccount}
              setSelected={setSelectedAccount}
              color="green"
            />
            <FilterGroup
              label="เขต/พื้นที่ย่อย"
              show={showArea2}
              setShow={setShowArea2}
              options={uniqueArea2}
              selected={selectedArea2}
              setSelected={setSelectedArea2}
              color="pink"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl shadow border border-gray-100">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#eef3fa] text-gray-700 font-semibold">
                <th className="px-4 py-3 text-left">Report ID</th>
                <th className="px-4 py-3 text-left">ชื่อร้าน</th>
                <th className="px-4 py-3 text-left">จังหวัด</th>
                <th className="px-4 py-3 text-left">วันที่</th>
                <th className="px-4 py-3 text-left">ประเภทเชียร์</th>
                <th className="px-4 py-3 text-left">Cup Serves</th>
                <th className="px-4 py-3 text-left">Bills</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.report_ID}
                  className="hover:bg-blue-50 transition"
                >
                  <td className="px-4 py-2">{report.report_ID}</td>
                  <td className="px-4 py-2">{report.store_Name}</td>
                  <td className="px-4 py-2">{report.store_Province}</td>
                  <td className="px-4 py-2">{formatThaiDate(report.report_SubmitAt)}</td>
                  <td className="px-4 py-2">{report.report_cheerType || "-"}</td>
                  <td className="px-4 py-2">{report.report_sampleCups}</td>
                  <td className="px-4 py-2">{report.report_billsSold}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex gap-2 justify-center">
                      <Link href={`/admin/data-report/${report.report_ID}`}>
                        <button
                          className="px-3 py-1 rounded-full font-medium shadow transition 
                            bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 text-white"
                          style={{ minWidth: 62 }}
                        >
                          Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(report.report_ID)}
                        className="px-3 py-1 rounded-full font-medium shadow transition
                          bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-700 hover:to-pink-600 
                          focus:outline-none focus:ring-2 focus:ring-red-200 text-white"
                        style={{ minWidth: 62 }}
                        aria-label="Delete report"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 py-6">
                    ไม่พบข้อมูลที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 py-4">
          <div className="text-sm text-gray-600">
            แสดง {from}-{to} จาก {total} รายการ
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm">แสดงต่อหน้า</label>
            <select
              value={perPage}
              onChange={e => setPerPage(Number(e.target.value))}
              className="border border-gray-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-200"
            >
              {[10, 25, 50, 100].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <Pagination page={page} setPage={setPage} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Accordion FilterGroup
function FilterGroup({
  label,
  show,
  setShow,
  options,
  selected,
  setSelected,
  color = "blue",
}) {
  function handleCheck(val, checked) {
    setSelected((prev) =>
      checked ? [...prev, val] : prev.filter((v) => v !== val)
    );
  }
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm min-w-[140px]">
      <button
        className="w-full flex items-center gap-2 px-4 py-2 font-semibold text-base hover:bg-gray-50 rounded-t-xl transition"
        type="button"
        aria-expanded={show}
        aria-controls={`${label}-group`}
        onClick={() => setShow((v) => !v)}
      >
        <span
          className={`transition-transform duration-200 ${show ? "rotate-90" : ""}`}
        >
          <svg width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 7l3 3 3-3" stroke="#3b82f6" strokeWidth="2" fill="none" />
          </svg>
        </span>
        <span>{label}</span>
      </button>
      <div
        id={`${label}-group`}
        style={{
          maxHeight: show ? "400px" : "0px",
          transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
        }}
      >
        <div className="px-4 py-2 flex flex-wrap gap-x-3 gap-y-1 text-[15px]">
          {options.length === 0 ? (
            <span className="text-gray-400">ไม่มีข้อมูล</span>
          ) : (
            options.map((val) => (
              <label
                key={val}
                className="inline-flex items-center mr-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(val)}
                  onChange={(e) => handleCheck(val, e.target.checked)}
                  className={`accent-${color}-500 w-4 h-4 rounded focus:ring-2 focus:ring-${color}-300`}
                />
                <span className="ml-2">{val}</span>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Pagination Component
function Pagination({ page, setPage, totalPages }) {
  if (totalPages <= 1) return null;
  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);

  return (
    <div className="flex items-center gap-1">
      <button
        disabled={page === 1}
        onClick={() => setPage(p => Math.max(1, p - 1))}
        className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
      >
        {"<"}
      </button>
      {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(n => (
        <button
          key={n}
          onClick={() => setPage(n)}
          className={`w-8 h-8 rounded border flex items-center justify-center ${
            page === n
              ? "bg-blue-600 text-white"
              : "border-gray-200 bg-white text-gray-800 hover:bg-gray-100"
          }`}
        >
          {n}
        </button>
      ))}
      <button
        disabled={page === totalPages}
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
      >
        {">"}
      </button>
    </div>
  );
}
