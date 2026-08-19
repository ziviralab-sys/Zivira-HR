import Link from "next/link";

export default function EmployeePayrollPage({ params }: { params: { id: string } }) {
  const employeeId = params.id || "EMP00125";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/employees/${employeeId}`} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Payroll Information</h1>
        </div>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm">
          Edit Salary Structure
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Priya Sharma</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{employeeId} - Full Stack Developer</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-gray-500 dark:text-gray-400">Effective From: <span className="font-medium text-gray-900 dark:text-gray-100">01-Apr-2026</span></p>
            <p className="text-gray-500 dark:text-gray-400">Annual CTC: <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">₹6,00,000</span></p>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Salary Structure Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Earnings Column */}
            <div>
              <h4 className="font-semibold text-green-700 uppercase tracking-wide text-sm border-b border-gray-200 dark:border-gray-800 pb-2 mb-4 flex justify-between">
                <span>Earnings</span>
                <span>Monthly (₹)</span>
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>Basic Salary <span className="text-xs text-gray-400 block">50% of CTC</span></span>
                  <span className="font-medium">25,000</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>House Rent Allowance <span className="text-xs text-gray-400 block">50% of Basic</span></span>
                  <span className="font-medium">12,500</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>Special Allowance <span className="text-xs text-gray-400 block">Remainder</span></span>
                  <span className="font-medium">12,500</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-gray-900 dark:text-gray-100 font-bold border-t border-gray-200 dark:border-gray-800 pt-3 mt-4">
                <span>Gross Earnings</span>
                <span>50,000</span>
              </div>
            </div>

            {/* Deductions Column */}
            <div>
              <h4 className="font-semibold text-red-700 uppercase tracking-wide text-sm border-b border-gray-200 dark:border-gray-800 pb-2 mb-4 flex justify-between">
                <span>Statutory Deductions</span>
                <span>Monthly (₹)</span>
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>PF (Employee) <span className="text-xs text-gray-400 block">12% of Basic</span></span>
                  <span className="font-medium text-red-600">- 3,000</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>Professional Tax <span className="text-xs text-gray-400 block">State slab</span></span>
                  <span className="font-medium text-red-600">- 200</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>ESI <span className="text-xs text-gray-400 block">Not Applicable</span></span>
                  <span className="font-medium text-gray-400">0</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-gray-900 dark:text-gray-100 font-bold border-t border-gray-200 dark:border-gray-800 pt-3 mt-4">
                <span>Total Fixed Deductions</span>
                <span className="text-red-600">- 3,200</span>
              </div>
            </div>

          </div>

          <div className="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-orange-800 uppercase tracking-wider">Estimated Net Salary</p>
              <p className="text-xs text-orange-600 mt-1">Excluding variables like LWP, Income Tax, or Loans</p>
            </div>
            <div className="text-3xl font-bold text-orange-700">
              ₹46,800
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
