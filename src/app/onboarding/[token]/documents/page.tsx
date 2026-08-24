"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiClient, openDataUrlInNewTab, type Onboarding } from "@/lib/api-client";

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

// New request item 3 — "after uploading it the driving license must be
// automatically fill the details in the HR portal and the field repo
// portal under the driving license name." Free, on-device OCR
// (Tesseract.js — no API key, no external service) runs right in the
// browser on the uploaded Driving License photo, pulls out the most
// plausible license-number-looking token, and saves it straight onto
// EmployeeModel.drivingLicense via PATCH /ess/profile/driving-license —
// the SAME field the HR Employee Profile and FieldRepo already display,
// so both pick it up immediately with no extra sync step. Loaded
// dynamically (it's a multi-MB WASM engine) so it never slows down the
// rest of the onboarding flow, and only runs for image files — PDFs are
// skipped since Tesseract.js only reads images.
//
// Indian driving license numbers are State Code (2 letters) + RTO code
// (2 digits) + year + a run of digits, e.g. "TN01 20230012345" or
// "KA-05-2019-1234567" — this regex is deliberately loose (letters,
// digits, spaces, and hyphens only) so it matches real formats without
// pretending to validate any one state's exact layout. If nothing
// plausible is found, the field is simply left for HR/the employee to
// fill in manually, same as before this change.
const LICENSE_NUMBER_PATTERN = /\b[A-Z]{2}[\s-]?\d{2}[\s-]?(?:\d{4}[\s-]?)?\d{6,11}\b/;

async function extractDrivingLicenseNumber(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null; // Tesseract.js reads images, not PDFs
  try {
    const Tesseract = await import("tesseract.js");
    const { data } = await Tesseract.recognize(file, "eng");
    const text = (data?.text || "").toUpperCase();
    const match = text.match(LICENSE_NUMBER_PATTERN);
    return match ? match[0].replace(/\s+/g, " ").trim() : null;
  } catch {
    return null; // best-effort — a failed OCR pass never blocks the upload itself
  }
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

      // New request item 3 — only the Driving License slot triggers OCR
      // auto-fill; every other document type behaves exactly as before.
      if (docName === "Driving License") {
        const licenseNumber = await extractDrivingLicenseNumber(file);
        if (licenseNumber) {
          try {
            await apiClient.updateDrivingLicense(licenseNumber);
            toast.success(`Driving License auto-filled: ${licenseNumber}`);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Uploaded, but auto-fill failed — HR can enter it manually.");
          }
        } else {
          toast("Couldn't auto-read the license number from that photo — HR can enter it manually.", { icon: "ℹ️" });
        }
      }

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
  // A REJECTED document must be re-uploaded before submission is allowed —
  // it isn't "PENDING" any more, but it also isn't accepted, so treating
  // "not PENDING" as "ready" let a rejected file silently pass through
  // and left the Submit button clickable when it shouldn't have been.
  const allUploaded = documents.length > 0 && documents.every((d) => d.status === "UPLOADED" || d.status === "VERIFIED");

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
                        <button
                          type="button"
                          onClick={() => openDataUrlInNewTab(doc.fileData!)}
                          className="text-sm font-medium text-green-600 hover:underline"
                          title="Review the file you uploaded"
                        >
                          {doc.fileName} ✓ (Preview)
                        </button>
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
