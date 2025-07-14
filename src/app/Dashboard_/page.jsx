"use client";
import React, { useState } from "react";
import { Package, BarChart, Store, Menu, LogOut } from "lucide-react";
import Product from "./components/ByProduct";
import ByStore from "./components/ByStore";
import Overview from "./components/Overview";
import { useRouter } from "next/navigation";

const MENU = [
  { key: "Overview", label: "Overview", icon: <BarChart size={20} /> },
  { key: "product", label: "Product", icon: <Package size={20} /> },
  { key: "store", label: "Store", icon: <Store size={20} /> },
];

function DashboardPage() {
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(MENU[0].key); // Default = Overview
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 bg-white shadow-lg h-screen 
        ${open ? "w-56" : "w-16"} flex flex-col`}
        aria-label="Sidebar"
      >
        {/* Logo/Header */}
        <div className="flex items-center h-16 px-4 border-b">
          <span className="font-extrabold text-lg text-blue-700 tracking-wider">{open && "DASHBOARD"}</span>
          <button
            className="ml-auto p-1 focus:outline-none rounded-md hover:bg-blue-50 transition"
            aria-label="Toggle Sidebar"
            onClick={() => setOpen((v) => !v)}
            tabIndex={0}
          >
            <Menu />
          </button>
        </div>
        {/* Menu */}
        <nav className="flex-1 flex flex-col gap-1 mt-4" role="navigation" aria-label="Main Navigation">
          {MENU.map((item) => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all
                ${page === item.key ? "bg-blue-50 font-bold text-blue-700 shadow-sm" : "hover:bg-gray-100"}
              `}
              aria-label={item.label}
              tabIndex={0}
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
      <main className="flex-1 p-6 overflow-y-auto">
        {page === "Overview" && (
          <div>
            <h2 className="text-xl font-bold mb-4">📊 Performance Overview</h2>
            <Overview />
          </div>
        )}
        {page === "product" && (
          <div>
            <h2 className="text-xl font-bold mb-4">📦 จัดการสินค้า</h2>
            <Product />
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
