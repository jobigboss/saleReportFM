"use client";
import React, { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";

function NavBar({ logo, name = "Bigboss", onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const buttonWidth = 180;

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-[#232321] border-b border-[#494137] shadow-md z-30">
      <div className="flex items-center gap-2">
        {logo && (
          <img src={logo} alt="Logo" className="h-8 w-8 rounded-full bg-[#beb096] object-cover" />
        )}
        <span className="text-xl font-bold text-[#ecd8b2] tracking-wide">Foremost</span>
      </div>
      <div ref={ref} className="relative flex items-center">
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-2 px-5 py-2 font-bold text-base transition-all duration-150
            bg-[#282828] text-[#f5e6c4]
            rounded-t-2xl ${open ? "rounded-b-none" : "rounded-b-2xl"}
            shadow-md border border-[#494137]
            focus:outline-none
            ${open ? "z-50" : "hover:bg-[#37322b] hover:text-[#fff5dc]"}
          `}
          style={{
            width: buttonWidth,
            boxShadow: open ? "0 6px 28px 0 #0007" : undefined,
            borderBottom: open ? "none" : "1.5px solid #494137",
            cursor: "pointer"
          }}
        >
          {name}
          <svg
            className={`w-4 h-4 ml-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {open && (
          <div
            className={`
              absolute right-0 top-full
              bg-[#282828] border border-[#494137]
              rounded-b-2xl rounded-t-none
              shadow-2xl z-40 animate-fade-in
              overflow-hidden
            `}
            style={{
              width: buttonWidth,
              borderTop: "none",
              boxShadow: "0 8px 32px 0 #0007",
            }}
          >
            <button
              className="flex items-center gap-2 w-full px-4 py-3 text-left text-[#cfc6b7] hover:bg-[#37322b] hover:text-[#fff5dc] transition font-medium"
              onClick={() => { setOpen(false); onLogout && onLogout(); }}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
      <style jsx>{`
        .rounded-b-none { border-bottom-left-radius: 0 !important; border-bottom-right-radius: 0 !important; }
        .rounded-t-none { border-top-left-radius: 0 !important; border-top-right-radius: 0 !important; }
        .animate-fade-in {
          animation: fadein 0.17s;
        }
        @keyframes fadein {
          0% { opacity: 0; transform: translateY(-8px);}
          100% { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </nav>
  );
}

export default NavBar;
