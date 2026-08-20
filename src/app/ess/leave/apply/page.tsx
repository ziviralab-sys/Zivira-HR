"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { apiClient, type LeaveApplication, type CompOff } from "@/lib/api-client";

// Zivira_HR_Client_Requirement_1A.docx §25 Leave Management (employee
// side): Leave Type -> Leave Request. Backed by GET/POST /ess/leave and
// GET /ess/leave/types. There is no leave-balance model in Phase 1, so
// this page shows real leave history instead of a fabricated balance.
export default function ESSLeaveApplyPage() {
  const [leaveTypes, setLeaveTypes] = useState<{ id: string; leaveTypeDesc: string }[]>([]);
  const [history, setHistory] = useState<LeaveApplication[]>([]);
  const [compOffs, setCompOffs] = useState<CompOff[]>([]);
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [compOffId, setCompOffId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => {
    Promise.all([apiClient.essLeaveTypes(), apiClient.essLeave(), apiClient.essCompOffs()])
      .then(([typesRes, leaveRes, compRes]) => {
        setLeaveTypes(typesRes.data);
        setHistory(leaveRes.data);
        setCompOffs(compRes.data.filter((c) => c.status === "AVAILABLE"));
      })
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const duration = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (to < from) return 0;
    return Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
  }, [fromDate, toDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveType || !fromDate || !toDate) {
      toast.error("Please fill in leave type and dates.");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.essApplyLeave({ leaveType, fromDate, toDate, reason, compOffId: compOffId || undefined });
      toast.success(compOffId ? "Comp-Off leave request submitted for HR approval." : "Leave request submitted for HR approval.");
      setLeaveType(""); setFromDate(""); setToDate(""); setReason(""); setCompOffId("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit leave request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 pt-24 pb-12 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Apply for Leave</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Submit a time-off request to HR.</p>
        </div>
        <Link href="/ess" className="text-orange-600 hover:underline font-medium text-sm">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">Recent Requests</h3>
          {history.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No leave requests yet.</p>}
          {history.slice(0, 6).map((l) => (
            <div key={l.id} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{l.leaveType}</h4>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${l.status === "APPROVED" ? "bg-green-100 text-green-700" : l.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{l.status}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.fromDate?.slice(0, 10)} to {l.toDate?.slice(0, 10)} · {l.days} day{l.days === 1 ? "" : "s"}</p>
            </div>
          ))}
        </div>

        <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Leave Type <span className="text-red-500">*</span></label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-shadow text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900"
              >
                <option value="">Select leave type</option>
                {leaveTypes.map((t) => <option key={t.id} value={t.leaveTypeDesc}>{t.leaveTypeDesc}</option>)}
              </select>
            </div>

            {compOffs.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Spend a Comp-Off Credit (optional)</label>
                <select
                  value={compOffId}
                  onChange={(e) => setCompOffId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-shadow text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900"
                >
                  <option value="">Don't use a Comp-Off credit</option>
                  {compOffs.map((c) => (
                    <option key={c.id} value={c.id}>Earned {c.earnedDate?.slice(0, 10)} — {c.reason}</option>
                  ))}
                </select>
                {compOffId && <p className="text-xs text-gray-400 mt-1">This request will be paid time off, spending the selected Comp-Off credit instead of your leave balance.</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date <span className="text-red-500">*</span></label>
                <input type="date" required value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-shadow text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date <span className="text-red-500">*</span></label>
                <input type="date" required value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-shadow text-gray-700 dark:text-gray-300" />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-3 flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Total Duration:</span>
              <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{duration} Day{duration === 1 ? "" : "s"}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason</label>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a brief reason for your leave..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-shadow text-gray-700 dark:text-gray-300 resize-none"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
