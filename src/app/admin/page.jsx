"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

function AdminPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingForce, setPendingForce] = useState(false); // modal หรือ state แจ้งเตือน
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");
  const router = useRouter();

  // กด submit login
  const handleSubmit = async (e, forceLogout = false) => {
    e && e.preventDefault();
    setLoading(true);
    setError("");
    const email = e ? e.target.email.value : pendingEmail;
    const password = e ? e.target.password.value : pendingPassword;

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, forceLogout }),
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.error === "active_session") {
        // ถ้าติด active session
        setPendingForce(true);
        setPendingEmail(email);
        setPendingPassword(password);
        setLoading(false);
        return;
      }
      setError(data.error || "Login failed");
      setLoading(false);
      return;
    }

    // Success: Save session
    localStorage.setItem("email", email);
    localStorage.setItem("sessionId", data.sessionId);
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name);
    router.replace("/admin/Menu");
  };

  // ยืนยันออกจากระบบเครื่องเก่า
  const handleForceLogout = () => {
    setPendingForce(false);
    handleSubmit(null, true); // ส่ง forceLogout=true
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ece8de]">
      <form
        className="w-full max-w-sm bg-white rounded-xl shadow-xl p-8 space-y-6 flex flex-col items-center"
        onSubmit={handleSubmit}
      >
        {/* logo & ... เหมือนเดิม */}
        {/* ... */}
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
        {error && <div className="text-red-600 text-center">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-[#232321] text-white font-bold mt-2 hover:bg-[#323220] transition"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "Login"}
        </button>
      </form>

      {/* Modal แจ้งเตือนซ้อน session */}
      {pendingForce && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center">
            <div className="text-lg mb-4 text-[#c93] font-bold">
              บัญชีนี้กำลังใช้งานอยู่บนเครื่องอื่น<br />ต้องการออกจากระบบเครื่องเก่าและเข้าสู่ระบบที่นี่หรือไม่?
            </div>
            <div className="flex gap-3 mt-2">
              <button
                className="px-4 py-2 rounded-lg bg-[#e45757] text-white font-bold"
                onClick={() => setPendingForce(false)}
              >ยกเลิก</button>
              <button
                className="px-4 py-2 rounded-lg bg-[#232321] text-white font-bold"
                onClick={handleForceLogout}
              >ออกจากเครื่องเก่าและเข้าสู่ระบบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
