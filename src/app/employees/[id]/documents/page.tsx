import Link from "next/link";

export default function HRDocumentVerificationPage({ params }: { params: { id: string } }) {
  const employeeId = params.id || "EMP00125";

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
          Pending Verification
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Priya Sharma</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{employeeId} - Full Stack Developer</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-gray-500 dark:text-gray-400">Onboarding Submitted: <span className="font-medium text-gray-900 dark:text-gray-100">Today</span></p>
            <p className="text-gray-500 dark:text-gray-400">Documents: <span className="font-medium text-gray-900 dark:text-gray-100">3/3 Uploaded</span></p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Aadhaar Card Review */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col md:flex-row">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex flex-col justify-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Aadhaar_Card.pdf</p>
              <button className="text-orange-600 text-xs font-semibold mt-2 hover:underline">View Document</button>
            </div>
            <div className="p-6 md:w-2/3 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Aadhaar Card</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status: <span className="text-yellow-600 font-medium">Under Review</span></p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors">
                  ✓ Verify
                </button>
                <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 rounded-lg transition-colors">
                  ✕ Reject
                </button>
              </div>
            </div>
          </div>

          {/* PAN Card Review */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col md:flex-row">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex flex-col justify-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">PAN_Scanned.jpg</p>
              <button className="text-orange-600 text-xs font-semibold mt-2 hover:underline">View Image</button>
            </div>
            <div className="p-6 md:w-2/3 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">PAN Card</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status: <span className="text-green-600 font-medium">Verified ✓</span></p>
                </div>
              </div>
              <div className="flex gap-3">
                <button disabled className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-400 font-medium py-2 rounded-lg cursor-not-allowed">
                  Verified
                </button>
                <button className="flex-1 border border-gray-300 hover:bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 font-medium py-2 rounded-lg transition-colors">
                  Revert Status
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
