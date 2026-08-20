"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiClient, type LeaveApplication } from "@/lib/api-client";

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?";
}

// Zivira_HR_Client_Requirement_1A.docx §25 Leave Management — HR side:
// review PENDING applications, Approve/Reject. Backed by GET/PATCH
// /company/leave/*. isLWP-flagged leave feeds straight into the next
// Payroll Run's LWP deduction once approved.
export default function LeaveManagementPage() {
  const [requests, setRequests] = useState<LeaveApplication[]>([]);
  const [approved, setApproved] = useState<LeaveApplication[]>([]);
  const [activeTab, setActiveTab] = useState<"Pending Approvals" | "Approved Leaves">("Pending Approvals");
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    setIsLoading(true);
    Promise.all([apiClient.leaveApplications("PENDING"), apiClient.leaveApplications("APPROVED")])
      .then(([pendingRes, approvedRes]) => {
        setRequests(pendingRes.data);
        setApproved(approvedRes.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: string, name: string) => {
    try {
      await apiClient.approveLeave(id);
      toast.success(`Leave request for ${name} approved!`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve leave");
    }
  };

  const handleReject = async (id: string, name: string) => {
    try {
      await apiClient.rejectLeave(id);
      toast.error(`Leave request for ${name} rejected.`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject leave");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Leave Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Review pending leave requests, approve time off, and monitor team availability.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("Pending Approvals")}
          className={`pb-3 font-bold ${activeTab === 'Pending Approvals' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          Pending Approvals
          <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs ml-2">{requests.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("Approved Leaves")}
          className={`pb-3 font-bold ${activeTab === 'Approved Leaves' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          Approved Leaves
        </button>
      </div>

      {isLoading && <p className="text-center text-gray-400 py-12">Loading…</p>}

      {/* Leave Requests Grid */}
      {!isLoading && activeTab === "Pending Approvals" && (
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
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-orange-100 text-orange-600">
                      {initials(req.employeeName ?? req.employeeCode)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{req.employeeName ?? req.employeeCode}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{req.employeeCode}</p>
                    </div>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">Pending</span>
                </div>

                <div className={`${req.isLWP ? 'bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50' : 'bg-gray-50 dark:bg-gray-950 border border-transparent'} rounded-lg p-4 mb-4`}>
                  <p className={`font-semibold mb-1 flex justify-between ${req.isLWP ? 'text-red-800 dark:text-red-300' : 'text-gray-800 dark:text-gray-200'}`}>
                    <span>{req.leaveType}</span>
                    <span className="text-sm font-bold text-orange-600">{req.days} Day{req.days === 1 ? "" : "s"}</span>
                  </p>
                  <p className={`text-sm ${req.isLWP ? 'text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {req.fromDate?.slice(0, 10)} to {req.toDate?.slice(0, 10)}
                  </p>
                  {req.reason && (
                    <div className={`mt-3 pt-3 border-t ${req.isLWP ? 'border-red-200 dark:border-red-900/50' : 'border-gray-200 dark:border-gray-800'}`}>
                      <p className={`text-xs italic ${req.isLWP ? 'text-red-800 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}>"{req.reason}"</p>
                    </div>
                  )}
                </div>

                {req.isLWP && (
                  <div className="flex items-center justify-between text-sm mb-5">
                    <span className="text-gray-500 dark:text-gray-400">Impact:</span>
                    <span className="font-bold text-red-600">Will deduct from this month's payroll</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(req.id, req.employeeName ?? req.employeeCode)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors shadow-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(req.id, req.employeeName ?? req.employeeCode)}
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

      {!isLoading && activeTab === "Approved Leaves" && (
        <div className="pt-4">
          {approved.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              <p>No approved leaves yet.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Employee</th>
                    <th className="px-6 py-3 font-semibold">Type</th>
                    <th className="px-6 py-3 font-semibold">Dates</th>
                    <th className="px-6 py-3 font-semibold">Days</th>
                    <th className="px-6 py-3 font-semibold">LWP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {approved.map((req) => (
                    <tr key={req.id}>
                      <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">{req.employeeName ?? req.employeeCode}</td>
                      <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{req.leaveType}</td>
                      <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{req.fromDate?.slice(0, 10)} to {req.toDate?.slice(0, 10)}</td>
                      <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{req.days}</td>
                      <td className="px-6 py-3">{req.isLWP ? <span className="text-red-600 font-bold text-xs">LWP</span> : <span className="text-gray-400 text-xs">Paid</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
