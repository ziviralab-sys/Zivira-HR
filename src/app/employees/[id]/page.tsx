"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import { apiClient, addSavedCredential, type Employee, type Onboarding, type Attendance, type LeaveApplication } from "@/lib/api-client";

export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 15+, params is a Promise in client components and must be unwrapped
  const { id: employeeId } = use(params);

  const [activeTab, setActiveTab] = useState("Overview");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leave, setLeave] = useState<LeaveApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [credentials, setCredentials] = useState<{
    username: string;
    tempPassword: string;
    emailSent?: boolean;
    note?: string;
    // New request item 2 — the trigger-mail response now also reports
    // whether a copy went to the employee's personal email.
    personalEmailSent?: boolean;
    personalEmailNote?: string;
  } | null>(null);

  const load = () => {
    setIsLoading(true);
    const month = new Date().toISOString().slice(0, 7);
    Promise.all([
      apiClient.employees(),
      apiClient.onboarding(employeeId).catch(() => ({ data: null as Onboarding | null })),
      apiClient.attendance({ employeeCode: employeeId, month }),
      apiClient.leaveApplications()
    ])
      .then(([empRes, onbRes, attRes, leaveRes]) => {
        setEmployee(empRes.data.find((e) => e.employeeCode === employeeId) ?? null);
        setOnboarding(onbRes.data);
        setAttendance(attRes.data);
        setLeave(leaveRes.data.filter((l) => l.employeeCode === employeeId));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleGenerateOnboarding = async () => {
    setIsBusy(true);
    try {
      await apiClient.generateOnboarding(employeeId);
      toast.success("Onboarding generated.");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate onboarding");
    } finally {
      setIsBusy(false);
    }
  };

  const handleTriggerMail = async () => {
    setIsBusy(true);
    try {
      const res = await apiClient.triggerOnboardingMail(employeeId);
      // Item 2 — the backend now actually sends this employee's login
      // credentials to their own email (Employee Master's `email` field),
      // and reports back whether it did (`emailSent`) plus a human-readable
      // `note` covering the "no email on file" fallback case.
      const typed = res as unknown as {
        credentials?: { username: string; tempPassword: string };
        emailSent?: boolean;
        note?: string;
        personalEmailSent?: boolean;
        personalEmailNote?: string;
      };
      const creds = typed.credentials;
      if (creds) {
        // Stays open until HR explicitly chooses Save or Dismiss — it must
        // not auto-vanish, since this is the only place the temp password
        // is ever shown.
        setCredentials({
          ...creds,
          emailSent: typed.emailSent,
          note: typed.note,
          personalEmailSent: typed.personalEmailSent,
          personalEmailNote: typed.personalEmailNote
        });
        if (typed.emailSent) toast.success(`Onboarding email sent.`);
        if (typed.personalEmailSent) toast.success(`Also sent to the employee's personal email.`);
      } else {
        toast.success("Onboarding email triggered.");
      }
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to trigger onboarding mail");
    } finally {
      setIsBusy(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-5xl mx-auto py-12 text-center text-gray-400">Loading…</div>;
  }

  if (!employee) {
    return <div className="max-w-5xl mx-auto py-12 text-center text-gray-400">Employee {employeeId} not found.</div>;
  }

  const handleSaveCredentials = () => {
    if (!credentials) return;
    addSavedCredential({
      employeeCode: employeeId,
      employeeName: employee.name,
      username: credentials.username,
      tempPassword: credentials.tempPassword
    });
    toast.success("Saved — you'll find these under the notification bell.");
    setCredentials(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {credentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setCredentials(null)}>
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-1">Login Credentials Generated</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {credentials.emailSent
                ? (credentials.note ?? "An email with these credentials was sent to the employee.")
                : (credentials.note ?? "This employee has no email on file — share these credentials with them directly, or Save to keep them under your notifications.")}
            </p>
            {credentials.personalEmailNote && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 -mt-2">{credentials.personalEmailNote}</p>
            )}
            <div className="bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Employee ID</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{credentials.username}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Temp Password</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{credentials.tempPassword}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCredentials(null)}
                className="px-5 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Disappear
              </button>
              <button
                onClick={handleSaveCredentials}
                className="px-5 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Employee Profile</h1>
        <div className="flex gap-3">
          {!onboarding ? (
            <button
              onClick={handleGenerateOnboarding}
              disabled={isBusy}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50"
            >
              Generate Onboarding
            </button>
          ) : onboarding.status === "INITIATED" ? (
            <button
              onClick={handleTriggerMail}
              disabled={isBusy}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50"
            >
              Trigger Onboarding Mail
            </button>
          ) : (
            <Link href={`/employees/${employeeId}/documents`} className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Review Onboarding
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-8 flex items-start gap-8 border-b border-gray-100 dark:border-gray-800">
          <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-3xl font-bold">
            {employee.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{employee.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{employeeId}</p>
            <div className="flex gap-4 mt-4 text-sm">
              <span className={`px-3 py-1 rounded-full font-medium ${employee.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>{employee.status}</span>
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">Onboarding: {onboarding?.status.replace(/_/g, " ") ?? "Not Started"}</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Employment Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-12">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Designation</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{employee.designation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Division</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{employee.division}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Joining Date</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{employee.joinDate ? String(employee.joinDate).slice(0, 10) : "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Official Email</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{employee.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Personal Email</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{employee.personalEmail ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reporting Manager</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{employee.reportingManager ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Territory</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{employee.territory}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Driving License</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{(employee as any).drivingLicense ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mt-6">
        <button
          onClick={() => setActiveTab("Overview")}
          className={`px-6 py-3 font-medium ${activeTab === 'Overview' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("Attendance")}
          className={`px-6 py-3 font-medium ${activeTab === 'Attendance' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          Attendance
        </button>
        <button
          onClick={() => setActiveTab("Leave")}
          className={`px-6 py-3 font-medium ${activeTab === 'Leave' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          Leave
        </button>
        <Link href={`/employees/${employeeId}/payroll`} className="px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 font-medium">Payroll</Link>
        <Link href={`/employees/${employeeId}/documents`} className="px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 font-medium">Documents</Link>
        <Link href={`/employees/${employeeId}/payslip`} className="px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 font-medium">Payslips</Link>
      </div>

      {activeTab === "Attendance" && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mt-6">
          {attendance.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6">No attendance recorded this month.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <tr><th className="py-2">Date</th><th className="py-2">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {attendance.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2 text-gray-800 dark:text-gray-200">{a.attendanceDate?.slice(0, 10)}</td>
                    <td className="py-2 text-gray-800 dark:text-gray-200">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "Leave" && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mt-6">
          {leave.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6">No leave history.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <tr><th className="py-2">Type</th><th className="py-2">Dates</th><th className="py-2">Days</th><th className="py-2">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {leave.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 text-gray-800 dark:text-gray-200">{l.leaveType}</td>
                    <td className="py-2 text-gray-800 dark:text-gray-200">{l.fromDate?.slice(0, 10)} - {l.toDate?.slice(0, 10)}</td>
                    <td className="py-2 text-gray-800 dark:text-gray-200">{l.days}</td>
                    <td className="py-2 text-gray-800 dark:text-gray-200">{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
}
