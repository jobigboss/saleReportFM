"use client";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const defaultForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "user",
};

function AddUserForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(defaultForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      return "กรุณากรอกข้อมูลให้ครบถ้วน";
    }
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
      return "อีเมลไม่ถูกต้อง";
    }
    if (form.password.length < 6) {
      return "รหัสผ่านต้องมากกว่า 6 ตัว";
    }
    if (form.password !== form.confirmPassword) {
      return "รหัสผ่านไม่ตรงกัน";
    }
    return "";
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  const err = validate();
  if (err) {
    setError(err);
    return;
  }
  setError("");
  setLoading(true);

  try {
    const res = await fetch("/api/admin/AddUserForm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form }),
    });
    const data = await res.json();

    if (!res.ok) {
    toast.error(data.error || "เกิดข้อผิดพลาด");
    setLoading(false);
    return;
    }


    toast.success("เพิ่มผู้ใช้งานสำเร็จ!", {
    style: {
        borderRadius: '8px',
        background: '#333',
        color: '#fff',
        fontWeight: 'bold',
    },
    });

    setForm(defaultForm);
    if (onSubmit) onSubmit(data.user);
  } catch (e) {
    setError("เกิดข้อผิดพลาด");
  }
  setLoading(false);
};

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-12 bg-white shadow-xl rounded-xl px-8 py-8 space-y-5 border border-gray-100"
    >
        <Toaster position="top-center" />
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">เพิ่มผู้ใช้งานใหม่</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-base font-medium mb-1 text-gray-700">ชื่อ</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="block text-base font-medium mb-1 text-gray-700">อีเมล</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
            required
          />
        </div>
        <div>
          <label className="block text-base font-medium mb-1 text-gray-700">เบอร์โทร</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
            required
          />
        </div>
        <div>
          <label className="block text-base font-medium mb-1 text-gray-700">รหัสผ่าน</label>
          <div className="relative flex items-center">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
              required
            />
            <button
              type="button"
              className="absolute right-2 text-sm text-blue-500 bg-white px-2 py-1 rounded cursor-pointer"
              style={{ top: "50%", transform: "translateY(-50%)" }}
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? "ซ่อน" : "แสดง"}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-base font-medium mb-1 text-gray-700">ยืนยันรหัสผ่าน</label>
          <div className="relative flex items-center">
            <input
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
              required
            />
            <button
              type="button"
              className="absolute right-2 text-sm text-blue-500 bg-white px-2 py-1 rounded cursor-pointer"
              style={{ top: "50%", transform: "translateY(-50%)" }}
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
            >
              {showConfirm ? "ซ่อน" : "แสดง"}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-base font-medium mb-1 text-gray-700">สิทธิ์การเข้าถึง</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="sup">Supervisor</option>
            <option value="customer">Customer</option>
          </select>
        </div>
      </div>
      {error && (
        <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium text-center shadow mt-2">
          {error}
        </div>
      )}
      <div className="flex gap-2 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </form>
  );
}

export default AddUserForm;
