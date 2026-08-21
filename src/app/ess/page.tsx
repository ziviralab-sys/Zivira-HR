"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient, getStoredUser, type Employee, type Attendance, type PayrollRun, type Holiday } from "@/lib/api-client";

// Zivira_HR_Client_Requirement_1A.docx §31 RBAC — Employee sees own
// Profile/Attendance/Leave/Payslip/Tax/Loans/Documents only. Everything
// below is scoped to the logged-in employee via /ess/* (requireEmployee).
// Zivira_HR_Client_Requirement_1A.docx §30 "Employee Self-Service
// Dashboard" tile set (Attendance/Leave/Payslip/Tax/Incentive/Loan),
// extended per product decision with Documents, Onboarding, and Exit so
// every tab from the HR-side Employee Profile view is also one click away
// for the employee themselves.
const TILES: { key: string; label: string; href: string; color: string; icon: JSX.Element }[] = [
  {
    key: "attendance", label: "Attendance", href: "/ess/attendance", color: "text-green-600 bg-green-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    key: "leave", label: "Leave", href: "/ess/leave", color: "text-yellow-600 bg-yellow-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    key: "payslips", label: "Payslips", href: "/ess/payslips", color: "text-purple-600 bg-purple-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    key: "tax", label: "Tax", href: "/ess/tax", color: "text-blue-600 bg-blue-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3v-6m-3 6v-1m-2 6h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    key: "incentives", label: "Incentives", href: "/ess/incentives", color: "text-pink-600 bg-pink-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m9-8a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    key: "loans", label: "Loans", href: "/ess/loans", color: "text-orange-600 bg-orange-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a4 4 0 00-8 0v2M5 9h14l1 12H4L5 9z" />
      </svg>
    )
  },
  {
    key: "documents", label: "Documents", href: "/ess/documents", color: "text-teal-600 bg-teal-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    key: "onboarding", label: "Onboarding", href: "/onboarding/me/form", color: "text-indigo-600 bg-indigo-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    key: "exit", label: "Exit", href: "/ess/exit", color: "text-red-600 bg-red-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    )
  }
];

export default function EmployeeDashboardPage() {
  const [profile, setProfile] = useState<(Employee & { onboardingStatus: string }) | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payslips, setPayslips] = useState<PayrollRun[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    setMustChangePassword(Boolean(getStoredUser()?.mustChangePassword));
  }, []);

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

        {/* Set-password prompt — the temp-password gate now unlocks straight
            into onboarding + this dashboard; the account isn't fully secured
            until a real password is set, so this stays visible (not a
            blocking modal) until that's done. */}
        {mustChangePassword && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-bold text-yellow-900 dark:text-yellow-200">Set Your Password</h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">You're still signed in with your temporary password. Set a permanent one to secure your account.</p>
            </div>
            <Link href="/onboarding/me" className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition-colors whitespace-nowrap">
              Create Password
            </Link>
          </div>
        )}

        {/* Quick Actions — every tab available on the HR-side Employee
            Profile, one click away for the employee themselves. */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {TILES.map((tile) => (
              <Link
                key={tile.key}
                href={tile.href}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col items-center gap-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${tile.color}`}>
                  {tile.icon}
                </div>
                <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{tile.label}</span>
              </Link>
            ))}
          </div>
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
