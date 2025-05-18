"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import liff from "@line/liff";
import UserLine from "./components/UserLine";
import SaleReport from "./components/MultistepForm";

// ✅ โหลด Lottie ที่นี่ได้
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

function LoadingLottie() {
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
    <div className="flex flex-col items-center justify-center h-screen bg-white text-[#0076CE]">
      {animationData ? (
        <Lottie
          animationData={animationData}
          loop
          className="w-[150px] h-[150px] mb-4"
        />
      ) : (
        <p className="text-sm text-gray-400 animate-pulse">กำลังโหลด animation...</p>
      )}
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
    <input type="hidden" value={userLineID} name="user_LineID" readOnly />
    <SaleReport user_LineID={userLineID} />
  </>
) : (
  <UserLine user_LineID={userLineID} onRegistered={() => setUserExists(true)} />
);

}
