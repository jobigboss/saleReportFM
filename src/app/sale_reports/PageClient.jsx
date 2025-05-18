"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import liff from "@line/liff";
import UserLine from "./components/UserLine";
import SaleReport from "./components/MultistepForm";

// ✅ โหลด Lottie ที่นี่ได้
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

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

      // ✅ รอ 5 วินาทีก่อนแสดงหน้า
      setTimeout(() => {
        setUserExists(data.exists);
      }, 5000);
    } catch (error) {
      console.error("LINE + DB error", error);
      setUserExists(false);
    }
  };

  init();
}, []);




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
        setUserExists(data.exists);
      } catch (error) {
        console.error("LINE + DB error", error);
        setUserExists(false);
      }
    };

    init();
  }, []);

  // ✅ โหลด Lottie ตอนกำลังโหลด
  if (userExists === null) {
    return <LoadingLottie />;
  }

return userExists ? (
  <>
    <input type="text" value={userLineID} name="user_LineID" readOnly />
    <SaleReport user_LineID={userLineID} />
  </>
) : (
  <UserLine user_LineID={userLineID} onRegistered={() => setUserExists(true)} />
);

}
