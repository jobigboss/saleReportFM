"use client";
import React, { use, useState, useEffect } from "react";
import Link from "next/link"; // 👈 เพิ่ม import Link
import { useRouter } from "next/navigation"; // สำหรับ router.push

function formatDateInput(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  // ตัดเป็นวันที่ Local ของเครื่อง user
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function getAdminNameByEmail(email) {
  if (!email) return "";
  const res = await fetch("/api/admin/get/get-user-admin");
  const data = await res.json();
  const found = data.find((u) => u.email === email);
  return found ? found.name : "";
}

export default function DataReportEditPage(props) {
  // 👇 สำคัญ
  const params = use(props.params);
  const { id } = params;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("email");
    const cachedEmail = localStorage.getItem("cachedEmail");
    if (email !== cachedEmail) {
      localStorage.removeItem("name");
      localStorage.setItem("cachedEmail", email || "");
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/sale-report/${id}`);
        const data = await res.json();
        setReport(data);
        setError("");
      } catch {
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  function handleChange(e) {
    setReport((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const email = localStorage.getItem("email");
    let name = localStorage.getItem("name");
    if (!name && email) {
      name = await getAdminNameByEmail(email);
      localStorage.setItem("name", name);
    }

    try {
      const body = {
        ...report,
        _editorUserID: email,
        _editorName: name,
      };
      const res = await fetch(`/api/admin/sale-report/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("save error");
      alert("บันทึกข้อมูลเรียบร้อยแล้ว");
      router.push("/admin/data-report"); // กลับหน้าหลังบันทึก
    } catch {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel(e) {
    e.preventDefault();
    router.push("/admin/data-report"); // กลับหน้ารายการ
  }

  if (loading) return <div className="p-10 text-lg text-gray-500">Loading...</div>;
  if (error) return <div className="p-10 text-lg text-red-500">{error}</div>;
  if (!report) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 my-10">
      <h1 className="text-2xl font-extrabold mb-8 text-gray-800">
        แก้ไขรายงาน: <span className="text-blue-600">{report.report_ID}</span>
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Name */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">ชื่อร้าน</label>
          <input
            type="text"
            name="store_Name"
            value={report.store_Name || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 outline-none transition"
            required
          />
        </div>
        {/* Province */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">จังหวัด</label>
          <input
            type="text"
            name="store_Province"
            value={report.store_Province || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 outline-none transition"
            required
          />
        </div>
        {/* Channel */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">ช่องทาง</label>
          <input
            type="text"
            name="store_Channel"
            value={report.store_Channel || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 outline-none transition"
          />
        </div>
        {/* Account */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">Account</label>
          <input
            type="text"
            name="store_Account"
            value={report.store_Account || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 outline-none transition"
          />
        </div>
        
        {/* วันที่ */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">วันที่ลงรายงาน</label>
          <input
            type="date"
            name="report_SubmitAt"
            value={formatDateInput(report.report_SubmitAt)}
            onChange={e =>
              handleChange({
                target: {
                  name: "report_SubmitAt",
                  value: e.target.value,
                },
              })
            }
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 outline-none transition"
            max={new Date().toISOString().slice(0, 10)}
            required
          />
        </div>

        {/* Sample Cups */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">แจกชิม (แก้ว)</label>
          <input
            type="number"
            name="report_sampleCups"
            value={report.report_sampleCups ?? ""}
            min={0}
            onChange={e =>
              handleChange({
                target: {
                  name: "report_sampleCups",
                  value: e.target.value === "" ? "" : Number(e.target.value), // Ensure number or empty
                }
              })
            }
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 outline-none transition"
            placeholder="จำนวนแก้ว"
          />
        </div>

        {/* Bills Sold */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">ขายได้ (บิล)</label>
          <input
            type="number"
            name="report_billsSold"
            value={report.report_billsSold ?? ""}
            min={0}
            onChange={e =>
              handleChange({
                target: {
                  name: "report_billsSold",
                  value: e.target.value === "" ? "" : Number(e.target.value),
                }
              })
            }
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 outline-none transition"
            placeholder="จำนวนบิล"
          />
        </div>


        {/* ปุ่ม */}
        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={saving}
            className={`px-8 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-400 shadow-lg hover:from-blue-700 hover:to-blue-500 transition active:scale-95 ${
              saving ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
          {/* ปุ่ม Cancel */}
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="px-8 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 shadow hover:bg-gray-300 transition active:scale-95"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
