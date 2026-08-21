"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiClient, setToken, setStoredUser } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Zivira_HR_Client_Requirement_1B.docx "EMPLOYEE LOGIN" is a distinct
  // portal from the HR/Admin staff login — same screen, a toggle, since
  // both authenticate against the same backend with a different `portal`.
  const [portal, setPortal] = useState<"COMPANY_ADMIN" | "EMPLOYEE">("COMPANY_ADMIN");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await apiClient.login(email, password, portal);
      setToken(res.data.token);
      setStoredUser(res.data.user);
      document.cookie = "auth=1; path=/; max-age=86400"; // Set auth cookie for 1 day
      toast.success("Welcome back!");

      if (portal === "EMPLOYEE") {
        // A new employee logging in with their temp password fills their
        // Personal Info (and the rest of the onboarding form) first, then
        // lands on their Employee Dashboard once details are in — password
        // creation is prompted from there, not forced before they can see
        // anything. See /onboarding/me/form and the dashboard's "Set Your
        // Password" banner.
        if (res.data.user.mustChangePassword) {
          router.push("/onboarding/me/form");
        } else {
          router.push("/ess");
        }
      } else {
        router.push("/dashboard");
      }
      router.refresh(); // Refresh to ensure middleware state is updated in the client
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-end relative bg-cover bg-left bg-no-repeat pr-12 md:pr-32"
      style={{
        backgroundImage: "url('/log%20in%20page%201.png')"
      }}
    >

      {/* Right Panel - Form */}
      <div className="w-full max-w-md relative z-10">

        <div className="flex mb-4 bg-white/80 dark:bg-gray-900/80 rounded-lg p-1 border border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setPortal("COMPANY_ADMIN")}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${portal === "COMPANY_ADMIN" ? "bg-orange-600 text-white" : "text-gray-600 dark:text-gray-300"}`}
          >
            HR / Admin Staff
          </button>
          <button
            type="button"
            onClick={() => setPortal("EMPLOYEE")}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${portal === "EMPLOYEE" ? "bg-orange-600 text-white" : "text-gray-600 dark:text-gray-300"}`}
          >
            Employee Login
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {portal === "EMPLOYEE" ? "Employee ID" : "Username"}
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={portal === "EMPLOYEE" ? "e.g. EMP00001" : "admin@zivira.com"}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {portal === "EMPLOYEE" ? "Temporary Password" : "Password"}
              </label>
              <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300">Forgot password?</a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${isLoading ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account? <a href="#" className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300">Request access</a>
        </p>
      </div>

    </div>
  );
}
