"use client";

import { useEffect, useState } from "react";
import { apiClient, type Holiday } from "@/lib/api-client";

// Zivira_HR_Client_Requirement_1A/1B.docx cross-portal reflection
// requirement — the Holiday Master is managed from the Admin portal's
// Master Setup, and this HR screen just reads the same GET
// /company/holidays data the Payroll Run's working-days calculation uses,
// so any change made in Admin shows up here automatically.
export default function HolidaysSettingsPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .holidays()
      .then((res) => setHolidays(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Holiday Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Mandatory company holidays by state, used for the Payroll Run's working-days calculation.</p>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
        Holidays are managed from the Admin portal's Master Setup. Changes made there appear here automatically.
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{holidays.length} Holiday Record{holidays.length === 1 ? "" : "s"} Configured</span>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="p-8 text-center text-gray-400">Loading…</p>
          ) : holidays.length === 0 ? (
            <p className="p-8 text-center text-gray-500 dark:text-gray-400">No holidays configured yet.</p>
          ) : (
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">State</th>
                  <th className="px-6 py-4 font-semibold">Weekend Holiday</th>
                  <th className="px-6 py-4 font-semibold">Other Holiday Date</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {holidays.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">{h.stateName}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{h.weekendHoliday ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{h.otherHolidayDate ? String(h.otherHolidayDate).slice(0, 10) : "—"}</td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{h.otherHolidayDescription ?? "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${h.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>{h.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
