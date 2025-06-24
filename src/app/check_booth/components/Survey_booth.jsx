"use client";
import React, { useState, useEffect } from "react";

function Survey_booth() {

const [formData, setFormData] = useState({
    Date: "",

  });

    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


const renderInput = (label, name, type = "text", placeholder = "",readOnly = false) => (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm shadow-sm focus:ring-2 focus:outline-none ${
          readOnly
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "focus:ring-[#0076CE]"
        }`}
      />
    </div>
  );

  const renderSelect = (label, name, options) => (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      <select
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-[#0076CE] focus:outline-none"
      >
        <option value="">-- กรุณาเลือก --</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  return (
     <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4 space-y-8">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 border border-[#f2e4d6] space-y-8">
        <h2 className="text-2xl font-semibold text-center text-[#2E2E2E]">
          แบบฟอร์ม Check Booth
        </h2>
        
        {renderInput("วันที่", "Date", "date")}




        
        
         <div className="flex justify-between pt-6">

            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium rounded-full text-white bg-gradient-to-r from-[#00C6FF] to-[#0076CE] hover:opacity-90 transition"
            >
              บันทึก
            </button>
        </div>
        

        </div>
    </div>
  )
}

export default Survey_booth