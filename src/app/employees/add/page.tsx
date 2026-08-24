"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomDatePicker } from "@/components/CustomDatePicker";

const ROLES = ["NBH", "BH", "RBM", "ZBM", "ABM", "SR_MR", "MR", "OTHER"] as const;

// Zivira_HR_Client_Requirement_1A.docx Phase 1 MVP "Employee Master" —
// the first step of the doc's "complete employee journey" (ADD EMPLOYEE ->
// SAVE -> GENERATE ONBOARDING -> ...). Backed by POST /company/employees.
const EMAIL_DOMAIN = "@zivira.com";

export default function AddEmployeePage() {
  const router = useRouter();
  const [existingEmployees, setExistingEmployees] = useState<Employee[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    employeeCode: "",
    emailLocal: "",
    personalEmail: "",
    name: "",
    designation: "",
    division: "",
    territory: "",
    role: "OTHER" as (typeof ROLES)[number],
    joinDate: "",
    reportingManager: "",
    drivingLicense: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE"
  });

  useEffect(() => {
    apiClient.employees().then((res) => setExistingEmployees(res.data)).catch(() => {});
  }, []);

  const update = (field: keyof typeof form, value: string) => setForm((p) => ({ ...p, [field]: value }));

  // Employee Code must be unique — checked live against every already-loaded
  // employee (case/whitespace-insensitive) so HR sees the conflict the
  // moment they type it, not after a failed save round-trip to the backend.
  const normalizedCode = form.employeeCode.trim().toUpperCase();
  const isDuplicateCode =
    normalizedCode.length > 0 &&
    existingEmployees.some((emp) => emp.employeeCode.trim().toUpperCase() === normalizedCode);

  const email = form.emailLocal.trim() ? `${form.emailLocal.trim()}${EMAIL_DOMAIN}` : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeCode || !form.name || !form.designation || !form.division || !form.territory) {
      toast.error("Employee Code, Name, Designation, Division, and Territory are required.");
      return;
    }
    if (isDuplicateCode) {
      toast.error(`Employee Code "${form.employeeCode}" already exists. Choose a different code.`);
      return;
    }
    if (form.personalEmail.trim() && !/^\S+@\S+\.\S+$/.test(form.personalEmail.trim())) {
      toast.error("Enter a valid Personal Email address.");
      return;
    }
    setIsSaving(true);
    try {
      await apiClient.createEmployee({
        employeeCode: form.employeeCode,
        name: form.name,
        designation: form.designation,
        division: form.division,
        territory: form.territory,
        role: form.role,
        reportingManager: form.reportingManager || undefined,
        email: email || null,
        // New request item 2 — separate personal email HR captures here.
        // Trigger Onboarding (on the employee's profile page) sends the
        // Zivira HR portal link + employee code + temp password to this
        // address, in addition to the existing official-email send.
        personalEmail: form.personalEmail.trim() || null,
        joinDate: form.joinDate || null,
        drivingLicense: form.drivingLicense.trim() || undefined,
        status: form.status
      });
      toast.success("Employee created.");
      router.push(`/employees/${form.employeeCode}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create employee");
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Add New Employee</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8">
        <form className="space-y-8" onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. EMP00011"
                value={form.employeeCode}
                onChange={(e) => update("employeeCode", e.target.value)}
                aria-invalid={isDuplicateCode}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${
                  isDuplicateCode
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                }`}
              />
              {isDuplicateCode && (
                <p className="mt-1 text-sm text-red-600">This employee code is already in use. Choose a different code.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Official Email</label>
              <div className={`flex items-stretch w-full border rounded-lg overflow-hidden focus-within:ring-2 transition-colors ${"border-gray-300 focus-within:ring-orange-500 focus-within:border-orange-500"}`}>
                <input
                  type="text"
                  placeholder="firstname.lastname"
                  value={form.emailLocal}
                  onChange={(e) => update("emailLocal", e.target.value.replace(/@.*/g, "").replace(/\s+/g, ""))}
                  className="flex-1 min-w-0 px-4 py-2 outline-none bg-transparent"
                />
                <span className="flex items-center px-3 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm border-l border-gray-300 dark:border-gray-700 select-none">
                  {EMAIL_DOMAIN}
                </span>
              </div>
              {email && <p className="mt-1 text-xs text-gray-400">{email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Personal Email</label>
              <input
                type="email"
                placeholder="e.g. name@gmail.com"
                value={form.personalEmail}
                onChange={(e) => update("personalEmail", e.target.value.trim())}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors bg-white dark:bg-gray-900"
              />
              <p className="mt-1 text-xs text-gray-400">Onboarding credentials and the portal link are also emailed here.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="Full Name" value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Designation <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="e.g. Medical Representative" value={form.designation} onChange={(e) => update("designation", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Division <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="e.g. Cardiology" value={form.division} onChange={(e) => update("division", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Territory <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="e.g. Chennai North" value={form.territory} onChange={(e) => update("territory", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role <span className="text-red-500">*</span></label>
              <select value={form.role} onChange={(e) => update("role", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors bg-white dark:bg-gray-900">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Joining Date</label>
              <CustomDatePicker value={form.joinDate} onChange={(v) => update("joinDate", v)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reporting Manager</label>
              <select value={form.reportingManager} onChange={(e) => update("reportingManager", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors bg-white dark:bg-gray-900">
                <option value="">Select Manager</option>
                {existingEmployees.map((emp) => (
                  <option key={emp.employeeCode} value={emp.employeeCode}>{emp.employeeCode} - {emp.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Driving License</label>
              <input
                type="text"
                value={form.drivingLicense}
                onChange={(e) => update("drivingLicense", e.target.value)}
                placeholder="e.g. DL-MH-20-1234567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee Status</label>
              <select value={form.status} onChange={(e) => update("status", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors bg-white dark:bg-gray-900">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link href="/employees" className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:bg-gray-950 transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={isSaving || isDuplicateCode} className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {isSaving ? "Saving..." : "Save Employee"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
