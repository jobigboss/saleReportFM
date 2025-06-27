"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MENU_LIST, ROLE_MENUS } from "./components/Menus";
import NavBar from "./components/Nevbar";

function getMenuByRole(role) {
  const keys = ROLE_MENUS[role] || [];
  return MENU_LIST.filter(menu => keys.includes(menu.key));
}

export default function MenuPage() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ จุดสำคัญ: เพิ่ม useEffect นี้
  useEffect(() => {
    let interval = null;

    const checkSession = () => {
      const sessionId = localStorage.getItem("sessionId");
      const email = localStorage.getItem("email");
      if (!sessionId || !email) {
        router.replace("/admin");
        return;
      }
      fetch("/api/admin/validate-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sessionId }),
      }).then(async res => {
        if (!res.ok) {
          // ✅ set เหตุผลสำหรับแจ้งเตือนในหน้า login
          localStorage.setItem(
            "logout_reason",
            "บัญชีถูก force logout เนื่องจากมีการเข้าสู่ระบบจากเครื่องอื่น"
          );
          // เคลียร์ข้อมูล session
          localStorage.removeItem("sessionId");
          localStorage.removeItem("role");
          localStorage.removeItem("email");
          localStorage.removeItem("name");
          router.replace("/admin");
        } else {
          const data = await res.json();
          setRole(data.role);
          setName(data.name);
          setLoading(false);
        }
      });
    };

    checkSession(); // เช็คตอน mount ทันที
    interval = setInterval(checkSession, 8000); // เช็คทุก 8 วิ (ปรับตามที่เหมาะ)

    // sync ทุก tab เมื่อโดน kick (เช่น force logout)
    const storageListener = (e) => {
      if (e.key === "sessionId") {
        checkSession();
      }
    };
    window.addEventListener("storage", storageListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", storageListener);
    };
  }, [router]);

  // handle logout ปกติ
  const handleLogout = async () => {
    const email = localStorage.getItem("email");
    if (email) {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    }
    localStorage.removeItem("sessionId");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    router.replace("/admin");
  };

  if (loading || !role) {
    return (
      <div className="h-screen flex items-center justify-center text-xl text-[#b6b6a2] bg-[#232321]">
        Loading...
      </div>
    );
  }

  const menus = getMenuByRole(role);

  return (
    <div className="min-h-screen w-full" style={{ background: "#232321", minHeight: "100dvh" }}>
      <NavBar
        logo="https://www.foremostthailand.com/wp-content/uploads/2022/03/footer-icon_foremost-e1648914092691.png"
        name={name}
        onLogout={handleLogout}
      />

      <div className="flex flex-col items-center py-8">
        <h1 className="text-2xl font-bold mb-8" style={{ color: "#f5e6c4" }}>
          เมนูหลัก
        </h1>
        <div className="flex flex-wrap justify-center gap-6 w-full max-w-3xl">
          {menus.map((menu) => (
            <button
              key={menu.key}
              onClick={() => router.push(menu.path)}
              className="group flex flex-col items-center justify-center
                w-20 h-20 md:w-24 md:h-24 rounded-full
                border transition shadow relative focus:outline-none"
              style={{
                background: "#282828",
                borderColor: "#494137",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#37322b";
                e.currentTarget.style.borderColor = "#e5c77e";
                e.currentTarget.querySelector("svg").style.color = "#ecd8b2";
                e.currentTarget.querySelector("span").style.color = "#fff5dc";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#282828";
                e.currentTarget.style.borderColor = "#494137";
                e.currentTarget.querySelector("svg").style.color = "#beb096";
                e.currentTarget.querySelector("span").style.color = "#cfc6b7";
              }}
            >
              <menu.icon
                className="w-7 h-7 md:w-8 md:h-8 transition mb-2 pointer-events-none"
                style={{
                  color: "#beb096",
                  transition: "color 0.2s"
                }}
              />
              <span
                className="text-xs font-medium text-center leading-5 px-2 transition pointer-events-none"
                style={{ color: "#cfc6b7", transition: "color 0.2s" }}
              >
                {menu.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
