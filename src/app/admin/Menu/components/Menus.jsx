// src/constants/Menus.js

import { LayoutDashboard, Users, Database } from "lucide-react";

export const MENU_LIST = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/Dashboard" },
  { key: "user", label: "พนักงานในระบบ", icon: Users, path: "/admin/user" },
  { key: "data", label: "Data", icon: Database, path: "/admin/data-report" },
];
export const ROLE_MENUS = {
  admin: ["dashboard", "user", "data"],
  user: ["dashboard"],
  sup: ["data"]
};
