"use client";

import Link from "next/link";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const salaryData = [
  { name: 'Mar', amount: 450000 },
  { name: 'Apr', amount: 480000 },
  { name: 'May', amount: 510000 },
  { name: 'Jun', amount: 505000 },
  { name: 'Jul', amount: 540000 },
  { name: 'Aug', amount: 580000 },
];

const deptData = [
  { name: 'Engineering', value: 45 },
  { name: 'Sales', value: 25 },
  { name: 'HR & Admin', value: 10 },
  { name: 'Marketing', value: 20 },
];

const COLORS = ['#ea580c', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Command Center</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Company overview and key metrics for August 2026.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/payroll/run" className="bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-orange-700 transition-colors shadow-sm flex items-center gap-2">
            <span>💳</span> Run Payroll
          </Link>
          <button className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 px-5 py-2.5 rounded-lg font-bold hover:bg-gray-50 dark:bg-gray-950 transition-colors shadow-sm">
            Generate Reports
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide">Total Employees</h3>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center">&uarr; 12%</span>
          </div>
          <p className="text-4xl font-black text-gray-900 dark:text-gray-100">142</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">+15 new hires this month</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide">Today's Attendance</h3>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center">&uarr; 2%</span>
          </div>
          <p className="text-4xl font-black text-gray-900 dark:text-gray-100">94%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">134 Present, 8 Absent/Leave</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide">Monthly Payroll</h3>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded flex items-center">&uarr; 5%</span>
          </div>
          <p className="text-4xl font-black text-gray-900 dark:text-gray-100">₹5.8L</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Estimated payout for August</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide">Pending Actions</h3>
          </div>
          <p className="text-4xl font-black text-gray-900 dark:text-gray-100">12</p>
          <div className="text-sm mt-2 flex gap-3 font-medium">
            <Link href="/leave" className="text-orange-600 hover:underline">8 Leaves</Link>
            <span className="text-gray-300">|</span>
            <Link href="#" className="text-orange-600 hover:underline">4 Documents</Link>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Salary Trends Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Salary Trends (Last 6 Months)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Total Salary']}
                />
                <Bar dataKey="amount" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Headcount Donut Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Headcount by Dept</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
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
            <Link href="/employees" className="flex flex-col items-center justify-center p-6 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl transition-colors border border-orange-100">
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
              <span className="font-bold">Fix Attendance</span>
            </Link>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Live Activity Feed</h3>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
          <div className="p-6 flex-1 overflow-auto max-h-[350px]">
            <div className="space-y-6">
              <div className="flex gap-4 relative">
                <div className="absolute top-8 left-4 w-[2px] h-full bg-gray-100 dark:bg-gray-800 -z-10"></div>
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">AK</div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Arun Kumar <span className="text-gray-500 dark:text-gray-400 font-normal">applied for Sick Leave</span></p>
                  <p className="text-xs text-gray-400 mt-1">10 minutes ago</p>
                </div>
              </div>
              <div className="flex gap-4 relative">
                <div className="absolute top-8 left-4 w-[2px] h-full bg-gray-100 dark:bg-gray-800 -z-10"></div>
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs shrink-0">HR</div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Meena Patel <span className="text-gray-500 dark:text-gray-400 font-normal">verified Aadhar Card for</span> Rahul Sharma</p>
                  <p className="text-xs text-gray-400 mt-1">45 minutes ago</p>
                </div>
              </div>
              <div className="flex gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">SYS</div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">System <span className="text-gray-500 dark:text-gray-400 font-normal">flagged 3 late arrivals in Engineering</span></p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
