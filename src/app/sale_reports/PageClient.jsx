"use client";
import React, { useEffect, useState } from "react";
import liff from "@line/liff";
import UserLine from "./components/UserLine";
import SaleReport from "./components/MultistepForm";

export default function PageClient() {
  const [userExists, setUserExists] = useState(null);
  const [userLineID, setUserLineID] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        if (!liff.isInitialized()) {
          await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });
        }

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        const profile = await liff.getProfile();
        const lineID = profile.userId;
        setUserLineID(lineID);
        localStorage.setItem("user_LineID", lineID);

        const res = await fetch(`/api/checkUser?user_LineID=${lineID}`);
        const data = await res.json();
        setUserExists(data.exists); // ✅ true = มีข้อมูลแล้ว
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการเชื่อม LINE หรือเช็คฐานข้อมูล", error);
        setUserExists(false); // fallback ปลอดภัย
      }
    };

    init();
  }, []);

  if (userExists === null) {
    return (
      <p className="text-center mt-10 text-gray-600">
        🔄 กำลังโหลดข้อมูลจาก LINE...
      </p>
    );
  }

  return userExists ? (
    <SaleReport user_LineID={userLineID} />
  ) : (
    <UserLine user_LineID={userLineID} onRegistered={() => setUserExists(true)} />
  );
}
