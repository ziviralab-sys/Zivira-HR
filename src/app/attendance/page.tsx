import Link from "next/link";

export default function AttendanceRegisterPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Attendance Register</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Monitor daily employee attendance, working hours, and correct anomalies.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:bg-gray-950 transition-colors">
            Import Excel/CSV
          </button>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm">
            Sync Biometrics
          </button>
        </div>
      </div>

      {/* Date Filter & Stats */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <button className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-md text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="font-bold text-gray-800 dark:text-gray-200 min-w-[120px] text-center">18 Aug 2026</span>
          <button className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-md text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
            <span className="text-green-800 text-sm font-bold uppercase tracking-wider">Present</span>
            <p className="text-2xl font-black text-green-700">201</p>
          </div>
          <div className="bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
            <span className="text-red-800 text-sm font-bold uppercase tracking-wider">Absent</span>
            <p className="text-2xl font-black text-red-700">17</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg">
            <span className="text-yellow-800 text-sm font-bold uppercase tracking-wider">On Leave</span>
            <p className="text-2xl font-black text-yellow-700">10</p>
          </div>
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Punch In</th>
                <th className="px-6 py-4 font-semibold">Punch Out</th>
                <th className="px-6 py-4 font-semibold">Working Hours</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              
              {/* Present - On Time */}
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900 dark:text-gray-100">Arun Kumar</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">EMP001</p>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Present</span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">09:30 AM</td>
                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">18:30 PM</td>
                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">9h 00m</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-orange-600 hover:text-orange-800 font-medium">Correct</button>
                </td>
              </tr>

              {/* Present - Late */}
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900 dark:text-gray-100">Priya Sharma</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">EMP1025</p>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Present</span>
                </td>
                <td className="px-6 py-4 font-medium text-red-600">09:45 AM <span className="text-xs text-gray-400 block font-normal">Late by 15m</span></td>
                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">--:--</td>
                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">Currently Working</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-orange-600 hover:text-orange-800 font-medium">Correct</button>
                </td>
              </tr>

              {/* Absent - Missing Punch / Needs Correction */}
              <tr className="hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors bg-red-50/30 dark:bg-red-950/20">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900 dark:text-gray-100">Ravi Raj</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">EMP003</p>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Absent</span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-400">Missing</td>
                <td className="px-6 py-4 font-medium text-gray-400">Missing</td>
                <td className="px-6 py-4 font-medium text-gray-400">0h 0m</td>
                <td className="px-6 py-4 text-right">
                  <button className="bg-orange-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-orange-700 shadow-sm">Add Punch</button>
                </td>
              </tr>

              {/* Leave */}
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-gray-50 dark:bg-gray-900/50 opacity-75">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900 dark:text-gray-100">Meena Patel</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">EMP042</p>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">On Leave</span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Casual Leave</td>
                <td className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Approved</td>
                <td className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">-</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600 dark:text-gray-400 font-medium">View</button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
