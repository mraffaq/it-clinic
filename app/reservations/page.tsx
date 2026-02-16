'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/auth-provider'
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
import { Calendar, Clock, AlertCircle, CheckCircle2, CalendarDays, Plus } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'destructive'> = {
  pending: 'default',
  confirmed: 'secondary',
  completed: 'success',
  cancelled: 'destructive',
}

export default function ReservationsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [services, setServices] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [formData, setFormData] = useState({
    serviceId: '',
    bookingDate: '',
    problemDescription: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
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
    setError('')
    setSuccess(false)

    if (!formData.serviceId || !formData.bookingDate) {
      setError('Please select a service and date')
      return
    }

    setIsSubmitting(true)

    if (!user?.id) {
      setError('You must be logged in to make a reservation')
      setIsSubmitting(false)
      return
    }

    try {
      const { error: submitError } = await supabase.from('reservations').insert({
        user_id: user.id,
        service_id: formData.serviceId,
        booking_date: formData.bookingDate,
        problem_description: formData.problemDescription || null,
        status: 'pending',
      })

      if (submitError) throw submitError

      setSuccess(true)
      setFormData({ serviceId: '', bookingDate: '', problemDescription: '' })

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
      setError(err.message || 'Failed to create reservation')
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
            Service <span className="gradient-text">Reservations</span>
          </h1>
          <p className="text-muted-foreground">
            Book a service appointment or view your reservation history.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="new">
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </TabsTrigger>
            <TabsTrigger value="history">
              <CalendarDays className="h-4 w-4 mr-2" />
              My Reservations ({reservations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle>Book a Service</CardTitle>
                <CardDescription>
                  Fill out the form below to schedule your service appointment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-4 border-emerald-500/50 text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Reservation created successfully! We'll confirm your appointment soon.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="service">Select Service *</Label>
                    <Select
                      value={formData.serviceId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, serviceId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a service..." />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - ${service.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Preferred Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      min={getMinDate()}
                      value={formData.bookingDate}
                      onChange={(e) =>
                        setFormData({ ...formData, bookingDate: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Problem Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Please describe the issue you're experiencing..."
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
                    {isSubmitting ? 'Creating Reservation...' : 'Book Appointment'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>My Reservations</CardTitle>
                <CardDescription>
                  View and track your service appointments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reservations.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Reservations Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't made any service reservations yet.
                    </p>
                    <Button onClick={() => setActiveTab('new')} className="gradient-bg border-0">
                      Book Your First Service
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Booked On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell className="font-medium">
                            {reservation.service?.name}
                          </TableCell>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
