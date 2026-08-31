"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiClient, getStoredUser, setStoredUser } from "@/lib/api-client";

// Zivira_HR_Client_Requirement_1B.docx "CREATE PASSWORD" — the very first
// screen an employee sees after signing in with their temporary password
// (see the redirect in src/app/page.tsx). Onboarding details (Personal Info
// through Documents & Review) are only asked for once a real password is
// in place, not before — an account secured with a password the employee
// never chose shouldn't be the one collecting their personal data.
// params.token is unused; the logged-in employee's own JWT already
// identifies who this is — see POST /auth/change-password.
export default function CreatePasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsSaving(true);
    try {
      await apiClient.changePassword(currentPassword, newPassword);
      // The ESS dashboard's "Set Your Password" banner (now just a fallback
      // for accounts that reach it with a temp password still active, e.g.
      // an HR-triggered reset) reads this flag straight out of localStorage
      // — without updating it here it stays stale forever, nagging an
      // employee who already changed their password.
      const user = getStoredUser();
      if (user) setStoredUser({ ...user, mustChangePassword: false });
      toast.success("Password set!");
      // Password is the gate; onboarding is the next step for anyone who
      // hasn't finished it yet. Someone whose onboarding is already
      // SUBMITTED (awaiting HR review) or COMPLETED shouldn't be sent back
      // into the form — they go straight to their dashboard instead.
      try {
        const profile = await apiClient.essProfile();
        const status = profile.data.onboardingStatus;
        if (status === "SUBMITTED" || status === "COMPLETED") {
          router.push("/ess");
        } else {
          router.push("/onboarding/me/form");
        }
      } catch {
        // Couldn't confirm onboarding status — default to the onboarding
        // form rather than risk skipping it; if it's already done, the
        // form loads it pre-filled and "Continue to Documents" is one click.
        router.push("/onboarding/me/form");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set password");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Create Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Welcome to Zivira HR! Before we collect your onboarding details, please set a permanent password for your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Temporary Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Set Password & Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
