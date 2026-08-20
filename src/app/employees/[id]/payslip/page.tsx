"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { apiClient, type PayrollRun, type Employee } from "@/lib/api-client";

// Zivira_HR_Client_Requirement_1A.docx Phase 1 MVP "Payslip" — rendered
// from a real PayrollRun row (GET /company/payroll/runs, filtered to this
// employee). No email/SMTP service is configured in this environment
// (documented Phase 1 limitation, same as onboarding's "trigger mail"), so
// "Email Payslip" is disabled; "Print / Save as PDF" uses the browser's
// native print dialog instead of fabricating a PDF-generation backend.
export default function EmployeePayslipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const employeeId = id;

  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([apiClient.payrollRuns(), apiClient.employees()])
      .then(([runRes, empRes]) => {
        const mine = runRes.data.filter((r) => r.employeeCode === employeeId).sort((a, b) => b.month.localeCompare(a.month));
        setRuns(mine);
        setSelectedMonth(mine[0]?.month ?? null);
        setEmployee(empRes.data.find((e) => e.employeeCode === employeeId) ?? null);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [employeeId]);

  const run = runs.find((r) => r.month === selectedMonth) ?? null;

  if (isLoading) return <div className="max-w-4xl mx-auto py-12 text-center text-gray-400">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-12">
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-4">
          <Link href={`/employees/${employeeId}`} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Payslip Preview</h1>
        </div>
        <div className="flex gap-3 items-center">
          {runs.length > 0 && (
            <select
              value={selectedMonth ?? ""}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-950"
            >
              {runs.map((r) => <option key={r.id} value={r.month}>{r.month}</option>)}
            </select>
          )}
          <button
            disabled
            title="No email service is configured in this environment"
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-400 cursor-not-allowed"
          >
            Email Payslip
          </button>
          <button
            onClick={() => window.print()}
            disabled={!run}
            className="px-4 py-2 rounded-lg font-medium transition-colors shadow-sm bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      {!run ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-12 text-center text-gray-500 dark:text-gray-400">
          No payroll run found for this employee yet.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-800 shadow-lg p-12 print:shadow-none print:border-none">

          {/* Header */}
          <div className="text-center mb-10 pb-6 border-b-2 border-gray-800">
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">Zivira Labs Pvt. Ltd.</h1>
            <h2 className="text-xl font-bold text-orange-800 mt-6 uppercase tracking-wider">
              Payslip for {new Date(`${run.month}-01`).toLocaleString("en-IN", { month: "long", year: "numeric" })}
            </h2>
          </div>

          {/* Employee Info Grid */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-10 text-sm">
            <div className="grid grid-cols-2">
              <span className="font-semibold text-gray-600 dark:text-gray-400">Employee Name:</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{run.employeeName ?? employee?.name ?? "—"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="font-semibold text-gray-600 dark:text-gray-400">Employee Code:</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{employeeId}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="font-semibold text-gray-600 dark:text-gray-400">Designation:</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{employee?.designation ?? "—"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="font-semibold text-gray-600 dark:text-gray-400">Division:</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{employee?.division ?? "—"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="font-semibold text-gray-600 dark:text-gray-400">Total Working Days:</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{run.workingDays}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="font-semibold text-gray-600 dark:text-gray-400">LWP Days:</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium text-red-600">{run.lwpDays}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="font-semibold text-gray-600 dark:text-gray-400">Status:</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{run.status.replace(/_/g, " ")}</span>
            </div>
          </div>

          {/* Salary Breakdown Table */}
          <div className="grid grid-cols-2 gap-0 border border-gray-300">

            {/* Earnings */}
            <div className="border-r border-gray-300 flex flex-col">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 font-bold text-gray-800 dark:text-gray-200 border-b border-gray-300 flex justify-between">
                <span>Earnings</span>
                <span>Amount (₹)</span>
              </div>
              <div className="p-4 space-y-3 text-sm flex-1">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Basic</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{run.basic.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">HRA</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{run.hra.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Special Allowance</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{run.allowance.toLocaleString("en-IN")}</span>
                </div>
                {run.arrears !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Arrears</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{run.arrears.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {run.incentive > 0 && (
                  <div className="flex justify-between pt-2">
                    <span className="text-gray-900 dark:text-gray-100 font-bold flex items-center gap-2">
                      Incentive
                      {run.incentiveNote && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-sm">{run.incentiveNote}</span>}
                    </span>
                    <span className="font-bold text-green-700">{run.incentive.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-950 p-3 font-bold text-gray-900 dark:text-gray-100 border-t border-gray-300 flex justify-between">
                <span>Gross Earnings (A)</span>
                <span>{(run.grossEarnings + run.arrears + run.incentive).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="flex flex-col">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 font-bold text-gray-800 dark:text-gray-200 border-b border-gray-300 flex justify-between">
                <span>Deductions</span>
                <span>Amount (₹)</span>
              </div>
              <div className="p-4 space-y-3 text-sm flex-1">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">LWP Deduction</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{run.lwpDeduction.toLocaleString("en-IN")}</span>
                </div>
                {run.loanDeduction > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Loan EMI</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{run.loanDeduction.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {run.estimatedTax > 0 && (
                  <div className="flex justify-between pt-2">
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-gray-100 font-bold">Estimated Tax (visibility only)</span>
                    </div>
                    <span className="font-bold text-red-700 mt-0.5">{run.estimatedTax.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-950 p-3 font-bold text-gray-900 dark:text-gray-100 border-t border-gray-300 flex justify-between">
                <span>Total Deductions (B)</span>
                <span>{(run.lwpDeduction + run.loanDeduction + run.estimatedTax).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="border border-gray-300 border-t-0 bg-orange-50 p-4 flex justify-between items-center">
            <span className="text-lg font-bold text-orange-900">NET PAY (A - B)</span>
            <span className="text-2xl font-black text-orange-900">₹{run.netPay.toLocaleString("en-IN")}</span>
          </div>

          {/* Note */}
          <div className="mt-12 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
            This is a computer generated document and does not require a signature. Automated slab-based tax calculation is a Phase 2 item — the Estimated Tax figure above is HR-entered for visibility only.
          </div>

        </div>
      )}
    </div>
  );
}
