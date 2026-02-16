import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Package,
  Wrench,
  Users,
  Settings,
  ArrowLeft,
} from 'lucide-react'

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/calendar', label: 'Kalender', icon: CalendarDays },
  { href: '/admin/reservations', label: 'Reservasi', icon: Calendar },
  { href: '/admin/products', label: 'Produk', icon: Package },
  { href: '/admin/services', label: 'Layanan', icon: Wrench },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">IT Clinic</span>
          </Link>
        </div>

        <Separator />

        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <Separator />

        <div className="p-4">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Site
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-border p-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">Admin</span>
          </Link>
          <nav className="flex gap-2">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
          </nav>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
