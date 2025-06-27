"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoutReason, setLogoutReason] = useState("");
  const router = useRouter();

  useEffect(() => {
    const msg = localStorage.getItem("logout_reason");
    if (msg) {
      setLogoutReason(msg);
      localStorage.removeItem("logout_reason");
    }
  }, []);

  const doLogin = async ({ email, password }) => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    localStorage.setItem("email", email);
    localStorage.setItem("sessionId", data.sessionId);
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name);

    router.replace("/admin/Menu");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    doLogin({ email, password });
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
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-[#232321] text-white font-bold mt-2 hover:bg-[#323220] transition"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "Login"}
        </button>
        {logoutReason && (
          <div className="mb-2 text-red-600 text-center font-bold">{logoutReason}</div>
        )}
      </form>
    </div>
  );
}
