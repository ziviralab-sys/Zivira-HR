"use client";

import Link from "next/link";
import { useState, use } from "react";
import toast from "react-hot-toast";

export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 15+, params is a Promise in client components and must be unwrapped
  const { id: employeeId } = use(params);
  
  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    designation: "Full Stack Developer",
    department: "Technology",
    joinDate: "2026-08-10", // Using YYYY-MM-DD for date inputs
    email: "priya@company.com",
    manager: "Technical Manager"
  });

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleEditToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditing) {
      // Cancel edit
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Employee Profile</h1>
        <div className="flex gap-3">
          {isEditing ? (
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm inline-block"
            >
              Save Changes
            </button>
          ) : (
            <button 
              onClick={handleEditToggle}
              className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:bg-gray-950 transition-colors"
            >
              Edit Profile
            </button>
          )}
          <Link href="/onboarding/abc12345/form" className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm inline-block">
            Generate Onboarding (Demo)
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-8 flex items-start gap-8 border-b border-gray-100 dark:border-gray-800">
          <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-3xl font-bold">
            P
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Priya Sharma</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{employeeId}</p>
            <div className="flex gap-4 mt-4 text-sm">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">Active</span>
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">Onboarding: Not Started</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Employment Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-12">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Designation</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={profileData.designation} 
                  onChange={(e) => setProfileData({...profileData, designation: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-900 dark:text-gray-100">{profileData.designation}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Department</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={profileData.department} 
                  onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-900 dark:text-gray-100">{profileData.department}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Joining Date</p>
              {isEditing ? (
                <input 
                  type="date" 
                  value={profileData.joinDate} 
                  onChange={(e) => setProfileData({...profileData, joinDate: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-900 dark:text-gray-100">{profileData.joinDate}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Official Email</p>
              {isEditing ? (
                <input 
                  type="email" 
                  value={profileData.email} 
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-900 dark:text-gray-100">{profileData.email}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reporting Manager</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={profileData.manager} 
                  onChange={(e) => setProfileData({...profileData, manager: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-900 dark:text-gray-100">{profileData.manager}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mt-6">
        <button 
          onClick={(e) => { e.stopPropagation(); setActiveTab("Overview"); }}
          className={`px-6 py-3 font-medium ${activeTab === 'Overview' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          Overview
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setActiveTab("Attendance"); }}
          className={`px-6 py-3 font-medium ${activeTab === 'Attendance' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          Attendance
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setActiveTab("Leave"); }}
          className={`px-6 py-3 font-medium ${activeTab === 'Leave' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          Leave
        </button>
        <Link href={`/employees/${employeeId}/payroll`} className="px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 font-medium">Payroll</Link>
        <Link href={`/employees/${employeeId}/documents`} className="px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 font-medium">Documents</Link>
      </div>

      {activeTab === "Attendance" && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center mt-6">
          <p className="text-gray-500 dark:text-gray-400">Attendance records will appear here.</p>
          <button 
            onClick={(e) => { e.stopPropagation(); toast.success("Attendance overridden!"); }}
            className="mt-4 px-4 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50"
          >
            Override Attendance Demo
          </button>
        </div>
      )}

      {activeTab === "Leave" && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center mt-6">
          <p className="text-gray-500 dark:text-gray-400">Leave history will appear here.</p>
        </div>
      )}

    </div>
  );
}
