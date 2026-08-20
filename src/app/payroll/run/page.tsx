"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiClient, type PayrollRun } from "@/lib/api-client";

function currentMonth() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default function RunPayrollPage() {
  const [month, setMonth] = useState(currentMonth());
  const [searchQuery, setSearchQuery] = useState("");
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const load = (m: string) => {
    setIsLoading(true);
    apiClient
      .payrollRuns(m)
      .then((res) => setRuns(res.data))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load payroll runs"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const filteredRuns = runs.filter((r) =>
    (r.employeeName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allLocked = runs.length > 0 && runs.every((r) => r.status === "LOCKED");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await apiClient.generatePayrollRun(month);
      toast.success(`Generated ${res.data.length} payroll row(s) for ${month}.`);
      load(month);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate payroll");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiClient.approvePayrollRun(id);
      toast.success("Payroll row approved.");
      load(month);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    }
  };

  const handleLock = async (id: string) => {
    try {
      await apiClient.lockPayrollRun(id);
      toast.success("Payroll row locked.", { icon: "🔒" });
      load(month);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to lock");
    }
  };

  const handleEditIncentiveTax = async (run: PayrollRun) => {
    const incentiveInput = window.prompt("Incentive amount (₹)?", String(run.incentive ?? 0));
    if (incentiveInput === null) return;
    const taxInput = window.prompt("Estimated Tax — Basic Tax Visibility (₹)?", String(run.estimatedTax ?? 0));
    if (taxInput === null) return;
    const incentive = Number(incentiveInput);
    const estimatedTax = Number(taxInput);
    if (Number.isNaN(incentive) || Number.isNaN(estimatedTax)) {
      toast.error("Enter valid numbers.");
      return;
    }
    try {
      await apiClient.updatePayrollRun(run.id, { incentive, estimatedTax });
      toast.success("Payroll row updated.");
      load(month);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update payroll row");
    }
  };

  const handleLockAll = async () => {
    const approved = runs.filter((r) => r.status === "HR_APPROVED");
    if (approved.length === 0) {
      toast("No HR-approved rows to lock.", { icon: "ℹ️" });
      return;
    }
    await Promise.all(approved.map((r) => apiClient.lockPayrollRun(r.id).catch(() => null)));
    toast.success("Approved payroll rows locked for the month.", { icon: "🔒" });
    load(month);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Run Payroll</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Process salary calculations for the selected month.</p>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${isGenerating ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
          >
            {isGenerating ? "Generating..." : "Generate Payroll"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Payroll Month</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{month}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rows Generated</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{runs.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">HR Approved</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{runs.filter((r) => r.status !== "DRAFT").length}</p>
        </div>
        <div className={`p-6 rounded-xl border shadow-sm ${allLocked ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
          <p className={`text-sm font-medium uppercase tracking-wide ${allLocked ? 'text-green-600' : 'text-orange-600'}`}>Status</p>
          <p className={`text-2xl font-bold mt-1 ${allLocked ? 'text-green-800' : 'text-orange-800'}`}>{allLocked ? "Locked" : runs.length ? "In Progress" : "Not Generated"}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mt-8">
        <div className="p-4 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 dark:text-gray-200">Calculation Preview</h2>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Employee..."
              className="bg-white dark:bg-gray-900 border border-gray-300 pl-8 pr-3 py-1.5 rounded text-gray-600 dark:text-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 w-48"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold text-right">Gross (₹)</th>
                <th className="px-6 py-4 font-semibold text-right">Working Days</th>
                <th className="px-6 py-4 font-semibold text-right text-red-700">LWP Days</th>
                <th className="px-6 py-4 font-semibold text-right text-red-700">LWP Ded. (₹)</th>
                <th className="px-6 py-4 font-semibold text-right text-green-700">Incentive (₹)</th>
                <th className="px-6 py-4 font-semibold text-right text-red-700">Loan EMI (₹)</th>
                <th className="px-6 py-4 font-semibold text-right">Arrears (₹)</th>
                <th className="px-6 py-4 font-semibold text-right text-red-700">Est. Tax (₹)</th>
                <th className="px-6 py-4 font-bold text-right text-gray-900 dark:text-gray-100">Net Pay (₹)</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={12} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Loading...</td></tr>
              ) : filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No payroll rows for {month} yet. Click "Generate Payroll" to create them from active salary structures.
                  </td>
                </tr>
              ) : (
                filteredRuns.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{r.employeeName ?? r.employeeCode}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{r.employeeCode}</p>
                    </td>
                    <td className="px-6 py-4 text-right">{r.grossEarnings.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">{r.workingDays}</td>
                    <td className="px-6 py-4 text-right">{r.lwpDays > 0 ? <span className="text-red-600 font-medium">{r.lwpDays}</span> : "0"}</td>
                    <td className="px-6 py-4 text-right">{r.lwpDeduction > 0 ? <span className="text-red-600 font-medium">-{r.lwpDeduction.toLocaleString()}</span> : "0"}</td>
                    <td className="px-6 py-4 text-right">{r.incentive > 0 ? <span className="text-green-700 font-medium">+{r.incentive.toLocaleString()}</span> : "0"}</td>
                    <td className="px-6 py-4 text-right">{r.loanDeduction > 0 ? <span className="text-red-600 font-medium">-{r.loanDeduction.toLocaleString()}</span> : "0"}</td>
                    <td className="px-6 py-4 text-right">{r.arrears !== 0 ? r.arrears.toLocaleString() : "0"}</td>
                    <td className="px-6 py-4 text-right">{r.estimatedTax > 0 ? <span className="text-red-600 font-medium">-{r.estimatedTax.toLocaleString()}</span> : "0"}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-gray-100">
                      <Link href={`/employees/${r.employeeCode}/payslip`} className="text-orange-600 hover:underline">{r.netPay.toLocaleString()}</Link>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        r.status === "LOCKED" ? "bg-green-100 text-green-700" :
                        r.status === "HR_APPROVED" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {r.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center space-x-3">
                      {r.status !== "LOCKED" && (
                        <button onClick={() => handleEditIncentiveTax(r)} className="font-medium text-xs text-gray-600 dark:text-gray-400 hover:underline">Edit</button>
                      )}
                      {r.status === "DRAFT" && (
                        <button onClick={() => handleApprove(r.id)} className="font-medium text-xs text-orange-600 hover:underline">Approve</button>
                      )}
                      {r.status === "HR_APPROVED" && (
                        <button onClick={() => handleLock(r.id)} className="font-medium text-xs text-green-700 hover:underline">Lock</button>
                      )}
                      {r.status === "LOCKED" && <span className="text-xs text-gray-400">Locked</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={handleLockAll}
          disabled={runs.length === 0 || allLocked}
          className={`px-6 py-3 rounded-lg font-medium transition-colors shadow-sm ${runs.length === 0 || allLocked ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
        >
          {allLocked ? "Locked" : "Lock All Approved"}
        </button>
      </div>

    </div>
  );
}
