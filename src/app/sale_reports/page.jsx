"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import UserLine from "./components/UserLine";
import SaleReport from "./components/MultistepForm";

export default function PageClient() {
  const searchParams = useSearchParams();
  const lineFromQuery = searchParams.get("line");

  const [userExists, setUserExists] = useState(null);
  const [userLineID, setUserLineID] = useState("");

  useEffect(() => {
    const lineID = lineFromQuery || localStorage.getItem("user_LineID");

    if (!lineID || lineID === "null" || lineID === "undefined") {
      setUserExists(false);
      return;
    }

    localStorage.setItem("user_LineID", lineID);
    setUserLineID(lineID);

    const checkUser = async () => {
      try {
        const res = await fetch(`/api/checkUser?user_LineID=${lineID}`);
        const text = await res.text();
        const data = JSON.parse(text);
        setUserExists(data.exists);
      } catch (err) {
        console.error("❌ ตรวจสอบ user ล้มเหลว:", err);
        setUserExists(false);
      }
    };

    checkUser();
  }, [lineFromQuery]);

  if (userExists === null) {
    return <p className="text-center mt-10">🔄 กำลังโหลดข้อมูล...</p>;
  }

  return userExists ? (
    <SaleReport user_LineID={userLineID} />
  ) : (
    <UserLine />
  );
}
