"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

const steps = [
  "Personal Info",
  "Address",
  "Education",
  "Experience",
  "Documents"
];

export default function OnboardingFormPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      toast.success("Progress saved!");
    } else {
      toast.success("Onboarding submitted successfully!");
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

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
              onClick={(e) => { e.stopPropagation(); toast("Saved for later!"); }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 font-medium"
            >
              Save & Exit
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <form className="space-y-6">
              {currentStep === 0 && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                    <input type="text" defaultValue="Priya" disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                    <input type="text" defaultValue="Sharma" disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                    <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900">
                      <option>Select</option>
                      <option>Female</option>
                      <option>Male</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Personal Email</label>
                    <input type="email" placeholder="Personal email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                    <input type="tel" placeholder="10-digit number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                </div>
              )}

              {currentStep > 0 && (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-lg mb-2">Simulated {steps[currentStep]} Fields</p>
                  <p className="text-sm">In the real app, the specific form fields for this step will load here.</p>
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4">
                {currentStep > 0 && (
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentStep(prev => prev - 1); }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Back
                  </button>
                )}
                {currentStep < steps.length - 1 ? (
                  <button 
                    onClick={handleNext}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
                  >
                    Save & Next
                  </button>
                ) : (
                  <Link 
                    href="/onboarding/abc12345/documents"
                    onClick={(e) => { e.stopPropagation(); toast.success("Redirecting to Document Verification..."); }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                  >
                    Complete Onboarding
                  </Link>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
