"use client";
import React, { useEffect, useState } from "react";
import Container from "../components/Container";
import UserLine from "./components/UserLine";
import SaleReport from "./components/MultistepForm";

function SaleReportPage() {
  const [userExists, setUserExists] = useState(null); // null = loading
  const [userLineID, setUserLineID] = useState("");

  useEffect(() => {
    const lineID = localStorage.getItem("user_LineID");
    if (!lineID) {
      console.warn("ไม่มี user_LineID ใน localStorage");
      setUserExists(false);
      return;
    }

    setUserLineID(lineID);

    const checkUser = async () => {
      try {
        const res = await fetch(`/api/checkUser?user_LineID=${lineID}`);
        const data = await res.json();
        setUserExists(data.exists);
      } catch (err) {
        console.error("Error calling /api/checkUser", err);
        setUserExists(false);
      }
    };

    checkUser();
  }, []);

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
