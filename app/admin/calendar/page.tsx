'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { formatRupiah } from '@/lib/currency'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

type Reservation = {
  id: string
  booking_date: string
  booking_time: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  repair_status: 'pending' | 'diagnosing' | 'repairing' | 'completed' | 'cancelled' | 'ready' | 'registered' | 'received' | 'picked_up' | null
  problem_description: string | null
  device_info: string | null
  user: {
    full_name: string | null
    email: string | null
  } | null
  service: {
    name: string
    price: number
  } | null
}

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'destructive'> = {
  pending: 'default',
  confirmed: 'secondary',
  completed: 'success',
  cancelled: 'destructive',
}

const repairStatusLabels: Record<string, string> = {
  registered: 'Terdaftar',
  received: 'Diterima',
  diagnosing: 'Diagnosa',
  repairing: 'Perbaikan',
  ready: 'Siap Ambil',
  picked_up: 'Sudah Diambil',
  cancelled: 'Dibatalkan',
}

const timeSlots = [
  '09:00',
  '10:00',
  '11:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
]

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const supabase = createClient()

  const fetchReservations = async () => {
    setIsLoading(true)
    const start = format(startOfMonth(currentDate), 'yyyy-MM-dd')
    const end = format(endOfMonth(currentDate), 'yyyy-MM-dd')

    const { data } = await supabase
      .from('reservations')
      .select(`
        *,
        service:service_id(name, price),
        user:user_id(full_name, email)
      `)
      .gte('booking_date', start)
      .lte('booking_date', end)
      .order('booking_date', { ascending: true })

    if (data) setReservations(data as Reservation[])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchReservations()
  }, [currentDate])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getReservationsForDay = (day: Date) => {
    return reservations.filter((r) => isSameDay(parseISO(r.booking_date), day))
  }

  const handleRepairStatusChange = async (reservationId: string, newStatus: 'pending' | 'diagnosing' | 'repairing' | 'completed' | 'cancelled' | 'ready' | 'registered' | 'received' | 'picked_up') => {
    const { error } = await supabase
      .from('reservations')
      .update({ repair_status: newStatus })
      .eq('id', reservationId)

    if (!error) {
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, repair_status: newStatus } : r))
      )
      if (selectedReservation) {
        setSelectedReservation({ ...selectedReservation, repair_status: newStatus })
      }
    }
  }

  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Kalender Reservasi</h1>
          <p className="text-muted-foreground">
            Lihat dan kelola jadwal reservasi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[150px] text-center font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: id })}
          </div>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayReservations = getReservationsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors
                    ${isCurrentMonth ? 'bg-card' : 'bg-muted/50'}
                    ${isToday ? 'border-primary' : 'border-border'}
                    hover:border-primary/50
                  `}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className={`
                    text-sm font-medium mb-1
                    ${isToday ? 'text-primary' : ''}
                    ${!isCurrentMonth ? 'text-muted-foreground' : ''}
                  `}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayReservations.slice(0, 3).map((res) => (
                      <div
                        key={res.id}
                        className={`
                          text-xs px-1.5 py-0.5 rounded truncate
                          ${res.repair_status === 'ready' ? 'bg-green-100 text-green-700' : ''}
                          ${res.repair_status === 'repairing' ? 'bg-blue-100 text-blue-700' : ''}
                          ${res.repair_status === 'registered' ? 'bg-gray-100 text-gray-700' : ''}
                          ${res.repair_status === 'received' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${res.repair_status === 'diagnosing' ? 'bg-orange-100 text-orange-700' : ''}
                          ${res.repair_status === 'picked_up' ? 'bg-purple-100 text-purple-700' : ''}
                        `}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedReservation(res)
                        }}
                      >
                        {res.booking_time || '--:--'} {res.user?.full_name?.split(' ')[0] || 'User'}
                      </div>
                    ))}
                    {dayReservations.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayReservations.length - 3} lagi
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Status Perbaikan</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3">
            {Object.entries(repairStatusLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`
                  w-3 h-3 rounded-full
                  ${key === 'registered' ? 'bg-gray-400' : ''}
                  ${key === 'received' ? 'bg-yellow-400' : ''}
                  ${key === 'diagnosing' ? 'bg-orange-400' : ''}
                  ${key === 'repairing' ? 'bg-blue-400' : ''}
                  ${key === 'ready' ? 'bg-green-400' : ''}
                  ${key === 'picked_up' ? 'bg-purple-400' : ''}
                  ${key === 'cancelled' ? 'bg-red-400' : ''}
                `} />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Reservasi {selectedDate && format(selectedDate, 'dd MMMM yyyy', { locale: id })}
            </DialogTitle>
            <DialogDescription>
              {selectedDate && getReservationsForDay(selectedDate).length} reservasi
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {selectedDate && getReservationsForDay(selectedDate).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Tidak ada reservasi</p>
            ) : (
              selectedDate && getReservationsForDay(selectedDate).map((res) => (
                <Card key={res.id} className="cursor-pointer hover:border-primary" onClick={() => setSelectedReservation(res)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{res.user?.full_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{res.service?.name}</p>
                        <p className="text-sm text-primary">{formatRupiah(res.service?.price || 0)}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={statusColors[res.status]}>{res.status}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {res.booking_time || '--:--'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className={`
                        ${res.repair_status === 'ready' ? 'border-green-500 text-green-700' : ''}
                        ${res.repair_status === 'repairing' ? 'border-blue-500 text-blue-700' : ''}
                      `}>
                        {repairStatusLabels[res.repair_status || "registered"]}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reservation Detail Dialog */}
      <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Reservasi</DialogTitle>
            <DialogDescription>
              ID: {selectedReservation?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pelanggan</p>
                  <p className="font-medium">{selectedReservation.user?.full_name || 'N/A'}</p>
                  <p className="text-sm">{selectedReservation.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Layanan</p>
                  <p className="font-medium">{selectedReservation.service?.name}</p>
                  <p className="text-sm text-primary">{formatRupiah(selectedReservation.service?.price || 0)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal</p>
                  <p className="font-medium">
                    {format(parseISO(selectedReservation.booking_date), 'dd MMMM yyyy', { locale: id })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {selectedReservation.booking_time || 'Belum ditentukan'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status Reservasi</p>
                  <Badge variant={statusColors[selectedReservation.status]}>
                    {selectedReservation.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status Perbaikan</p>
                <Select
                  value={selectedReservation.repair_status || undefined}
                  onValueChange={(value) => handleRepairStatusChange(selectedReservation.id, value as any)}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(repairStatusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedReservation.device_info && (
                <div>
                  <p className="text-sm text-muted-foreground">Info Perangkat</p>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{selectedReservation.device_info}</p>
                </div>
              )}

              {selectedReservation.problem_description && (
                <div>
                  <p className="text-sm text-muted-foreground">Deskripsi Masalah</p>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{selectedReservation.problem_description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
