"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient, openDataUrlInNewTab, type Onboarding } from "@/lib/api-client";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Not Uploaded",
  UPLOADED: "Under Review",
  VERIFIED: "Verified ✓",
  REJECTED: "Rejected"
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  UPLOADED: "bg-yellow-100 text-yellow-700",
  VERIFIED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700"
};

// Read-only view of the employee's own HR documents (the same records
// filled in during onboarding — see /onboarding/me/documents for the
// upload flow). GET /ess/onboarding is already scoped to this employee.
export default function EssDocumentsPage() {
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .essOnboarding()
      .then((res) => setOnboarding(res.data))
      .catch(() => setOnboarding(null))
      .finally(() => setIsLoading(false));
  }, []);

  const documents = onboarding?.documents ?? [];

  return (
    <main className="max-w-4xl mx-auto px-6 pt-24 pb-12 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ess" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Documents</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <p className="text-center text-gray-400 py-12">Loading…</p>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <p>No documents on file yet.</p>
            <Link href="/onboarding/me/documents" className="text-orange-600 hover:underline mt-2 inline-block">Go to Documents &amp; Review</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {documents.map((doc) => (
              <div key={doc.name} className="p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{doc.name}</p>
                  {doc.status === "REJECTED" && doc.rejectReason && (
                    <p className="text-sm text-red-500 mt-0.5">Rejected — {doc.rejectReason}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[doc.status]}`}>{STATUS_LABEL[doc.status]}</span>
                  {doc.fileData && (
                    <button
                      type="button"
                      onClick={() => openDataUrlInNewTab(doc.fileData!)}
                      className="text-sm font-medium text-orange-600 hover:underline"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
