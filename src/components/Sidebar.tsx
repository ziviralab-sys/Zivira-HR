"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ isCollapsed = false, setIsCollapsed = () => {} }: { isCollapsed?: boolean, setIsCollapsed?: (val: boolean) => void }) {
  const pathname = usePathname();
  if (pathname.startsWith("/ess") || pathname.startsWith("/onboarding") || pathname === "/") return null;

  return (
    <aside className={`bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-800 min-h-screen flex flex-col fixed left-0 top-0 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <svg className="flex-shrink-0" width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f93a0b" />
                  <stop offset="50%" stopColor="#f58013" />
                  <stop offset="100%" stopColor="#fcb612" />
                </linearGradient>
              </defs>
              <g transform="scale(0.8) translate(12.5, 12.5)">
                <polygon points="25,5 75,5 100,50 75,95 25,95 0,50" fill="url(#logo-grad)" />
                <path d="M70 30 L40 50 M75 40 L45 55 M80 50 L50 60 M75 60 L45 65 M70 70 L40 70" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </g>
            </svg>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#1a1060] leading-none dark:text-white">Zivira</span>
              <span className="text-[10px] text-[#1a1060] font-medium tracking-wide dark:text-gray-300 whitespace-nowrap">Labs Pvt. Ltd.</span>
            </div>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>
      <nav className={`flex-1 py-4 space-y-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <Link href="/dashboard" className={`flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isCollapsed ? 'justify-center' : ''}`} title="Dashboard">
          <span className="text-xl">📊</span>
          {!isCollapsed && <span className="ml-3">Dashboard</span>}
        </Link>
        <Link href="/employees" className={`flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isCollapsed ? 'justify-center' : ''}`} title="Employee Directory">
          <span className="text-xl">👥</span>
          {!isCollapsed && <span className="ml-3">Employee Directory</span>}
        </Link>
        <Link href="/attendance" className={`flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isCollapsed ? 'justify-center' : ''}`} title="Attendance">
          <span className="text-xl">⏰</span>
          {!isCollapsed && <span className="ml-3">Attendance</span>}
        </Link>
        <Link href="/leave" className={`flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isCollapsed ? 'justify-center' : ''}`} title="Leave Management">
          <span className="text-xl">🏖️</span>
          {!isCollapsed && <span className="ml-3">Leave Management</span>}
        </Link>
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/payroll/run" className={`flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white font-medium ${isCollapsed ? 'justify-center' : ''}`} title="Run Payroll">
            <span className="text-xl">💳</span>
            {!isCollapsed && <span className="ml-3">Run Payroll</span>}
          </Link>
          <Link href="/settings/payroll" className={`flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-300 ${isCollapsed ? 'justify-center' : ''}`} title="Payroll Settings">
            <span className="text-xl">⚙️</span>
            {!isCollapsed && <span className="ml-3">Payroll Settings</span>}
          </Link>
        </div>
      </nav>
      <div className={`p-4 pb-20 border-t border-gray-200 dark:border-gray-800 text-sm flex flex-col gap-4 ${isCollapsed ? 'items-center' : ''}`}>
        {!isCollapsed && <span className="text-gray-500 dark:text-gray-400 font-medium">Admin Portal</span>}
        <Link href="/ess" className={`text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`} title="Switch to ESS View">
          <span className="text-xl">📱</span>
          {!isCollapsed && <span>ESS View &rarr;</span>}
        </Link>
        <button onClick={() => { document.cookie = 'auth=; Max-Age=0; path=/;'; window.location.href = '/'; }} className={`text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`} title="Sign Out">
          <span className="text-xl">🚪</span>
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
