import Link from "next/link";

export default function HolidaysSettingsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Holiday Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Configure mandatory company holidays and regional observances for the year 2026.</p>
        </div>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm">
          Add Holiday
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div className="flex gap-4">
            <select className="bg-white dark:bg-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option>Year: 2026</option>
              <option>Year: 2027</option>
            </select>
            <select className="bg-white dark:bg-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option>Region: All Locations</option>
              <option>Region: Chennai HQ</option>
              <option>Region: Mumbai Office</option>
            </select>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">12 Holidays Configured</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Holiday Name</th>
                <th className="px-6 py-4 font-semibold">Day of Week</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              
              <tr className="hover:bg-gray-50 dark:bg-gray-950 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">01 Jan 2026</td>
                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">New Year's Day</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Thursday</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide">National</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-orange-600 hover:text-orange-800 font-medium">Edit</button>
                </td>
              </tr>

              <tr className="hover:bg-gray-50 dark:bg-gray-950 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">26 Jan 2026</td>
                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">Republic Day</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Monday</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide">National</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-orange-600 hover:text-orange-800 font-medium">Edit</button>
                </td>
              </tr>

              <tr className="hover:bg-gray-50 dark:bg-gray-950 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">15 Aug 2026</td>
                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">Independence Day</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Saturday</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide">National</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-orange-600 hover:text-orange-800 font-medium">Edit</button>
                </td>
              </tr>
              
              <tr className="hover:bg-gray-50 dark:bg-gray-950 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">11 Nov 2026</td>
                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">Diwali</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Wednesday</td>
                <td className="px-6 py-4">
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Regional</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-orange-600 hover:text-orange-800 font-medium">Edit</button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
