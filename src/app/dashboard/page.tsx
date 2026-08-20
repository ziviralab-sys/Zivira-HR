"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer
} from 'recharts';
import { apiClient, type HrDashboard, type Employee, type LeaveApplication, type Onboarding } from "@/lib/api-client";

const COLORS = ['#ea580c', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899'];

// Zivira_HR_Client_Requirement_1A.docx Phase 1 MVP "Admin/HR Dashboard" —
// every figure below comes from GET /company/hr-dashboard plus the
// Employees/Leave/Onboarding lists, replacing the previous hardcoded
// "142 employees / 94% attendance / ₹5.8L payroll" mock numbers.
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<HrDashboard | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pendingLeave, setPendingLeave] = useState<LeaveApplication[]>([]);
  const [onboardingRows, setOnboardingRows] = useState<Onboarding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      apiClient.hrDashboard(),
      apiClient.employees(),
      apiClient.leaveApplications("PENDING"),
      apiClient.onboardingList()
    ])
      .then(([dashRes, empRes, leaveRes, onbRes]) => {
        setStats(dashRes.data);
        setEmployees(empRes.data);
        setPendingLeave(leaveRes.data.slice(0, 5));
        setOnboardingRows(onbRes.data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const deptCounts = employees.reduce<Record<string, number>>((acc, e) => {
    const key = e.division || "Unassigned";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const deptData = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));

  const attendanceTotal = (stats?.presentToday ?? 0) + (stats?.absentOrLeaveToday ?? 0);
  const attendancePct = attendanceTotal > 0 ? Math.round(((stats?.presentToday ?? 0) / attendanceTotal) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Command Center</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Company overview for {stats ? new Date(`${stats.payrollMonth}-01`).toLocaleString("en-IN", { month: "long", year: "numeric" }) : "this month"}.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/payroll/run" className="bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-orange-700 transition-colors shadow-sm flex items-center gap-2">
            <span>💳</span> Run Payroll
          </Link>
          <Link href="/reports" className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 px-5 py-2.5 rounded-lg font-bold hover:bg-gray-50 dark:bg-gray-950 transition-colors shadow-sm">
            Generate Reports
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide mb-4">Total Employees</h3>
          <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{isLoading ? "…" : stats?.totalEmployees ?? 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{stats?.newJoiners ?? 0} new hires this month</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide mb-4">Today's Attendance</h3>
          <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{isLoading ? "…" : `${attendancePct}%`}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{stats?.presentToday ?? 0} Present, {stats?.absentOrLeaveToday ?? 0} Absent/Leave</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide mb-4">Payroll Rows ({stats?.payrollMonth ?? "—"})</h3>
          <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{isLoading ? "…" : stats?.payrollRowsGenerated ?? 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{stats?.payrollLocked ? "Locked for this month" : "Not yet locked"}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide mb-4">Pending Actions</h3>
          <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{isLoading ? "…" : (stats?.pendingLeaveApprovals ?? 0) + (stats?.pendingOnboarding ?? 0)}</p>
          <div className="text-sm mt-2 flex gap-3 font-medium">
            <Link href="/leave" className="text-orange-600 hover:underline">{stats?.pendingLeaveApprovals ?? 0} Leaves</Link>
            <span className="text-gray-300">|</span>
            <Link href="/onboarding" className="text-orange-600 hover:underline">{stats?.pendingOnboarding ?? 0} Onboarding</Link>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Onboarding pipeline */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Onboarding Pipeline</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900">
              <p className="text-sm font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wide">Pending</p>
              <p className="text-5xl font-black text-orange-700 dark:text-orange-400 mt-2">{stats?.pendingOnboarding ?? 0}</p>
            </div>
            <div className="p-6 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900">
              <p className="text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">Completed</p>
              <p className="text-5xl font-black text-green-700 dark:text-green-400 mt-2">{stats?.completedOnboarding ?? 0}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {onboardingRows.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No onboarding records yet.</p>}
            {onboardingRows.map((o) => (
              <div key={o.id} className="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-800 pb-2">
                <span className="font-medium text-gray-800 dark:text-gray-200">{o.employeeName ?? o.employeeCode}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{o.status.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Headcount Donut Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Headcount by Division</h3>
          <div className="flex-1 min-h-[250px]">
            {deptData.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 text-center">No employees yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Quick Actions</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4 flex-1">
            <Link href="/employees/add" className="flex flex-col items-center justify-center p-6 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl transition-colors border border-orange-100">
              <span className="text-2xl mb-2">👥</span>
              <span className="font-bold">Add Employee</span>
            </Link>
            <Link href="/leave" className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors border border-green-100">
              <span className="text-2xl mb-2">✅</span>
              <span className="font-bold">Approve Leaves</span>
            </Link>
            <Link href="/settings/payroll" className="flex flex-col items-center justify-center p-6 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors border border-purple-100">
              <span className="text-2xl mb-2">⚙️</span>
              <span className="font-bold">Payroll Settings</span>
            </Link>
            <Link href="/attendance" className="flex flex-col items-center justify-center p-6 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl transition-colors border border-orange-100">
              <span className="text-2xl mb-2">⏱️</span>
              <span className="font-bold">Import Attendance</span>
            </Link>
          </div>
        </div>

        {/* Pending Leave Requests (real) */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pending Leave Requests</h3>
            <Link href="/leave" className="text-sm text-orange-600 hover:underline font-medium">View all</Link>
          </div>
          <div className="p-6 flex-1 overflow-auto max-h-[350px]">
            {pendingLeave.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No pending leave requests.</p>}
            <div className="space-y-4">
              {pendingLeave.map((leave) => (
                <div key={leave.id} className="flex justify-between items-center border-b border-gray-50 dark:border-gray-800 pb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{leave.employeeName ?? leave.employeeCode}</p>
                    <p className="text-xs text-gray-400 mt-1">{leave.leaveType} · {leave.days} day{leave.days === 1 ? "" : "s"}</p>
                  </div>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">PENDING</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
