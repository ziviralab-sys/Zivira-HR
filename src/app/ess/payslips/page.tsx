import Link from "next/link";

export default function ESSPayslipsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 pt-24 pb-12 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">My Payslips</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View and download your monthly salary slips.</p>
        </div>
        <Link href="/ess" className="text-orange-600 hover:underline font-medium text-sm">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
          <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-6 py-4 font-semibold">Month & Year</th>
              <th className="px-6 py-4 font-semibold">Net Pay</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            
            {/* July */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">July 2026</td>
              <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">₹46,800</td>
              <td className="px-6 py-4">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Paid</span>
              </td>
              <td className="px-6 py-4 text-right flex justify-end gap-3">
                <Link href="/employees/EMP001/payslip" className="text-orange-600 hover:text-orange-800 font-medium">View</Link>
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 font-medium">Download</button>
              </td>
            </tr>

            {/* June */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">June 2026</td>
              <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">₹46,800</td>
              <td className="px-6 py-4">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Paid</span>
              </td>
              <td className="px-6 py-4 text-right flex justify-end gap-3">
                <Link href="/employees/EMP001/payslip" className="text-orange-600 hover:text-orange-800 font-medium">View</Link>
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 font-medium">Download</button>
              </td>
            </tr>

            {/* May */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">May 2026</td>
              <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">₹46,800</td>
              <td className="px-6 py-4">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Paid</span>
              </td>
              <td className="px-6 py-4 text-right flex justify-end gap-3">
                <Link href="/employees/EMP001/payslip" className="text-orange-600 hover:text-orange-800 font-medium">View</Link>
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 font-medium">Download</button>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </main>
  );
}
