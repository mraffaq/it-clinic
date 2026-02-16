import { z } from 'zod'

export const bookingFormSchema = z.object({
  serviceId: z.string().uuid('Pilih layanan yang valid'),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  bookingTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu tidak valid'),
  deviceInfo: z.string().max(200, 'Maksimal 200 karakter').optional(),
  problemDescription: z.string().max(1000, 'Maksimal 1000 karakter').optional(),
})

export type BookingFormData = z.infer<typeof bookingFormSchema>

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Maksimal 100 karakter'),
  phone: z.string().regex(/^\d{10,15}$/, 'Nomor telepon tidak valid').optional(),
  address: z.string().max(500, 'Maksimal 500 karakter').optional(),
})

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>
