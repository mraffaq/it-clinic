# IT Clinic – Service & Tech Store

**Author:** Raffa Qomarul

A modern, production-ready web application for IT service bookings and tech product sales.

![IT Clinic](https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80)

## Features

- **Authentication**: Secure login/register with email/password using Supabase Auth
- **Service Booking**: Book IT service appointments (laptop repair, PC repair, networking, etc.)
- **Product Store**: Browse and view tech products
- **IT Consultation**: Contact form for IT inquiries
- **Admin Dashboard**: Manage reservations, products, and services
- **Responsive Design**: Mobile-friendly interface with modern UI

## Tech Stack

### Frontend
- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - Beautiful UI components
- [Lucide React](https://lucide.dev/) - Icon library
- [date-fns](https://date-fns.org/) - Date formatting utilities

### Backend
- [Supabase](https://supabase.com/) - PostgreSQL database
- [Supabase Auth](https://supabase.com/docs/guides/auth) - Authentication
- [Supabase Storage](https://supabase.com/docs/guides/storage) - File storage (optional)

## Project Structure

```
├── app/
│   ├── auth/
│   │   ├── login/          # Login page
│   │   └── register/       # Registration page
│   ├── about/              # About page
│   ├── contact/            # Contact page
│   ├── products/           # Products listing
│   ├── services/           # Services listing
│   ├── reservations/       # User reservations
│   ├── admin/
│   │   ├── dashboard/      # Admin dashboard
│   │   ├── products/       # Product management
│   │   ├── services/       # Service management
│   │   └── reservations/   # Reservation management
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── ui/                 # UI components (shadcn)
│   ├── footer.tsx          # Footer component
│   ├── navigation.tsx      # Navigation component
│   └── providers/          # Context providers
├── lib/
│   ├── supabase/           # Supabase clients
│   └── utils.ts            # Utility functions
├── types/
│   └── supabase.ts         # TypeScript types
├── supabase/
│   └── schema.sql          # Database schema
├── .env.example            # Environment variables template
├── middleware.ts           # Next.js middleware
└── next.config.js          # Next.js configuration
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/it-clinic.git
cd it-clinic
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Once your project is created, go to **Project Settings > API**
3. Copy the **Project URL** and **anon/public** key

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 5. Set Up Database

1. Go to your Supabase project's **SQL Editor**
2. Open `supabase/schema.sql` from this project
3. Copy the entire SQL content
4. Paste it into the SQL Editor and click **Run**

This will create all necessary tables, policies, and sample data.

### 6. Configure Admin User

**Method 1: Using Admin Key (Easiest)**
1. Go to `/auth/register`
2. Fill in your registration details
3. In the "Admin Key" field, enter: `itclinic2024`
4. Submit - your account will be created as admin

**Method 2: Via Supabase Dashboard**
1. Register a user through the application
2. Go to Supabase **Table Editor > profiles**
3. Find your user and change the `role` column from `user` to `admin`

**Method 3: Using SQL**
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

**To change the admin key:** Edit `app/auth/register/page.tsx` and modify `ADMIN_SECRET_KEY`

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

### Tables

#### profiles
- `id` (uuid, PK) - References auth.users
- `full_name` (text)
- `role` (text) - 'user' or 'admin'
- `created_at`, `updated_at` (timestamp)

#### services
- `id` (uuid, PK)
- `name` (text)
- `description` (text)
- `price` (numeric)
- `duration_minutes` (integer)
- `created_at`, `updated_at` (timestamp)

#### products
- `id` (uuid, PK)
- `name` (text)
- `description` (text)
- `price` (numeric)
- `image_url` (text)
- `stock` (integer)
- `category` (text)
- `created_at`, `updated_at` (timestamp)

#### reservations
- `id` (uuid, PK)
- `user_id` (uuid, FK) - References profiles
- `service_id` (uuid, FK) - References services
- `booking_date` (date)
- `problem_description` (text)
- `status` (text) - 'pending', 'confirmed', 'completed', 'cancelled'
- `created_at`, `updated_at` (timestamp)

#### consultations
- `id` (uuid, PK)
- `user_id` (uuid, FK) - References profiles (optional)
- `name` (text)
- `email` (text)
- `phone` (text)
- `message` (text)
- `status` (text) - 'new', 'in_progress', 'resolved'
- `created_at`, `updated_at` (timestamp)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/) and import your repository
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## User Guide

### For Customers

1. **Browse Services**: Visit `/services` to see available IT services
2. **Book Service**: Login and go to `/reservations` to book a service
3. **View Products**: Visit `/products` to browse tech products
4. **Contact**: Use `/contact` for general inquiries

### For Admins

1. **Admin Dashboard**: Access at `/admin/dashboard`
2. **Manage Reservations**: View and update reservation status
3. **Manage Products**: Add, edit, or delete products
4. **Manage Services**: Add, edit, or delete services

## Customization

### Colors & Theme

Edit `app/globals.css` to customize colors:

```css
:root {
  --primary: #3b82f6;    /* Change primary color */
  --accent: #0ea5e9;     /* Change accent color */
  /* ... */
}
```

### Adding New Services/Products

Use the admin dashboard or insert directly into the database:

```sql
-- Add a service
INSERT INTO services (name, description, price)
VALUES ('New Service', 'Description here', 99.99);

-- Add a product
INSERT INTO products (name, description, price, stock, category)
VALUES ('New Product', 'Description here', 49.99, 10, 'Accessories');
```

## Troubleshooting

### Common Issues

1. **"Failed to fetch" errors**: Check your Supabase URL and anon key
2. **RLS Policy errors**: Ensure policies are correctly set up in Supabase
3. **Admin access issues**: Verify the user's role is set to 'admin' in the profiles table

### Reset Database

To reset and start fresh:

```sql
-- Drop tables (in order to avoid FK constraints)
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS consultations;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS profiles;

-- Then re-run schema.sql
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
- Open an issue on GitHub
- Contact: contact@itclinic.com

---

Built with Next.js, Supabase & Tailwind CSS
