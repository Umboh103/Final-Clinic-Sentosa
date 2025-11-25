
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'pharmacist', 'owner', 'patient');
CREATE TYPE appointment_status AS ENUM ('waiting_doctor', 'in_examination', 'waiting_pharmacy', 'medicine_ready', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'transfer');
CREATE TYPE payment_status AS ENUM ('pending', 'paid');
CREATE TYPE prescription_status AS ENUM ('pending', 'processed', 'completed');

-- Create Tables

-- Profiles Table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role user_role,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Patients Table
CREATE TABLE patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT NOT NULL,
    nik TEXT NOT NULL UNIQUE,
    date_of_birth DATE,
    gender TEXT,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Medicines Table
CREATE TABLE medicines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    price NUMERIC DEFAULT 0,
    unit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Appointments Table
CREATE TABLE appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES profiles(id),
    date TIMESTAMP WITH TIME ZONE,
    status appointment_status DEFAULT 'waiting_doctor',
    symptoms TEXT,
    queue_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Medical Records Table
CREATE TABLE medical_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES profiles(id) NOT NULL,
    diagnosis TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Prescriptions Table
CREATE TABLE prescriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES profiles(id) NOT NULL,
    status prescription_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Prescription Items Table
CREATE TABLE prescription_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE NOT NULL,
    medicine_id UUID REFERENCES medicines(id) NOT NULL,
    quantity INTEGER NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Payments Table
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    method payment_method,
    status payment_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create Policies (Basic policies for now, can be refined later)

-- Profiles: Public read (for now, to allow checking roles), Users can update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Patients: Authenticated users can view and insert
CREATE POLICY "Authenticated users can view patients" ON patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert patients" ON patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update patients" ON patients FOR UPDATE TO authenticated USING (true);

-- Medicines: Authenticated users can view, Pharmacist/Admin can update (simplified to auth for now)
CREATE POLICY "Authenticated users can view medicines" ON medicines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert medicines" ON medicines FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update medicines" ON medicines FOR UPDATE TO authenticated USING (true);

-- Appointments: Authenticated users can view and insert
CREATE POLICY "Authenticated users can view appointments" ON appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert appointments" ON appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update appointments" ON appointments FOR UPDATE TO authenticated USING (true);

-- Medical Records: Authenticated users can view and insert
CREATE POLICY "Authenticated users can view medical records" ON medical_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert medical records" ON medical_records FOR INSERT TO authenticated WITH CHECK (true);

-- Prescriptions: Authenticated users can view and insert
CREATE POLICY "Authenticated users can view prescriptions" ON prescriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert prescriptions" ON prescriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update prescriptions" ON prescriptions FOR UPDATE TO authenticated USING (true);

-- Prescription Items: Authenticated users can view and insert
CREATE POLICY "Authenticated users can view prescription items" ON prescription_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert prescription items" ON prescription_items FOR INSERT TO authenticated WITH CHECK (true);

-- Payments: Authenticated users can view and insert
CREATE POLICY "Authenticated users can view payments" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert payments" ON payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update payments" ON payments FOR UPDATE TO authenticated USING (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', (new.raw_user_meta_data->>'role')::user_role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
