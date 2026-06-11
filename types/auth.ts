// ─────────────────────────────────────────
// AUTH & USER TYPES
// ─────────────────────────────────────────

import type { RoleName } from './enums'
import type { Timestamps } from './common'

// --- Lookup ---

export interface Role {
  id: number
  name: RoleName
}

export interface Department {
  id: number
  name: string
}

// --- User ---

// Shape lengkap dari GET /users & GET /auth/me
export interface User extends Timestamps {
  id: number
  employeeId: string
  name: string
  email: string
  profilePhoto: string | null
  isActive: boolean
  role: Role
  department: Department
}

// Subset untuk nested relasi di booking, approval, dll
export interface UserSummary {
  id: number
  name: string
  employeeId: string
  department: string // API mengirim string nama dept, bukan objek
}

// Shape user di dalam login response (berbeda — role & department string)
export interface AuthUser {
  id: number
  employeeId: string
  name: string
  email: string
  role: string       // "EMPLOYEE" | "ADMIN" | "DRIVER" | "ROOM_KEEPER" — plain string di login response
  department: string // "Operations" — plain string
}

// --- Auth Payloads & Responses ---

export interface RegisterPayload {
  employeeId: string
  name: string
  email: string
  password: string
  roleId: number
  departmentId: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  user: AuthUser
}

export interface RefreshTokenPayload {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
}

export interface LogoutPayload {
  refreshToken: string
}

// --- Password Flow ---

export interface ForgotPasswordPayload {
  email: string
}

export interface VerifyOtpPayload {
  email: string
  otpCode: string
}

export interface VerifyOtpResponse {
  resetToken: string
}

export interface ResetPasswordPayload {
  resetToken: string
  newPassword: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

// --- Stored Auth State (Zustand) ---

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
}

// --- User Management (Admin) ---

export interface CreateUserPayload {
  employeeId: string
  name: string
  email: string
  password: string
  roleId: number
  departmentId: number
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  roleId?: number
  departmentId?: number
}

export interface ToggleActiveResponse {
  id: number
  isActive: boolean
}

export interface UpdateProfilePhotoResponse {
  profilePhoto: string
}

// --- User Query Params ---

export interface UserQueryParams {
  page?: number
  limit?: number
  search?: string
  roleId?: number
}