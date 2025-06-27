
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MENU_LIST, ROLE_MENUS } from "./components/Menus";
import NavBar from "./components/Nevbar";

const ICON_COLOR = "#beb096";
const ICON_HOVER = "#ecd8b2";
const TEXT_COLOR = "#cfc6b7";
const TEXT_HOVER = "#fff5dc";
const BORDER_COLOR = "#494137";
const HEADER_COLOR = "#f5e6c4";
const BG_MAIN = "#232321";
const BG_MENU = "#282828";
const BG_MENU_HOVER = "#37322b";
const BORDER_MENU_HOVER = "#e5c77e";

function getMenuByRole(role) {
  const keys = ROLE_MENUS[role] || [];
  return MENU_LIST.filter(menu => keys.includes(menu.key));
}

function MenuPage() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ มี useEffect แค่ตัวเดียว!
  useEffect(() => {
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
        localStorage.clear();
        localStorage.setItem(
          "logout_reason",
          "บัญชีถูก force logout เนื่องจากมีการเข้าสู่ระบบจากเครื่องอื่น"
        );
        router.replace("/admin");
      } else {
        const data = await res.json();
        setRole(data.role);
        setName(data.name);
        setLoading(false);
      }
    });
  }, []);

  const handleLogout = async () => {
    const email = localStorage.getItem("email");
    if (email) {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    }
    localStorage.clear();
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
    <div className="min-h-screen w-full" style={{ background: BG_MAIN, minHeight: "100dvh" }}>
      <NavBar
        logo="https://www.foremostthailand.com/wp-content/uploads/2022/03/footer-icon_foremost-e1648914092691.png"
        name={name}
        onLogout={handleLogout}
      />

      <div className="flex flex-col items-center py-8">
        <h1 className="text-2xl font-bold mb-8" style={{ color: HEADER_COLOR }}>
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
                background: BG_MENU,
                borderColor: BORDER_COLOR,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = BG_MENU_HOVER;
                e.currentTarget.style.borderColor = BORDER_MENU_HOVER;
                e.currentTarget.querySelector("svg").style.color = ICON_HOVER;
                e.currentTarget.querySelector("span").style.color = TEXT_HOVER;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = BG_MENU;
                e.currentTarget.style.borderColor = BORDER_COLOR;
                e.currentTarget.querySelector("svg").style.color = ICON_COLOR;
                e.currentTarget.querySelector("span").style.color = TEXT_COLOR;
              }}
            >
              <menu.icon
                className="w-7 h-7 md:w-8 md:h-8 transition mb-2 pointer-events-none"
                style={{
                  color: ICON_COLOR,
                  transition: "color 0.2s"
                }}
              />
              <span
                className="text-xs font-medium text-center leading-5 px-2 transition pointer-events-none"
                style={{ color: TEXT_COLOR, transition: "color 0.2s" }}
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

export default MenuPage;

