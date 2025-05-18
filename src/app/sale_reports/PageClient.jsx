"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import liff from "@line/liff";
import UserLine from "./components/UserLine";
import SaleReport from "./components/MultistepForm";

// ✅ โหลด Lottie แบบ dynamic
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

function LoadingLottie({ text = "🚚 กำลังโหลดข้อมูลจาก LINE..." }) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/lottie/foremost-delivery.json");
      const data = await res.json();
      setAnimationData(data);
    };
    load();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center">
      {animationData && (
        <Lottie animationData={animationData} loop className="w-[130px] h-[130px] mb-4" />
      )}
      <p className="text-[#0076CE] text-lg font-semibold">{text}</p>
    </div>
  );
}

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

        // ✅ รอ 5 วิ ค่อยแสดงผล
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

  if (userExists === null) {
    return <LoadingLottie />;
  }

  return userExists ? (
    <UserLine user_LineID={userLineID} />
  ) : (
    <SaleReport user_LineID={userLineID} onRegistered={() => setUserExists(true)} />
  );
}
