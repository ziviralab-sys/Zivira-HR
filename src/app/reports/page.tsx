"use client";

import { useEffect, useState } from "react";
import { apiClient, type PayrollSummary } from "@/lib/api-client";

// Zivira_HR_Client_Requirement_1A.docx Phase 1 MVP "Reports" — a payroll
// summary for a chosen month plus a CSV export "in the exact format
// Accounts expects" (doc §23), backed by GET /company/reports/payroll-summary
// and GET /company/reports/payroll-export.
export default function ReportsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .payrollSummary(month)
      .then((res) => setSummary(res.data))
      .catch(() => setSummary(null))
      .finally(() => setIsLoading(false));
  }, [month]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Payroll summary and exports for Accounts.</p>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-950"
          />
          <a
            href={apiClient.payrollExportUrl(month)}
            target="_blank"
            rel="noreferrer"
            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm"
          >
            Export CSV
          </a>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-400 py-12">Loading…</p>
      ) : !summary || summary.headcount === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-12 text-center text-gray-500 dark:text-gray-400">
          No payroll run exists for {month} yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Headcount</h3>
              <p className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-2">{summary.headcount}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Gross Earnings</h3>
              <p className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-2">₹{summary.grossEarnings.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Net Pay</h3>
              <p className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-2">₹{summary.netPay.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Est. Tax</h3>
              <p className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-2">₹{summary.estimatedTax.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Deductions Breakdown</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">LWP Deduction</span><span className="font-medium text-gray-900 dark:text-gray-100">₹{summary.lwpDeduction.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Loan Deduction</span><span className="font-medium text-gray-900 dark:text-gray-100">₹{summary.loanDeduction.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Estimated Tax</span><span className="font-medium text-gray-900 dark:text-gray-100">₹{summary.estimatedTax.toLocaleString("en-IN")}</span></div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Additions & Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Incentives</span><span className="font-medium text-gray-900 dark:text-gray-100">₹{summary.incentive.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Arrears</span><span className="font-medium text-gray-900 dark:text-gray-100">₹{summary.arrears.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800"><span className="text-gray-600 dark:text-gray-400">Draft / HR Approved / Locked</span><span className="font-medium text-gray-900 dark:text-gray-100">{summary.draft} / {summary.hrApproved} / {summary.locked}</span></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
