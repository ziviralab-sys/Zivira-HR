"use client";

import Link from "next/link";
import { useState, use } from "react";
import toast from "react-hot-toast";

export default function EmployeePayslipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const employeeId = id || "EMP001";
  
  const [isEmailing, setIsEmailing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleEmail = () => {
    setIsEmailing(true);
    toast("Preparing email...", { icon: "📧" });
    setTimeout(() => {
      setIsEmailing(false);
      toast.success(`Payslip successfully emailed to ${employeeId}@company.com`);
    }, 1500);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    toast("Generating PDF...", { icon: "📄" });
    setTimeout(() => {
      setIsDownloading(false);
      toast.success("Payslip PDF downloaded successfully!");
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-12">
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-4">
          <Link href={`/payroll/run`} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Payslip Preview</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleEmail}
            disabled={isEmailing}
            className={`px-4 py-2 border border-gray-300 rounded-lg font-medium transition-colors ${isEmailing ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-950'}`}
          >
            {isEmailing ? "Sending..." : "Email Payslip"}
          </button>
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${isDownloading ? 'bg-orange-400 text-white cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
          >
            {isDownloading ? "Downloading..." : "Download PDF"}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-800 shadow-lg p-12 print:shadow-none print:border-none">
        
        {/* Header */}
        <div className="text-center mb-10 pb-6 border-b-2 border-gray-800">
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">Zivira HR Solutions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">10 Business Park, Chennai, Tamil Nadu</p>
          <h2 className="text-xl font-bold text-orange-800 mt-6 uppercase tracking-wider">Payslip for the month of August 2026</h2>
        </div>

        {/* Employee Info Grid */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-10 text-sm">
          <div className="grid grid-cols-2">
            <span className="font-semibold text-gray-600 dark:text-gray-400">Employee Name:</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">Arun Kumar</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-semibold text-gray-600 dark:text-gray-400">Employee Code:</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{employeeId}</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-semibold text-gray-600 dark:text-gray-400">Designation:</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">Sales Executive</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-semibold text-gray-600 dark:text-gray-400">Department:</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">Sales</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-semibold text-gray-600 dark:text-gray-400">Total Working Days:</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">31</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-semibold text-gray-600 dark:text-gray-400">LWP Days:</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium text-red-600">0</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-semibold text-gray-600 dark:text-gray-400">UAN:</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">100123456789</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-semibold text-gray-600 dark:text-gray-400">PAN:</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">ABCDE1234F</span>
          </div>
        </div>

        {/* Salary Breakdown Table */}
        <div className="grid grid-cols-2 gap-0 border border-gray-300">
          
          {/* Earnings */}
          <div className="border-r border-gray-300">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 font-bold text-gray-800 dark:text-gray-200 border-b border-gray-300 flex justify-between">
              <span>Earnings</span>
              <span>Amount (₹)</span>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Basic</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">25,000.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">HRA</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">12,500.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Special Allowance</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">12,500.00</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-900 dark:text-gray-100 font-bold flex items-center gap-2">
                  Sales Incentive 
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-sm">One-time</span>
                </span>
                <span className="font-bold text-green-700">40,000.00</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-950 p-3 font-bold text-gray-900 dark:text-gray-100 border-t border-gray-300 flex justify-between mt-[45px]">
              <span>Gross Earnings (A)</span>
              <span>90,000.00</span>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 font-bold text-gray-800 dark:text-gray-200 border-b border-gray-300 flex justify-between">
              <span>Deductions</span>
              <span>Amount (₹)</span>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Provident Fund (PF)</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">3,000.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Professional Tax</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">200.00</span>
              </div>
              <div className="flex justify-between pt-2">
                <div className="flex flex-col">
                  <span className="text-gray-900 dark:text-gray-100 font-bold">Income Tax (TDS)</span>
                  <span className="text-xs text-red-500 max-w-[200px] leading-tight mt-1">Adjusted higher due to ₹40k incentive payout this month.</span>
                </div>
                <span className="font-bold text-red-700 mt-0.5">5,000.00</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-950 p-3 font-bold text-gray-900 dark:text-gray-100 border-t border-gray-300 flex justify-between mt-12">
              <span>Total Deductions (B)</span>
              <span>8,200.00</span>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="border border-gray-300 border-t-0 bg-orange-50 p-4 flex justify-between items-center">
          <span className="text-lg font-bold text-orange-900">NET PAY (A - B)</span>
          <span className="text-2xl font-black text-orange-900">₹81,800.00</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">Amount in words: Eighty-One Thousand Eight Hundred Rupees Only.</p>

        {/* Note */}
        <div className="mt-12 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
          This is a computer generated document and does not require a signature.
        </div>

      </div>
    </div>
  );
}
