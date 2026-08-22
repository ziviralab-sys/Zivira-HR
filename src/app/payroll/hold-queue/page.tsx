"use client";
// src/app/payroll/hold-queue/page.tsx
// Zivira_Project_Basic.docx Topic 3 — Salary Integration Engine.
//
// This is the compliance salary-hold queue (chronic DCR defaulters), not
// the monthly Payroll Run under /payroll/run. It reads/writes the exact
// same backend PayrollStatusModel the Admin portal's "Payroll — Compliance
// Hold Queue" page and the Manager portal's "Team Payroll Status" section
// already use, via the shared /company/analytics/payroll endpoints — so a
// release from HR here shows up in Admin and Manager immediately, and vice
// versa, with no separate sync needed.
//
// New file — purely additive, does not touch the existing Payroll Run flow.
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiClient, type PayrollHoldRow, type PayrollHoldSummary } from "@/lib/api-client";

const STATUS_STYLE: Record<string, string> = {
  HOLD: "bg-red-100 text-red-700",
  EXPLANATION_SUBMITTED: "bg-yellow-100 text-yellow-700",
  RELEASED: "bg-green-100 text-green-700"
};

export default function PayrollHoldQueuePage() {
  const [rows, setRows] = useState<PayrollHoldRow[]>([]);
  const [summary, setSummary] = useState<PayrollHoldSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await apiClient.payrollHoldQueue();
      setRows(res.data);
      setSummary(res.summary);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load payroll hold queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function release(id: string) {
    setBusyId(id);
    try {
      await apiClient.releasePayrollHold(id);
      toast.success("Payroll released.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Release failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Salary Integration — Payroll Status</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Auto-held for chronic defaulters (missed &gt;5 working-day DCRs in the last 30 days); released once the manager approves the employee&apos;s explanation.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">On Hold</p>
            <p className="text-2xl font-black text-red-600">{summary.onHold}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Pending Manager Approval</p>
            <p className="text-2xl font-black text-yellow-600">{summary.pendingApproval}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <p className="text-2xl font-black text-green-600">{summary.released}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Released</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-500 dark:text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Hold Reason</th>
              <th className="px-4 py-3">Employee Explanation</th>
              <th className="px-4 py-3">Manager Approved By</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{r.employeeName ?? r.employeeCode}</span>{" "}
                  <span className="text-gray-400 text-xs">({r.employeeCode})</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{r.role ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 max-w-xs">{r.holdReason ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 max-w-xs">{r.employeeExplanation ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{r.managerApprovedByName ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[r.status] ?? STATUS_STYLE.RELEASED}`}>
                    {r.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {r.status !== "RELEASED" ? (
                    <button
                      onClick={() => release(r.id)}
                      disabled={busyId === r.id}
                      className="px-3 py-1.5 bg-[#f58013] text-white rounded-md font-medium text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {busyId === r.id ? "Releasing…" : "Force Release"}
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs">Released</span>
                  )}
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">No payroll status records for this month yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
