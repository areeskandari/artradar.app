import { Suspense } from 'react'
import { AdminLoginForm } from './AdminLoginForm'

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-ink-500">Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  )
}
