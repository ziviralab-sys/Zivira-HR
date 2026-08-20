// Real backend API client for the HR portal, following the same pattern
// already used by the Manager/Field-Force apps in this platform (see
// Zivira-Manager-main/lib/api-client.ts). Previously this repo had no
// lib/ directory at all and every page used hardcoded mock data.
//
// The HR portal authenticates against the same backend as the Admin app,
// using portal "COMPANY_ADMIN" — the /company/* routes this client calls
// (employees, salary-structures, payroll/runs, holidays) all require
// requireCompanyAdmin on the backend.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://zivira-labs-backend-1.onrender.com/api";
const TOKEN_KEY = "zivira.hr.token";

export type Employee = {
  id: string;
  employeeCode: string;
  name: string;
  designation: string;
  division: string;
  reportingManager?: string;
  territory: string;
  role: "NBH" | "BH" | "RBM" | "ZBM" | "ABM" | "SR_MR" | "MR" | "OTHER";
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
  netPay: number;
  status: "DRAFT" | "HR_APPROVED" | "LOCKED";
  approvedBy?: string | null;
  approvedAt?: string | null;
};

export type Holiday = {
  id: string;
  stateName: string;
  weekendHoliday?: string | null;
  otherHolidayDate?: string | null;
  otherHolidayDescription?: string | null;
  status: "ACTIVE" | "INACTIVE";
};

type ApiEnvelope<T> = { data: T; [key: string]: unknown };

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
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
  login: (username: string, password: string) =>
    request<{ token: string; user: Record<string, unknown> }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password, portal: "COMPANY_ADMIN" })
    }),

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
  approvePayrollRun: (id: string) =>
    request<PayrollRun>(`/company/payroll/runs/${id}/approve`, { method: "PATCH" }),
  lockPayrollRun: (id: string) =>
    request<PayrollRun>(`/company/payroll/runs/${id}/lock`, { method: "PATCH" }),
  payslip: (id: string) =>
    request<PayrollRun & { employeeName?: string; designation?: string; division?: string }>(`/company/payroll/runs/${id}/payslip`),

  holidays: () => request<Holiday[]>("/company/holidays")
};
