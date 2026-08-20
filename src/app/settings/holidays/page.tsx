"use client";

import { useEffect, useState } from "react";
import { apiClient, type Holiday } from "@/lib/api-client";

export default function HolidaysSettingsPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .holidays()
      .then((res) => setHolidays(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Holiday Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Company holidays and regional observances, imported from the Admin master data.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {isLoading ? "Loading..." : `${holidays.length} Holiday record(s)`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">State</th>
                <th className="px-6 py-4 font-semibold">Weekend Holiday</th>
                <th className="px-6 py-4 font-semibold">Other Holiday Date</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Loading...</td></tr>
              ) : holidays.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No holiday records found.</td></tr>
              ) : (
                holidays.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50 dark:bg-gray-950 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">{h.stateName}</td>
                    <td className="px-6 py-4">{h.weekendHoliday ?? "-"}</td>
                    <td className="px-6 py-4">{h.otherHolidayDate ? new Date(h.otherHolidayDate).toLocaleDateString() : "-"}</td>
                    <td className="px-6 py-4">{h.otherHolidayDescription ?? "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${h.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-gray-400">
        Holiday records are imported from Excel via the Admin Master Setup and are read-only here, matching the existing backend data source.
      </p>
    </div>
  );
}
