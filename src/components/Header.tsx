"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const notifications = [
    { id: 1, title: "Leave Request", message: "Arun Kumar requested Sick Leave", time: "10 mins ago", read: false },
    { id: 2, title: "Payroll Processed", message: "August 2026 payroll has been locked", time: "2 hours ago", read: true },
    { id: 3, title: "New Onboarding", message: "Priya Sharma completed onboarding steps", time: "1 day ago", read: true },
  ];

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10 w-full transition-colors">
      <div className="flex items-center gap-4">
        {/* Search or Breadcrumbs can go here */}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Welcome, Admin</h2>
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
            <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
                <button className="text-xs text-orange-600 hover:underline">Mark all as read</button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-4 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${notif.read ? 'opacity-70' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm font-semibold ${notif.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'}`}>{notif.title}</p>
                      <span className="text-xs text-gray-400">{notif.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{notif.message}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <button className="text-sm font-medium text-orange-600 hover:underline">View all notifications</button>
              </div>
            </div>
          )}
        </div>
        <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
}
