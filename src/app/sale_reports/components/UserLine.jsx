"use client";
import React, { useEffect, useState } from "react";
import liff from "@line/liff";
import Swal from "sweetalert2";

function UserPage() {
  const [userData, setUserData] = useState({
    user_LineID: "",
    user_Name: "",
    user_Lastname: "",
    user_Phone: "",
  });

  const [lineProfile, setLineProfile] = useState({
    displayName: "",
    pictureUrl: "",
  });

  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });
        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }
        const profile = await liff.getProfile();
        const lineID = profile.userId;

        setUserData((prev) => ({
          ...prev,
          user_LineID: lineID,
        }));

        setLineProfile({
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
        });

        // ✅ เช็คว่าลงทะเบียนแล้วหรือยัง
        const res = await fetch(`/api/checkUser?lineID=${lineID}`);
        const result = await res.json();

        if (result.exists) {
          window.location.href = `/form-continue?lineID=${lineID}`;
        } else {
          setIsReady(true);
        }
      } catch (err) {
        console.error("LIFF init error:", err);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถโหลดข้อมูลจาก LINE ได้",
        });
      } finally {
        setLoading(false);
      }
    };

    initLiff();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const renderInputText = (
    label,
    name,
    type = "text",
    placeholder = "",
    readOnly = false,
    hidden = false
  ) => {
    if (hidden) return null;
    return (
      <div className="w-full">
        <label className="block text-gray-700 font-medium mb-1">{label}</label>
        <input
          type={type}
          name={name}
          value={userData[name] || ""}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:outline-none ${
            readOnly
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "focus:ring-indigo-500"
          }`}
        />
      </div>
    );
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/saveUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const result = await res.json();

    if (result.success) {
      Swal.fire({
        title: `ยินดีต้อนรับ ${lineProfile.displayName}!`,
        text: "ลงทะเบียนเรียบร้อยแล้ว",
        imageUrl: lineProfile.pictureUrl,
        imageWidth: 100,
        imageHeight: 100,
        imageAlt: "LINE Profile",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        liff.closeWindow();
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: result.message,
      });
    }
  };

  if (loading || !isReady) {
    return <p className="text-center mt-10 text-gray-500 animate-pulse">กำลังโหลดข้อมูลจาก LINE...</p>;
  }

  return (
    <div className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-lg space-y-6 mx-auto animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        แนะนำตัวให้ผมรู้จักคุณหน่อยครับ
      </h2>

      {renderInputText("user_LineID", "user_LineID", "text", "", true, true)}

      <div className="flex gap-4">
        {renderInputText("ชื่อ", "user_Name", "text", "ระบุชื่อ")}
        {renderInputText("นามสกุล", "user_Lastname", "text", "ระบุนามสกุล")}
      </div>

      {renderInputText("เบอร์โทร", "user_Phone", "tel", "ระบุเบอร์โทร")}

      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
      >
        แนะนำตัว
      </button>
    </div>
  );
}

export default UserPage;
