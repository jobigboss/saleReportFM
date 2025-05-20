"use client";
import React, { useEffect, useState } from "react";

function SaleReportPage({ onNext, formData, setFormData }) {
  const [storeData, setStoreData] = useState([]);
  const [reportData, setReportData] = useState({
    store_Channel: "",
    store_Account: "",
    store_Area2: "",
    store_Province: "",
    store_Name: "",
  });

  // ✅ โหลดข้อมูลร้าน
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch("/api/get/sale_Report_Store");
        const data = await res.json();
        setStoreData(data);
      } catch (err) {
        console.error("Failed to fetch store data", err);
      }
    };
    fetchStores();
  }, []);

  // ✅ ดึงข้อมูลจาก formData กลับมาเมื่อกลับมาหน้านี้
  useEffect(() => {
    setReportData({
      store_Channel: formData.store_Channel || "",
      store_Account: formData.store_Account || "",
      store_Area2: formData.store_Area2 || "",
      store_Province: formData.store_Province || "",
      store_Name: formData.store_Name || "",
    });
  }, [formData]);

  // ✅ เมื่อมีการเปลี่ยน select
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...reportData, [name]: value };
    setReportData(updated);
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  // ✅ เมื่อคลิกช่องทางการขาย
  const handleChannelClick = (channel) => {
    const updated = {
      store_Channel: channel,
      store_Account: "",
      store_Area2: "",
      store_Province: "",
      store_Name: "",
    };
    setReportData(updated);
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  // ✅ ดึงรายการให้เลือกตามลำดับการเลือก
  const getFilteredOptions = (field) => {
    let filtered = storeData;
    if (reportData.store_Channel) filtered = filtered.filter(i => i.store_Channel === reportData.store_Channel);
    if (field === "store_Account") return [...new Set(filtered.map(i => i.store_Account))];

    if (reportData.store_Account) filtered = filtered.filter(i => i.store_Account === reportData.store_Account);
    if (field === "store_Area2") return [...new Set(filtered.map(i => i.store_Area2))];

    if (reportData.store_Area2) filtered = filtered.filter(i => i.store_Area2 === reportData.store_Area2);
    if (field === "store_Province") return [...new Set(filtered.map(i => i.store_Province))];

    if (reportData.store_Province) filtered = filtered.filter(i => i.store_Province === reportData.store_Province);
    if (field === "store_Name") return [...new Set(filtered.map(i => i.store_Name))];

    return [];
  };

  // ✅ สร้าง dropdown แบบปรับได้
  const renderSelect = (label, name, options, disabled = false, hidden = false) => {
    if (hidden) return null;
    return (
      <div className="w-full">
        <label className="block text-[#4B2E2B] font-semibold mb-2 text-sm tracking-wide">{label}</label>
        <select
          name={name}
          value={reportData[name]}
          onChange={handleChange}
          disabled={disabled}
          className={`w-full px-4 py-2 border border-[#CDA47E] bg-gradient-to-br from-[#FFF2E5] to-[#FFD8A9] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C97440] text-[#5C3B28] transition ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <option value="">เลือก {label}</option>
          {options.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  };

  const storeChannels = [...new Set(storeData.map(i => i.store_Channel))];

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6 bg-gradient-to-br from-[#FFF8F2] to-[#FFE6C9] rounded-xl shadow-xl border border-[#FFD6B3]">
      <h2 className="text-2xl font-bold text-[#6B3E26] mb-4 tracking-wide">ฟอร์มรายงานการขาย</h2>

      <div className="space-y-4">
        <label className="block text-[#4B2E2B] font-semibold text-sm tracking-wide">ช่องทางการขาย</label>
        <div className="flex flex-wrap gap-2">
          {storeChannels.map((channel, i) => (
            <button
              key={i}
              onClick={() => handleChannelClick(channel)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition ${reportData.store_Channel === channel ? 'bg-[#C97440] text-white border-[#C97440]' : 'bg-white text-[#C97440] border-[#C97440]'}`}
            >
              {channel}
            </button>
          ))}
        </div>

        {reportData.store_Channel && renderSelect("ร้านค้า", "store_Account", getFilteredOptions("store_Account"))}
        {reportData.store_Account && renderSelect("เขตพื้นที่ย่อย", "store_Area2", getFilteredOptions("store_Area2"))}
        {reportData.store_Area2 && renderSelect("จังหวัด", "store_Province", getFilteredOptions("store_Province"))}
        {reportData.store_Province && renderSelect("ชื่อร้านค้า", "store_Name", getFilteredOptions("store_Name"))}

        {reportData.store_Name && (
          <div className="pt-4 text-right">
            <button
              onClick={() => onNext(reportData)}
              className="bg-[#C97440] text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-[#a75933] transition"
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SaleReportPage;
