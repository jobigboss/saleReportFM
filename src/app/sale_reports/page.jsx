"use client";
import React, { useEffect, useState } from "react";
import Container from "../components/Container";
import UserLine from "./components/UserLine";
import SaleReport from "./components/MultistepForm";

function SaleReportPage() {
  const [userExists, setUserExists] = useState(null); // null = ยังไม่โหลด, true/false = ตรวจแล้ว
  const [userLineID, setUserLineID] = useState("");

  useEffect(() => {
    const lineID = localStorage.getItem("user_LineID"); // 👈 หรือใช้ router query ก็ได้
    if (!lineID) {
      setUserExists(false); // ไม่พบ Line ID ในเครื่อง
      return;
    }

    setUserLineID(lineID);

    const checkUser = async () => {
      try {
        const res = await fetch(`/api/checkUser?user_LineID=${lineID}`);
        const data = await res.json();
        setUserExists(data.exists); // true ถ้ามี user แล้ว
      } catch (err) {
        console.error("Error checking user:", err);
        setUserExists(false);
      }
    };

    checkUser();
  }, []);

  return (
    <Container>
      {userExists === null ? (
        <p>🔄 กำลังโหลดข้อมูล...</p>
      ) : userExists ? (
        <SaleReport user_LineID={userLineID} />
      ) : (
        <UserLine />
      )}
    </Container>
  );
}

export default SaleReportPage;
