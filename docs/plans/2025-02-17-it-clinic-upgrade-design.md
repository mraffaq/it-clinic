# IT Clinic Production Upgrade - Design Document

## Overview
Upgrade the existing IT Clinic web application to production-ready quality with enhanced security, better UX, and polished features.

## Current State
- Next.js 14 with App Router and TypeScript
- Supabase for auth and database
- Working authentication with role-based access
- Admin dashboard exists
- User dashboard exists
- Toast notification system in place
- RLS policies configured

## Goals

### 1. Authentication & Security
- Protect booking routes (/reservations, /dashboard) - redirect if not logged in
- Enhance middleware for proper route protection
- Audit and tighten RLS policies

### 2. Booking System Improvements
- Add Zod validation to booking forms
- Prevent double booking on same date/time
- Add proper error messages and loading states
- Integrate toast notifications for all actions

### 3. UI/UX Enhancements
- Integrate testimonials section into homepage
- Integrate stats section into homepage
- Ensure sticky navbar works properly
- Add empty states and loading skeletons
- Better CTA buttons

### 4. Performance
- Optimize images with next/image
- Use server components properly
- Clean up unnecessary client components

### 5. Database
- Add unique constraint to prevent double bookings
- Ensure proper indexes on foreign keys

## Architecture

### Route Protection Strategy
```
Middleware Layer:
- /admin/* → Check auth + admin role
- /reservations → Check auth, redirect to login if not
- /dashboard → Check auth, redirect to login if not
- /auth/* → Redirect to home if already logged in
```

### Validation Layer
```
Zod Schemas:
- BookingFormSchema: serviceId, bookingDate, bookingTime, deviceInfo, problemDescription
- ProfileUpdateSchema: fullName, phone, address
```

### Database Constraints
```sql
-- Prevent double booking
CREATE UNIQUE INDEX idx_reservations_date_time_user
ON reservations (user_id, booking_date, booking_time)
WHERE status != 'cancelled';
```

## Implementation Approach
1. Upgrade middleware.ts with comprehensive route protection
2. Add Zod validation schemas
3. Add database constraint for double booking prevention
4. Update booking form with validation and toast notifications
5. Integrate sections into homepage
6. Review and update RLS policies
7. Add error boundaries
8. Performance optimization pass

## Success Criteria
- All protected routes redirect unauthorized users
- Booking form validates input and shows clear errors
- Cannot book same date/time twice
- Toast notifications on all CRUD operations
- Homepage shows testimonials and stats
- No console errors
- Clean build with no TypeScript errors
