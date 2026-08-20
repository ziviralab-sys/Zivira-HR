// Real backend API client for the HR portal, following the same pattern
// already used by the Manager/Field-Force apps in this platform (see
// Zivira-Manager-main/lib/api-client.ts). Previously this repo had no
// lib/ directory at all and every page used hardcoded mock data.
//
// The HR portal authenticates against the same backend as the Admin app,
// using portal "COMPANY_ADMIN" — the /company/* routes this client calls
// (employees, salary-structures, payroll/runs, holidays, onboarding,
// attendance, leave, loans, arrears, dashboard, reports) all require
// requireCompanyAdmin on the backend. The Employee Self-Service (ESS)
// screens use portal "EMPLOYEE" and the /ess/* routes, gated by
// requireEmployee — see Zivira_HR_Client_Requirement_1B.docx "Employee
// Login" flow.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://zivira-backend-7qkt.onrender.com/api";
const TOKEN_KEY = "zivira.hr.token";
const USER_KEY = "zivira.hr.user";

export type Employee = {
  id: string;
  employeeCode: string;
  name: string;
  designation: string;
  division: string;
  reportingManager?: string;
  territory: string;
  role: "NBH" | "BH" | "RBM" | "ZBM" | "ABM" | "SR_MR" | "MR" | "OTHER";
  email?: string | null;
  phone?: string | null;
  joinDate?: string | null;
  state?: string | null;
  status: "ACTIVE" | "INACTIVE";
  [key: string]: unknown;
};

export type SalaryStructure = {
  id: string;
  employeeCode: string;
  ctc: number;
  basicPercent: number;
  hraPercent: number;
  allowancePercent: number;
  effectiveFrom: string;
  status: "ACTIVE" | "INACTIVE";
};

export type PayrollRun = {
  id: string;
  employeeCode: string;
  employeeName?: string | null;
  month: string;
  basic: number;
  hra: number;
  allowance: number;
  grossEarnings: number;
  workingDays: number;
  lwpDays: number;
  lwpDeduction: number;
  incentive: number;
  incentiveNote?: string | null;
  loanDeduction: number;
  arrears: number;
  estimatedTax: number;
  // Phase 2 "Advanced Statutory Calculations" + "OT" — see statutory-rule.model.ts.
  pfEmployee: number;
  pfEmployer: number;
  professionalTax: number;
  esiEmployee: number;
  esiEmployer: number;
  otHours: number;
  otAmount: number;
  netPay: number;
  status: "DRAFT" | "HR_APPROVED" | "LOCKED";
  approvedBy?: string | null;
  approvedAt?: string | null;
};

export type ProfessionalTaxSlab = { minGross: number; maxGross: number | null; amount: number };

// Phase 2 "Advanced Statutory Calculations" + the old mock UI's "Payroll
// Rules Engine" — one editable ACTIVE rule set per tenant.
export type StatutoryRule = {
  id: string;
  pfEnabled: boolean;
  pfEmployeeRate: number;
  pfEmployerRate: number;
  pfWageCeiling: number;
  ptEnabled: boolean;
  ptSlabs: ProfessionalTaxSlab[];
  esiEnabled: boolean;
  esiEmployeeRate: number;
  esiEmployerRate: number;
  esiWageCeiling: number;
  otEnabled: boolean;
  standardShiftHours: number;
  otRatePerHour: number;
  status: "ACTIVE" | "INACTIVE";
};

// Phase 2 "Comp-Off" item.
export type CompOff = {
  id: string;
  employeeCode: string;
  employeeName?: string | null;
  earnedDate: string;
  reason: string;
  expiresOn?: string | null;
  status: "AVAILABLE" | "USED" | "EXPIRED";
  usedInLeaveId?: string | null;
};

export type Holiday = {
  id: string;
  stateName: string;
  weekendHoliday?: string | null;
  otherHolidayDate?: string | null;
  otherHolidayDescription?: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export type OnboardingDocument = {
  name: string;
  fileName?: string | null;
  status: "PENDING" | "UPLOADED" | "VERIFIED" | "REJECTED";
  rejectReason?: string | null;
};

export type Onboarding = {
  id: string;
  onboardingId: string;
  employeeCode: string;
  employeeName?: string | null;
  status: "NOT_STARTED" | "INITIATED" | "EMAIL_SENT" | "PASSWORD_CREATED" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED";
  personal?: Record<string, unknown> | null;
  address?: Record<string, unknown> | null;
  education?: Record<string, unknown>[];
  experience?: Record<string, unknown>[];
  bank?: Record<string, unknown> | null;
  statutory?: Record<string, unknown> | null;
  documents: OnboardingDocument[];
  submittedAt?: string | null;
  completedAt?: string | null;
};

export type Attendance = {
  id: string;
  employeeCode: string;
  attendanceDate: string;
  status: "PRESENT" | "ABSENT" | "LEAVE";
  checkInAt?: string | null;
  checkOutAt?: string | null;
};

export type LeaveApplication = {
  id: string;
  employeeCode: string;
  employeeName?: string | null;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason?: string | null;
  isLWP: boolean;
  isCompOff?: boolean;
  compOffId?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectReason?: string | null;
};

export type Loan = {
  id: string;
  employeeCode: string;
  principal: number;
  emiAmount: number;
  remainingBalance: number;
  reason?: string | null;
  startMonth: string;
  status: "ACTIVE" | "CLOSED";
};

export type Arrear = {
  id: string;
  employeeCode: string;
  month: string;
  amount: number;
  reason?: string | null;
  status: "PENDING" | "APPLIED";
};

export type HrDashboard = {
  totalEmployees: number;
  newJoiners: number;
  pendingOnboarding: number;
  completedOnboarding: number;
  presentToday: number;
  absentOrLeaveToday: number;
  pendingLeaveApprovals: number;
  payrollMonth: string;
  payrollRowsGenerated: number;
  payrollLocked: boolean;
};

export type PayrollSummary = {
  month: string;
  headcount: number;
  grossEarnings: number;
  netPay: number;
  lwpDeduction: number;
  loanDeduction: number;
  incentive: number;
  arrears: number;
  estimatedTax: number;
  pfEmployee: number;
  pfEmployer: number;
  professionalTax: number;
  esiEmployee: number;
  esiEmployer: number;
  otHours: number;
  otAmount: number;
  draft: number;
  hrApproved: number;
  locked: number;
};

export type StatutorySummary = {
  month: string;
  rows: { employeeCode: string; employeeName: string | null; basic: number; pfEmployee: number; pfEmployer: number; professionalTax: number; esiEmployee: number; esiEmployer: number }[];
  totals: { pfEmployee: number; pfEmployer: number; professionalTax: number; esiEmployee: number; esiEmployer: number };
};

export type OtSummary = {
  month: string;
  rows: { employeeCode: string; employeeName: string | null; otHours: number; otAmount: number }[];
  totalHours: number;
  totalAmount: number;
};

export type CompOffSummary = {
  rows: CompOff[];
  available: number;
  used: number;
  expired: number;
};

type ApiEnvelope<T> = { data: T; [key: string]: unknown };
type Portal = "COMPANY_ADMIN" | "EMPLOYEE";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: Record<string, unknown>) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers
    }
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.error?.message ?? "API request failed");
  }
  return payload as ApiEnvelope<T>;
}

export const apiClient = {
  login: (username: string, password: string, portal: Portal = "COMPANY_ADMIN") =>
    request<{ token: string; user: Record<string, unknown> }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password, portal })
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword })
    }),

  // No single-employee GET exists on the backend — pages that need one
  // employee fetch the full list and find() by employeeCode client-side
  // (same pattern already used by employees/[id]/payroll/page.tsx).
  employees: () => request<Employee[]>("/company/employees"),
  createEmployee: (input: Omit<Employee, "id" | "status"> & { status?: "ACTIVE" | "INACTIVE" }) =>
    request<Employee>("/company/employees", { method: "POST", body: JSON.stringify(input) }),

  salaryStructures: (employeeCode?: string) =>
    request<SalaryStructure[]>(`/company/salary-structures${employeeCode ? `?employeeCode=${employeeCode}` : ""}`),
  createSalaryStructure: (input: Omit<SalaryStructure, "id" | "status"> & { status?: "ACTIVE" | "INACTIVE" }) =>
    request<SalaryStructure>("/company/salary-structures", { method: "POST", body: JSON.stringify(input) }),

  generatePayrollRun: (month: string) =>
    request<PayrollRun[]>("/company/payroll/runs", { method: "POST", body: JSON.stringify({ month }) }),
  payrollRuns: (month?: string) =>
    request<PayrollRun[]>(`/company/payroll/runs${month ? `?month=${month}` : ""}`),
  updatePayrollRun: (id: string, input: { incentive?: number; incentiveNote?: string; estimatedTax?: number }) =>
    request<PayrollRun>(`/company/payroll/runs/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  approvePayrollRun: (id: string) =>
    request<PayrollRun>(`/company/payroll/runs/${id}/approve`, { method: "PATCH" }),
  lockPayrollRun: (id: string) =>
    request<PayrollRun>(`/company/payroll/runs/${id}/lock`, { method: "PATCH" }),
  payslip: (id: string) =>
    request<PayrollRun & { employeeName?: string; designation?: string; division?: string }>(`/company/payroll/runs/${id}/payslip`),

  holidays: () => request<Holiday[]>("/company/holidays"),

  // Payroll Rules Engine (Phase 2 "Advanced Statutory Calculations" + the
  // old mock UI's editable PF/Professional-Tax screen).
  payrollRules: () => request<StatutoryRule>("/company/payroll/rules"),
  updatePayrollRules: (input: Omit<StatutoryRule, "id" | "status">) =>
    request<StatutoryRule>("/company/payroll/rules", { method: "PUT", body: JSON.stringify(input) }),

  // Comp-Off (Phase 2 item) — HR grant + list.
  compOffs: (employeeCode?: string) => request<CompOff[]>(`/company/comp-offs${employeeCode ? `?employeeCode=${employeeCode}` : ""}`),
  grantCompOff: (input: { employeeCode: string; earnedDate: string; reason: string; expiresOn?: string }) =>
    request<CompOff>("/company/comp-offs", { method: "POST", body: JSON.stringify(input) }),

  // Onboarding — Zivira_HR_Client_Requirement_1B.docx "complete employee
  // journey" (HR side).
  onboardingList: () => request<Onboarding[]>("/company/onboarding"),
  onboarding: (employeeCode: string) => request<Onboarding>(`/company/onboarding/${employeeCode}`),
  generateOnboarding: (employeeCode: string) =>
    request<Onboarding>(`/company/onboarding/${employeeCode}/generate`, { method: "POST" }),
  triggerOnboardingMail: (employeeCode: string) =>
    request<Onboarding>(`/company/onboarding/${employeeCode}/trigger-mail`, { method: "POST" }),
  verifyOnboardingDocument: (employeeCode: string, docName: string) =>
    request<Onboarding>(`/company/onboarding/${employeeCode}/documents/${encodeURIComponent(docName)}/verify`, { method: "PATCH" }),
  rejectOnboardingDocument: (employeeCode: string, docName: string, reason: string) =>
    request<Onboarding>(`/company/onboarding/${employeeCode}/documents/${encodeURIComponent(docName)}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason })
    }),
  completeOnboarding: (employeeCode: string) =>
    request<Onboarding>(`/company/onboarding/${employeeCode}/complete`, { method: "PATCH" }),

  // Attendance Import (bulk) + list
  importAttendance: (rows: { employeeCode: string; attendanceDate: string; status: "PRESENT" | "ABSENT" | "LEAVE"; checkInAt?: string; checkOutAt?: string }[]) =>
    request<{ imported: number; errors: { row: number; error: string }[] }>("/company/attendance/import", {
      method: "POST",
      body: JSON.stringify({ rows })
    }),
  attendance: (params?: { employeeCode?: string; month?: string }) => {
    const qs = new URLSearchParams();
    if (params?.employeeCode) qs.set("employeeCode", params.employeeCode);
    if (params?.month) qs.set("month", params.month);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<Attendance[]>(`/company/attendance${suffix}`);
  },

  // Leave (HR side)
  leaveApplications: (status?: string) =>
    request<LeaveApplication[]>(`/company/leave${status ? `?status=${status}` : ""}`),
  approveLeave: (id: string) => request<LeaveApplication>(`/company/leave/${id}/approve`, { method: "PATCH" }),
  rejectLeave: (id: string, reason?: string) =>
    request<LeaveApplication>(`/company/leave/${id}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) }),

  // Loans
  loans: (employeeCode?: string) => request<Loan[]>(`/company/loans${employeeCode ? `?employeeCode=${employeeCode}` : ""}`),
  createLoan: (input: { employeeCode: string; principal: number; emiAmount: number; reason?: string; startMonth: string }) =>
    request<Loan>("/company/loans", { method: "POST", body: JSON.stringify(input) }),

  // Arrears
  arrears: (employeeCode?: string) => request<Arrear[]>(`/company/arrears${employeeCode ? `?employeeCode=${employeeCode}` : ""}`),
  createArrear: (input: { employeeCode: string; month: string; amount: number; reason?: string }) =>
    request<Arrear>("/company/arrears", { method: "POST", body: JSON.stringify(input) }),

  // Dashboard + Reports
  hrDashboard: () => request<HrDashboard>("/company/hr-dashboard"),
  payrollSummary: (month: string) => request<PayrollSummary>(`/company/reports/payroll-summary?month=${month}`),
  payrollExportUrl: (month: string) => `${API_BASE_URL}/company/reports/payroll-export?month=${month}`,
  // Phase 2 "Advanced Reports"
  statutorySummary: (month: string) => request<StatutorySummary>(`/company/reports/statutory-summary?month=${month}`),
  otSummary: (month: string) => request<OtSummary>(`/company/reports/ot-summary?month=${month}`),
  compOffSummary: () => request<CompOffSummary>("/company/reports/comp-off-summary"),

  // Employee Self-Service (ESS) — Zivira_HR_Client_Requirement_1B.docx
  // Employee Login portal. Every call here is scoped to the logged-in
  // employee's own records by the backend (requireEmployee).
  essProfile: () => request<Employee & { onboardingStatus: string }>("/ess/profile"),
  essOnboarding: () => request<Onboarding>("/ess/onboarding"),
  essSaveOnboarding: (input: Partial<Pick<Onboarding, "personal" | "address" | "education" | "experience" | "bank" | "statutory">>) =>
    request<Onboarding>("/ess/onboarding", { method: "PUT", body: JSON.stringify(input) }),
  essUploadOnboardingDocument: (docName: string, fileName: string) =>
    request<Onboarding>(`/ess/onboarding/documents/${encodeURIComponent(docName)}`, { method: "POST", body: JSON.stringify({ fileName }) }),
  essSubmitOnboarding: () => request<Onboarding>("/ess/onboarding/submit", { method: "POST" }),
  essAttendance: (month?: string) => request<Attendance[]>(`/ess/attendance${month ? `?month=${month}` : ""}`),
  essLeave: () => request<LeaveApplication[]>("/ess/leave"),
  essLeaveTypes: () => request<{ id: string; leaveTypeDesc: string }[]>("/ess/leave/types"),
  essApplyLeave: (input: { leaveType: string; fromDate: string; toDate: string; reason?: string; compOffId?: string }) =>
    request<LeaveApplication>("/ess/leave", { method: "POST", body: JSON.stringify(input) }),
  essPayslips: () => request<PayrollRun[]>("/ess/payslips"),
  essPayslip: (id: string) => request<PayrollRun>(`/ess/payslips/${id}`),
  essLoans: () => request<Loan[]>("/ess/loans"),
  // Phase 2 "Comp-Off" item — own balance only.
  essCompOffs: () => request<CompOff[]>("/ess/comp-offs")
};
