"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/api-client";
import { apiClient, type LeaveApplication } from "@/lib/api-client";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("Admin");
  const [pendingLeave, setPendingLeave] = useState<LeaveApplication[]>([]);

  useEffect(() => {
    setMounted(true);
    const user = getStoredUser();
    if (user?.displayName) setDisplayName(String(user.displayName));
    apiClient
      .leaveApplications("PENDING")
      .then((res) => setPendingLeave(res.data.slice(0, 5)))
      .catch(() => setPendingLeave([]));
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10 w-full transition-colors">
      <div className="flex items-center gap-4">
        {/* Search or Breadcrumbs can go here */}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Welcome, {displayName}</h2>
      </div>
      <div className="flex items-center gap-4 relative">
        {mounted && (
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        )}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {pendingLeave.length > 0 && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>

          {/* Notifications Dropdown — real pending leave requests, the one
              cross-portal signal every HR staffer needs to see at a glance. */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Pending Leave Requests</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {pendingLeave.length === 0 && (
                  <p className="p-4 text-sm text-gray-500 dark:text-gray-400">No pending leave requests.</p>
                )}
                {pendingLeave.map((leave) => (
                  <div key={leave.id} className="p-4 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{leave.employeeName ?? leave.employeeCode}</p>
                      <span className="text-xs text-gray-400">{leave.days} day{leave.days === 1 ? "" : "s"}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{leave.leaveType} — {leave.fromDate?.slice(0, 10)} to {leave.toDate?.slice(0, 10)}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <a href="/leave" className="text-sm font-medium text-orange-600 hover:underline">View all leave requests</a>
              </div>
            </div>
          )}
        </div>
        <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold cursor-pointer" title={displayName}>
          {displayName.slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
