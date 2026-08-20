"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient, type SalaryStructure, type Employee } from "@/lib/api-client";

// Zivira_HR_Client_Requirement_1A.docx Phase 1 MVP "Salary Structure" —
// the backend models this as a per-employee Basic/HRA/Allowance % split
// on a CTC figure (see employees/[id]/payroll), not a global configurable
// "component rules engine" — that generic engine was never implemented
// server-side, so this page now shows the real per-employee structures
// instead of a static mock list of components that don't exist as data.
export default function PayrollSettingsPage() {
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiClient.salaryStructures(), apiClient.employees()])
      .then(([structRes, empRes]) => {
        setStructures(structRes.data);
        setEmployees(empRes.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const nameByCode = new Map(employees.map((e) => [e.employeeCode, e.name]));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Salary Structures</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Every active salary structure (Basic / HRA / Allowance split of CTC), across all employees.</p>
        </div>
        <Link href="/employees" className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm">
          Set Up an Employee's Structure
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="p-8 text-center text-gray-400">Loading…</p>
          ) : structures.length === 0 ? (
            <p className="p-8 text-center text-gray-500 dark:text-gray-400">No salary structures configured yet.</p>
          ) : (
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">Employee</th>
                  <th className="px-6 py-4 font-semibold">CTC (Annual)</th>
                  <th className="px-6 py-4 font-semibold">Basic %</th>
                  <th className="px-6 py-4 font-semibold">HRA %</th>
                  <th className="px-6 py-4 font-semibold">Allowance %</th>
                  <th className="px-6 py-4 font-semibold">Effective From</th>
                  <th className="px-6 py-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {structures.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                      <Link href={`/employees/${s.employeeCode}/payroll`} className="hover:text-orange-600">
                        {nameByCode.get(s.employeeCode) ?? s.employeeCode}
                      </Link>
                      <p className="text-xs text-gray-400 font-normal">{s.employeeCode}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">₹{s.ctc.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4">{s.basicPercent}%</td>
                    <td className="px-6 py-4">{s.hraPercent}%</td>
                    <td className="px-6 py-4">{s.allowancePercent}%</td>
                    <td className="px-6 py-4">{s.effectiveFrom?.slice(0, 10)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${s.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-sm text-orange-800 flex items-start gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          Phase 1 keeps salary structure to a simple Basic/HRA/Allowance percentage split per employee, entered on that employee's Payroll tab.
          Automated, slab-based statutory rules (PF, Professional Tax, Income Tax) are a Phase 2 item — see "Basic Tax Visibility" on each payroll run for the current manually-entered figure.
        </p>
      </div>
    </div>
  );
}
