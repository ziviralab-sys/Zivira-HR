"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

const initialEmployees = [
  {
    id: "EMP1025",
    name: "Priya Sharma",
    basic: "25,000",
    incentive: "0",
    incentiveNote: "",
    lwp: "0",
    lwpNote: "",
    tax: "-3,000",
    taxNote: "",
    loan: "0",
    loanNote: "",
    net: "46,800",
    hasIncentive: false,
    hasLWP: false,
    status: "Normal"
  },
  {
    id: "EMP001",
    name: "Arun Kumar",
    basic: "25,000",
    incentive: "+40,000",
    incentiveNote: "Sales Inc.",
    lwp: "0",
    lwpNote: "",
    tax: "-8,000",
    taxNote: "Adj. for Inc.",
    loan: "0",
    loanNote: "",
    net: "81,800",
    hasIncentive: true,
    hasLWP: false,
    status: "Overridden"
  },
  {
    id: "EMP003",
    name: "Ravi Raj",
    basic: "30,000",
    incentive: "0",
    incentiveNote: "",
    lwp: "-2,000",
    lwpNote: "2 Days",
    tax: "-3,500",
    taxNote: "",
    loan: "-5,000",
    loanNote: "Personal",
    net: "49,500",
    hasIncentive: false,
    hasLWP: true,
    status: "Errors"
  }
];

export default function RunPayrollPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("Filter: All");
  
  // Real State for Demo
  const [payrollStatus, setPayrollStatus] = useState("Draft Calculated");
  const [isCalculating, setIsCalculating] = useState(false);
  const [employees, setEmployees] = useState(initialEmployees);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filter === "Filter: Errors") {
      matchesFilter = emp.status === "Errors";
    } else if (filter === "Filter: Overridden") {
      matchesFilter = emp.status === "Overridden";
    }

    return matchesSearch && matchesFilter;
  });

  const handleCalculate = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent global demo toast
    setIsCalculating(true);
    setPayrollStatus("Processing...");
    setTimeout(() => {
      setIsCalculating(false);
      setPayrollStatus("Calculated");
      toast.success("Payroll calculated successfully!");
    }, 2000);
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPayrollStatus("Draft");
    toast.error("Payroll rejected and set to Draft.");
  };

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (payrollStatus === "Locked") {
      toast("Payroll is already locked.", { icon: "🔒" });
      return;
    }
    setPayrollStatus("Locked");
    toast.success("Payroll approved and locked for the month!", { icon: "🔒" });
  };

  const handleOverride = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (payrollStatus === "Locked") {
      toast.error("Cannot override a locked payroll.");
      return;
    }
    
    const newValue = prompt(`Enter new override Net Salary for ${id}:`);
    if (newValue && !isNaN(Number(newValue.replace(/,/g, '')))) {
      setEmployees(prev => prev.map(emp => {
        if (emp.id === id) {
          return { ...emp, net: newValue, status: "Overridden" };
        }
        return emp;
      }));
      toast.success(`Salary overridden for ${id}`);
    } else if (newValue) {
      toast.error("Invalid number entered.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Run Payroll</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Process salary calculations for the current month.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={(e) => e.stopPropagation()} className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:bg-gray-950 transition-colors">
            Export to Accounts
          </button>
          <button 
            onClick={handleCalculate}
            disabled={isCalculating || payrollStatus === "Locked"}
            className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${isCalculating || payrollStatus === "Locked" ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
          >
            {isCalculating ? "Calculating..." : "Calculate Payroll"}
          </button>
        </div>
      </div>

      {/* Payroll Configuration & Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Payroll Month</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">August 2026</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Payroll Cycle</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">25th to 25th</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">228</p>
        </div>
        <div className={`p-6 rounded-xl border shadow-sm ${payrollStatus === 'Locked' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
          <p className={`text-sm font-medium uppercase tracking-wide ${payrollStatus === 'Locked' ? 'text-green-600' : 'text-orange-600'}`}>Status</p>
          <p className={`text-2xl font-bold mt-1 ${payrollStatus === 'Locked' ? 'text-green-800' : 'text-orange-800'}`}>{payrollStatus}</p>
        </div>
      </div>

      {/* Main Payroll Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mt-8">
        <div className="p-4 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 dark:text-gray-200">Calculation Preview</h2>
          <div className="flex gap-2 text-sm">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white dark:bg-gray-900 border border-gray-300 px-3 py-1.5 rounded text-gray-600 dark:text-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option>Filter: All</option>
              <option>Filter: Errors</option>
              <option>Filter: Overridden</option>
            </select>
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Employee..." 
                className="bg-white dark:bg-gray-900 border border-gray-300 pl-8 pr-3 py-1.5 rounded text-gray-600 dark:text-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 w-48"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold text-right">Basic (₹)</th>
                <th className="px-6 py-4 font-semibold text-right text-orange-700">Incentive / Arrears</th>
                <th className="px-6 py-4 font-semibold text-right text-red-700">LWP Ded.</th>
                <th className="px-6 py-4 font-semibold text-right text-red-700">Tax Ded.</th>
                <th className="px-6 py-4 font-semibold text-right text-red-700">Loan Ded.</th>
                <th className="px-6 py-4 font-bold text-right text-gray-900 dark:text-gray-100">Net Salary (₹)</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No employees match your search.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className={`hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors ${emp.hasIncentive ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{emp.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{emp.id}</p>
                    </td>
                    <td className="px-6 py-4 text-right">{emp.basic}</td>
                    <td className="px-6 py-4 text-right">
                      {emp.incentive !== "0" ? (
                        <>
                          <span className="font-medium text-orange-600">{emp.incentive}</span>
                          <span className="text-xs text-gray-400 block">{emp.incentiveNote}</span>
                        </>
                      ) : "0"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {emp.lwp !== "0" ? (
                        <>
                          <span className="text-red-600 font-medium">{emp.lwp}</span>
                          <span className="text-xs text-gray-400 block">{emp.lwpNote}</span>
                        </>
                      ) : "0"}
                    </td>
                    <td className="px-6 py-4 text-right text-red-600">
                      {emp.tax !== "0" && emp.taxNote ? (
                        <>
                          <span className="font-bold">{emp.tax}</span>
                          <span className="text-xs text-gray-400 block">{emp.taxNote}</span>
                        </>
                      ) : (
                        emp.tax
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {emp.loan !== "0" ? (
                        <>
                          <span className="text-red-600 font-medium">{emp.loan}</span>
                          <span className="text-xs text-gray-400 block">{emp.loanNote}</span>
                        </>
                      ) : "0"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-gray-100">
                      {emp.hasIncentive ? (
                        <Link href={`/employees/${emp.id}/payslip`} className="text-orange-600 hover:underline">{emp.net}</Link>
                      ) : (
                        emp.net
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={(e) => handleOverride(e, emp.id)}
                        disabled={payrollStatus === "Locked"}
                        className={`font-medium text-xs ${payrollStatus === "Locked" ? 'text-gray-400 cursor-not-allowed' : 'text-orange-600 hover:underline'}`}
                      >
                        Override
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-end gap-4 mt-6">
        <button 
          onClick={handleReject}
          disabled={payrollStatus === "Locked"}
          className={`px-6 py-3 border rounded-lg font-medium transition-colors ${payrollStatus === "Locked" ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
        >
          Reject & Recalculate
        </button>
        <button 
          onClick={handleApprove}
          disabled={payrollStatus === "Locked"}
          className={`px-6 py-3 rounded-lg font-medium transition-colors shadow-sm ${payrollStatus === "Locked" ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
        >
          {payrollStatus === "Locked" ? "Locked" : "Approve & Lock Payroll"}
        </button>
      </div>

    </div>
  );
}
