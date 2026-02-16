'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Search, RefreshCw, Clock, Package, Wrench, CheckCircle, Truck } from 'lucide-react'
import { formatRupiah } from '@/lib/currency'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
type RepairStatus = 'registered' | 'received' | 'diagnosing' | 'repairing' | 'ready' | 'picked_up' | 'cancelled'

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

const repairStatusOptions = [
  { value: 'registered', label: 'Terdaftar', icon: Calendar, color: 'text-gray-500' },
  { value: 'received', label: 'Diterima', icon: Package, color: 'text-yellow-500' },
  { value: 'diagnosing', label: 'Diagnosa', icon: Wrench, color: 'text-orange-500' },
  { value: 'repairing', label: 'Perbaikan', icon: Wrench, color: 'text-blue-500' },
  { value: 'ready', label: 'Siap Ambil', icon: CheckCircle, color: 'text-green-500' },
  { value: 'picked_up', label: 'Sudah Diambil', icon: Truck, color: 'text-purple-500' },
  { value: 'cancelled', label: 'Dibatalkan', icon: Calendar, color: 'text-red-500' },
] as const

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'destructive'> = {
  pending: 'default',
  confirmed: 'secondary',
  completed: 'success',
  cancelled: 'destructive',
}

const repairStatusColors: Record<string, string> = {
  registered: 'bg-gray-100 text-gray-700 border-gray-300',
  received: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  diagnosing: 'bg-orange-100 text-orange-700 border-orange-300',
  repairing: 'bg-blue-100 text-blue-700 border-blue-300',
  ready: 'bg-green-100 text-green-700 border-green-300',
  picked_up: 'bg-purple-100 text-purple-700 border-purple-300',
  cancelled: 'bg-red-100 text-red-700 border-red-300',
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [repairStatusFilter, setRepairStatusFilter] = useState<string>('all')
  const [adminNotes, setAdminNotes] = useState('')
  const supabase = createClient()

  const fetchReservations = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('reservations')
      .select(`
        *,
        service:service_id(name, price),
        user:user_id(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (data) setReservations(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  const handleStatusChange = async (reservationId: string, newStatus: ReservationStatus) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status: newStatus })
      .eq('id', reservationId)

    if (!error) {
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: newStatus } : r))
      )
    }
  }

  const handleRepairStatusChange = async (reservationId: string, newStatus: RepairStatus) => {
    const { error } = await supabase
      .from('reservations')
      .update({ repair_status: newStatus })
      .eq('id', reservationId)

    if (!error) {
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, repair_status: newStatus } : r))
      )
      if (selectedReservation?.id === reservationId) {
        setSelectedReservation({ ...selectedReservation, repair_status: newStatus })
      }
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedReservation) return

    const { error } = await supabase
      .from('reservations')
      .update({ admin_notes: adminNotes })
      .eq('id', selectedReservation.id)

    if (!error) {
      setReservations((prev) =>
        prev.map((r) => (r.id === selectedReservation.id ? { ...r, admin_notes: adminNotes } : r))
      )
      setSelectedReservation({ ...selectedReservation, admin_notes: adminNotes })
    }
  }

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.device_info?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter
    const matchesRepairStatus = repairStatusFilter === 'all' || reservation.repair_status === repairStatusFilter

    return matchesSearch && matchesStatus && matchesRepairStatus
  })

  // Count reservations by repair status
  const statusCounts = repairStatusOptions.reduce((acc, option) => {
    acc[option.value] = reservations.filter(r => r.repair_status === option.value).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reservasi & Perbaikan</h1>
          <p className="text-muted-foreground">
            Kelola booking dan tracking perbaikan perangkat
          </p>
        </div>
        <Button onClick={fetchReservations} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {repairStatusOptions.map((option) => {
          const Icon = option.icon
          return (
            <Card
              key={option.value}
              className={`cursor-pointer transition-colors ${repairStatusFilter === option.value ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => setRepairStatusFilter(repairStatusFilter === option.value ? 'all' : option.value)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${option.color}`} />
                  <span className="text-lg font-bold">{statusCounts[option.value] || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{option.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari pelanggan, layanan, perangkat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : filteredReservations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Tidak ada reservasi
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Perangkat</TableHead>
                    <TableHead>Layanan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status Perbaikan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => (
                    <TableRow
                      key={reservation.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedReservation(reservation)
                        setAdminNotes(reservation.admin_notes || '')
                      }}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {reservation.user?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reservation.user?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{reservation.device_info || '-'}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{reservation.service?.name}</p>
                        <p className="text-sm text-primary">
                          {formatRupiah(reservation.service?.price || 0)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(parseISO(reservation.booking_date), 'dd MMM yyyy', { locale: id })}
                        </div>
                        {reservation.booking_time && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {reservation.booking_time}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={reservation.repair_status}
                            onValueChange={(value) => handleRepairStatusChange(reservation.id, value as RepairStatus)}
                          >
                            <SelectTrigger className={`w-[150px] text-xs ${repairStatusColors[reservation.repair_status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {repairStatusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <option.icon className={`h-3 w-3 ${option.color}`} />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={reservation.status}
                            onValueChange={(value) => handleStatusChange(reservation.id, value as ReservationStatus)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedReservation}
        onOpenChange={() => setSelectedReservation(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                  <p className="font-medium">
                    {selectedReservation.user?.full_name || 'N/A'}
                  </p>
                  <p className="text-sm">{selectedReservation.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Layanan</p>
                  <p className="font-medium">{selectedReservation.service?.name}</p>
                  <p className="text-sm text-primary">
                    {formatRupiah(selectedReservation.service?.price || 0)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Booking</p>
                  <p className="font-medium">
                    {format(parseISO(selectedReservation.booking_date), 'dd MMMM yyyy', { locale: id })}
                  </p>
                  {selectedReservation.booking_time && (
                    <p className="text-sm text-muted-foreground">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {selectedReservation.booking_time}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status Reservasi</p>
                  <Badge variant={statusColors[selectedReservation.status]} className="mt-1">
                    {selectedReservation.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status Perbaikan</p>
                <Select
                  value={selectedReservation.repair_status}
                  onValueChange={(value) => handleRepairStatusChange(selectedReservation.id, value as RepairStatus)}
                >
                  <SelectTrigger className={`w-full mt-1 ${repairStatusColors[selectedReservation.repair_status]}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {repairStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className={`h-4 w-4 ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedReservation.device_info && (
                <div>
                  <p className="text-sm text-muted-foreground">Info Perangkat</p>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                    {selectedReservation.device_info}
                  </p>
                </div>
              )}

              {selectedReservation.problem_description && (
                <div>
                  <p className="text-sm text-muted-foreground">Deskripsi Masalah</p>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                    {selectedReservation.problem_description}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Catatan Admin</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Tambahkan catatan internal..."
                  className="mt-1"
                  rows={3}
                />
                <Button onClick={handleSaveNotes} size="sm" className="mt-2">
                  Simpan Catatan
                </Button>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Dibuat Pada</p>
                <p className="text-sm">
                  {format(parseISO(selectedReservation.created_at), 'dd MMMM yyyy HH:mm', { locale: id })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
