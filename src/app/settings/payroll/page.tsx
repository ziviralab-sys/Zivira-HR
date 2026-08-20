"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient, type SalaryStructure, type Employee, type StatutoryRule, type ProfessionalTaxSlab } from "@/lib/api-client";

// Restores the old mock UI's "Payroll Rules Engine" screen (editable
// PF / Professional Tax components) — now backed by a real, connected
// StatutoryRule document (Phase 2 "Advanced Statutory Calculations",
// Zivira_HR_Client_Requirement_1A.docx §32) instead of static mock rows.
// GET/PUT /company/payroll/rules. Every Payroll Run generated after a
// save picks these rates up automatically (see company.routes.ts
// POST /payroll/runs).
export default function PayrollSettingsPage() {
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rule, setRule] = useState<StatutoryRule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<"rules" | "structures">("rules");

  useEffect(() => {
    Promise.all([apiClient.salaryStructures(), apiClient.employees(), apiClient.payrollRules()])
      .then(([structRes, empRes, ruleRes]) => {
        setStructures(structRes.data);
        setEmployees(empRes.data);
        setRule(ruleRes.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const nameByCode = new Map(employees.map((e) => [e.employeeCode, e.name]));

  function updateRule<K extends keyof StatutoryRule>(key: K, value: StatutoryRule[K]) {
    if (!rule) return;
    setRule({ ...rule, [key]: value });
  }

  function updateSlab(index: number, patch: Partial<ProfessionalTaxSlab>) {
    if (!rule) return;
    const slabs = rule.ptSlabs.map((s, i) => (i === index ? { ...s, ...patch } : s));
    setRule({ ...rule, ptSlabs: slabs });
  }

  function addSlab() {
    if (!rule) return;
    setRule({ ...rule, ptSlabs: [...rule.ptSlabs, { minGross: 0, maxGross: null, amount: 0 }] });
  }

  function removeSlab(index: number) {
    if (!rule) return;
    setRule({ ...rule, ptSlabs: rule.ptSlabs.filter((_, i) => i !== index) });
  }

  async function saveRules() {
    if (!rule) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const { id, status, ...input } = rule;
      const res = await apiClient.updatePayrollRules(input);
      setRule(res.data);
      setSaveMessage("Payroll rules saved. New payroll runs will use these rates.");
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "Failed to save payroll rules");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Payroll Rules Engine</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Statutory deduction rules (PF, Professional Tax, ESI) and OT policy, applied automatically at Payroll Run generation.</p>
        </div>
        <Link href="/employees" className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm">
          Set Up an Employee's Structure
        </Link>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setTab("rules")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === "rules" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Statutory Rules (PF / PT / ESI / OT)
        </button>
        <button
          onClick={() => setTab("structures")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === "structures" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Salary Structures
        </button>
      </div>

      {isLoading ? (
        <p className="p-8 text-center text-gray-400">Loading…</p>
      ) : tab === "rules" && rule ? (
        <div className="space-y-6">
          {saveMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">{saveMessage}</div>
          )}

          {/* Provident Fund */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Provident Fund (PF)</h2>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <input type="checkbox" checked={rule.pfEnabled} onChange={(e) => updateRule("pfEnabled", e.target.checked)} className="h-4 w-4" />
                Enabled
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Employee Rate (%)</label>
                <input type="number" step="0.01" value={rule.pfEmployeeRate} onChange={(e) => updateRule("pfEmployeeRate", Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-950" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Employer Rate (%)</label>
                <input type="number" step="0.01" value={rule.pfEmployerRate} onChange={(e) => updateRule("pfEmployerRate", Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-950" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Wage Ceiling (₹, on Basic)</label>
                <input type="number" value={rule.pfWageCeiling} onChange={(e) => updateRule("pfWageCeiling", Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-950" />
              </div>
            </div>
            <p className="text-xs text-gray-400">PF Employee deduction = min(Basic, Wage Ceiling) × Employee Rate. Employer contribution is informational only — not deducted from net pay.</p>
          </div>

          {/* Professional Tax */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Professional Tax (PT)</h2>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <input type="checkbox" checked={rule.ptEnabled} onChange={(e) => updateRule("ptEnabled", e.target.checked)} className="h-4 w-4" />
                Enabled
              </label>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="py-2 font-semibold">Min Gross (₹)</th>
                  <th className="py-2 font-semibold">Max Gross (₹, blank = no cap)</th>
                  <th className="py-2 font-semibold">PT Amount (₹/month)</th>
                  <th className="py-2 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rule.ptSlabs.map((slab, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-2">
                      <input type="number" value={slab.minGross} onChange={(e) => updateSlab(i, { minGross: Number(e.target.value) })}
                        className="w-28 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-950" />
                    </td>
                    <td className="py-2 pr-2">
                      <input type="number" value={slab.maxGross ?? ""} placeholder="No cap"
                        onChange={(e) => updateSlab(i, { maxGross: e.target.value === "" ? null : Number(e.target.value) })}
                        className="w-28 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-950" />
                    </td>
                    <td className="py-2 pr-2">
                      <input type="number" value={slab.amount} onChange={(e) => updateSlab(i, { amount: Number(e.target.value) })}
                        className="w-28 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-950" />
                    </td>
                    <td className="py-2 text-right">
                      <button onClick={() => removeSlab(i)} className="text-red-600 hover:text-red-700 text-xs font-semibold">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addSlab} className="text-orange-600 hover:text-orange-700 text-sm font-semibold">+ Add Slab</button>
          </div>

          {/* ESI */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">ESI</h2>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <input type="checkbox" checked={rule.esiEnabled} onChange={(e) => updateRule("esiEnabled", e.target.checked)} className="h-4 w-4" />
                Enabled
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Employee Rate (%)</label>
                <input type="number" step="0.01" value={rule.esiEmployeeRate} onChange={(e) => updateRule("esiEmployeeRate", Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-950" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Employer Rate (%)</label>
                <input type="number" step="0.01" value={rule.esiEmployerRate} onChange={(e) => updateRule("esiEmployerRate", Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-950" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Wage Ceiling (₹, on Gross)</label>
                <input type="number" value={rule.esiWageCeiling} onChange={(e) => updateRule("esiWageCeiling", Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-950" />
              </div>
            </div>
            <p className="text-xs text-gray-400">Employees whose Gross Earnings exceed the wage ceiling are not ESI-eligible and are skipped automatically.</p>
          </div>

          {/* OT */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Overtime (OT)</h2>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <input type="checkbox" checked={rule.otEnabled} onChange={(e) => updateRule("otEnabled", e.target.checked)} className="h-4 w-4" />
                Enabled
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Standard Shift Hours / Day</label>
                <input type="number" value={rule.standardShiftHours} onChange={(e) => updateRule("standardShiftHours", Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-950" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">OT Rate (₹/hour, 0 = auto-derive)</label>
                <input type="number" value={rule.otRatePerHour} onChange={(e) => updateRule("otRatePerHour", Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-950" />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              OT hours are summed from the real Attendance Register punch-in/punch-out times beyond the standard shift hours each day.
              If OT Rate is left at 0, it's derived as 2× the employee's basic hourly rate.
            </p>
          </div>

          <div className="flex justify-end">
            <button onClick={saveRules} disabled={isSaving}
              className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50">
              {isSaving ? "Saving…" : "Save Payroll Rules"}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {structures.length === 0 ? (
              <p className="p-8 text-center text-gray-500 dark:text-gray-400">No salary structures configured yet.</p>
            ) : (
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Employee</th>
                    <th className="px-6 py-4 font-semibold">CTC (Annual)</th>
                    <th className="px-6 py-4 font-semibold">Basic %</th>
                    <th className="px-6 py-4 font-semibold">HRA %</th>
                    <th className="px-6 py-4 font-semibold">Allowance %</th>
                    <th className="px-6 py-4 font-semibold">Effective From</th>
                    <th className="px-6 py-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {structures.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                        <Link href={`/employees/${s.employeeCode}/payroll`} className="hover:text-orange-600">
                          {nameByCode.get(s.employeeCode) ?? s.employeeCode}
                        </Link>
                        <p className="text-xs text-gray-400 font-normal">{s.employeeCode}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">₹{s.ctc.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4">{s.basicPercent}%</td>
                      <td className="px-6 py-4">{s.hraPercent}%</td>
                      <td className="px-6 py-4">{s.allowancePercent}%</td>
                      <td className="px-6 py-4">{s.effectiveFrom?.slice(0, 10)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${s.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
