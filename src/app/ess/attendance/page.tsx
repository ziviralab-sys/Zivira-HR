"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiClient, type Attendance } from "@/lib/api-client";
import { CustomDatePicker } from "@/components/CustomDatePicker";

const STATUS_COLOR: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LEAVE: "bg-yellow-100 text-yellow-700"
};

function formatTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function workingHours(inAt?: string | null, outAt?: string | null) {
  if (!inAt || !outAt) return "—";
  const start = new Date(inAt).getTime();
  const end = new Date(outAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return "—";
  const mins = Math.round((end - start) / 60000);
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// Zivira_HR_Client_Requirement_1A.docx §9 Attendance Module, read-only
// employee view of GET /ess/attendance — the exact same AttendanceModel
// rows HR sees in the Attendance Register, scoped to this employee only.
const todayIso = () => new Date().toISOString().slice(0, 10);

export default function EssAttendancePage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPunching, setIsPunching] = useState(false);

  const load = (m: string) => {
    setIsLoading(true);
    apiClient
      .essAttendance(m)
      .then((res) => setRows(res.data))
      .catch(() => setRows([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const presentDays = rows.filter((r) => r.status === "PRESENT").length;
  const absentDays = rows.filter((r) => r.status === "ABSENT").length;
  const leaveDays = rows.filter((r) => r.status === "LEAVE").length;

  // Today's row (if the current month is the one being viewed) drives
  // whether Punch In / Punch Out is available — matches the 1A doc's
  // Attendance Module requirement that the employee can mark their own
  // attendance, which then flows straight into the same records HR sees.
  const todayRow = month === new Date().toISOString().slice(0, 7) ? rows.find((r) => r.attendanceDate.slice(0, 10) === todayIso()) : undefined;
  const canPunchIn = !todayRow?.checkInAt;
  const canPunchOut = Boolean(todayRow?.checkInAt) && !todayRow?.checkOutAt;

  const handlePunch = async (action: "IN" | "OUT") => {
    setIsPunching(true);
    try {
      await apiClient.essPunchAttendance(action);
      toast.success(action === "IN" ? "Punched in!" : "Punched out!");
      load(month);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record attendance");
    } finally {
      setIsPunching(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 pt-24 pb-12 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/ess" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Attendance</h1>
        </div>
        <CustomDatePicker mode="month" value={month} onChange={setMonth} className="w-40" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200">Today — {todayIso()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {todayRow?.checkInAt ? `Punched in at ${formatTime(todayRow.checkInAt)}` : "Not punched in yet"}
            {todayRow?.checkOutAt ? ` · Punched out at ${formatTime(todayRow.checkOutAt)}` : ""}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handlePunch("IN")}
            disabled={!canPunchIn || isPunching}
            className="px-5 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Punch In
          </button>
          <button
            type="button"
            onClick={() => handlePunch("OUT")}
            disabled={!canPunchOut || isPunching}
            className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Punch Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 text-center">
          <p className="text-2xl font-black text-green-600">{presentDays}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 text-center">
          <p className="text-2xl font-black text-red-600">{absentDays}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 text-center">
          <p className="text-2xl font-black text-yellow-600">{leaveDays}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Leave</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-950 text-left text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Punch In</th>
              <th className="px-4 py-3">Punch Out</th>
              <th className="px-4 py-3">Working Hours</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center text-gray-400 py-8">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-gray-400 py-8">No attendance records for {month}.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{r.attendanceDate.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatTime(r.checkInAt)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatTime(r.checkOutAt)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{workingHours(r.checkInAt, r.checkOutAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[r.status] ?? "bg-gray-100 text-gray-600"}`}>{r.status}</span>
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
