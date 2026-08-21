"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient, type Loan } from "@/lib/api-client";

// Employee's own loans — GET /ess/loans (own records only).
export default function EssLoansPage() {
  const [rows, setRows] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .essLoans()
      .then((res) => setRows(res.data))
      .catch(() => setRows([]))
      .finally(() => setIsLoading(false));
  }, []);

  const activeLoans = rows.filter((l) => l.status === "ACTIVE");
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.remainingBalance, 0);

  return (
    <main className="max-w-4xl mx-auto px-6 pt-24 pb-12 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ess" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Loans</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Outstanding</p>
        <p className="text-3xl font-black text-gray-900 dark:text-gray-100">₹{totalOutstanding.toLocaleString("en-IN")}</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-950 text-left text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Started</th>
              <th className="px-4 py-3">Principal</th>
              <th className="px-4 py-3">EMI</th>
              <th className="px-4 py-3">Remaining</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center text-gray-400 py-8">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-gray-400 py-8">No loans on record.</td></tr>
            ) : (
              rows.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{l.startMonth}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">₹{l.principal.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">₹{l.emiAmount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">₹{l.remainingBalance.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{l.reason ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${l.status === "ACTIVE" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>{l.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
