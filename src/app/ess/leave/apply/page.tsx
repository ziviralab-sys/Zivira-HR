import Link from "next/link";

export default function ESSLeaveApplyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 pt-24 pb-12 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Apply for Leave</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Submit a time-off request to your manager.</p>
        </div>
        <Link href="/ess" className="text-orange-600 hover:underline font-medium text-sm">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
            <h3 className="font-bold text-orange-800 text-sm uppercase tracking-wide">Casual Leave</h3>
            <p className="text-3xl font-black text-orange-600 mt-2">12 <span className="text-sm font-medium">Days</span></p>
          </div>
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
            <h3 className="font-bold text-green-800 text-sm uppercase tracking-wide">Sick Leave</h3>
            <p className="text-3xl font-black text-green-600 mt-2">6 <span className="text-sm font-medium">Days</span></p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Leave Type <span className="text-red-500">*</span></label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-shadow text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900">
                <option value="">Select leave type</option>
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="lwp">Leave Without Pay (LWP)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date <span className="text-red-500">*</span></label>
                <input type="date" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-shadow text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date <span className="text-red-500">*</span></label>
                <input type="date" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-shadow text-gray-700 dark:text-gray-300" />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-3 flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Total Duration:</span>
              <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">0 Days</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason <span className="text-red-500">*</span></label>
              <textarea rows={4} placeholder="Please provide a brief reason for your leave..." className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-shadow text-gray-700 dark:text-gray-300 resize-none"></textarea>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button type="button" className="px-6 py-3 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:bg-gray-950 transition-colors">
                Cancel
              </button>
              <button type="button" className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
