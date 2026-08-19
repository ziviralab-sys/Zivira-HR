import Link from "next/link";

export default function PayrollSettingsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Payroll Rules Engine</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Configure salary components, deductions, and organizational calculation rules.</p>
        </div>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm">
          Add Component
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Settings Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <Link href="#" className="block px-4 py-3 rounded-lg bg-orange-50 text-orange-700 font-semibold">Salary Components</Link>
          <Link href="#" className="block px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-950 font-medium">Rounding Rules</Link>
          <Link href="#" className="block px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-950 font-medium">Payroll Cycle</Link>
          <Link href="#" className="block px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-950 font-medium">Tax Regimes</Link>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Component Name</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Calculation</th>
                    <th className="px-6 py-4 font-semibold">Taxable</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  
                  {/* Basic Salary */}
                  <tr className="hover:bg-gray-50 dark:bg-gray-950 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">Basic Salary</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold tracking-wide uppercase">Earning</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">50% of CTC</td>
                    <td className="px-6 py-4">Yes</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-orange-600 hover:text-orange-800 font-medium">Edit</button>
                    </td>
                  </tr>

                  {/* HRA */}
                  <tr className="hover:bg-gray-50 dark:bg-gray-950 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">HRA</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold tracking-wide uppercase">Earning</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">50% of Basic</td>
                    <td className="px-6 py-4">Yes (Subject to Exemption)</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-orange-600 hover:text-orange-800 font-medium">Edit</button>
                    </td>
                  </tr>

                  {/* PF Employee */}
                  <tr className="hover:bg-gray-50 dark:bg-gray-950 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">Provident Fund (PF)</td>
                    <td className="px-6 py-4">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold tracking-wide uppercase">Deduction</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">12% of Basic</td>
                    <td className="px-6 py-4">Pre-Tax</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-orange-600 hover:text-orange-800 font-medium">Edit</button>
                    </td>
                  </tr>

                  {/* Professional Tax */}
                  <tr className="hover:bg-gray-50 dark:bg-gray-950 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">Professional Tax (PT)</td>
                    <td className="px-6 py-4">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold tracking-wide uppercase">Deduction</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">Slab based (State)</td>
                    <td className="px-6 py-4">Pre-Tax</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-orange-600 hover:text-orange-800 font-medium">Edit</button>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-sm text-orange-800 flex items-start gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              <strong>Why use configurable components?</strong> Rather than hardcoding a giant math formula to calculate salary, defining individual rules here allows the payroll engine to dynamically calculate arrears, pro-rate joining months, and process Leave Without Pay accurately against only specific salary components.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
