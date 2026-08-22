"use client";

import { useEffect, useRef, useState } from "react";
import { apiClient, type PayrollSummary, type CompOffSummary } from "@/lib/api-client";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { ChevronDown } from "lucide-react";

// Zivira_HR_Client_Requirement_1A.docx Phase 1 MVP "Reports" — a payroll
// summary for a chosen month plus an export "in the exact format Accounts
// expects" (doc §23), backed by GET /company/reports/payroll-summary and
// GET /company/reports/payroll-export. Also surfaces Phase 2 "Advanced
// Reports" — PF/PT/ESI statutory totals, OT totals, and the Comp-Off
// grant/spend ledger, all real, backend-computed figures.
export default function ReportsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [compOffSummary, setCompOffSummary] = useState<CompOffSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([apiClient.payrollSummary(month), apiClient.compOffSummary()])
      .then(([sumRes, compRes]) => {
        setSummary(sumRes.data);
        setCompOffSummary(compRes.data);
      })
      .catch(() => setSummary(null))
      .finally(() => setIsLoading(false));
  }, [month]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Same client-side export approach the Admin portal's masters tables use:
  // fetch the real data through an authenticated request, then build the
  // Excel/PDF file directly in the browser — no more <a target="_blank">
  // navigating straight to the API (which sent no auth header at all and
  // just showed "Missing bearer token").
  async function exportExcel() {
    setExporting(true);
    setExportError("");
    try {
      const { headers, rows } = await apiClient.payrollExportRows(month);
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      worksheet["!cols"] = headers.map((h, colIdx) => {
        const longest = rows.reduce((max, r) => Math.max(max, (r[colIdx] ?? "").length), h.length);
        return { wch: Math.min(Math.max(longest + 2, 10), 40) };
      });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");
      XLSX.writeFile(workbook, `payroll-${month}.xlsx`);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Failed to export Excel");
    } finally {
      setExporting(false);
      setExportMenuOpen(false);
    }
  }

  async function exportPdf() {
    setExporting(true);
    setExportError("");
    try {
      const { headers, rows } = await apiClient.payrollExportRows(month);
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      doc.setFontSize(13);
      doc.text(`Payroll Export — ${month}`, 28, 20);
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 28,
        styles: { fontSize: 7, cellPadding: 3, overflow: "linebreak" },
        headStyles: { fillColor: [234, 88, 12], textColor: [255, 255, 255], fontStyle: "bold" }
      });
      doc.save(`payroll-${month}.pdf`);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Failed to export PDF");
    } finally {
      setExporting(false);
      setExportMenuOpen(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Payroll summary and exports for Accounts.</p>
        </div>
        <div className="flex gap-3 items-center">
          <CustomDatePicker mode="month" value={month} onChange={setMonth} className="w-40" />
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setExportMenuOpen((v) => !v)}
              disabled={exporting}
              className="flex items-center gap-1.5 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-60"
            >
              {exporting ? "Exporting..." : "Export"}
              <ChevronDown size={15} />
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden z-20">
                <button type="button" onClick={exportExcel} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                  Excel (.xlsx)
                </button>
                <button type="button" onClick={exportPdf} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                  PDF (.pdf)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {exportError && <p className="text-sm text-red-600">{exportError}</p>}

      {isLoading ? (
        <p className="text-center text-gray-400 py-12">Loading…</p>
      ) : !summary || summary.headcount === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-12 text-center text-gray-500 dark:text-gray-400">
          No payroll run exists for {month} yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Headcount</h3>
              <p className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-2">{summary.headcount}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Gross Earnings</h3>
              <p className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-2">₹{summary.grossEarnings.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Net Pay</h3>
              <p className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-2">₹{summary.netPay.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Est. Tax</h3>
              <p className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-2">₹{summary.estimatedTax.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Deductions Breakdown</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">LWP Deduction</span><span className="font-medium text-gray-900 dark:text-gray-100">₹{summary.lwpDeduction.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Loan Deduction</span><span className="font-medium text-gray-900 dark:text-gray-100">₹{summary.loanDeduction.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Estimated Tax</span><span className="font-medium text-gray-900 dark:text-gray-100">₹{summary.estimatedTax.toLocaleString("en-IN")}</span></div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Additions & Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Incentives</span><span className="font-medium text-gray-900 dark:text-gray-100">₹{summary.incentive.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Arrears</span><span className="font-medium text-gray-900 dark:text-gray-100">₹{summary.arrears.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800"><span className="text-gray-600 dark:text-gray-400">Draft / HR Approved / Locked</span><span className="font-medium text-gray-900 dark:text-gray-100">{summary.draft} / {summary.hrApproved} / {summary.locked}</span></div>
              </div>
            </div>
          </div>

          {/* Phase 2 "Advanced Reports" */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Advanced Reports</h2>
              <div className="flex gap-3">
                <button type="button" onClick={exportExcel} disabled={exporting} className="text-sm text-orange-600 hover:underline font-medium disabled:opacity-60">
                  Statutory + OT included — download Excel &rarr;
                </button>
                <button type="button" onClick={exportPdf} disabled={exporting} className="text-sm text-orange-600 hover:underline font-medium disabled:opacity-60">
                  Download PDF &rarr;
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Statutory (PF / PT / ESI)</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">PF (Employee)</span><span className="font-medium text-gray-900 dark:text-gray-100">₹{summary.pfEmployee.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">PF (Employer)</span><span className="font-medium text-gray-900 dark:text-gray-100">₹{summary.pfEmployer.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Professional Tax</span><span className="font-medium text-gray-900 dark:text-gray-100">₹{summary.professionalTax.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">ESI (Employee)</span><span className="font-medium text-gray-900 dark:text-gray-100">₹{summary.esiEmployee.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">ESI (Employer)</span><span className="font-medium text-gray-900 dark:text-gray-100">₹{summary.esiEmployer.toLocaleString("en-IN")}</span></div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Overtime (OT)</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Total OT Hours</span><span className="font-medium text-gray-900 dark:text-gray-100">{summary.otHours}h</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Total OT Paid</span><span className="font-medium text-gray-900 dark:text-gray-100">₹{summary.otAmount.toLocaleString("en-IN")}</span></div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Comp-Off Ledger</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Available</span><span className="font-medium text-green-700">{compOffSummary?.available ?? 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Used</span><span className="font-medium text-gray-900 dark:text-gray-100">{compOffSummary?.used ?? 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Expired</span><span className="font-medium text-red-700">{compOffSummary?.expired ?? 0}</span></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
