"use client";
import React, { useState } from "react";
import { Package, BarChart, Store, Menu, LogOut } from "lucide-react";
import Product from "./components/ByProduct";
import Performance from "./components/Performance";
import ByStore from "./components/ByStore";
import Overview from "./components/Overview";
import { useRouter } from "next/navigation";

const menu = [
  { key: "Overview", label: "Overview", icon: <BarChart size={20} /> },
  { key: "product", label: "Product", icon: <Package size={20} /> },
  { key: "store", label: "Store", icon: <Store size={20} /> },
];

function DashboardPage() {
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState("performance");
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 bg-white shadow-lg h-screen 
        ${open ? "w-56" : "w-16"} flex flex-col`}
      >
        {/* Logo/Header */}
        <div className="flex items-center h-16 px-4 border-b">
          <span className="font-extrabold text-lg text-blue-700">{open && "DASHBOARD"}</span>
          <button
            className="ml-auto p-1 focus:outline-none"
            aria-label="Toggle Sidebar"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu />
          </button>
        </div>
        {/* Menu */}
        <nav className="flex-1 flex flex-col gap-1 mt-4">
          {menu.map((item) => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all
                ${page === item.key ? "bg-blue-50 font-bold text-blue-700" : "hover:bg-gray-100"}
              `}
              aria-label={item.label}
            >
              {item.icon}
              {open && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        {/* Logout */}
        <button
          className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-red-100 text-red-500 transition mt-auto mb-4"
          aria-label="Logout"
          onClick={() => router.push("/admin")}
        >
          <LogOut size={20} />
          {open && <span>Logout</span>}
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-6">
        {page === "product" && (
          <div>
            <h2 className="text-xl font-bold mb-4">📦 จัดการสินค้า</h2>
          </div>
        )}
        {page === "performance" && (
          <div>
            <h2 className="text-xl font-bold mb-4">📊 Performance Overview</h2>
            <Overview/>
          </div>
        )}
        {page === "store" && (
          <div>
            <h2 className="text-xl font-bold mb-4">🏪 Store Report</h2>
            <ByStore />
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
