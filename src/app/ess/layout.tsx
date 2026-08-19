import Link from "next/link";

export default function ESSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 transition-colors">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm fixed top-0 w-full z-10 transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logo-grad-ess" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f93a0b" />
                    <stop offset="50%" stopColor="#f58013" />
                    <stop offset="100%" stopColor="#fcb612" />
                  </linearGradient>
                </defs>
                <polygon points="25,5 75,5 100,50 75,95 25,95 0,50" fill="url(#logo-grad-ess)" />
                <path d="M70 30 L40 50 M75 40 L45 55 M80 50 L50 60 M75 60 L45 65 M70 70 L40 70" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-[#1a1060] leading-none dark:text-white">Zivira</span>
                <span className="text-[10px] text-[#1a1060] font-medium tracking-wide dark:text-gray-300">Labs Pvt. Ltd.</span>
              </div>
            </div>
            <nav className="hidden md:flex gap-6 font-medium text-sm text-gray-600 dark:text-gray-400">
              <Link href="/ess" className="hover:text-orange-600 dark:hover:text-orange-400 pt-5 pb-5 transition-colors">Dashboard</Link>
              <Link href="/ess/payslips" className="hover:text-orange-600 dark:hover:text-orange-400 pt-5 pb-5 transition-colors">Payslips</Link>
              <Link href="/ess/leave/apply" className="hover:text-orange-600 dark:hover:text-orange-400 pt-5 pb-5 transition-colors">Leave</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors mr-4 flex items-center gap-1">
              &larr; Switch to Admin
            </a>
            <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Arun Kumar</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sales Exec</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg shadow-sm border border-orange-200">
                AK
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
