"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient, type PayrollRun } from "@/lib/api-client";

// Incentive amounts already live on each PayrollRun (see payslip.tsx's
// EARNINGS section) — this rolls the employee's own approved/locked runs
// (GET /ess/payslips) into a dedicated Incentives view instead of only
// surfacing the figure buried inside each payslip.
export default function EssIncentivesPage() {
  const [rows, setRows] = useState<PayrollRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .essPayslips()
      .then((res) => setRows(res.data))
      .catch(() => setRows([]))
      .finally(() => setIsLoading(false));
  }, []);

  const incentiveRows = rows.filter((r) => r.incentive > 0);
  const totalIncentive = rows.reduce((sum, r) => sum + r.incentive, 0);

  return (
    <main className="max-w-4xl mx-auto px-6 pt-24 pb-12 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ess" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Incentives</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Incentive Earned</p>
        <p className="text-3xl font-black text-gray-900 dark:text-gray-100">₹{totalIncentive.toLocaleString("en-IN")}</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-950 text-left text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Incentive</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={3} className="text-center text-gray-400 py-8">Loading…</td></tr>
            ) : incentiveRows.length === 0 ? (
              <tr><td colSpan={3} className="text-center text-gray-400 py-8">No incentives recorded yet.</td></tr>
            ) : (
              incentiveRows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{r.month}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">₹{r.incentive.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.incentiveNote ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
