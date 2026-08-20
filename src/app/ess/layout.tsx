"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredUser, clearToken } from "@/lib/api-client";

export default function ESSLayout({ children }: { children: React.ReactNode }) {
  const [displayName, setDisplayName] = useState("Employee");
  const [designation, setDesignation] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (user?.displayName) setDisplayName(String(user.displayName));
    if (user?.designation) setDesignation(String(user.designation));
  }, []);

  const handleLogout = () => {
    clearToken();
    document.cookie = "auth=; Max-Age=0; path=/;";
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 transition-colors">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm fixed top-0 left-0 w-full z-10 transition-colors">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                <svg width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="logo-grad-ess" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f93a0b" />
                      <stop offset="50%" stopColor="#f58013" />
                      <stop offset="100%" stopColor="#fcb612" />
                    </linearGradient>
                  </defs>
                  <polygon points="8,1.6 24,1.6 32,16 24,30.4 8,30.4 0,16" fill="url(#logo-grad-ess)" />
                  <path d="M22.4 9.6 L12.8 16 M24 12.8 L14.4 17.6 M25.6 16 L16 19.2 M24 19.2 L14.4 20.8 M22.4 22.4 L12.8 22.4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-[#1a1060] leading-none dark:text-white">Zivira</span>
                <span className="text-[10px] text-[#1a1060] font-medium tracking-wide dark:text-gray-300 whitespace-nowrap">Labs Pvt. Ltd.</span>
              </div>
            </div>
            <nav className="hidden md:flex gap-6 font-medium text-sm text-gray-600 dark:text-gray-400">
              <Link href="/ess" className="hover:text-orange-600 dark:hover:text-orange-400 pt-5 pb-5 transition-colors">Dashboard</Link>
              <Link href="/ess/payslips" className="hover:text-orange-600 dark:hover:text-orange-400 pt-5 pb-5 transition-colors">Payslips</Link>
              <Link href="/ess/leave/apply" className="hover:text-orange-600 dark:hover:text-orange-400 pt-5 pb-5 transition-colors">Leave</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors mr-4 flex items-center gap-1"
            >
              Sign Out
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{displayName}</p>
                {designation && <p className="text-xs text-gray-500 dark:text-gray-400">{designation}</p>}
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg shadow-sm border border-orange-200">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
