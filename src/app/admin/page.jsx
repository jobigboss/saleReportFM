"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

function AdminPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forceMode, setForceMode] = useState(false);
  const [formCache, setFormCache] = useState(null);
  const router = useRouter();

  // --- ส่ง login (option: forceLogout)
  const doLogin = async ({ email, password, forceLogout = false }) => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, forceLogout }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.status === 403 && data.error === "active_session") {
      setForceMode(true);
      setFormCache({ email, password });
      setError(data.message || "บัญชีนี้กำลังใช้งานอยู่บนเครื่องอื่น");
      return;
    }
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    // Success!
    localStorage.setItem("email", email);
    localStorage.setItem("sessionId", data.sessionId);
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name);
    router.replace("/admin/Menu");
  };

  // -- submit event
  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    doLogin({ email, password });
  };

  // -- ยืนยัน force logout
  const handleForceLogout = () => {
    if (!formCache) return;
    doLogin({ ...formCache, forceLogout: true });
    setForceMode(false);
    setFormCache(null);
  };

  // -- ยกเลิก
  const handleCancel = () => {
    setForceMode(false);
    setFormCache(null);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ece8de]">
      <form
        className="w-full max-w-sm bg-white rounded-xl shadow-xl p-8 space-y-6 flex flex-col items-center"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        {/* โลโก้ Foremost */}
        <div className="flex flex-col items-center mb-1">
          <div className="h-20 w-20 rounded-full bg-[#ecd8b2] flex items-center justify-center shadow">
            <img
              src="https://www.foremostthailand.com/wp-content/uploads/2022/03/footer-icon_foremost-e1648914092691.png"
              alt="Foremost Logo"
              className="h-15 w-15 object-contain"
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 text-[#432]">Admin Login</h2>
        <div className="w-full">
          <label className="block mb-1 text-[#432]">Email</label>
          <input name="email" type="email" className="w-full px-4 py-2 border rounded-lg" required autoFocus />
        </div>
        <div className="w-full">
          <label className="block mb-1 text-[#432]">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-2 border rounded-lg pr-14"
              required
            />
            <button type="button"
              className="absolute right-3 top-2 text-gray-500 text-sm"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
            >
              {showPassword ? "ซ่อน" : "แสดง"}
            </button>
          </div>
        </div>
        {error && (
          <div className="text-red-600 text-center">
            {error}
            {/* ถ้าเป็น forceMode ให้ปุ่มกด confirm/ยกเลิก */}
            {forceMode && (
              <div className="flex flex-col mt-2 gap-2">
                <button
                  type="button"
                  className="bg-[#e36e66] hover:bg-[#b94b44] text-white rounded px-4 py-1 font-bold"
                  onClick={handleForceLogout}
                  disabled={loading}
                >
                  ออกจากระบบเครื่องเดิมและเข้าสู่ระบบนี้
                </button>
                <button
                  type="button"
                  className="underline text-xs text-gray-600 hover:text-black"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  ยกเลิก
                </button>
              </div>
            )}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || forceMode}
          className="w-full py-2 rounded-lg bg-[#232321] text-white font-bold mt-2 hover:bg-[#323220] transition"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default AdminPage;
