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
import { Calendar, Search, RefreshCw } from 'lucide-react'
import { formatRupiah } from '@/lib/currency'
import { format, parseISO } from 'date-fns'

type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'destructive'> = {
  pending: 'default',
  confirmed: 'secondary',
  completed: 'success',
  cancelled: 'destructive',
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
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

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.service?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reservations</h1>
          <p className="text-muted-foreground">
            Manage service bookings and appointments
          </p>
        </div>
        <Button onClick={fetchReservations} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
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
              No reservations found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Booked</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => (
                    <TableRow
                      key={reservation.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedReservation(reservation)}
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
                      <TableCell>{reservation.service?.name}</TableCell>
                      <TableCell>
                        {format(parseISO(reservation.booking_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[reservation.status]}>
                          {reservation.status.charAt(0).toUpperCase() +
                            reservation.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(parseISO(reservation.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={reservation.status}
                            onValueChange={(value) =>
                              handleStatusChange(reservation.id, value as ReservationStatus)
                            }
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
            <DialogDescription>
              Booking ID: {selectedReservation?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">
                    {selectedReservation.user?.full_name || 'N/A'}
                  </p>
                  <p className="text-sm">{selectedReservation.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium">{selectedReservation.service?.name}</p>
                  <p className="text-sm text-primary">
                    {formatRupiah(selectedReservation.service?.price || 0)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking Date</p>
                  <p className="font-medium">
                    {format(parseISO(selectedReservation.booking_date), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={statusColors[selectedReservation.status]} className="mt-1">
                    {selectedReservation.status.charAt(0).toUpperCase() +
                      selectedReservation.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {selectedReservation.problem_description && (
                <div>
                  <p className="text-sm text-muted-foreground">Problem Description</p>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                    {selectedReservation.problem_description}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Booked On</p>
                <p className="text-sm">
                  {format(parseISO(selectedReservation.created_at), 'MMMM d, yyyy at h:mm a')}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
