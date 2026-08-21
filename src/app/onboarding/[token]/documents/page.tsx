"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiClient, type Onboarding } from "@/lib/api-client";

// Zivira_HR_Client_Requirement_1B.docx "FILL ONBOARDING" step 7/8
// (Documents) + step 8 (Review/SUBMIT). The file's actual bytes are read
// client-side and sent as a base64 data: URL to POST
// /ess/onboarding/documents/:docName, capped at 3MB (enforced here AND
// re-checked server-side) — so what HR reviews is the real document, not
// just a filename, and so the review step can show a genuine preview
// before the employee submits.
const MAX_DOCUMENT_BYTES = 3 * 1024 * 1024; // 3MB

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function EmployeeDocumentUploadPage() {
  const router = useRouter();
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyDoc, setBusyDoc] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => {
    setIsLoading(true);
    apiClient
      .essOnboarding()
      .then((res) => setOnboarding(res.data))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load onboarding"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (docName: string, file: File | null) => {
    if (!file) return;
    if (file.size > MAX_DOCUMENT_BYTES) {
      toast.error(`${file.name} is ${(file.size / (1024 * 1024)).toFixed(1)}MB — the limit is 3MB. Please upload a smaller file.`);
      return;
    }
    setBusyDoc(docName);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      await apiClient.essUploadOnboardingDocument(docName, file.name, dataUrl, file.type || "application/octet-stream", file.size);
      toast.success(`${docName} uploaded.`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload document");
    } finally {
      setBusyDoc(null);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.essSubmitOnboarding();
      toast.success("Onboarding submitted! HR will verify your documents.");
      router.push("/ess");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;

  const documents = onboarding?.documents ?? [];
  const allUploaded = documents.length > 0 && documents.every((d) => d.status !== "PENDING");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Onboarding Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed left-0 top-0 h-full p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-8">Employee Onboarding</h2>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 text-green-600 font-medium">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-sm">✓</div>
            Personal Details
          </div>
          <div className="flex items-center gap-3 text-orange-600 font-medium">
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-sm">7</div>
            Documents &amp; Review
          </div>
        </nav>

        <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">Status: {onboarding?.status.replace(/_/g, " ") ?? "—"}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Upload Documents</h1>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please upload clear PDF or image files for each required document.</p>

            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{doc.name} <span className="text-red-500">*</span></h3>
                    {doc.status === "REJECTED" && doc.rejectReason ? (
                      <p className="text-sm text-red-500">Rejected — {doc.rejectReason}. Please re-upload.</p>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Max size: 3MB</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {doc.status !== "PENDING" && doc.status !== "REJECTED" && (
                      doc.fileData ? (
                        <a
                          href={doc.fileData}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-green-600 hover:underline"
                          title="Review the file you uploaded"
                        >
                          {doc.fileName} ✓ (Preview)
                        </a>
                      ) : (
                        <span className="text-sm font-medium text-green-600">{doc.fileName} ✓</span>
                      )
                    )}
                    <label className="px-4 py-2 border border-orange-600 text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors text-sm cursor-pointer">
                      {busyDoc === doc.name ? "Uploading…" : doc.status === "PENDING" ? "Upload File" : "Replace"}
                      <input
                        type="file"
                        className="hidden"
                        disabled={busyDoc === doc.name || onboarding?.status === "SUBMITTED" || onboarding?.status === "COMPLETED"}
                        onChange={(e) => handleUpload(doc.name, e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 mt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <Link href="/onboarding/me/form" className="text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:text-gray-300">Back</Link>
              <button
                onClick={handleSubmit}
                disabled={!allUploaded || isSubmitting || onboarding?.status === "SUBMITTED" || onboarding?.status === "COMPLETED"}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm text-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {onboarding?.status === "SUBMITTED" || onboarding?.status === "COMPLETED"
                  ? "Already Submitted"
                  : isSubmitting ? "Submitting…" : "Submit Onboarding"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
