"use client";
import { useRouter, usePathname } from "next/navigation";
import { Menu, ShoppingCart, BarChart } from "lucide-react";

const menu = [
  { label: "Menu", icon: <Menu size={18} />, href: "/admin/Menu" },
  { label: "Product", icon: <ShoppingCart size={18} />, href: "/admin/Product" },
  { label: "Performance", icon: <BarChart size={18} />, href: "/admin/Performance" },
];

function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="min-h-screen w-56 bg-[#232321] text-white flex flex-col py-8 px-2">
      <div className="mb-10 flex justify-center">
        <img
          src="https://www.foremostthailand.com/wp-content/uploads/2022/03/footer-icon_foremost-e1648914092691.png"
          alt="logo"
          className="w-12 h-12 bg-[#ecd8b2] rounded-full p-2 shadow"
        />
      </div>
      {menu.map((item) => (
        <button
          key={item.href}
          className={`flex items-center gap-3 px-4 py-2 mb-2 rounded-lg font-medium text-left transition 
            ${pathname === item.href ? "bg-[#ece8de] text-[#232321]" : "hover:bg-[#363634]"}`}
          onClick={() => router.push(item.href)}
        >
          {item.icon} {item.label}
        </button>
      ))}
      <div className="flex-1" />
      {/* เพิ่ม logout button หรืออื่นๆ ตรงนี้ */}
    </aside>
  );
}

export default DashboardSidebar;
