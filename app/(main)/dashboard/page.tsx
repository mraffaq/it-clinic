'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/auth-provider'
import { useToast } from '@/components/providers/toast-provider'
import { profileUpdateSchema } from '@/lib/validations/booking'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Calendar,
  Clock,
  Package,
  Wrench,
  CheckCircle2,
  Truck,
  User,
  Phone,
  MapPin,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { formatRupiah } from '@/lib/currency'
import { ReservationCardSkeleton, CardSkeleton } from '@/components/shared/skeletons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Reservation = {
  id: string
  booking_date: string
  booking_time: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  repair_status: string
  device_info: string | null
  problem_description: string | null
  service: {
    name: string
    price: number
  } | null
}

type Profile = {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  address: string | null
  role: string
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

const repairStatusIcons: Record<string, any> = {
  registered: Calendar,
  received: Package,
  diagnosing: Wrench,
  repairing: Wrench,
  ready: CheckCircle2,
  picked_up: Truck,
  cancelled: AlertCircle,
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const { success, error: showError } = useToast()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  // Form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    const fetchData = async () => {
      if (!user) return

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setFullName(profileData.full_name || '')
        setPhone(profileData.phone || '')
        setAddress(profileData.address || '')
      }

      // Fetch reservations
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select(`
          *,
          service:service_id(name, price)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (reservationsData) {
        setReservations(reservationsData as Reservation[])
      }

      setIsLoading(false)
    }

    fetchData()
  }, [user, authLoading, router, supabase])

  const handleUpdateProfile = async () => {
    if (!user) return

    // Validate with Zod
    const validationResult = profileUpdateSchema.safeParse({
      fullName,
      phone,
      address,
    })

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues[0]?.message || 'Data tidak valid'
      showError('Validasi gagal', errorMessage)
      return
    }

    setIsUpdating(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone,
        address: address,
      })
      .eq('id', user.id)

    if (error) {
      showError('Gagal memperbarui profil', error.message)
    } else {
      success('Profil berhasil diperbarui')
    }
    setIsUpdating(false)
  }

  const handleCancelReservation = async () => {
    if (!selectedReservation) return

    const { error } = await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        repair_status: 'cancelled',
      })
      .eq('id', selectedReservation.id)

    if (error) {
      showError('Gagal membatalkan reservasi', error.message)
    } else {
      success('Reservasi berhasil dibatalkan')
      setReservations(prev =>
        prev.map(r =>
          r.id === selectedReservation.id
            ? { ...r, status: 'cancelled', repair_status: 'cancelled' }
            : r
        )
      )
    }
    setCancelDialogOpen(false)
    setSelectedReservation(null)
  }

  const activeReservations = reservations.filter(
    r => !['cancelled', 'completed', 'picked_up'].includes(r.repair_status)
  )

  const completedReservations = reservations.filter(
    r => ['completed', 'picked_up'].includes(r.repair_status)
  )

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <CardSkeleton />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <ReservationCardSkeleton />
              <ReservationCardSkeleton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Dashboard <span className="gradient-text">Saya</span>
          </h1>
          <p className="text-muted-foreground">
            Kelola profil dan lihat status reservasi Anda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profil Saya
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-2xl gradient-bg text-white">
                      {fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{fullName || 'Pengguna'}</p>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'} className="mt-1">
                      {profile?.role === 'admin' ? 'Administrator' : 'Pelanggan'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Nomor Telepon
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812-3456-7890"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Alamat
                    </Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Masukkan alamat"
                    />
                  </div>

                  <Button
                    onClick={handleUpdateProfile}
                    className="w-full gradient-bg border-0"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Reservasi</p>
                  <p className="text-3xl font-bold">{reservations.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Selesai</p>
                  <p className="text-3xl font-bold text-green-500">{completedReservations.length}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reservations Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Reservations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Reservasi Aktif
                </CardTitle>
                <CardDescription>
                  Reservasi yang sedang dalam proses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeReservations.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Tidak ada reservasi aktif</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeReservations.map((reservation) => {
                      const RepairIcon = repairStatusIcons[reservation.repair_status] || Package
                      return (
                        <div
                          key={reservation.id}
                          className="border-l-4 border-l-primary bg-muted/50 rounded-lg p-4"
                        >
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
                                'bg-gray-100 text-gray-700'
                              }`}>
                                <RepairIcon className="h-3 w-3" />
                                {repairStatusLabels[reservation.repair_status]}
                              </div>
                              <p className="text-sm font-medium text-primary">
                                {formatRupiah(reservation.service?.price || 0)}
                              </p>
                              {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    setSelectedReservation(reservation)
                                    setCancelDialogOpen(true)
                                  }}
                                >
                                  Batalkan
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reservation History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Riwayat Reservasi
                </CardTitle>
                <CardDescription>
                  Reservasi yang telah selesai atau dibatalkan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completedReservations.length === 0 && reservations.filter(r => r.status === 'cancelled').length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Belum ada riwayat reservasi</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...completedReservations, ...reservations.filter(r => r.status === 'cancelled')].map((reservation) => (
                      <div
                        key={reservation.id}
                        className={`rounded-lg p-4 ${
                          reservation.status === 'cancelled'
                            ? 'bg-red-50 border border-red-100'
                            : 'bg-green-50 border border-green-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{reservation.service?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(reservation.booking_date), 'dd MMM yyyy', { locale: id })}
                            </p>
                          </div>
                          <Badge
                            variant={reservation.status === 'cancelled' ? 'destructive' : 'success'}
                          >
                            {reservation.status === 'cancelled' ? 'Dibatalkan' : 'Selesai'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan Reservasi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membatalkan reservasi ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelReservation}
            >
              Ya, Batalkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
