"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // ✅ ใช้ดึงค่าจาก query string
import Container from "../components/Container";
import UserLine from "./components/UserLine";
import SaleReport from "./components/MultistepForm";

function SaleReportPage() {
  const searchParams = useSearchParams();
  const lineFromQuery = searchParams.get("line");

  const [userExists, setUserExists] = useState(null); // null = loading
  const [userLineID, setUserLineID] = useState("");

  useEffect(() => {
    let lineID = lineFromQuery || localStorage.getItem("user_LineID");

    if (!lineID) {
      console.warn("ไม่พบ user_LineID จาก query หรือ localStorage");
      setUserExists(false);
      return;
    }

    localStorage.setItem("user_LineID", lineID); // 🔐 เก็บไว้ใช้รอบหน้า
    setUserLineID(lineID);

    const checkUser = async () => {
      try {
        const res = await fetch(`/api/checkUser?user_LineID=${lineID}`);
        const data = await res.json();
        console.log("✅ ตรวจสอบ user:", data);
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
        <p className="text-center">🔄 กำลังโหลดข้อมูล...</p>
      ) : userExists ? (
        <SaleReport user_LineID={userLineID} />
      ) : (
        <UserLine />
      )}
    </Container>
  );
}

export default SaleReportPage;
