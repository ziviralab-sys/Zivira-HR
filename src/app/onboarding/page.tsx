"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient, type Onboarding } from "@/lib/api-client";

const STATUS_STYLES: Record<string, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-600",
  INITIATED: "bg-blue-100 text-blue-700",
  EMAIL_SENT: "bg-purple-100 text-purple-700",
  PASSWORD_CREATED: "bg-purple-100 text-purple-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  SUBMITTED: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-green-100 text-green-700"
};

// Zivira_HR_Client_Requirement_1B.docx "complete employee journey" — HR's
// pipeline view of every employee's onboarding: ADD EMPLOYEE -> GENERATE
// ONBOARDING -> TRIGGER MAIL -> ... -> HR VERIFY -> COMPLETED. Backed by
// GET /company/onboarding.
export default function OnboardingPipelinePage() {
  const [rows, setRows] = useState<Onboarding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .onboardingList()
      .then((res) => setRows(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Onboarding Pipeline</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Track every employee from Generate Onboarding through HR Verify and Complete.</p>
        </div>
        <Link href="/employees" className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm">
          Go to Employee Directory
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="p-8 text-center text-gray-400">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="p-8 text-center text-gray-500 dark:text-gray-400">
              No onboarding records yet. Generate onboarding from an employee's profile page to start the journey.
            </p>
          ) : (
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">Employee</th>
                  <th className="px-6 py-4 font-semibold">Onboarding ID</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Documents</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map((o) => {
                  const verified = o.documents.filter((d) => d.status === "VERIFIED").length;
                  return (
                    <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                        {o.employeeName ?? o.employeeCode}
                        <p className="text-xs text-gray-400 font-normal">{o.employeeCode}</p>
                      </td>
                      <td className="px-6 py-4">{o.onboardingId}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {o.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">{verified}/{o.documents.length} Verified</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/employees/${o.employeeCode}/documents`} className="text-orange-600 hover:text-orange-800 font-medium">Review</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
