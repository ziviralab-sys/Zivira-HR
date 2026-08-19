const MOCK_EMPLOYEES = [
  { id: "EMP-001", name: "John Doe", role: "Software Engineer", department: "Engineering", status: "Active" },
  { id: "EMP-002", name: "Jane Smith", role: "Product Manager", department: "Product", status: "Active" },
  { id: "EMP-003", name: "Robert Johnson", role: "HR Specialist", department: "Human Resources", status: "On Leave" },
  { id: "EMP-004", name: "Emily Davis", role: "UX Designer", department: "Design", status: "Active" },
  { id: "EMP-005", name: "Michael Wilson", role: "Data Analyst", department: "Data Science", status: "Inactive" },
];

import Link from "next/link";

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Employee Directory</h1>
        <Link href="/employees/add" className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm inline-block">
          Add Employee
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee ID</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_EMPLOYEES.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 dark:bg-gray-950 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{emp.id}</td>
                  <td className="px-6 py-4">{emp.name}</td>
                  <td className="px-6 py-4">{emp.role}</td>
                  <td className="px-6 py-4">{emp.department}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      emp.status === "Active" ? "bg-green-100 text-green-700" :
                      emp.status === "On Leave" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/employees/${emp.id}`} className="text-orange-600 hover:text-orange-800 font-medium bg-orange-50 px-3 py-1.5 rounded-lg transition-colors">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
