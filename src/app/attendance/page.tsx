"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { apiClient, type Attendance, type Employee } from "@/lib/api-client";
import { CustomDatePicker } from "@/components/CustomDatePicker";

const STATUS_STYLES: Record<Attendance["status"], string> = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LEAVE: "bg-yellow-100 text-yellow-700"
};

function formatTime(iso?: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// Request (item 4) — the "Correct"/"Add Punch" edit boxes used to pre-fill
// via `new Date(iso).toISOString().slice(11,16)`, which is always the UTC
// clock time. The read-only table cell right next to it uses
// `toLocaleTimeString("en-IN", ...)`, which renders in the VIEWER'S local
// timezone. Those two only agree when the browser's local timezone happens
// to be UTC, so on any IST machine the edit box showed a different (wrong)
// time than the table — and saving it back (see saveRow below) baked that
// same UTC/local mismatch into the stored value, corrupting it further on
// every "correction". isoToLocalHHMM reads the same local wall-clock
// components `toLocaleTimeString` renders, so the edit box always starts
// out matching exactly what the table already shows.
function isoToLocalHHMM(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Builds the punch instant from the date + the HH:MM the HR user actually
// sees/types (both already local wall-clock), using the multi-arg Date
// constructor — which JS interprets as LOCAL time — then serializes with
// toISOString() so the backend receives an explicit, unambiguous UTC
// instant (no more sending a bare "no-Z" string that the server has to
// guess the timezone of).
function localDateTimeToISO(dateStr: string, timeStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) return undefined;
  return new Date(y, m - 1, d, hh, mm, 0).toISOString();
}

function workingHours(checkInAt?: string | null, checkOutAt?: string | null) {
  if (!checkInAt) return null;
  if (!checkOutAt) return "Currently Working";
  const ms = new Date(checkOutAt).getTime() - new Date(checkInAt).getTime();
  if (ms <= 0) return null;
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.round((ms % 3600000) / 60000);
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

// Zivira_HR_Client_Requirement_1A.docx Phase 1 MVP "Attendance Import" —
// manual/bulk Punch In & Punch Out entry, backed by POST
// /company/attendance/import (checkInAt/checkOutAt) and GET
// /company/attendance. Biometric device sync is explicitly a Phase 2 item
// in the doc's own scope split, so that button stays disabled here rather
// than faking a device connection.
export default function AttendanceRegisterPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: "PRESENT" as Attendance["status"], checkIn: "", checkOut: "" });
  const [isSavingRow, setIsSavingRow] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const byEmployee = useMemo(() => {
    const map: Record<string, Attendance> = {};
    recordsForDate.forEach((r) => { map[r.employeeCode] = r; });
    return map;
  }, [recordsForDate]);

  const counts = { PRESENT: 0, ABSENT: 0, LEAVE: 0 };
  recordsForDate.forEach((r) => { counts[r.status]++; });

  const openEditor = (employeeCode: string) => {
    const existing = byEmployee[employeeCode];
    setEditForm({
      status: existing?.status ?? "PRESENT",
      checkIn: existing?.checkInAt ? isoToLocalHHMM(existing.checkInAt) : "",
      checkOut: existing?.checkOutAt ? isoToLocalHHMM(existing.checkOutAt) : ""
    });
    setEditingCode(employeeCode);
  };

  const saveRow = async () => {
    if (!editingCode) return;
    setIsSavingRow(true);
    try {
      await apiClient.importAttendance([{
        employeeCode: editingCode,
        attendanceDate: selectedDate,
        status: editForm.status,
        checkInAt: editForm.checkIn ? localDateTimeToISO(selectedDate, editForm.checkIn) : undefined,
        checkOutAt: editForm.checkOut ? localDateTimeToISO(selectedDate, editForm.checkOut) : undefined
      }]);
      toast.success("Attendance saved.");
      setEditingCode(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save attendance");
    } finally {
      setIsSavingRow(false);
    }
  };

  // Import Excel/CSV — expects columns: employeeCode,date,status,checkIn,checkOut
  // (date = YYYY-MM-DD, checkIn/checkOut = HH:MM, both optional).
  const handleImportFile = async (file: File | null) => {
    if (!file) return;
    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.trim().split(/\r?\n/);
      const header = lines[0].toLowerCase();
      const startIdx = header.includes("employeecode") ? 1 : 0;
      const rows = lines.slice(startIdx).filter(Boolean).map((line) => {
        const [employeeCode, date, status, checkIn, checkOut] = line.split(",").map((v) => v.trim());
        return {
          employeeCode,
          attendanceDate: date,
          status: (status?.toUpperCase() || "PRESENT") as Attendance["status"],
          checkInAt: checkIn ? `${date}T${checkIn}:00` : undefined,
          checkOutAt: checkOut ? `${date}T${checkOut}:00` : undefined
        };
      });
      if (rows.length === 0) {
        toast.error("No rows found in the file.");
        return;
      }
      const res = await apiClient.importAttendance(rows);
      toast.success(`Imported ${res.data.imported} row(s).${res.data.errors.length ? ` ${res.data.errors.length} error(s).` : ""}`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import file");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Attendance Register</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Monitor daily employee attendance, working hours, and correct anomalies.</p>
        </div>
        <div className="flex gap-3">
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleImportFile(e.target.files?.[0] ?? null)} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isImporting ? "Importing..." : "Import Excel/CSV"}
          </button>
          <button
            disabled
            title="Biometric device integration is a Phase 2 item (Zivira_HR_Client_Requirement_1A.docx Phase 2 scope) — not built yet"
            className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg font-medium shadow-sm cursor-not-allowed"
          >
            Sync Biometrics
          </button>
        </div>
      </div>

      {/* Date Filter & Stats */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <CustomDatePicker value={selectedDate} onChange={setSelectedDate} className="w-44" />
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
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Punch In</th>
                <th className="px-6 py-4 font-semibold">Punch Out</th>
                <th className="px-6 py-4 font-semibold">Working Hours</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading…</td></tr>
              )}
              {!isLoading && employees.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No active employees found.</td></tr>
              )}
              {employees.map((emp) => {
                const record = byEmployee[emp.employeeCode];
                const hours = workingHours(record?.checkInAt, record?.checkOutAt);
                const isEditingRow = editingCode === emp.employeeCode;
                return (
                  <tr key={emp.employeeCode} className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!record ? "bg-red-50/30 dark:bg-red-950/20" : ""}`}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{emp.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{emp.employeeCode}</p>
                    </td>
                    {isEditingRow ? (
                      <>
                        <td className="px-6 py-4">
                          <select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as Attendance["status"] }))} className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-950">
                            <option value="PRESENT">PRESENT</option>
                            <option value="ABSENT">ABSENT</option>
                            <option value="LEAVE">LEAVE</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input type="time" value={editForm.checkIn} onChange={(e) => setEditForm((f) => ({ ...f, checkIn: e.target.value }))} className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-950" />
                        </td>
                        <td className="px-6 py-4">
                          <input type="time" value={editForm.checkOut} onChange={(e) => setEditForm((f) => ({ ...f, checkOut: e.target.value }))} className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-950" />
                        </td>
                        <td className="px-6 py-4 text-gray-400">—</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={saveRow} disabled={isSavingRow} className="bg-orange-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-orange-700 shadow-sm disabled:opacity-50">Save</button>
                          <button onClick={() => setEditingCode(null)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 text-xs font-medium">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          {record ? (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[record.status]}`}>{record.status}</span>
                          ) : (
                            <span className="text-xs text-gray-400">Not recorded</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{formatTime(record?.checkInAt) ?? "Missing"}</td>
                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{formatTime(record?.checkOutAt) ?? "Missing"}</td>
                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{hours ?? "0h 0m"}</td>
                        <td className="px-6 py-4 text-right">
                          {record ? (
                            <button onClick={() => openEditor(emp.employeeCode)} className="text-orange-600 hover:text-orange-800 font-medium">Correct</button>
                          ) : (
                            <button onClick={() => openEditor(emp.employeeCode)} className="bg-orange-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-orange-700 shadow-sm">Add Punch</button>
                          )}
                        </td>
                      </>
                    )}
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
