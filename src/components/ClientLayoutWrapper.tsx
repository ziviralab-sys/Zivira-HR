"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isNoSidebar = pathname === "/" || pathname.startsWith("/ess") || pathname.startsWith("/onboarding");
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700' }} />
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${!isNoSidebar ? (isCollapsed ? 'ml-16' : 'ml-64') : ''}`}>
        {!isNoSidebar && <Header />}
        <main className={`flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 ${isNoSidebar ? 'p-0' : 'p-6'}`}>
          {children}
        </main>
      </div>
    </>
  );
}
