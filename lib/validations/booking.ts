import { z } from 'zod'

// Booking form validation schema
export const bookingSchema = z.object({
  serviceId: z.string().uuid('Pilih layanan yang valid'),
  bookingDate: z.string()
    .min(1, 'Tanggal booking wajib diisi')
    .refine((date) => {
      const selectedDate = new Date(date)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      return selectedDate >= tomorrow
    }, 'Tanggal booking minimal besok'),
  bookingTime: z.string()
    .min(1, 'Waktu booking wajib diisi')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu tidak valid'),
  deviceInfo: z.string()
    .min(3, 'Info perangkat minimal 3 karakter')
    .max(200, 'Info perangkat maksimal 200 karakter')
    .optional()
    .or(z.literal('')),
  problemDescription: z.string()
    .min(10, 'Deskripsi masalah minimal 10 karakter')
    .max(1000, 'Deskripsi masalah maksimal 1000 karakter')
    .optional()
    .or(z.literal('')),
})

export type BookingFormData = z.infer<typeof bookingSchema>

// Login form validation
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z.string()
    .min(6, 'Password minimal 6 karakter')
    .max(100, 'Password maksimal 100 karakter'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Registration form validation
export const registerSchema = z.object({
  fullName: z.string()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter'),
  email: z.string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z.string()
    .min(6, 'Password minimal 6 karakter')
    .max(100, 'Password maksimal 100 karakter'),
  confirmPassword: z.string(),
  adminKey: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

// Contact form validation
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  email: z.string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  phone: z.string()
    .regex(/^([+]?[0-9\s-\(\)]{8,20})$/, 'Format nomor telepon tidak valid')
    .optional()
    .or(z.literal('')),
  subject: z.string()
    .min(3, 'Subjek minimal 3 karakter')
    .max(100, 'Subjek maksimal 100 karakter'),
  message: z.string()
    .min(10, 'Pesan minimal 10 karakter')
    .max(2000, 'Pesan maksimal 2000 karakter'),
})

export type ContactFormData = z.infer<typeof contactSchema>

// Service form validation (admin)
export const serviceSchema = z.object({
  name: z.string()
    .min(3, 'Nama layanan minimal 3 karakter')
    .max(100, 'Nama layanan maksimal 100 karakter'),
  description: z.string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
  price: z.number()
    .min(0, 'Harga tidak boleh negatif')
    .max(100000000, 'Harga terlalu besar'),
  durationMinutes: z.number()
    .min(15, 'Durasi minimal 15 menit')
    .max(480, 'Durasi maksimal 8 jam')
    .optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
})

export type ServiceFormData = z.infer<typeof serviceSchema>

// Product form validation (admin)
export const productSchema = z.object({
  name: z.string()
    .min(3, 'Nama produk minimal 3 karakter')
    .max(100, 'Nama produk maksimal 100 karakter'),
  description: z.string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
  price: z.number()
    .min(0, 'Harga tidak boleh negatif')
    .max(100000000, 'Harga terlalu besar'),
  stock: z.number()
    .min(0, 'Stok tidak boleh negatif')
    .max(10000, 'Stok terlalu besar'),
  category: z.string()
    .min(1, 'Kategori wajib diisi')
    .max(50, 'Kategori maksimal 50 karakter'),
  imageUrl: z.string()
    .url('URL gambar tidak valid')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().default(true),
})

export type ProductFormData = z.infer<typeof productSchema>
