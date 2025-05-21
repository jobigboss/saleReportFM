"use client";
import React, { useEffect, useState } from "react";

// กลุ่มผลิตภัณฑ์
const productGroups = [
  { key: "KIDS", label: "KIDS" },
  { key: "MS", label: "MS" },
  { key: "DKY", label: "DKY" },
  { key: "TFD", label: "TFD" },
];

// สินค้าในกลุ่ม KIDS พร้อมหลายปริมาณและแพ็คเฉพาะตัว
const kisForemostProducts = [
  {
    key: "sur_Omega369Gold1",
    label: "Omega369 Gold 1+",
    image: "https://www.foremostthailand.com/wp-content/uploads/2024/09/banner-OMG-1.png",
    volumes: {
      "180 ml.": ["แพ็ค 3", "แพ็ค 12", "ยกลัง (24)", "ยกลัง (36)"],
    },
  },
  {
    key: "sur_Omega369Gold4",
    label: "Omega369 Gold 4+",
    image: "https://www.foremostthailand.com/wp-content/uploads/2024/09/4banner-OMG-4.png",
    volumes: {
      "180 ml.": ["แพ็ค 3", "แพ็ค 12", "ยกลัง (24)", "ยกลัง (36)"],
    },
  },
  {
    key: "sur_Omega369Smart1",
    label: "Omega369 Smart 1+",
    image: "https://www.foremostthailand.com/wp-content/themes/foremost-thailand/assets/images/omg_smart/bg-box-banner.png",
    volumes: {
      "180 ml.": ["แพ็ค 4", "แพ็ค 12", "ยกลัง (36)"],
    },
  },
  {
    key: "sur_Omega369Smart4",
    label: "Omega369 Smart 4+",
    image: "https://www.foremostthailand.com/wp-content/themes/foremost-thailand/assets/images/omg_smart/bg-box-banner-4.png",
    volumes: {
      "180 ml.": ["แพ็ค 4", "แพ็ค 12", "ยกลัง (36)"],
    },
  },
  {
    key: "sur_Omega369Plain",
    label: "Omega369 (regular) รสจืด",
    image: "https://www.foremostthailand.com/wp-content/uploads/2023/07/plain_packshot.png",
    volumes: {
      "80 ml.": ["แพ็ค 4", "ยกลัง (48)"],
      "110 ml.": ["แพ็ค 4", "ยกลัง (48)"],
      "180 ml.": ["แพ็ค 4", "แพ็ค 12", "ยกลัง (36)", "ยกลัง (48)"],
    },
  },
  {
    key: "sur_Omega369Choco",
    label: "Omega369 (regular) รสช็อกโกแลต",
    image: "https://www.foremostthailand.com/wp-content/themes/foremost-thailand/assets/images/omg_regular/choc-pack.png",
    volumes: {
      "80 ml.": ["แพ็ค 4", "ยกลัง (48)"],
      "110 ml.": ["แพ็ค 4", "ยกลัง (48)"],
      "180 ml.": ["แพ็ค 4", "แพ็ค 12", "ยกลัง (36)", "ยกลัง (48)"],
    },
  },
  {
    key: "sur_Omega369Sweet",
    label: "Omega369 (regular) รสหวาน",
    image: "https://www.foremostthailand.com/wp-content/themes/foremost-thailand/assets/images/omg_regular/sweet-pack.png",
    volumes: {
      "80 ml.": ["แพ็ค 4", "ยกลัง (48)"],
      "110 ml.": ["แพ็ค 4", "ยกลัง (48)"],
      "180 ml.": ["แพ็ค 4", "แพ็ค 12", "ยกลัง (36)", "ยกลัง (48)"],
    },
  },
];

const msForemostProducts = [
  {
    key: "sur_Foremost100",
    label: "Foremost 100%",
    image: "https://www.foremostthailand.com/wp-content/uploads/2022/03/packshot-plain-2024-1-300x300.png",
    volumes: {
      "165 ml.": ["แพ็ค 4", "แพ็ค 6", "ยกลัง (36)", "ยกลัง (48)"],
      "180 ml.": ["แพ็ค 4", "แพ็ค 6", "ยกลัง (36)", "ยกลัง (48)"],
      "225 ml.": [ "แพ็ค 6", "ยกลัง (36)"],
      "1000 ml.": [ "เดี่ยว", "ยกลัง"],
    },
  },

    {
    key: "sur_Foremost100low0",
    label: "Foremost 100% ไขมัน 0%",
    image: "https://www.foremostthailand.com/wp-content/uploads/2022/03/packshot-0fat-2024-1-300x300.png",
    volumes: {
      "165 ml.": ["แพ็ค 4", "แพ็ค 6", "ยกลัง (36)", "ยกลัง (48)"],
      "180 ml.": ["แพ็ค 4", "แพ็ค 6", "ยกลัง (36)", "ยกลัง (48)"],
      "225 ml.": [ "แพ็ค 6", "ยกลัง (36)"],
      "1000 ml.": [ "เดี่ยว", "ยกลัง"],
    },
  },
  {
    key: "sur_Foremost100low",
    label: "Foremost 100% ไขมันต่ำ",
    image: "https://www.foremostthailand.com/wp-content/uploads/2022/03/packshot-lowfat-2024-1-300x300.png",
    volumes: {
      "165 ml.": ["แพ็ค 4", "แพ็ค 6", "ยกลัง (36)", "ยกลัง (48)"],
      "180 ml.": ["แพ็ค 4", "แพ็ค 6", "ยกลัง (36)", "ยกลัง (48)"],
      "225 ml.": [ "แพ็ค 6", "ยกลัง (36)"],
      "1000 ml.": [ "เดี่ยว", "ยกลัง"],
    },
  },
    {
    key: "sur_ForemostChocolate",
    label: "Foremost รสช็อกโกแลต",
    image: "https://www.foremostthailand.com/wp-content/uploads/2022/03/Chocolate180.png",
    volumes: {
      "165 ml.": ["แพ็ค 4", "ยกลัง"],
      "180 ml.": ["แพ็ค 4", "ยกลัง"],
      "225 ml.": [ "แพ็ค 6", "ยกลัง"],
    },
  },
  {
    key: "sur_ForemostChocolate01",
    label: "Foremost รสช็อกโกแลต พร่องไขมัน",
    image: "https://www.foremostthailand.com/wp-content/uploads/2022/03/LowFat_Chocolate225-600x600.png",
    volumes: {
      "165 ml.": ["แพ็ค 4", "ยกลัง"],
      "180 ml.": ["แพ็ค 4", "ยกลัง"],
      "225 ml.": [ "แพ็ค 6", "ยกลัง"],
    },
  },
  {
    key: "sur_ForemostStrawberryflavor",
    label: "Foremost รสสตอเบอรี่",
    image: "https://www.foremostthailand.com/wp-content/uploads/2022/03/Strawberry225-600x600.png",
    volumes: {
      "165 ml.": ["แพ็ค 4", "ยกลัง"],
      "180 ml.": ["แพ็ค 4", "ยกลัง"],
      "225 ml.": [ "แพ็ค 6", "ยกลัง"],
    },
  },
  {
    key: "sur_ForemostSweetTaste",
    label: "Foremost รสหวาน",
    image: "https://www.foremostthailand.com/wp-content/uploads/2022/03/Sweet180.png",
    volumes: {
      "165 ml.": ["แพ็ค 4", "ยกลัง"],
      "180 ml.": ["แพ็ค 4", "ยกลัง"],
      "225 ml.": [ "แพ็ค 6", "ยกลัง"],
    },
  },
  {
    key: "sur_ForemostBanana",
    label: "Foremost รสกล้วยหอม",
    image: "https://www.foremostthailand.com/wp-content/uploads/2022/07/Banana225.png",
    volumes: {
      "165 ml.": ["แพ็ค 4", "ยกลัง"],
      "180 ml.": ["แพ็ค 4", "ยกลัง"],
      "225 ml.": [ "แพ็ค 6", "ยกลัง"],
    },
  },

];

const dkyForemostProducts = [
  {
    key: "surveyYogurtMixed",
    label: "โยเกิรต์ดริ้งค์ รสผลไม้รวม",
    image: "https://www.foremostthailand.com/wp-content/uploads/2022/03/DKY_Mixed170-600x600.png",
    volumes: {
      "80 ml.": ["แพ็ค 4"],
      "170 ml.": [ "แพ็ค 4", "ยกลัง"],
    },
  },
  {
    key: "surveyYogurtStrawberry",
    label: "โยเกิรต์ดริ้งค์ รสสตอเบอร์รี่",
    image: "https://www.foremostthailand.com/wp-content/uploads/2022/03/DKY_Strawberry170-600x600.png",
    volumes: {
      "80 ml.": ["แพ็ค 4"],
      "170 ml.": [ "แพ็ค 4", "ยกลัง"],
    },
  },
    {
    key: "surveyYogurtOrange",
    label: "โยเกิรต์ดริ้งค์ รสส้ม",
    image: "https://www.foremostthailand.com/wp-content/uploads/2022/03/DKY_Orange170.png",
    volumes: {
      "80 ml.": ["แพ็ค 4"],
      "170 ml.": [ "แพ็ค 4", "ยกลัง"],
    },
  },

];

const tfdForemostProducts =[
    {
    key: "surveyTFDMuti",
    label: "TFD Muti-grain ช็อกโกแลตธัญญพืช",
    image: "https://www.foremostthailand.com/wp-content/themes/foremost-thailand/assets/images/multigrain/multigrain-pack.png",
    volumes: {
      "180 ml.": [ "แพ็ค 4", "ยกลัง"],
    },
  },
];

function Sale2ProductPage({ onNext, onPrev, formData, setFormData }) {
  const [activeGroup, setActiveGroup] = useState("KIDS");
  const [quantities, setQuantities] = useState({});
  const [expandedProduct, setExpandedProduct] = useState({}); // ใช้ควบคุมการคลี่สินค้า

  const handleQuantityChange = (productKey, volume, packType, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productKey]: {
        ...(prev[productKey] || {}),
        [volume]: {
          ...(prev[productKey]?.[volume] || {}),
          [packType]: Number(value), // ✅ แปลงค่าเป็น number
        },
      },
    }));
  };

  const toggleProduct = (key) => {
    setExpandedProduct((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

    useEffect(() => {
    if (formData.quantities) {
      setQuantities(formData.quantities);
    }
  }, [formData]);

  useEffect(() => {
    // เปิดสินค้าที่มีการกรอกข้อมูลไว้เท่านั้น
    const expanded = {};
    for (const productKey in quantities) {
      const productData = quantities[productKey];
      let hasValue = false;
      for (const volume in productData) {
        for (const pack in productData[volume]) {
          const val = productData[volume][pack];
          if (val !== "" && val !== "0" && val !== 0) {
            hasValue = true;
          }
        }
      }
      if (hasValue) {
        expanded[productKey] = true;
      }
    }
    setExpandedProduct(expanded);
  }, [quantities]);


  // const renderPackInput = (productKey, volumes) => {
  //   return Object.entries(volumes).map(([volume, packs]) => (
  //     <div key={volume} className="w-full mt-3">
  //       <div className="grid grid-cols-5 gap-2 text-sm font-semibold text-[#5C3B28] mb-1 items-center">
  //         <div></div>
  //         {packs.map((pack, i) => (
  //           <div key={i} className="text-center">{pack}</div>
  //         ))}
  //       </div>

  //       <div className="grid grid-cols-5 gap-2">
  //         <div className="col-span-1 flex justify-center items-center">{volume}</div>
  //         {packs.map((pack, i) => (
  //           <input
  //             key={i}
  //             type="number"
  //             min="0"
  //             value={quantities[productKey]?.[volume]?.[pack] || ""}
  //             onChange={(e) => handleQuantityChange(productKey, volume, pack, e.target.value)}
  //             className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none text-center"
  //           />
  //         ))}
  //       </div>
  //     </div>
  //   ));
  // };


// const renderPackInput = (productKey, volumes) => {
//   return Object.entries(volumes).map(([volume, packs]) => (
//     <div key={volume} className="w-full mt-3">
//       {/* แถวชื่อแพ็ค */}
//       <div className="grid grid-cols-5 gap-2 text-sm font-semibold text-[#5C3B28] mb-1">
//         <div></div>
//         {packs.map((pack, i) => (
//           <div key={i} className="text-center">{pack}</div>
//         ))}
//       </div>

//       {/* แถว input จำนวน */}
//       <div className="grid grid-cols-5 gap-2 mb-1">
//         <div className="flex justify-center items-center text-sm font-medium text-[#5C3B28]">
//           {volume}
//         </div>
//         {packs.map((pack, i) => (
//           <input
//             key={`qty-${i}`}
//             type="number"
//             min="0"
//             placeholder=""
//             value={quantities[productKey]?.[volume]?.[pack] || ""}
//             onChange={(e) =>
//               handleQuantityChange(productKey, volume, pack, e.target.value)
//             }
//             className="w-full px-2 py-1 border border-gray-300 rounded-md text-center text-sm"
//           />
//         ))}
//       </div>

//       {/* แถว input ราคา */}
//       <div className="grid grid-cols-5 gap-2">
//         <div>ราคา</div>
//         {packs.map((pack, i) => (
//           <input
//             key={`price-${i}`}
//             type="number"
//             min="0"
//             placeholder="฿"
//             value={quantities[productKey]?.[volume]?.[`${pack}_price`] || ""}
//             onChange={(e) =>
//               setQuantities((prev) => ({
//                 ...prev,
//                 [productKey]: {
//                   ...(prev[productKey] || {}),
//                   [volume]: {
//                     ...(prev[productKey]?.[volume] || {}),
//                     [`${pack}_price`]: Number(e.target.value),
//                   },
//                 },
//               }))
//             }
//             className="w-full px-2 py-1 border border-blue-300 rounded-md text-center text-xs text-gray-600"
//           />
//         ))}
//       </div>
//     </div>
//   ));
// };

const renderPackInput = (productKey, volumes) => {
  return Object.entries(volumes).map(([volume, packs]) => (
    <div key={volume} className="w-full mt-3">
      {/* แถวชื่อแพ็ค */}
      <div className="grid grid-cols-5 gap-2 text-sm font-semibold text-[#5C3B28] mb-1">
        <div></div>
        {packs.map((pack, i) => (
          <div key={i} className="text-center">{pack}</div>
        ))}
      </div>

      {/* แถว input จำนวน */}
      <div className="grid grid-cols-5 gap-2 mb-1">
        <div className="flex justify-center items-center text-sm font-medium text-[#5C3B28]">
          {volume}
        </div>
        {packs.map((pack, i) => (
          <input
            key={`qty-${i}`}
            type="number"
            min="0"
            placeholder=""
            value={quantities[productKey]?.[volume]?.[pack] || ""}
            onChange={(e) =>
              handleQuantityChange(productKey, volume, pack, e.target.value)
            }
            className="w-full px-2 py-1 border border-gray-300 rounded-md text-center text-sm"
          />
        ))}
      </div>

      {/* แถว input ราคา */}
      <div className="grid grid-cols-5 gap-2">
        <div>ราคา</div>
        {packs.map((pack, i) => (
          <input
            key={`price-${i}`}
            type="number"
            min="0"
            placeholder="฿"
            value={quantities[productKey]?.[volume]?.[`${pack}_price`] || ""}
            onChange={(e) =>
              setQuantities((prev) => ({
                ...prev,
                [productKey]: {
                  ...(prev[productKey] || {}),
                  [volume]: {
                    ...(prev[productKey]?.[volume] || {}),
                    [`${pack}_price`]: Number(e.target.value),
                  },
                },
              }))
            }
            className="w-full px-2 py-1 border border-blue-300 rounded-md text-center text-xs text-gray-600"
          />
        ))}
      </div>

      {/* แถว dropdown สถานะ */}
      <div className="grid grid-cols-5 gap-2 mt-1">
        <div className="text-sm font-medium text-[#5C3B28]">สถานะ</div>
        {packs.map((pack, i) => (
          <select
            key={`status-${i}`}
            value={quantities[productKey]?.[volume]?.[`${pack}_status`] || ""}
            onChange={(e) =>
              setQuantities((prev) => ({
                ...prev,
                [productKey]: {
                  ...(prev[productKey] || {}),
                  [volume]: {
                    ...(prev[productKey]?.[volume] || {}),
                    [`${pack}_status`]: e.target.value,
                  },
                },
              }))
            }
            className="w-full px-2 py-1 border border-green-300 rounded-md text-center text-xs text-gray-700"
          >
            <option value="">เลือกสถานะ</option>
            <option value="มีขาย">มีขาย</option>
            <option value="สินค้าหมด">สินค้าหมด</option>
            <option value="ขาย">ขาย</option>
          </select>
        ))}
      </div>
    </div>
  ));
};





  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-[#6B3E26] mb-6 text-center">เลือกกลุ่มผลิตภัณฑ์</h2>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {productGroups.map((group) => (
          <button
            key={group.key}
            onClick={() => setActiveGroup(group.key)}
            className={`px-6 py-2 rounded-xl border transition text-md font-medium shadow-md
              ${activeGroup === group.key
                ? "bg-[#C97440] text-white border-[#C97440]"
                : "bg-white text-[#C97440] border-[#C97440] hover:bg-[#f7e0d0]"}`}
          >
            {group.label}
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-br from-[#FFF2E5] to-[#FFD8A9] rounded-lg p-6 border border-[#EBC6A0]">
        <h3 className="text-lg font-semibold text-[#5C3B28] mb-4">
          {productGroups.find((g) => g.key === activeGroup)?.label}
        </h3>

        {activeGroup === "KIDS" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {kisForemostProducts.map((product) => (
              <div key={product.key} className="bg-white rounded-lg p-4 shadow border border-[#FFD6B3]">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleProduct(product.key)}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.label}
                      className="w-20 h-20 object-contain"
                    />
                    <div className="text-sm font-medium text-[#5C3B28]">
                      {product.label}
                    </div>
                  </div>
                  <div className="text-xl text-[#C97440]">
                    {expandedProduct[product.key] ? "▲" : "▼"}
                  </div>
                </div>

                {expandedProduct[product.key] &&
                  renderPackInput(product.key, product.volumes)}
              </div>
            ))}
          </div>
        )}

        {activeGroup === "MS" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {msForemostProducts.map((product) => (
              <div key={product.key} className="bg-white rounded-lg p-4 shadow border border-[#FFD6B3]">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleProduct(product.key)}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.label}
                      className="w-20 h-20 object-contain"
                    />
                    <div className="text-sm font-medium text-[#5C3B28]">
                      {product.label}
                    </div>
                  </div>
                  <div className="text-xl text-[#C97440]">
                    {expandedProduct[product.key] ? "▲" : "▼"}
                  </div>
                </div>

                {expandedProduct[product.key] &&
                  renderPackInput(product.key, product.volumes)}
              </div>
            ))}
          </div>
        )}

        {activeGroup === "DKY" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {dkyForemostProducts.map((product) => (
              <div key={product.key} className="bg-white rounded-lg p-4 shadow border border-[#FFD6B3]">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleProduct(product.key)}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.label}
                      className="w-20 h-20 object-contain"
                    />
                    <div className="text-sm font-medium text-[#5C3B28]">
                      {product.label}
                    </div>
                  </div>
                  <div className="text-xl text-[#C97440]">
                    {expandedProduct[product.key] ? "▲" : "▼"}
                  </div>
                </div>

                {expandedProduct[product.key] &&
                  renderPackInput(product.key, product.volumes)}
              </div>
            ))}
          </div>
        )}

        {activeGroup === "TFD" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {tfdForemostProducts.map((product) => (
              <div key={product.key} className="bg-white rounded-lg p-4 shadow border border-[#FFD6B3]">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleProduct(product.key)}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.label}
                      className="w-20 h-20 object-contain"
                    />
                    <div className="text-sm font-medium text-[#5C3B28]">
                      {product.label}
                    </div>
                  </div>
                  <div className="text-xl text-[#C97440]">
                    {expandedProduct[product.key] ? "▲" : "▼"}
                  </div>
                </div>

                {expandedProduct[product.key] &&
                  renderPackInput(product.key, product.volumes)}
              </div>
            ))}
          </div>
        )}

        {/* ส่วน MS, DKY, TFD สามารถเพิ่มเติมได้ในอนาคต */}

      </div>
       {/* ✅ ปุ่มย้อนกลับและถัดไป */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onPrev}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
        >
          ◀ ย้อนกลับ
        </button>
        <button
            onClick={() => {
              const updated = { ...formData, quantities };
              setFormData(updated); // 🟢 เก็บ quantities ลง formData
              onNext(updated);      // 🟢 ส่งข้อมูลไปขั้นถัดไป
            }}
          className="bg-[#C97440] text-white px-6 py-2 rounded-lg hover:bg-[#a75933] transition font-semibold"
        >
          ถัดไป ▶
        </button>
      </div>
    </div>
  );
}

export default Sale2ProductPage;
