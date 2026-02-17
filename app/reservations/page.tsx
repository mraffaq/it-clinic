'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/auth-provider'
import { bookingFormSchema, type BookingFormData } from '@/lib/validations/booking'
import { useToast } from '@/components/providers/toast-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calendar, Clock, AlertCircle, CheckCircle2, CalendarDays, Plus, Package, Wrench, Truck } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { formatRupiah } from '@/lib/currency'

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

const repairStatusIcons: Record<string, any> = {
  registered: Calendar,
  received: Package,
  diagnosing: Wrench,
  repairing: Wrench,
  ready: CheckCircle2,
  picked_up: Truck,
  cancelled: AlertCircle,
}

const timeSlots = [
  { value: '09:00', label: '09:00 - 10:00' },
  { value: '10:00', label: '10:00 - 11:00' },
  { value: '11:00', label: '11:00 - 12:00' },
  { value: '13:00', label: '13:00 - 14:00' },
  { value: '14:00', label: '14:00 - 15:00' },
  { value: '15:00', label: '15:00 - 16:00' },
  { value: '16:00', label: '16:00 - 17:00' },
]

export default function ReservationsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const { success, error: showError } = useToast()

  const [services, setServices] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({})
  const [formData, setFormData] = useState({
    serviceId: '',
    bookingDate: '',
    bookingTime: '',
    deviceInfo: '',
    problemDescription: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [activeTab, setActiveTab] = useState('new')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    const fetchData = async () => {
      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('name')

      if (servicesData) setServices(servicesData)

      // Fetch user's reservations
      if (user) {
        const { data: reservationsData } = await supabase
          .from('reservations')
          .select(`
            *,
            service:service_id(name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (reservationsData) setReservations(reservationsData)
      }

      setIsLoading(false)
    }

    if (user) fetchData()
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})
    setError('')

    if (!user?.id) {
      showError('Anda harus login terlebih dahulu')
      router.push('/auth/login')
      return
    }

    // Validate with Zod
    const validationResult = bookingFormSchema.safeParse(formData)

    if (!validationResult.success) {
      const errors: Partial<Record<keyof BookingFormData, string>> = {}
      validationResult.error.issues.forEach((err) => {
        const path = err.path[0] as keyof BookingFormData
        errors[path] = err.message
      })
      setFormErrors(errors)
      showError('Mohon periksa kembali form yang diisi')
      return
    }

    setIsSubmitting(true)

    try {
      // Check for existing booking on same date/time
      const { data: existingBooking } = await supabase
        .from('reservations')
        .select('id')
        .eq('user_id', user.id)
        .eq('booking_date', formData.bookingDate)
        .eq('booking_time', formData.bookingTime)
        .not('status', 'eq', 'cancelled')
        .single()

      if (existingBooking) {
        showError('Anda sudah memiliki booking pada tanggal dan waktu yang sama')
        setFormErrors({ bookingDate: 'Sudah ada booking pada tanggal ini', bookingTime: 'Pilih waktu lain' })
        setIsSubmitting(false)
        return
      }

      const { error: submitError } = await supabase.from('reservations').insert({
        user_id: user.id,
        service_id: formData.serviceId,
        booking_date: formData.bookingDate,
        booking_time: formData.bookingTime,
        device_info: formData.deviceInfo || null,
        problem_description: formData.problemDescription || null,
        status: 'pending',
        repair_status: 'registered',
      })

      if (submitError) {
        if (submitError.code === '23505') {
          showError('Anda sudah memiliki booking pada tanggal dan waktu yang sama')
          setFormErrors({ bookingDate: 'Sudah ada booking', bookingTime: 'Pilih waktu lain' })
        } else {
          throw submitError
        }
        return
      }

      success('Reservasi berhasil dibuat!', 'Kami akan segera mengkonfirmasi jadwal Anda')

      setFormData({
        serviceId: '',
        bookingDate: '',
        bookingTime: '',
        deviceInfo: '',
        problemDescription: ''
      })

      // Refresh reservations
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select(`
          *,
          service:service_id(name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (reservationsData) setReservations(reservationsData)
      setActiveTab('history')
    } catch (err: any) {
      showError('Gagal membuat reservasi', err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Reservasi <span className="gradient-text">Layanan</span>
          </h1>
          <p className="text-muted-foreground">
            Booking layanan service dan tracking status perbaikan perangkat Anda.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="new">
              <Plus className="h-4 w-4 mr-2" />
              Booking Baru
            </TabsTrigger>
            <TabsTrigger value="history">
              <CalendarDays className="h-4 w-4 mr-2" />
              Riwayat ({reservations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle>Booking Layanan</CardTitle>
                <CardDescription>
                  Isi form di bawah untuk menjadwalkan service perangkat Anda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="service">Pilih Layanan *</Label>
                    <Select
                      value={formData.serviceId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, serviceId: value })
                      }
                    >
                      <SelectTrigger className={formErrors.serviceId ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Pilih layanan..." />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - {formatRupiah(service.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.serviceId && (
                      <p className="text-sm text-destructive">{formErrors.serviceId}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Tanggal *</Label>
                      <Input
                        id="date"
                        type="date"
                        min={getMinDate()}
                        value={formData.bookingDate}
                        onChange={(e) =>
                          setFormData({ ...formData, bookingDate: e.target.value })
                        }
                        className={formErrors.bookingDate ? 'border-destructive' : ''}
                        required
                      />
                      {formErrors.bookingDate && (
                        <p className="text-sm text-destructive">{formErrors.bookingDate}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Waktu *</Label>
                      <Select
                        value={formData.bookingTime}
                        onValueChange={(value) =>
                          setFormData({ ...formData, bookingTime: value })
                        }
                      >
                        <SelectTrigger className={formErrors.bookingTime ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Pilih waktu..." />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.bookingTime && (
                        <p className="text-sm text-destructive">{formErrors.bookingTime}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="device">Info Perangkat</Label>
                    <Input
                      id="device"
                      placeholder="Contoh: Laptop ASUS X456U, i5-8250U, RAM 8GB"
                      value={formData.deviceInfo}
                      onChange={(e) =>
                        setFormData({ ...formData, deviceInfo: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Sebutkan merk, tipe, dan spesifikasi perangkat Anda
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi Masalah</Label>
                    <Textarea
                      id="description"
                      placeholder="Jelaskan masalah yang dialami perangkat Anda..."
                      rows={4}
                      value={formData.problemDescription}
                      onChange={(e) =>
                        setFormData({ ...formData, problemDescription: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-bg border-0"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Membuat Reservasi...' : 'Booking Sekarang'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Reservasi</CardTitle>
                <CardDescription>
                  Lihat dan tracking status perbaikan perangkat Anda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reservations.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Belum Ada Reservasi</h3>
                    <p className="text-muted-foreground mb-4">
                      Anda belum membuat reservasi layanan.
                    </p>
                    <Button onClick={() => setActiveTab('new')} className="gradient-bg border-0">
                      Booking Layanan Pertama
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservations.map((reservation) => {
                      const RepairIcon = repairStatusIcons[reservation.repair_status] || Package
                      return (
                        <Card key={reservation.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">{reservation.service?.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {format(parseISO(reservation.booking_date), 'dd MMM yyyy', { locale: id })}
                                  </span>
                                  {reservation.booking_time && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {reservation.booking_time}
                                    </span>
                                  )}
                                </div>
                                {reservation.device_info && (
                                  <p className="text-sm mt-2 text-muted-foreground">
                                    <Package className="inline h-3 w-3 mr-1" />
                                    {reservation.device_info}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-start md:items-end gap-2">
                                <Badge variant={statusColors[reservation.status]}>
                                  {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                </Badge>
                                <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
                                  reservation.repair_status === 'ready' ? 'bg-green-100 text-green-700' :
                                  reservation.repair_status === 'repairing' ? 'bg-blue-100 text-blue-700' :
                                  reservation.repair_status === 'picked_up' ? 'bg-purple-100 text-purple-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  <RepairIcon className="h-3 w-3" />
                                  {repairStatusLabels[reservation.repair_status] || reservation.repair_status}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
