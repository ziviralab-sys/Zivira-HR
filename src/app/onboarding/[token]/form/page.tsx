"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiClient, type Onboarding } from "@/lib/api-client";

// Zivira_HR_Client_Requirement_1B.docx "FILL ONBOARDING" — Personal Info,
// Address, Education, Previous Employment, Bank Details, PF/UAN. The
// remaining two steps (Documents, Review) live on the next page
// (/onboarding/me/documents), which also does the final SUBMIT.
const steps = ["Personal Info", "Address", "Education", "Previous Employment", "Bank Details", "PF / UAN"];

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
  address: { line1: "", city: "", state: "", pincode: "" },
  education: { qualification: "", institution: "", yearOfPassing: "" },
  experience: { previousEmployer: "", designation: "", fromDate: "", toDate: "" },
  bank: { accountHolderName: "", accountNumber: "", ifsc: "", bankName: "" },
  statutory: { pfUan: "", esiNumber: "" }
};

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

  const handleNext = async () => {
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
  const labelize = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{steps[currentStep]}</h1>
            <button
              onClick={handleSaveExit}
              disabled={isSaving}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50"
            >
              Save &amp; Exit
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-6">
                {fieldsFor(stepKey).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{labelize(field)}</label>
                    <input
                      type={field.toLowerCase().includes("date") || field === "dob" ? "date" : "text"}
                      value={form[stepKey][field]}
                      onChange={(e) => updateField(field, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-950 dark:text-gray-100"
                    />
                  </div>
                ))}
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
                  disabled={isSaving}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50"
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
