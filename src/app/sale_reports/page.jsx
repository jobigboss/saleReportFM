"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Container from "../components/Container";
import UserLine from "./components/UserLine";
import SaleReport from "./components/MultistepForm";

function SaleReportPage() {
  const searchParams = useSearchParams();
  const lineFromQuery = searchParams.get("line");

  const [userExists, setUserExists] = useState(null); // null = กำลังโหลด
  const [userLineID, setUserLineID] = useState("");

  useEffect(() => {
    const lineID = lineFromQuery || localStorage.getItem("user_LineID");

    console.log("🔍 ตรวจสอบ LINE ID:", lineID);

    if (!lineID || lineID === "null" || lineID === "undefined") {
      console.warn("❌ ไม่พบ user_LineID จาก query หรือ localStorage");
      setUserExists(false);
      return;
    }

    // บันทึกไว้ใน localStorage เผื่อ reload
    localStorage.setItem("user_LineID", lineID);
    setUserLineID(lineID);

    const checkUser = async () => {
      try {
        const res = await fetch(`/api/checkUser?user_LineID=${lineID}`);
        const text = await res.text(); // อ่านเป็นข้อความก่อนเพื่อ debug ได้ชัด
        console.log("📦 ผลลัพธ์จาก API (raw):", text);

        const data = JSON.parse(text);
        if (data.exists) {
          console.log("✅ ผู้ใช้นี้ลงทะเบียนแล้ว");
        } else {
          console.log("🆕 ผู้ใช้นี้ยังไม่ลงทะเบียน");
        }

        setUserExists(data.exists);
      } catch (err) {
        console.error("❌ ตรวจสอบ user ล้มเหลว:", err);
        setUserExists(false);
      }
    };

    checkUser();
  }, [lineFromQuery]);

  return (
    <Container>
      {userExists === null ? (
        <p className="text-center text-gray-600 mt-10">🔄 กำลังโหลดข้อมูล...</p>
      ) : userExists ? (
        <SaleReport user_LineID={userLineID} />
      ) : (
        <UserLine />
      )}
    </Container>
  );
}

export default SaleReportPage;
