import Link from "next/link";

export default function EmployeeDashboardPage() {
  return (
    <>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-12 space-y-8">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl shadow-md p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Good morning, Arun! 👋</h2>
            <p className="text-orange-100 text-lg">Here is your quick summary for August 2026.</p>
          </div>
          <button className="bg-white dark:bg-gray-900 text-orange-700 hover:bg-orange-50 px-6 py-3 rounded-xl font-bold shadow-sm transition-colors whitespace-nowrap">
            Clock In Today
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide">Attendance</h3>
                <p className="text-2xl font-black text-gray-900 dark:text-gray-100">14 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">/ 22 Days</span></p>
              </div>
            </div>
            <Link href="#" className="text-orange-600 text-sm font-semibold hover:underline flex items-center gap-1">
              View Calendar <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide">Leave Balance</h3>
                <p className="text-2xl font-black text-gray-900 dark:text-gray-100">8 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Days</span></p>
              </div>
            </div>
            <Link href="/ess/leave/apply" className="text-orange-600 text-sm font-semibold hover:underline flex items-center gap-1">
              Apply for Leave <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide">Last Payslip</h3>
                <p className="text-2xl font-black text-gray-900 dark:text-gray-100">July</p>
              </div>
            </div>
            <Link href="/ess/payslips" className="text-orange-600 text-sm font-semibold hover:underline flex items-center gap-1">
              View Payslip <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Announcements & Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Company Announcements</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-2 h-2 mt-2 bg-orange-500 rounded-full shrink-0"></div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200">Q3 Townhall Meeting</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Join us on Friday at 4 PM for the Q3 financial review and updates.</p>
                  <p className="text-xs text-gray-400 mt-2">Posted 2 days ago</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-2 mt-2 bg-green-500 rounded-full shrink-0"></div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200">New Health Insurance Policy</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Please review the updated policy documents in your ESS portal.</p>
                  <p className="text-xs text-gray-400 mt-2">Posted 1 week ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Upcoming Holidays</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-white dark:bg-gray-900 p-2 rounded text-center border border-gray-200 dark:border-gray-800 min-w-[50px]">
                    <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Aug</span>
                    <span className="block text-xl font-black text-gray-900 dark:text-gray-100">15</span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-gray-200">Independence Day</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Saturday</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-white dark:bg-gray-900 p-2 rounded text-center border border-gray-200 dark:border-gray-800 min-w-[50px]">
                    <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Nov</span>
                    <span className="block text-xl font-black text-gray-900 dark:text-gray-100">11</span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-gray-200">Diwali</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Wednesday</span>
              </div>
            </div>
          </div>

        </div>

      </main>
    </>
  );
}
