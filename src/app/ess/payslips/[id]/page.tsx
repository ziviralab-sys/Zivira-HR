"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { apiClient, getStoredUser, type PayrollRun } from "@/lib/api-client";

// Employee's own single payslip — GET /ess/payslips/:id (requireEmployee,
// scoped to req.auth.employeeCode so an employee can never view a
// colleague's payslip by guessing an id).
export default function ESSPayslipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [run, setRun] = useState<PayrollRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .essPayslip(id)
      .then((res) => setRun(res.data))
      .catch(() => setRun(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const user = getStoredUser();

  if (isLoading) return <main className="max-w-3xl mx-auto px-6 pt-24 pb-12 text-center text-gray-400">Loading…</main>;

  if (!run) {
    return (
      <main className="max-w-3xl mx-auto px-6 pt-24 pb-12 text-center text-gray-500 dark:text-gray-400">
        <p>Payslip not found.</p>
        <Link href="/ess/payslips" className="text-orange-600 hover:underline mt-2 inline-block">Back to Payslips</Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 pt-24 pb-12 space-y-6">
      {/* Scope printing/"Save as PDF" to just the payslip card — without
          this, the browser printed the whole page (top nav bar, "Back to
          Payslips" link, etc.) along with the payslip, producing 2 sheets
          of paper for a 1-page document. */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #payslip-print-area, #payslip-print-area * { visibility: visible; }
          #payslip-print-area {
            position: absolute;
            inset: 0;
            width: 100%;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
      <div className="flex items-center justify-between print:hidden">
        <Link href="/ess/payslips" className="text-orange-600 hover:underline font-medium text-sm">&larr; Back to Payslips</Link>
        <button onClick={() => window.print()} className="px-4 py-2 rounded-lg font-medium bg-orange-600 text-white hover:bg-orange-700">Print / Save as PDF</button>
      </div>

      <div id="payslip-print-area" className="bg-white dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-800 shadow-lg p-12 print:shadow-none print:border-none">
        <div className="text-center mb-10 pb-6 border-b-2 border-gray-800">
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">Zivira Labs Pvt. Ltd.</h1>
          <h2 className="text-xl font-bold text-orange-800 mt-6 uppercase tracking-wider">
            Payslip for {new Date(`${run.month}-01`).toLocaleString("en-IN", { month: "long", year: "numeric" })}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-10 text-sm">
          <div className="grid grid-cols-2">
            <span className="font-semibold text-gray-600 dark:text-gray-400">Employee Name:</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{String(user?.displayName ?? run.employeeName ?? "")}</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-semibold text-gray-600 dark:text-gray-400">Employee Code:</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{run.employeeCode}</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-semibold text-gray-600 dark:text-gray-400">Working Days:</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{run.workingDays}</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-semibold text-gray-600 dark:text-gray-400">LWP Days:</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium text-red-600">{run.lwpDays}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-0 border border-gray-300">
          <div className="border-r border-gray-300 flex flex-col">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 font-bold text-gray-800 dark:text-gray-200 border-b border-gray-300 flex justify-between">
              <span>Earnings</span><span>Amount (₹)</span>
            </div>
            <div className="p-4 space-y-3 text-sm flex-1">
              <div className="flex justify-between"><span>Basic</span><span className="font-medium">{run.basic.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>HRA</span><span className="font-medium">{run.hra.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Special Allowance</span><span className="font-medium">{run.allowance.toLocaleString("en-IN")}</span></div>
              {run.arrears !== 0 && <div className="flex justify-between"><span>Arrears</span><span className="font-medium">{run.arrears.toLocaleString("en-IN")}</span></div>}
              {run.incentive > 0 && <div className="flex justify-between"><span>Incentive</span><span className="font-medium text-green-700">{run.incentive.toLocaleString("en-IN")}</span></div>}
              {run.otAmount > 0 && <div className="flex justify-between"><span>Overtime ({run.otHours}h)</span><span className="font-medium">{run.otAmount.toLocaleString("en-IN")}</span></div>}
            </div>
            <div className="bg-gray-50 dark:bg-gray-950 p-3 font-bold border-t border-gray-300 flex justify-between">
              <span>Gross Earnings (A)</span><span>{(run.grossEarnings + run.arrears + run.incentive + run.otAmount).toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 font-bold text-gray-800 dark:text-gray-200 border-b border-gray-300 flex justify-between">
              <span>Deductions</span><span>Amount (₹)</span>
            </div>
            <div className="p-4 space-y-3 text-sm flex-1">
              <div className="flex justify-between"><span>LWP Deduction</span><span className="font-medium">{run.lwpDeduction.toLocaleString("en-IN")}</span></div>
              {run.loanDeduction > 0 && <div className="flex justify-between"><span>Loan EMI</span><span className="font-medium">{run.loanDeduction.toLocaleString("en-IN")}</span></div>}
              {run.pfEmployee > 0 && <div className="flex justify-between"><span>Provident Fund (PF)</span><span className="font-medium">{run.pfEmployee.toLocaleString("en-IN")}</span></div>}
              {run.professionalTax > 0 && <div className="flex justify-between"><span>Professional Tax (PT)</span><span className="font-medium">{run.professionalTax.toLocaleString("en-IN")}</span></div>}
              {run.esiEmployee > 0 && <div className="flex justify-between"><span>ESI</span><span className="font-medium">{run.esiEmployee.toLocaleString("en-IN")}</span></div>}
              {run.estimatedTax > 0 && <div className="flex justify-between"><span>Estimated Tax</span><span className="font-medium text-red-700">{run.estimatedTax.toLocaleString("en-IN")}</span></div>}
            </div>
            <div className="bg-gray-50 dark:bg-gray-950 p-3 font-bold border-t border-gray-300 flex justify-between">
              <span>Total Deductions (B)</span><span>{(run.lwpDeduction + run.loanDeduction + run.pfEmployee + run.professionalTax + run.esiEmployee + run.estimatedTax).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-300 border-t-0 bg-orange-50 p-4 flex justify-between items-center">
          <span className="text-lg font-bold text-orange-900">NET PAY (A - B)</span>
          <span className="text-2xl font-black text-orange-900">₹{run.netPay.toLocaleString("en-IN")}</span>
        </div>

        <div className="mt-12 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
          This is a computer generated document and does not require a signature.
        </div>
      </div>
    </main>
  );
}
