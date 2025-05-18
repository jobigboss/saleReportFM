"use client";
import React, { useState, useEffect } from "react";
import LoadingOverlay from './LoadingOverlay';

const competitorBrands = [
  { name: "Thai Denmark UHT (นมไทยเดนมาร์ค)", image: "https://rshop.rweb-images.com/tMIzfteUyi9Ja664y4XXBFfIAeg=/500x500/fb1578d3395a4c6a83a2da34d99f2626" },
  { name: "Hi-Q", image: "https://danonecareplus.com/uploads/images/products/1F71C4E058EFA2294AB053ADCB35AE00.png" },
  { name: "S 26", image: "https://www.s-momclub.com/sites/default/files/2023-08/superma-s26uht.png" },
  { name: "Milo", image: "https://www.milo.co.th/sites/default/files/2024-05/Thumb-Product-UHT-Regular.jpg" },
  { name: "Ovaltine", image: "https://www.ovaltine.co.th/system/files/2024-08/2024-Malt-Chocolate-Flavoured-UHT.png" },
  { name: "นมหมี", image: "https://www.nestle.co.th/sites/g/files/pydnoa486/files/AW_NST049487_BBU_3D_State3_HNY_P2_NewDesign_FOP_148D1V2_Revise_F%203.jpg" },
  { name: "ดูโกร", image: "https://smartmedia.digital4danone.com/is/image/danonecs/single_brick_packshot-1?ts=1699590579469&dpr=off" },
  { name: "แอนลีน", image: "https://down-th.img.susercontent.com/file/e7d54996ce6a95248283632f06effa26@resize_w450_nl.webp" },
  { name: "ivy", image: "https://www.ip-one.com/frontend/img/thumb/product-ivy.png" },
  { name: "ดีน่า", image: "https://www.tudsinjai.com/wa-data/public/shop/products/99/02/299/images/875/875.750.JPG" }
];



const ImageUploadBox = ({ image, onChange, onRemove }) => {
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        onChange(base64); // 🔁 เปลี่ยนจาก URL เป็น base64
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="relative w-40 h-40">
      {image ? (
        <img src={image} alt="uploaded" className="w-full h-full object-cover rounded-xl shadow border" />
      ) : (
        <label className="w-full h-full flex items-center justify-center border-2 border-dashed rounded-xl text-sm text-gray-500 cursor-pointer hover:border-[#C97440]">
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          เลือกรูปภาพ
        </label>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-white text-red-500 rounded-full w-6 h-6 text-center font-bold shadow"
      >
        ×
      </button>
    </div>
  );
};

const InputField = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm text-[#333] mb-1">{label}</label>
    <input
      type="number"
      min="0"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C97440] bg-white"
    />
  </div>
);

// ✅ ย้ายไว้ข้างนอก ไม่อยู่ใน component อื่น
const TextAreaList = ({ title, values, setValues, placeholder }) => (
  <div className="space-y-2">
    <h3 className="text-lg font-semibold text-[#2E2E2E]">{title}</h3>
    {values.map((val, i) => (
      <div key={i} className="flex items-center gap-2">
        <input
          value={val}
          onChange={(e) => {
            const updated = [...values];
            updated[i] = e.target.value;
            setValues(updated);
          }}
          placeholder={`${placeholder} #${i + 1}`}
          className="w-full px-4 py-2 rounded-lg border border-gray-300"
        />
        <button
          onClick={() => {
            const updated = [...values];
            updated.splice(i, 1);
            setValues(updated);
          }}
          className="text-red-500 text-xl"
        >
          &times;
        </button>
      </div>
    ))}
    <button
      onClick={() => setValues([...values, ""])}
      className="mt-1 text-sm text-[#C97440] underline"
    >
      + เพิ่มรายการ
    </button>
  </div>
);


const PerformancePage = ({ onPrev, formData }) => {
  const [cheerType, setCheerType] = useState("");
  const [sampleCups, setSampleCups] = useState("");
  const [billsSold, setBillsSold] = useState("");
  const [selectedBrands, setSelectedBrands] = useState({});
  const [brandCounts, setBrandCounts] = useState({});
  const [customerQuestions, setCustomerQuestions] = useState([""]);
  const [foremostPromos, setForemostPromos] = useState([""]);
  const [competitorPromos, setCompetitorPromos] = useState([""]);
  const [cheerGirls, setCheerGirls] = useState([""]);
  const [imageList, setImageList] = useState([null]);
  const [quantities, setQuantities] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (formData?.quantities) {
      setQuantities(formData.quantities);
      console.log("✅ รับ quantities จาก formData:", formData.quantities);
    } else {
      console.warn("⚠️ ไม่พบ quantities ใน formData");
    }
  }, [formData]);

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) => {
      const newState = { ...prev, [brand]: !prev[brand] };
      if (!newState[brand]) setBrandCounts((c) => ({ ...c, [brand]: "" }));
      return newState;
    });
  };

  const updateBrandCount = (brand, value) => {
    setBrandCounts((prev) => ({ ...prev, [brand]:Number(value) }));
  };

  const updateImage = (index, newImage) => {
    const updated = [...imageList];
    updated[index] = newImage;
    setImageList(updated);
  };

  const addImageBox = () => setImageList([...imageList, null]);

  const removeImageBox = (index) => {
    const updated = [...imageList];
    updated.splice(index, 1);
    setImageList(updated);
  };

  const sanitizeKeys = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [
      key.replace(/\./g, "_"),
      typeof val === "object" ? sanitizeKeys(val) : val
    ])
  );
};

const cheerTypeLabel = {
  sell_taste: "เชียร์ขาย & ชงชิม",
  sell_only: "เชียร์ขายอย่างเดี่ยว",
};

const uploadImages = async (reportID) => {
  const uploadedUrls = [];

  for (let i = 0; i < imageList.length; i++) {
    const base64Image = imageList[i];
    if (!base64Image) continue;

    const base64Data = base64Image.split(",")[1];
    const imageName = `${reportID}_${String(i + 1).padStart(2, "0")}.jpg`;

    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycbzwPIr6Wnw0xx15BtU97cJR4Ab1jp87tsLpHO66t_wGMSbVHVWWDfHRIHr9YSJsQYAH/exec", {
        method: "POST",
        body: JSON.stringify({ base64Image: base64Data, imageName }),
      });
      const result = await res.json();
      if (result.success && result.imageUrl) {
        uploadedUrls.push(result.imageUrl);
      } else {
        uploadedUrls.push(null); // or ""
      }
    } catch (err) {
      console.error(`❌ Upload failed for image ${i + 1}`, err);
      uploadedUrls.push(null);
    }
  }

  return uploadedUrls;
};

 const handleSubmit = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);

  try {
    const idRes = await fetch("/api/gen-id");
    const { id } = await idRes.json();
    if (!id) {
      alert("ไม่สามารถสร้างรหัสรายงานได้");
      return;
    }

    const uploadedImageUrls = await uploadImages(id);
    const sanitizedQuantities = sanitizeKeys(quantities);

    const payload = {
      report_ID: id,
      user_LineID:user_LineID,
      store_Channel: formData.store_Channel || "",
      store_Account: formData.store_Account || "",
      store_Name: formData.store_Name || "",
      store_Province: formData.store_Province || "",
      store_Area1: formData.store_Area1 || "",
      store_Area2: formData.store_Area2 || "",
      quantities: sanitizedQuantities,
      report_cheerType: cheerTypeLabel[cheerType] || "",
      report_sampleCups: sampleCups,
      report_billsSold: billsSold,
      report_ChangeBrands: brandCounts,
      report_customerQuestions: customerQuestions,
      report_foremostPromos: foremostPromos,
      report_competitorPromos: competitorPromos,
      report_cheerGirls: cheerGirls,
      report_imageList: uploadedImageUrls
    };

    const res = await fetch("/api/sale-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result?.success) {
      // alert(`✅ ส่งข้อมูลสำเร็จ | รหัส: ${id}`);
    } else {
      alert("❌ บันทึกข้อมูลไม่สำเร็จ");
    }
  } catch (err) {
    console.error("Submit error:", err);
    alert("เกิดข้อผิดพลาดขณะส่งข้อมูล");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4 space-y-8">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 border border-[#f2e4d6] space-y-8">
        <h2 className="text-2xl font-semibold text-center text-[#2E2E2E]">
          แบบฟอร์มบันทึกกิจกรรมโปรโมชั่น
        </h2>

        {/* รูปแบบการเชียร์ */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[#2E2E2E]">เลือกรูปแบบการเชียร์</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "sell_taste", label: "🎉 เชียร์ขาย & ชงชิม" },
              { key: "sell_only", label: "💬 เชียร์ขายอย่างเดี่ยว" }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCheerType(key)}
                className={`rounded-xl py-3 text-sm font-medium transition-all border ${
                  cheerType === key
                    ? "bg-[#C97440] text-white border-[#C97440] shadow"
                    : "bg-gray-100 text-[#444] border-transparent hover:bg-[#f5e9e0]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {cheerType && (
          <>
            {cheerType === "sell_taste" && (
              <div className="space-y-4 mt-4">
                <InputField
                  label="🍶 แจกชิมทั้งหมดกี่แก้ว?"
                  value={sampleCups}
                  onChange={setSampleCups}
                  placeholder="ใส่จำนวนแก้ว"
                />
                <InputField
                  label="🧾 ขายได้กี่บิลจากที่ชงชิม?"
                  value={billsSold}
                  onChange={setBillsSold}
                  placeholder="ใส่จำนวนบิล"
                />
              </div>
            )}

            {/* เปลี่ยนจากแบรนด์คู่แข่ง */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[#2E2E2E]">🌀 เชิญชวนให้เปลี่ยนจากแบรนด์คู่แข่ง</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {competitorBrands.map(({ name, image }) => {
                  const isSelected = selectedBrands[name];
                  return (
                    <div
                      key={name}
                      className={`border p-4 rounded-xl text-center bg-white cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex flex-col items-center justify-center ${
                        isSelected ? "border-[#F97316] shadow-lg ring-2 ring-[#F97316]" : "border-gray-200"
                      }`}
                      onClick={() => toggleBrand(name)}
                    >
                      <img src={image} alt={name} className="w-24 h-24 object-contain mb-2 pointer-events-none mx-auto" />
                      <span className="block font-medium text-sm text-[#333] pointer-events-none text-center">{name}</span>
                      {isSelected && (
                        <input
                          type="number"
                          min="0"
                          value={brandCounts[name] || ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateBrandCount(name, e.target.value)}
                          placeholder="จำนวนคน"
                          className="mt-2 w-full px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:ring-[#C97440] focus:outline-none"
                        />
                      )}
                    </div>
                  );
                })}
              </div>              
            </div>
            

            <TextAreaList title="❓ คำถามที่ได้จากลูกค้า" values={customerQuestions} setValues={setCustomerQuestions} placeholder="คำถาม" />
            <TextAreaList title="🏷️ โปรโมชั่นโฟร์โมสต์ที่มีที่ร้านค้า (ส่วนลด / ของแถม)" values={foremostPromos} setValues={setForemostPromos} placeholder="โปรโมชั่นโฟร์โมสต์" />
            <TextAreaList title="🏷️ โปรโมชั่นของคู่แข่งที่มีที่ร้านค้า (ส่วนลด / ของแถม)" values={competitorPromos} setValues={setCompetitorPromos} placeholder="โปรโมชั่นคู่แข่ง" />
            <TextAreaList title="🏷️ รายการเชียร์เกิร์ลของคู่แข่ง ลงงานกี่วัน เป้าหมาย เน้นขายนมอะไร" values={cheerGirls} setValues={setCheerGirls} placeholder="เน้นขายนมอะไร" />

            <div>
              <h2 className="text-2xl font-semibold text-center text-[#2E2E2E] mb-3">แนบรูปภาพกิจกรรม</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {imageList.map((image, index) => (
                  <ImageUploadBox key={index} image={image} onChange={(img) => updateImage(index, img)} onRemove={() => removeImageBox(index)} />
                ))}
              </div>
              <div className="flex justify-center">
                <button onClick={addImageBox} className="mt-4 px-4 py-2 bg-[#C97440] text-white rounded-xl hover:bg-[#a1582d] transition">
                  + เพิ่มรูปภาพ
                </button>
              </div>
            </div>
          </>
            )}

         <div className="flex justify-between pt-6">
          <button onClick={onPrev} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">
            ⬅️ ย้อนกลับ
          </button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-[#C97440] text-white rounded-lg hover:bg-[#a1582d] shadow">
            ✅ ส่งข้อมูล
          </button>
        </div>
      </div>
      {isSubmitting && <LoadingOverlay />}

    </div>
    
  );
};

export default PerformancePage;