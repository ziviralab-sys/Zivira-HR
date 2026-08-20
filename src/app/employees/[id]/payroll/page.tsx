"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiClient, type SalaryStructure } from "@/lib/api-client";

export default function EmployeePayrollPage({ params }: { params: { id: string } }) {
  const employeeCode = params.id;

  const [structure, setStructure] = useState<SalaryStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    ctc: "",
    basicPercent: "50",
    hraPercent: "20",
    allowancePercent: "30",
    effectiveFrom: new Date().toISOString().slice(0, 10)
  });

  const load = () => {
    setIsLoading(true);
    apiClient
      .salaryStructures(employeeCode)
      .then((res) => {
        const active = res.data.find((s) => s.status === "ACTIVE") ?? res.data[0] ?? null;
        setStructure(active);
      })
      .catch(() => setStructure(null))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeCode]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ctc = Number(form.ctc);
    if (!ctc || ctc <= 0) {
      toast.error("Enter a valid CTC amount.");
      return;
    }
    setIsSaving(true);
    try {
      await apiClient.createSalaryStructure({
        employeeCode,
        ctc,
        basicPercent: Number(form.basicPercent),
        hraPercent: Number(form.hraPercent),
        allowancePercent: Number(form.allowancePercent),
        effectiveFrom: form.effectiveFrom
      });
      toast.success("Salary structure saved.");
      setIsEditing(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save salary structure");
    } finally {
      setIsSaving(false);
    }
  };

  const basicMonthly = structure ? Math.round((structure.ctc * structure.basicPercent) / 100) : 0;
  const hraMonthly = structure ? Math.round((structure.ctc * structure.hraPercent) / 100) : 0;
  const allowanceMonthly = structure ? Math.round((structure.ctc * structure.allowancePercent) / 100) : 0;
  const grossMonthly = basicMonthly + hraMonthly + allowanceMonthly;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/employees/${employeeCode}`} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Payroll Information</h1>
        </div>
        <button onClick={() => setIsEditing((v) => !v)} className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm">
          {isEditing ? "Cancel" : structure ? "Edit Salary Structure" : "Set Up Salary Structure"}
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center text-gray-500 dark:text-gray-400">
          Loading salary structure...
        </div>
      ) : isEditing ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly CTC (₹)</label>
                <input type="number" required value={form.ctc} onChange={(e) => setForm((p) => ({ ...p, ctc: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Effective From</label>
                <input type="date" required value={form.effectiveFrom} onChange={(e) => setForm((p) => ({ ...p, effectiveFrom: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Basic % of CTC</label>
                <input type="number" value={form.basicPercent} onChange={(e) => setForm((p) => ({ ...p, basicPercent: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">HRA % of CTC</label>
                <input type="number" value={form.hraPercent} onChange={(e) => setForm((p) => ({ ...p, hraPercent: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allowance % of CTC</label>
                <input type="number" value={form.allowancePercent} onChange={(e) => setForm((p) => ({ ...p, allowancePercent: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button type="submit" disabled={isSaving} className={`px-6 py-2 rounded-lg font-medium transition-colors shadow-sm ${isSaving ? 'bg-orange-400 text-white cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700'}`}>
                {isSaving ? "Saving..." : "Save Structure"}
              </button>
            </div>
          </form>
        </div>
      ) : !structure ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center text-gray-500 dark:text-gray-400">
          No salary structure has been set up for {employeeCode} yet.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{employeeCode}</h2>
            </div>
            <div className="text-right text-sm">
              <p className="text-gray-500 dark:text-gray-400">Effective From: <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(structure.effectiveFrom).toLocaleDateString()}</span></p>
              <p className="text-gray-500 dark:text-gray-400">Monthly CTC: <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">₹{structure.ctc.toLocaleString()}</span></p>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Salary Structure Configuration</h3>

            <div>
              <h4 className="font-semibold text-green-700 uppercase tracking-wide text-sm border-b border-gray-200 dark:border-gray-800 pb-2 mb-4 flex justify-between">
                <span>Earnings</span>
                <span>Monthly (₹)</span>
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>Basic Salary <span className="text-xs text-gray-400 block">{structure.basicPercent}% of CTC</span></span>
                  <span className="font-medium">{basicMonthly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>House Rent Allowance <span className="text-xs text-gray-400 block">{structure.hraPercent}% of CTC</span></span>
                  <span className="font-medium">{hraMonthly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>Special Allowance <span className="text-xs text-gray-400 block">{structure.allowancePercent}% of CTC</span></span>
                  <span className="font-medium">{allowanceMonthly.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-gray-900 dark:text-gray-100 font-bold border-t border-gray-200 dark:border-gray-800 pt-3 mt-4">
                <span>Gross Earnings</span>
                <span>{grossMonthly.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-orange-800 uppercase tracking-wider">Gross Monthly Earnings</p>
                <p className="text-xs text-orange-600 mt-1">Actual payout is computed per Payroll Run, after LWP deduction</p>
              </div>
              <div className="text-3xl font-bold text-orange-700">
                ₹{grossMonthly.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
