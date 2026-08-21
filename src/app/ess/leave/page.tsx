"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient, type LeaveApplication } from "@/lib/api-client";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700"
};

// Employee's own leave history — GET /ess/leave (own records only).
export default function EssLeavePage() {
  const [rows, setRows] = useState<LeaveApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .essLeave()
      .then((res) => setRows(res.data))
      .catch(() => setRows([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-6 pt-24 pb-12 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/ess" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Leave</h1>
        </div>
        <Link href="/ess/leave/apply" className="px-5 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 shadow-sm">
          Apply for Leave
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-950 text-left text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">To</th>
              <th className="px-4 py-3">Days</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center text-gray-400 py-8">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-gray-400 py-8">No leave applications yet.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{r.leaveType}{r.isCompOff ? " (Comp-Off)" : ""}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.fromDate.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.toDate.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.days}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[r.status] ?? "bg-gray-100 text-gray-600"}`}>{r.status}</span>
                    {r.status === "REJECTED" && r.rejectReason && (
                      <p className="text-xs text-red-500 mt-1">{r.rejectReason}</p>
                    )}
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
