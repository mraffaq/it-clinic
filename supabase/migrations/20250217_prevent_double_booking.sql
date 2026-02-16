-- Migration: Prevent double booking on same date/time
-- Created: 2025-02-17

-- Add unique constraint to prevent users from booking same date/time
CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_no_double_booking
ON reservations (user_id, booking_date, booking_time)
WHERE status != 'cancelled';

-- Add index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_reservations_booking_date
ON reservations (booking_date);

-- Add index for status-based queries
CREATE INDEX IF NOT EXISTS idx_reservations_status
ON reservations (status);

-- Add index for repair status queries
CREATE INDEX IF NOT EXISTS idx_reservations_repair_status
ON reservations (repair_status);

-- Update handle_new_user function to support role from metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role text;
    user_full_name text;
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
    user_full_name := NEW.raw_user_meta_data->>'full_name';

    INSERT INTO profiles (id, full_name, role)
    VALUES (NEW.id, user_full_name, user_role)
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
