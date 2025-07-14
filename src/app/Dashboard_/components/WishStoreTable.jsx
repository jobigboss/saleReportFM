import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

function WishStoreTable() {
  const [type, setType] = useState("เชียร์ขาย & ชงชิม"); // default
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/get/sale_Report_Store")
      .then(res => res.json())
      .then(res => {
        const filtered = res.filter(
          s => s.store_Account === "LMT" && s.store_Type === type
        );
        setData(filtered);
        setLoading(false);
      });
  }, [type]);

  return (
    <Card className="p-4 mt-6">
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${type === "เชียร์ขาย" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          onClick={() => setType("เชียร์ขาย")}
        >
          เชียร์ขายอย่างเดียว
        </button>
        <button
          className={`px-4 py-2 rounded ${type === "เชียร์ขาย & ชงชิม" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          onClick={() => setType("เชียร์ขาย & ชงชิม")}
        >
          เชียร์ขาย & ชงชิม
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[500px] w-full text-sm">
          <thead>
            <tr>
              <th className="text-center">#</th>
              <th className="text-left">ชื่อร้าน</th>
              <th className="text-center">โซน</th>
              <th className="text-center">จังหวัด</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8">กำลังโหลด...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8">ไม่พบข้อมูล</td>
              </tr>
            ) : data.map((item, i) => (
              <tr key={item._id || i} className="even:bg-gray-50">
                <td className="text-center">{i + 1}</td>
                <td>{item.store_Name}</td>
                <td className="text-center">{item.store_Area2 ?? "-"}</td>
                <td className="text-center">{item.store_Province ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
export default WishStoreTable;
