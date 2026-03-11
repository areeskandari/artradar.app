import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import { Building2, User, Shield } from 'lucide-react'

async function getAdminProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const profile = await getAdminProfile(user.id)

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-ink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield size={28} className="text-ink-400" />
        </div>
        <h1 className="font-serif text-3xl text-ink-900 mb-2">Access Pending</h1>
        <p className="text-ink-500 mb-6">Your account is awaiting admin role assignment. Contact a super admin.</p>
        <form action="/api/auth/signout" method="post">
          <Button type="submit" variant="outline">Sign Out</Button>
        </form>
      </div>
    )
  }

  const roleLinks = {
    super_admin: [
      { href: '/admin/super', icon: Shield, label: 'Super Admin', desc: 'Manage all content, users, and settings' },
      { href: '/admin/gallery', icon: Building2, label: 'Gallery Dashboard', desc: 'Manage gallery profile and events' },
    ],
    gallery_admin: [
      { href: '/admin/gallery', icon: Building2, label: 'Gallery Dashboard', desc: 'Manage your gallery profile, events, and artists' },
    ],
    artist: [
      { href: '/admin/artist', icon: User, label: 'Artist Dashboard', desc: 'Manage your artist profile and pro subscription' },
    ],
  }

  const links = roleLinks[profile.role as keyof typeof roleLinks] || []

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-ink-900 mb-1">Dashboard</h1>
        <p className="text-ink-500">
          Signed in as <span className="font-medium text-ink-700">{user.email}</span> ·{' '}
          <span className="capitalize">{profile.role.replace('_', ' ')}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {links.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}>
            <div className="bg-white border border-ink-200 rounded-lg p-5 card-hover h-full">
              <div className="w-10 h-10 bg-gold-50 border border-gold-200 rounded-lg flex items-center justify-center mb-3">
                <Icon size={20} className="text-gold-600" />
              </div>
              <h3 className="font-medium text-ink-900 mb-1">{label}</h3>
              <p className="text-sm text-ink-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <form action="/api/auth/signout" method="post">
        <Button type="submit" variant="ghost" size="sm">
          Sign Out
        </Button>
      </form>
    </div>
  )
}
