"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient, type PayrollRun } from "@/lib/api-client";

// Zivira_HR_Client_Requirement_1A.docx Phase 1 "Basic Tax Visibility" —
// each payslip already carries its own estimatedTax (see payslip.tsx);
// this view rolls those up across the employee's own approved/locked
// payroll runs (GET /ess/payslips) into a simple year-to-date summary
// instead of duplicating any tax calculation logic.
export default function EssTaxPage() {
  const [rows, setRows] = useState<PayrollRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .essPayslips()
      .then((res) => setRows(res.data))
      .catch(() => setRows([]))
      .finally(() => setIsLoading(false));
  }, []);

  const totalTax = rows.reduce((sum, r) => sum + r.estimatedTax, 0);
  const totalGross = rows.reduce((sum, r) => sum + r.grossEarnings + r.arrears + r.incentive + r.otAmount, 0);

  return (
    <main className="max-w-4xl mx-auto px-6 pt-24 pb-12 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ess" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Tax</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Tax Deducted</p>
          <p className="text-3xl font-black text-gray-900 dark:text-gray-100">₹{totalTax.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Gross Earnings</p>
          <p className="text-3xl font-black text-gray-900 dark:text-gray-100">₹{totalGross.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-950 text-left text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Gross Earnings</th>
              <th className="px-4 py-3">Tax Deducted</th>
              <th className="px-4 py-3">Net Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={4} className="text-center text-gray-400 py-8">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={4} className="text-center text-gray-400 py-8">No payslips yet.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{r.month}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">₹{(r.grossEarnings + r.arrears + r.incentive + r.otAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">₹{r.estimatedTax.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">₹{r.netPay.toLocaleString("en-IN")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
