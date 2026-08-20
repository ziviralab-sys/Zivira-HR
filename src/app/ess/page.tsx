"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient, getStoredUser, type Employee, type Attendance, type PayrollRun, type Holiday } from "@/lib/api-client";

// Zivira_HR_Client_Requirement_1A.docx §31 RBAC — Employee sees own
// Profile/Attendance/Leave/Payslip/Tax/Loans/Documents only. Everything
// below is scoped to the logged-in employee via /ess/* (requireEmployee).
export default function EmployeeDashboardPage() {
  const [profile, setProfile] = useState<(Employee & { onboardingStatus: string }) | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payslips, setPayslips] = useState<PayrollRun[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const month = new Date().toISOString().slice(0, 7);
    Promise.all([
      apiClient.essProfile(),
      apiClient.essAttendance(month),
      apiClient.essPayslips(),
      apiClient.holidays()
    ])
      .then(([profileRes, attRes, paysRes, holRes]) => {
        setProfile(profileRes.data);
        setAttendance(attRes.data);
        setPayslips(paysRes.data);
        setHolidays(holRes.data.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const displayName = String(getStoredUser()?.displayName ?? profile?.name ?? "there");
  const firstName = displayName.split(" ")[0];
  const presentDays = attendance.filter((a) => a.status === "PRESENT").length;
  const latestPayslip = payslips[0] ?? null;

  return (
    <>
      <main className="w-full px-6 pt-24 pb-12 space-y-8">

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl shadow-md p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome, {firstName}! 👋</h2>
            <p className="text-orange-100 text-lg">
              {profile?.onboardingStatus && profile.onboardingStatus !== "COMPLETED"
                ? `Your onboarding is ${profile.onboardingStatus.replace(/_/g, " ").toLowerCase()}.`
                : "Here is your quick summary."}
            </p>
          </div>
          {profile?.onboardingStatus && profile.onboardingStatus !== "COMPLETED" && profile.onboardingStatus !== "SUBMITTED" && (
            <Link href="/onboarding/me/form" className="bg-white dark:bg-gray-900 text-orange-700 hover:bg-orange-50 px-6 py-3 rounded-xl font-bold shadow-sm transition-colors whitespace-nowrap">
              Continue Onboarding
            </Link>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide">Attendance (This Month)</h3>
                <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{isLoading ? "…" : presentDays} <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Days Present</span></p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide">Leave</h3>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Apply or review status</p>
              </div>
            </div>
            <Link href="/ess/leave/apply" className="text-orange-600 text-sm font-semibold hover:underline flex items-center gap-1">
              Apply for Leave <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide">Last Payslip</h3>
                <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{latestPayslip ? latestPayslip.month : "—"}</p>
              </div>
            </div>
            <Link href="/ess/payslips" className="text-orange-600 text-sm font-semibold hover:underline flex items-center gap-1">
              View Payslip <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Upcoming Holidays</h3>
            <div className="space-y-4">
              {holidays.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No holidays configured yet.</p>}
              {holidays.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                  <span className="font-bold text-gray-800 dark:text-gray-200">{h.otherHolidayDescription ?? h.weekendHoliday ?? h.stateName}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{h.otherHolidayDate ? String(h.otherHolidayDate).slice(0, 10) : h.stateName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
