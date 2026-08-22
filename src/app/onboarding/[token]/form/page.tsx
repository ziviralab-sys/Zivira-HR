"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiClient, type Onboarding } from "@/lib/api-client";
import { CustomDatePicker } from "@/components/CustomDatePicker";

// Zivira_HR_Client_Requirement_1B.docx "FILL ONBOARDING" — Personal Info,
// Address, Education, Previous Company, Bank Details, PF/UAN. The
// remaining two steps (Documents, Review) live on the next page
// (/onboarding/me/documents), which also does the final SUBMIT.
const steps = ["Personal Info", "Address", "Education", "Previous Company", "Bank Details", "PF / UAN"];

type FormState = {
  personal: Record<string, string>;
  address: Record<string, string>;
  education: Record<string, string>;
  experience: Record<string, string>;
  bank: Record<string, string>;
  statutory: Record<string, string>;
};

const emptyForm: FormState = {
  personal: { firstName: "", lastName: "", dob: "", gender: "", personalEmail: "", mobile: "" },
  address: { address: "", city: "", state: "", pincode: "" },
  education: { qualification: "", institution: "", yearOfPassing: "" },
  experience: { previousCompany: "", designation: "", fromDate: "", toDate: "" },
  bank: { accountHolderName: "", accountNumber: "", ifsc: "", bankName: "" },
  statutory: { pfUan: "", esiNumber: "" }
};

// Per-field validation — every field not listed here is accepted as-is
// (free text). Applied on every keystroke so a wrong value is flagged
// immediately with a red border + message instead of only failing later
// at submit or, worse, silently saving bad data (wrong phone numbers,
// malformed bank details, etc).
const FIELD_VALIDATORS: Record<string, { test: (v: string) => boolean; message: string }> = {
  mobile: { test: (v) => /^\d{10}$/.test(v), message: "Enter a valid 10-digit mobile number." },
  personalEmail: { test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: "Enter a valid email address." },
  pincode: { test: (v) => /^\d{6}$/.test(v), message: "Enter a valid 6-digit pincode." },
  accountNumber: { test: (v) => /^\d{9,18}$/.test(v), message: "Enter a valid bank account number (9-18 digits)." },
  ifsc: { test: (v) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.toUpperCase()), message: "Enter a valid 11-character IFSC code (e.g. HDFC0001234)." },
  pfUan: { test: (v) => /^\d{12}$/.test(v), message: "UAN must be exactly 12 digits." },
  esiNumber: { test: (v) => /^\d{10,17}$/.test(v), message: "Enter a valid ESI number." }
};

function fieldError(field: string, value: string): string | null {
  if (!value.trim()) return null; // required-ness is checked separately; this only flags a WRONG value
  const validator = FIELD_VALIDATORS[field];
  if (!validator) return null;
  return validator.test(value.trim()) ? null : validator.message;
}

const FIELD_KEYS: (keyof FormState)[] = ["personal", "address", "education", "experience", "bank", "statutory"];

export default function OnboardingFormPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiClient
      .essOnboarding()
      .then((res) => {
        const o = res.data as Onboarding;
        setForm({
          personal: { ...emptyForm.personal, ...(o.personal as Record<string, string> | null) },
          address: { ...emptyForm.address, ...(o.address as Record<string, string> | null) },
          education: { ...emptyForm.education, ...((o.education?.[0] as Record<string, string>) ?? {}) },
          experience: { ...emptyForm.experience, ...((o.experience?.[0] as Record<string, string>) ?? {}) },
          bank: { ...emptyForm.bank, ...(o.bank as Record<string, string> | null) },
          statutory: { ...emptyForm.statutory, ...(o.statutory as Record<string, string> | null) }
        });
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load onboarding"))
      .finally(() => setIsLoading(false));
  }, []);

  const stepKey = FIELD_KEYS[currentStep];

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [stepKey]: { ...prev[stepKey], [field]: value } }));
  };

  const persistCurrentStep = async () => {
    const payload: Record<string, unknown> = {};
    if (stepKey === "education") payload.education = [form.education];
    else if (stepKey === "experience") payload.experience = [form.experience];
    else payload[stepKey] = form[stepKey];
    await apiClient.essSaveOnboarding(payload);
  };

  const handleSaveExit = async () => {
    setIsSaving(true);
    try {
      await persistCurrentStep();
      toast.success("Saved for later!");
      router.push("/ess");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const currentStepErrors = Object.keys(form[stepKey]).reduce<Record<string, string>>((acc, field) => {
    const err = fieldError(field, form[stepKey][field] ?? "");
    if (err) acc[field] = err;
    return acc;
  }, {});
  const hasErrors = Object.keys(currentStepErrors).length > 0;

  const handleNext = async () => {
    if (hasErrors) {
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }
    setIsSaving(true);
    try {
      await persistCurrentStep();
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
        toast.success("Progress saved!");
      } else {
        toast.success("Details saved — continue to Documents.");
        router.push("/onboarding/me/documents");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const progressPercentage = Math.round(((currentStep + 1) / (steps.length + 1)) * 100);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;

  const fieldsFor = (key: keyof FormState) => Object.keys(form[key]);

  // Explicit overrides for fields whose plain-English label isn't just
  // "split on capital letters, capitalize every word" — acronyms
  // (IFSC, PF/UAN, ESI) must stay upper-case, and connector words like
  // "of" must stay lower-case ("Year of Passing", not "Year Of Passing").
  const LABEL_OVERRIDES: Record<string, string> = {
    ifsc: "IFSC",
    pfUan: "PF/UAN",
    esiNumber: "ESI Number",
    yearOfPassing: "Year of Passing"
  };
  const LOWERCASE_WORDS = new Set(["of", "and", "the", "in", "on", "for", "to"]);
  const labelize = (key: string) => {
    if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key];
    return key
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((word, i) => (i > 0 && LOWERCASE_WORDS.has(word.toLowerCase()) ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Onboarding Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed left-0 top-0 h-full p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-8">Employee Onboarding</h2>
        <nav className="space-y-4">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <div key={step} className={`flex items-center gap-3 font-medium ${isActive ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${isActive ? 'bg-orange-100' : isCompleted ? 'bg-green-100' : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800'}`}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                {step}
              </div>
            );
          })}
          <div className="flex items-center gap-3 font-medium text-gray-500 dark:text-gray-400">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">7</div>
            Documents &amp; Review
          </div>
        </nav>

        <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">Progress: {progressPercentage}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-orange-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/ess"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                title="Back to Dashboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{steps[currentStep]}</h1>
            </div>
            <button
              type="button"
              onClick={handleSaveExit}
              disabled={isSaving}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Save & Exit"}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-6">
                {fieldsFor(stepKey).map((field) => {
                  const err = currentStepErrors[field];
                  const isDateField = field.toLowerCase().includes("date") || field === "dob";
                  return (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{labelize(field)}</label>
                      {isDateField ? (
                        <CustomDatePicker
                          value={form[stepKey][field]}
                          onChange={(v) => updateField(field, v)}
                          className={err ? "[&>button]:border-red-500" : ""}
                        />
                      ) : (
                        <input
                          type="text"
                          value={form[stepKey][field]}
                          onChange={(e) => updateField(field, e.target.value)}
                          aria-invalid={!!err}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none bg-white dark:bg-gray-950 dark:text-gray-100 transition-colors ${
                            err ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-orange-500"
                          }`}
                        />
                      )}
                      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSaving || hasErrors}
                  title={hasErrors ? "Fix the highlighted fields to continue" : undefined}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : currentStep < steps.length - 1 ? "Save & Next" : "Continue to Documents"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
