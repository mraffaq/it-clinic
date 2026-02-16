'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Wrench, Users, Calendar, CheckCircle } from 'lucide-react'

interface Stats {
  totalServices: number
  totalCustomers: number
  totalReservations: number
  completedRepairs: number
}

export function Stats() {
  const [stats, setStats] = useState<Stats>({
    totalServices: 0,
    totalCustomers: 0,
    totalReservations: 0,
    completedRepairs: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()

      // Get services count
      const { count: servicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })

      // Get customers count (profiles with role='user')
      const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user')

      // Get total reservations
      const { count: reservationsCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })

      // Get completed repairs
      const { count: completedCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .in('repair_status', ['completed', 'picked_up'])

      setStats({
        totalServices: servicesCount || 0,
        totalCustomers: customersCount || 0,
        totalReservations: reservationsCount || 0,
        completedRepairs: completedCount || 0,
      })
      setIsLoading(false)
    }

    fetchStats()
  }, [])

  const statItems = [
    { label: 'Layanan', value: stats.totalServices, icon: Wrench },
    { label: 'Pelanggan', value: stats.totalCustomers, icon: Users },
    { label: 'Reservasi', value: stats.totalReservations, icon: Calendar },
    { label: 'Perbaikan Selesai', value: stats.completedRepairs, icon: CheckCircle },
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Statistik Kami</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hasil kerja keras kami dalam melayani kebutuhan IT Anda
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statItems.map((item) => (
            <Card key={item.label} className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl font-bold mb-1">
                  {isLoading ? '-' : item.value.toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
