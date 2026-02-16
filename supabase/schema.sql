-- =====================================================
-- IT CLINIC - Supabase Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations table
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    problem_description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultations table
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Services policies (public read, admin write)
CREATE POLICY "Services are viewable by everyone"
    ON services FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Only admin can insert services"
    ON services FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admin can update services"
    ON services FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admin can delete services"
    ON services FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone"
    ON products FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Only admin can insert products"
    ON products FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admin can update products"
    ON products FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admin can delete products"
    ON products FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Reservations policies
CREATE POLICY "Users can view their own reservations"
    ON reservations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reservations"
    ON reservations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all reservations"
    ON reservations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin can update reservations"
    ON reservations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin can delete reservations"
    ON reservations FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Consultations policies
CREATE POLICY "Anyone can create consultations"
    ON consultations FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "Admin can view all consultations"
    ON consultations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin can update consultations"
    ON consultations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin can delete consultations"
    ON consultations FOR DELETE
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
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample services
INSERT INTO services (name, description, price, duration_minutes) VALUES
('Laptop Screen Replacement', 'Replace cracked or damaged laptop screens with high-quality replacements', 149.99, 120),
('PC Diagnostic Service', 'Complete hardware and software diagnostics to identify issues', 59.99, 60),
('Virus Removal', 'Complete malware and virus removal with system optimization', 79.99, 90),
('Home Network Setup', 'Professional installation and configuration of home WiFi networks', 99.99, 120),
('Data Recovery - Basic', 'Recovery of deleted files from working drives', 149.99, 180),
('Data Recovery - Advanced', 'Recovery from damaged or corrupted drives', 299.99, 480),
('RAM Upgrade', 'Install additional RAM memory for better performance', 49.99, 30),
('SSD Upgrade', 'Replace HDD with SSD for faster boot and load times', 129.99, 90),
('Thermal Paste Replacement', 'Clean and reapply thermal paste for better cooling', 39.99, 45),
('Laptop Battery Replacement', 'Replace old or defective laptop batteries', 89.99, 60);

-- Insert sample products
INSERT INTO products (name, description, price, stock, category) VALUES
('Wireless Mouse - Pro', 'Ergonomic wireless mouse with 6 programmable buttons', 29.99, 50, 'Accessories'),
('USB-C Hub', '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader', 49.99, 30, 'Accessories'),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard with blue switches', 79.99, 25, 'Accessories'),
('Webcam 1080p', 'Full HD webcam with built-in microphone and autofocus', 59.99, 40, 'Accessories'),
('Laptop Stand', 'Aluminum adjustable laptop stand for better ergonomics', 34.99, 60, 'Accessories'),
('External SSD 1TB', 'Portable SSD with USB 3.2 for fast data transfer', 89.99, 20, 'Storage'),
('HDMI Cable 6ft', 'High-speed HDMI cable supporting 4K resolution', 12.99, 100, 'Accessories'),
('Wireless Earbuds', 'Bluetooth 5.0 earbuds with charging case', 39.99, 45, 'Accessories'),
('Laptop Backpack', 'Water-resistant laptop backpack fits up to 17 inches', 44.99, 35, 'Accessories'),
('USB Flash Drive 64GB', 'High-speed USB 3.0 flash drive', 14.99, 80, 'Storage');
