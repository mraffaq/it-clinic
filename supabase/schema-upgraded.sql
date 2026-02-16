-- =====================================================
-- IT CLINIC - Production-Ready Supabase Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================
DO $$
BEGIN
    -- Create custom types if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
        CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'repair_status') THEN
        CREATE TYPE repair_status AS ENUM ('registered', 'received', 'diagnosing', 'repairing', 'ready', 'picked_up', 'cancelled');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'consultation_status') THEN
        CREATE TYPE consultation_status AS ENUM ('new', 'in_progress', 'resolved');
    END IF;
END $$;

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    role user_role DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    duration_minutes INTEGER CHECK (duration_minutes > 0),
    icon TEXT DEFAULT 'Wrench',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    booking_date DATE NOT NULL,
    booking_time TIME,
    device_info TEXT,
    problem_description TEXT,
    status reservation_status DEFAULT 'pending',
    repair_status repair_status DEFAULT 'registered',
    admin_notes TEXT,
    estimated_completion_date DATE,
    actual_completion_date DATE,
    total_price DECIMAL(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultations table
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status consultation_status DEFAULT 'new',
    admin_response TEXT,
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    site_name TEXT DEFAULT 'IT Clinic',
    tagline TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    business_hours JSONB,
    social_links JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_sort_order ON services(sort_order);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_booking_date ON reservations(booking_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_repair_status ON reservations(repair_status);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_testimonials_is_active ON testimonials(is_active);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - PROFILES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- =====================================================
-- RLS POLICIES - SERVICES
-- =====================================================

-- Services are viewable by everyone (active only)
CREATE POLICY "Services are viewable by everyone"
    ON services FOR SELECT
    TO authenticated, anon
    USING (is_active = true);

-- Admins can view all services
CREATE POLICY "Admins can view all services"
    ON services FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Only admins can modify services
CREATE POLICY "Only admins can insert services"
    ON services FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update services"
    ON services FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete services"
    ON services FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- =====================================================
-- RLS POLICIES - PRODUCTS
-- =====================================================

-- Products are viewable by everyone (active only)
CREATE POLICY "Products are viewable by everyone"
    ON products FOR SELECT
    TO authenticated, anon
    USING (is_active = true);

-- Admins can view all products
CREATE POLICY "Admins can view all products"
    ON products FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Only admins can modify products
CREATE POLICY "Only admins can insert products"
    ON products FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update products"
    ON products FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete products"
    ON products FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- =====================================================
-- RLS POLICIES - RESERVATIONS
-- =====================================================

-- Users can view their own reservations
CREATE POLICY "Users can view own reservations"
    ON reservations FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own reservations
CREATE POLICY "Users can create own reservations"
    ON reservations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all reservations
CREATE POLICY "Admins can view all reservations"
    ON reservations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Admins can update all reservations
CREATE POLICY "Admins can update all reservations"
    ON reservations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Admins can delete reservations
CREATE POLICY "Admins can delete reservations"
    ON reservations FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- =====================================================
-- RLS POLICIES - CONSULTATIONS
-- =====================================================

-- Anyone can create consultations
CREATE POLICY "Anyone can create consultations"
    ON consultations FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- Admins can view all consultations
CREATE POLICY "Admins can view all consultations"
    ON consultations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Admins can update consultations
CREATE POLICY "Admins can update consultations"
    ON consultations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Admins can delete consultations
CREATE POLICY "Admins can delete consultations"
    ON consultations FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- =====================================================
-- RLS POLICIES - TESTIMONIALS
-- =====================================================

-- Active testimonials are viewable by everyone
CREATE POLICY "Testimonials are viewable by everyone"
    ON testimonials FOR SELECT
    TO authenticated, anon
    USING (is_active = true);

-- Admins can manage testimonials
CREATE POLICY "Admins can manage testimonials"
    ON testimonials FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- =====================================================
-- RLS POLICIES - SITE SETTINGS
-- =====================================================

-- Site settings are viewable by everyone
CREATE POLICY "Site settings are viewable by everyone"
    ON site_settings FOR SELECT
    TO authenticated, anon
    USING (true);

-- Only admins can update site settings
CREATE POLICY "Only admins can update site settings"
    ON site_settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user')
    );
    RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
    BEFORE UPDATE ON consultations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to check for double booking
CREATE OR REPLACE FUNCTION check_double_booking()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM reservations
        WHERE booking_date = NEW.booking_date
        AND booking_time = NEW.booking_time
        AND status NOT IN ('cancelled', 'completed')
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Time slot already booked';
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger to prevent double booking
DROP TRIGGER IF EXISTS prevent_double_booking ON reservations;
CREATE TRIGGER prevent_double_booking
    BEFORE INSERT OR UPDATE ON reservations
    FOR EACH ROW
    WHEN (NEW.booking_time IS NOT NULL)
    EXECUTE FUNCTION check_double_booking();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample testimonials
INSERT INTO testimonials (name, role, content, rating, is_active) VALUES
('Budi Santoso', 'Mahasiswa', 'Pelayanan sangat bagus, laptop saya yang mati total bisa hidup lagi dalam 2 hari. Harga juga terjangkau.', 5, true),
('Siti Rahayu', 'Karyawan Swasta', 'Technician-nya profesional dan ramah. Dijelaskan masalahnya dengan detail. Recommended!', 5, true),
('Ahmad Wijaya', 'Pemilik Toko', 'Sudah 3 kali service di sini, selalu puas. Garansi servicenya juga jelas.', 4, true),
('Maya Indah', 'Freelancer', 'Upgrade SSD di sini, proses cepat dan datanya aman. Sekarang laptop jadi ngebut!', 5, true)
ON CONFLICT DO NOTHING;

-- Insert site settings
INSERT INTO site_settings (id, site_name, tagline, phone, email, address, business_hours, social_links)
VALUES (
    1,
    'IT Clinic',
    'Solusi Terpercaya untuk Perbaikan Laptop & PC Anda',
    '+62 812-3456-7890',
    'info@itclinic.id',
    'Jl. Sudirman No. 123, Jakarta Pusat',
    '{
        "monday": "09:00-17:00",
        "tuesday": "09:00-17:00",
        "wednesday": "09:00-17:00",
        "thursday": "09:00-17:00",
        "friday": "09:00-17:00",
        "saturday": "09:00-15:00",
        "sunday": "closed"
    }'::jsonb,
    '{
        "instagram": "@itclinic",
        "facebook": "ITClinicOfficial",
        "whatsapp": "6281234567890"
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
