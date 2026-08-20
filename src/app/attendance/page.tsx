"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { apiClient, type Attendance, type Employee } from "@/lib/api-client";

const STATUS_OPTIONS: Attendance["status"][] = ["PRESENT", "ABSENT", "LEAVE"];

const STATUS_STYLES: Record<Attendance["status"], string> = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LEAVE: "bg-yellow-100 text-yellow-700"
};

// Zivira_HR_Client_Requirement_1A.docx Phase 1 MVP "Attendance Import" —
// there is no biometric/Sanyforce integration in Phase 1 (that's Phase 2),
// so this page is HR's manual/bulk attendance entry screen, backed by
// POST /company/attendance/import and GET /company/attendance.
export default function AttendanceRegisterPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [draft, setDraft] = useState<Record<string, Attendance["status"]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const month = selectedDate.slice(0, 7);

  const load = () => {
    setIsLoading(true);
    Promise.all([apiClient.employees(), apiClient.attendance({ month })])
      .then(([empRes, attRes]) => {
        setEmployees(empRes.data.filter((e) => e.status === "ACTIVE"));
        setRecords(attRes.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const recordsForDate = useMemo(
    () => records.filter((r) => r.attendanceDate?.slice(0, 10) === selectedDate),
    [records, selectedDate]
  );
  const statusByEmployee = useMemo(() => {
    const map: Record<string, Attendance["status"]> = {};
    recordsForDate.forEach((r) => { map[r.employeeCode] = r.status; });
    return map;
  }, [recordsForDate]);

  const counts = { PRESENT: 0, ABSENT: 0, LEAVE: 0 };
  recordsForDate.forEach((r) => { counts[r.status]++; });

  const handleSave = async () => {
    const rows = Object.entries(draft).map(([employeeCode, status]) => ({
      employeeCode,
      attendanceDate: selectedDate,
      status
    }));
    if (rows.length === 0) {
      toast.error("Mark at least one employee's attendance before saving.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await apiClient.importAttendance(rows);
      toast.success(`Saved attendance for ${res.data.imported} employee(s).`);
      setDraft({});
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save attendance");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Attendance Register</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Mark daily attendance and import bulk records. Biometric sync is a Phase 2 item.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || Object.keys(draft).length === 0}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {isSaving ? "Saving..." : `Save Changes (${Object.keys(draft).length})`}
        </button>
      </div>

      {/* Date Filter & Stats */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="font-bold text-gray-800 dark:text-gray-200 bg-transparent outline-none px-2"
          />
        </div>

        <div className="flex gap-4">
          <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
            <span className="text-green-800 text-sm font-bold uppercase tracking-wider">Present</span>
            <p className="text-2xl font-black text-green-700">{counts.PRESENT}</p>
          </div>
          <div className="bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
            <span className="text-red-800 text-sm font-bold uppercase tracking-wider">Absent</span>
            <p className="text-2xl font-black text-red-700">{counts.ABSENT}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg">
            <span className="text-yellow-800 text-sm font-bold uppercase tracking-wider">On Leave</span>
            <p className="text-2xl font-black text-yellow-700">{counts.LEAVE}</p>
          </div>
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Recorded Status</th>
                <th className="px-6 py-4 font-semibold text-right">Mark Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">Loading…</td></tr>
              )}
              {!isLoading && employees.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">No active employees found.</td></tr>
              )}
              {employees.map((emp) => {
                const current = statusByEmployee[emp.employeeCode];
                const pending = draft[emp.employeeCode];
                return (
                  <tr key={emp.employeeCode} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{emp.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{emp.employeeCode}</p>
                    </td>
                    <td className="px-6 py-4">
                      {current ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[current]}`}>{current}</span>
                      ) : (
                        <span className="text-xs text-gray-400">Not recorded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={pending ?? current ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, [emp.employeeCode]: e.target.value as Attendance["status"] }))}
                        className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-950"
                      >
                        <option value="" disabled>Select…</option>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
