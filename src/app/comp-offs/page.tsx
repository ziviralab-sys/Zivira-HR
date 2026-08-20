"use client";

import { useEffect, useState } from "react";
import { apiClient, type CompOff, type Employee } from "@/lib/api-client";

// Phase 2 MVP item "Comp-Off" (Zivira_HR_Client_Requirement_1A.docx §32).
// HR grants a compensatory-off credit here; the employee later spends it
// from ESS's "Apply for Leave" screen (see ess/leave/apply/page.tsx),
// which lists their own AVAILABLE credits via GET /ess/comp-offs.
export default function CompOffsPage() {
  const [rows, setRows] = useState<CompOff[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ employeeCode: "", earnedDate: "", reason: "", expiresOn: "" });

  function load() {
    setIsLoading(true);
    Promise.all([apiClient.compOffs(), apiClient.employees()])
      .then(([compRes, empRes]) => {
        setRows(compRes.data);
        setEmployees(empRes.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.employeeCode || !form.earnedDate || !form.reason) {
      setError("Employee, earned date, and reason are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.grantCompOff({
        employeeCode: form.employeeCode,
        earnedDate: form.earnedDate,
        reason: form.reason,
        expiresOn: form.expiresOn || undefined
      });
      setForm({ employeeCode: "", earnedDate: "", reason: "", expiresOn: "" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to grant Comp-Off");
    } finally {
      setIsSubmitting(false);
    }
  }

  const statusColor: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-700",
    USED: "bg-gray-200 text-gray-600",
    EXPIRED: "bg-red-100 text-red-700"
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Comp-Off</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Grant compensatory-off credits for holiday/weekend work; employees spend them via ESS Apply for Leave.</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm">
          {showForm ? "Cancel" : "+ Grant Comp-Off"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleGrant} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Employee</label>
              <select value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-950">
                <option value="">Select employee…</option>
                {employees.map((emp) => (
                  <option key={emp.employeeCode} value={emp.employeeCode}>{emp.name} ({emp.employeeCode})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Earned Date (worked holiday/weekend)</label>
              <input type="date" value={form.earnedDate} onChange={(e) => setForm({ ...form, earnedDate: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-950" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Reason</label>
              <input type="text" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Worked Republic Day for stockist visit"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-950" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Expires On (optional)</label>
              <input type="date" value={form.expiresOn} onChange={(e) => setForm({ ...form, expiresOn: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-950" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting} className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50">
              {isSubmitting ? "Granting…" : "Grant Comp-Off"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="p-8 text-center text-gray-400">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="p-8 text-center text-gray-500 dark:text-gray-400">No Comp-Off credits granted yet.</p>
          ) : (
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">Employee</th>
                  <th className="px-6 py-4 font-semibold">Earned Date</th>
                  <th className="px-6 py-4 font-semibold">Reason</th>
                  <th className="px-6 py-4 font-semibold">Expires On</th>
                  <th className="px-6 py-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                      {r.employeeName ?? r.employeeCode}
                      <p className="text-xs text-gray-400 font-normal">{r.employeeCode}</p>
                    </td>
                    <td className="px-6 py-4">{r.earnedDate?.slice(0, 10)}</td>
                    <td className="px-6 py-4">{r.reason}</td>
                    <td className="px-6 py-4">{r.expiresOn ? r.expiresOn.slice(0, 10) : "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${statusColor[r.status]}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
