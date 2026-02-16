import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import {
  Calendar,
  Package,
  Wrench,
  Users,
  TrendingUp,
  DollarSign,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch statistics
  const [
    { count: totalReservations },
    { count: totalProducts },
    { count: totalServices },
    { count: totalUsers },
    { data: recentReservations },
    { data: recentConsultations },
  ] = await Promise.all([
    supabase.from('reservations').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('services').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('reservations')
      .select(`
        *,
        service:service_id(name),
        user:user_id(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const stats = [
    {
      title: 'Total Reservations',
      value: totalReservations || 0,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Products',
      value: totalProducts || 0,
      icon: Package,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Services',
      value: totalServices || 0,
      icon: Wrench,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
    },
    {
      title: 'Registered Users',
      value: totalUsers || 0,
      icon: Users,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ]

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'secondary' | 'success' | 'destructive'> = {
      pending: 'default',
      confirmed: 'secondary',
      completed: 'success',
      cancelled: 'destructive',
    }
    return colors[status] || 'default'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the admin dashboard. Here's an overview of your business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reservations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reservations</CardTitle>
            <CardDescription>Latest service bookings from customers</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReservations && recentReservations.length > 0 ? (
              <div className="space-y-4">
                {recentReservations.map((reservation: any) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{reservation.service?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.user?.full_name || reservation.user?.email}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No reservations yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Consultations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Consultations</CardTitle>
            <CardDescription>Latest messages from contact form</CardDescription>
          </CardHeader>
          <CardContent>
            {recentConsultations && recentConsultations.length > 0 ? (
              <div className="space-y-4">
                {recentConsultations.map((consultation: any) => (
                  <div
                    key={consultation.id}
                    className="p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{consultation.name}</p>
                      <Badge variant={consultation.status === 'new' ? 'default' : 'secondary'}>
                        {consultation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {consultation.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No consultations yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
