"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import { apiClient, type Onboarding, type Employee } from "@/lib/api-client";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Not Uploaded",
  UPLOADED: "Under Review",
  VERIFIED: "Verified ✓",
  REJECTED: "Rejected"
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-gray-500",
  UPLOADED: "text-yellow-600",
  VERIFIED: "text-green-600",
  REJECTED: "text-red-600"
};

// Zivira_HR_Client_Requirement_1B.docx "HR VERIFY" step — per-document
// VIEW/VERIFY/REJECT (with reason). Backed by PATCH
// /company/onboarding/:employeeCode/documents/:docName/{verify,reject}.
export default function HRDocumentVerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: employeeId } = use(params);
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyDoc, setBusyDoc] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const load = () => {
    setIsLoading(true);
    Promise.all([
      apiClient.onboarding(employeeId).catch(() => ({ data: null as Onboarding | null })),
      apiClient.employees()
    ])
      .then(([onbRes, empRes]) => {
        setOnboarding(onbRes.data);
        setEmployee(empRes.data.find((e) => e.employeeCode === employeeId) ?? null);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleVerify = async (docName: string) => {
    setBusyDoc(docName);
    try {
      await apiClient.verifyOnboardingDocument(employeeId, docName);
      toast.success(`${docName} verified.`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to verify document");
    } finally {
      setBusyDoc(null);
    }
  };

  const handleReject = async (docName: string) => {
    const reason = window.prompt(`Reason for rejecting ${docName}?`);
    if (!reason) return;
    setBusyDoc(docName);
    try {
      await apiClient.rejectOnboardingDocument(employeeId, docName, reason);
      toast.error(`${docName} rejected.`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject document");
    } finally {
      setBusyDoc(null);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await apiClient.completeOnboarding(employeeId);
      toast.success("Onboarding marked complete.");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to complete onboarding");
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) return <div className="max-w-5xl mx-auto py-12 text-center text-gray-400">Loading…</div>;

  if (!onboarding) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-gray-500 dark:text-gray-400">
        <p>Onboarding has not been generated for {employeeId} yet.</p>
        <Link href={`/employees/${employeeId}`} className="text-orange-600 hover:underline mt-2 inline-block">Back to profile</Link>
      </div>
    );
  }

  const uploadedCount = onboarding.documents.filter((d) => d.status !== "PENDING").length;
  const allVerified = onboarding.documents.every((d) => d.status === "VERIFIED");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/employees/${employeeId}`} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Document Verification</h1>
        </div>
        <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-bold shadow-sm">
          {onboarding.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{employee?.name ?? employeeId}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{employeeId} — {employee?.designation ?? ""}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-gray-500 dark:text-gray-400">Submitted: <span className="font-medium text-gray-900 dark:text-gray-100">{onboarding.submittedAt ? onboarding.submittedAt.slice(0, 10) : "Not yet"}</span></p>
            <p className="text-gray-500 dark:text-gray-400">Documents: <span className="font-medium text-gray-900 dark:text-gray-100">{uploadedCount}/{onboarding.documents.length} Uploaded</span></p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {onboarding.documents.map((doc) => (
            <div key={doc.name} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col md:flex-row">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex flex-col justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{doc.fileName ?? "Not uploaded"}</p>
              </div>
              <div className="p-6 md:w-2/3 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{doc.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status: <span className={`font-medium ${STATUS_COLOR[doc.status]}`}>{STATUS_LABEL[doc.status]}</span></p>
                    {doc.status === "REJECTED" && doc.rejectReason && (
                      <p className="text-xs text-red-500 mt-1">Reason: {doc.rejectReason}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={doc.status !== "UPLOADED" || busyDoc === doc.name}
                    onClick={() => handleVerify(doc.name)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ✓ Verify
                  </button>
                  <button
                    disabled={doc.status === "PENDING" || busyDoc === doc.name}
                    onClick={() => handleReject(doc.name)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {onboarding.status === "SUBMITTED" && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button
              onClick={handleComplete}
              disabled={!allVerified || isCompleting}
              className="px-6 py-2.5 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title={!allVerified ? "All documents must be verified first" : undefined}
            >
              {isCompleting ? "Completing…" : "Mark Onboarding Complete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
