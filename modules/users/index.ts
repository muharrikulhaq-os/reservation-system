// ─────────────────────────────────────────
// USERS MODULE — public API
// import { Users, useUsers } from '@/modules/users'
// ─────────────────────────────────────────

export { Users } from './Users'
export { UserForm } from './components/UserForm'
export { UserCreate } from './components/UserCreate'
export { UserEdit } from './components/UserEdit'
export { UserDetail } from './components/UserDetail'
export { userColumns } from './utils/columns'
export { userApi } from './api/user.api'
export * from './hooks/useUsers'
