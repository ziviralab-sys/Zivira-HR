"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient, type Employee } from "@/lib/api-client";

// Exit / Relieving — Zivira_HR_Client_Requirement_1A.docx lists
// "Exit / Relieving" under the Onboarding module, but the resignation
// workflow itself (request -> manager/HR approval -> clearance -> final
// settlement) isn't part of the Phase 1 MVP scope that's been built out
// yet on the backend, so this screen shows the employee's real current
// status honestly rather than pretending a "Submit Resignation" button
// goes anywhere. Wiring an actual request/approval flow here is a
// follow-up backend + HR-review item, not a frontend-only change.
export default function EssExitPage() {
  const [profile, setProfile] = useState<(Employee & { onboardingStatus: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .essProfile()
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-6 pt-24 pb-12 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ess" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Exit</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8">
        {isLoading ? (
          <p className="text-gray-400">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Employment Status</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{profile?.status ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reporting Manager</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{profile?.reportingManager ?? "—"}</p>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Requesting an Exit</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Resignation and relieving requests are handled directly by HR at this time — please reach out to your reporting
                manager or HR to start the process. Self-service exit requests will appear here once that workflow is available.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
