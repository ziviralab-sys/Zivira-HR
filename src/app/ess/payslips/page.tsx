"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient, type PayrollRun } from "@/lib/api-client";

export default function ESSPayslipsPage() {
  const [payslips, setPayslips] = useState<PayrollRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .essPayslips()
      .then((res) => setPayslips(res.data.sort((a, b) => b.month.localeCompare(a.month))))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-6 pt-24 pb-12 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">My Payslips</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View your monthly salary slips.</p>
        </div>
        <Link href="/ess" className="text-orange-600 hover:underline font-medium text-sm">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <p className="p-8 text-center text-gray-400">Loading…</p>
        ) : payslips.length === 0 ? (
          <p className="p-8 text-center text-gray-500 dark:text-gray-400">No payslips available yet.</p>
        ) : (
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Month & Year</th>
                <th className="px-6 py-4 font-semibold">Net Pay</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {payslips.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                    {new Date(`${p.month}-01`).toLocaleString("en-IN", { month: "long", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">₹{p.netPay.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${p.status === "LOCKED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {p.status === "LOCKED" ? "Paid" : "Approved"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/ess/payslips/${p.id}`} className="text-orange-600 hover:text-orange-800 font-medium">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
