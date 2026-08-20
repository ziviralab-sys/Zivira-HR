"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

const ROLES = ["NBH", "BH", "RBM", "ZBM", "ABM", "SR_MR", "MR", "OTHER"] as const;

export default function AddEmployeePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    employeeCode: "",
    name: "",
    designation: "",
    division: "",
    territory: "",
    reportingManager: "",
    role: "MR" as (typeof ROLES)[number],
    status: "ACTIVE" as "ACTIVE" | "INACTIVE"
  });

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeCode || !form.name || !form.designation || !form.division || !form.territory) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSaving(true);
    try {
      await apiClient.createEmployee(form);
      toast.success("Employee added successfully!");
      router.push("/employees");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add employee");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employees" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Add New Employee</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee Code</label>
              <input type="text" required value={form.employeeCode} onChange={update("employeeCode")} placeholder="e.g. EMP1025" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input type="text" required value={form.name} onChange={update("name")} placeholder="Full Name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Designation</label>
              <input type="text" required value={form.designation} onChange={update("designation")} placeholder="e.g. Full Stack Developer" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Division</label>
              <input type="text" required value={form.division} onChange={update("division")} placeholder="e.g. Cardiology" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Territory</label>
              <input type="text" required value={form.territory} onChange={update("territory")} placeholder="e.g. Chennai North" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reporting Manager (Employee Code)</label>
              <input type="text" value={form.reportingManager} onChange={update("reportingManager")} placeholder="e.g. EMP001" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
              <select value={form.role} onChange={update("role")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors bg-white dark:bg-gray-900">
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee Status</label>
              <select value={form.status} onChange={update("status")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors bg-white dark:bg-gray-900">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link href="/employees" className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:bg-gray-950 transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={isSaving} className={`px-6 py-2 rounded-lg font-medium transition-colors shadow-sm ${isSaving ? 'bg-orange-400 text-white cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700'}`}>
              {isSaving ? "Saving..." : "Save Employee"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
