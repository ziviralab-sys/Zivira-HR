"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

const initialRequests = [
  {
    id: "REQ001",
    initials: "AK",
    colorClass: "bg-orange-100 text-orange-600",
    name: "Arun Kumar",
    role: "Sales Executive",
    type: "Sick Leave",
    duration: "2 Days",
    date: "21 Aug 2026 - 22 Aug 2026",
    reason: "Severe viral fever, doctor advised 2 days of bed rest. Medical certificate attached.",
    balance: "6 Days (Sick)",
    typeColor: "text-red-600",
    isLWP: false,
    impact: ""
  },
  {
    id: "REQ002",
    initials: "MP",
    colorClass: "bg-purple-100 text-purple-600",
    name: "Meena Patel",
    role: "HR Manager",
    type: "Casual Leave",
    duration: "1 Day",
    date: "25 Aug 2026",
    reason: "Attending a family function out of town.",
    balance: "12 Days (Casual)",
    typeColor: "text-orange-600",
    isLWP: false,
    impact: ""
  },
  {
    id: "REQ003",
    initials: "RR",
    colorClass: "bg-orange-100 text-orange-600",
    name: "Ravi Raj",
    role: "Operations",
    type: "Leave Without Pay",
    duration: "4 Days",
    date: "28 Aug 2026 - 31 Aug 2026",
    reason: "Exhausted all casual leaves, need time off for personal emergency.",
    balance: "",
    typeColor: "text-red-600",
    isLWP: true,
    impact: "Will deduct from Aug Payroll"
  }
];

export default function LeaveManagementPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [activeTab, setActiveTab] = useState("Pending Approvals");

  const handleApprove = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setRequests(prev => prev.filter(req => req.id !== id));
    toast.success(`Leave request for ${name} approved!`);
  };

  const handleReject = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setRequests(prev => prev.filter(req => req.id !== id));
    toast.error(`Leave request for ${name} rejected.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Leave Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Review pending leave requests, approve time off, and monitor team availability.</p>
        </div>
        <button onClick={(e) => e.stopPropagation()} className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm">
          Add Leave on Behalf
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800">
        <button 
          onClick={(e) => { e.stopPropagation(); setActiveTab("Pending Approvals"); }}
          className={`pb-3 font-bold ${activeTab === 'Pending Approvals' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          Pending Approvals 
          <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs ml-2">{requests.length}</span>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setActiveTab("Approved Leaves"); }}
          className={`pb-3 font-bold ${activeTab === 'Approved Leaves' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          Approved Leaves
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setActiveTab("Team Calendar"); }}
          className={`pb-3 font-bold ${activeTab === 'Team Calendar' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          Team Calendar
        </button>
      </div>

      {/* Leave Requests Grid */}
      {activeTab === "Pending Approvals" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {requests.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">All caught up!</p>
              <p>There are no pending leave requests to review.</p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${req.colorClass}`}>
                      {req.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{req.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{req.role}</p>
                    </div>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">Pending</span>
                </div>

                <div className={`${req.isLWP ? 'bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50' : 'bg-gray-50 dark:bg-gray-950 border border-transparent'} rounded-lg p-4 mb-4`}>
                  <p className={`font-semibold mb-1 flex justify-between ${req.isLWP ? 'text-red-800 dark:text-red-300' : 'text-gray-800 dark:text-gray-200'}`}>
                    <span>{req.type}</span>
                    <span className={`text-sm font-bold ${req.typeColor}`}>{req.duration}</span>
                  </p>
                  <p className={`text-sm ${req.isLWP ? 'text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>{req.date}</p>
                  <div className={`mt-3 pt-3 border-t ${req.isLWP ? 'border-red-200 dark:border-red-900/50' : 'border-gray-200 dark:border-gray-800'}`}>
                    <p className={`text-xs italic ${req.isLWP ? 'text-red-800 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}>"{req.reason}"</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm mb-5">
                  <span className="text-gray-500 dark:text-gray-400">{req.isLWP ? 'Impact:' : 'Available Balance:'}</span>
                  <span className={`font-bold ${req.isLWP ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                    {req.isLWP ? req.impact : req.balance}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={(e) => handleApprove(e, req.id, req.name)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors shadow-sm"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={(e) => handleReject(e, req.id, req.name)}
                    className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2 rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "Approved Leaves" && (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          <p>Approved leaves will appear here.</p>
        </div>
      )}

      {activeTab === "Team Calendar" && (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          <p>Team calendar view will appear here.</p>
        </div>
      )}

    </div>
  );
}
