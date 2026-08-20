import Link from "next/link";

export default function EmployeeDocumentUploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Onboarding Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed left-0 top-0 h-full p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-8">Employee Onboarding</h2>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 text-green-600 font-medium">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-sm">✓</div>
            Personal Info
          </div>
          <div className="flex items-center gap-3 text-green-600 font-medium">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-sm">✓</div>
            Address
          </div>
          <div className="flex items-center gap-3 text-green-600 font-medium">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-sm">✓</div>
            Education
          </div>
          <div className="flex items-center gap-3 text-green-600 font-medium">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-sm">✓</div>
            Experience
          </div>
          <div className="flex items-center gap-3 text-orange-600 font-medium">
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-sm">5</div>
            Documents
          </div>
        </nav>

        <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">Progress: 80%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-orange-600 h-2 rounded-full" style={{ width: "80%" }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Upload Documents</h1>
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 font-medium">
              Save & Exit
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please upload clear PDF or image files for the following required documents.</p>
            
            <div className="space-y-4">
              
              {/* Aadhaar */}
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Aadhaar Card <span className="text-red-500">*</span></h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Max size: 5MB</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-green-600">Aadhaar.pdf ✓</span>
                  <button className="text-orange-600 hover:text-orange-800 font-medium text-sm">Replace</button>
                </div>
              </div>

              {/* PAN */}
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">PAN Card <span className="text-red-500">*</span></h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Max size: 5MB</p>
                </div>
                <button className="px-4 py-2 border border-orange-600 text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors text-sm">
                  Upload File
                </button>
              </div>

              {/* Degree */}
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Degree Certificate <span className="text-red-500">*</span></h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Max size: 5MB</p>
                </div>
                <button className="px-4 py-2 border border-orange-600 text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors text-sm">
                  Upload File
                </button>
              </div>

            </div>

            <div className="pt-8 mt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <Link href="#" className="text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:text-gray-300">Back</Link>
              <button className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm text-lg">
                Submit Onboarding
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
