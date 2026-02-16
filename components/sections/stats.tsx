'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Wrench, Users, CheckCircle2, Award } from 'lucide-react'
import { StatsCardSkeleton } from '@/components/shared/skeletons'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface Stats {
  repairs: number
  customers: number
  satisfaction: number
  experience: number
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isInView) {
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setDisplayValue(value)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <span ref={ref}>
      {displayValue.toLocaleString('id-ID')}{suffix}
    </span>
  )
}

export function StatsSection() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      // Get reservations count
      const { count: repairsCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .in('status', ['completed', 'picked_up'])

      // Get customers count
      const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user')

      // Get testimonials for satisfaction rate
      const { data: testimonials } = await supabase
        .from('testimonials')
        .select('rating')
        .eq('is_active', true)

      const avgRating = testimonials?.length
        ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
        : 4.8

      setStats({
        repairs: repairsCount || 500,
        customers: customersCount || 200,
        satisfaction: Math.round(avgRating * 20), // Convert 5-star to percentage
        experience: 8,
      })
      setIsLoading(false)
    }

    fetchStats()
  }, [supabase])

  const statsData = [
    {
      icon: Wrench,
      label: 'Perbaikan Berhasil',
      value: stats?.repairs || 500,
      suffix: '+',
      color: 'text-blue-500',
    },
    {
      icon: Users,
      label: 'Pelanggan Puas',
      value: stats?.customers || 200,
      suffix: '+',
      color: 'text-teal-500',
    },
    {
      icon: CheckCircle2,
      label: 'Tingkat Kepuasan',
      value: stats?.satisfaction || 98,
      suffix: '%',
      color: 'text-emerald-500',
    },
    {
      icon: Award,
      label: 'Tahun Pengalaman',
      value: stats?.experience || 8,
      suffix: '',
      color: 'text-amber-500',
    },
  ]

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-teal-500/5" />

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-muted mb-4 ${stat.color}`}>
                    <stat.icon className="h-7 w-7" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-2">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
