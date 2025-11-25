# 🏥 Clinic Sentosa - Modern Clinic Management System

**Sistem Manajemen Klinik Modern Berbasis Web**

![React](https://img.shields.io/badge/React-18.0+-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.0+-purple.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![Supabase](https://img.shields.io/badge/Supabase-Database-green.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0+-cyan.svg)

---

## 👥 Tim Pengembang

**Ketua Kelompok:**
- **Imanuel Palenewen** 

**Anggota Kelompok :**
- **Umboh, Timothy**
- **Tjia, David**
- **Tjiu, Kevin**

**Project:** Clinic Management System 
**Mata kuliah:** System Analysis Design
**Semester:** 5
**Tahun Akademik:** 2024/2025

---

## 📖 Tentang Proyek

Clinic Sentosa adalah sistem manajemen klinik terpadu yang dirancang untuk memodernisasi operasional klinik. Sistem ini mengintegrasikan pendaftaran pasien, rekam medis elektronik, manajemen apotek, dan pelaporan keuangan dalam satu platform yang efisien dan mudah digunakan.

### ✨ Fitur Utama

- 🏥 **Manajemen Pasien**: Pendaftaran pasien baru, riwayat kunjungan, dan manajemen antrian.
- 👨‍⚕️ **Dashboard Dokter**: Akses rekam medis, diagnosa, dan pembuatan resep obat digital.
- 💊 **Sistem Apotek**: Pemrosesan resep, manajemen stok obat, dan penyerahan obat.
- 💰 **Kasir & Keuangan**: Pembayaran terintegrasi dan laporan pendapatan harian/bulanan.
- 🔐 **Role-Based Access**: Akses aman untuk Admin, Dokter, Apoteker, Pemilik, dan Pasien.
- 📱 **UI Responsif**: Tampilan modern dan responsif menggunakan Tailwind CSS dan Shadcn UI.
- ⚡ **Real-time Updates**: Pembaruan data instan menggunakan Supabase Realtime.

### 🛠 Teknologi yang Digunakan

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: React Query
- **Form Handling**: React Hook Form, Zod
- **Icons**: Lucide React

---

## 🚀 Cara Instalasi dan Menjalankan

### 📋 Prasyarat

- Node.js (v18 atau lebih tinggi)
- npm atau yarn
- Akun Supabase (untuk backend)
- Git

### 📥 Langkah 1: Clone Repository

```bash
git clone https://github.com/Imanuelpalenewen/clinic-sentosa-ui.git
cd clinic-sentosa-ui
```

### 📦 Langkah 2: Install Dependencies

```bash
npm install
```

### 🔑 Langkah 3: Setup Environment Variables

1. Buat file `.env` di root folder project 

2. Edit file `.env` dan isi dengan kredensial Supabase Anda:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 🗄️ Langkah 4: Setup Database (Supabase)

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard).
2. Masuk ke menu **SQL Editor**.
3. Buka file `supabase_schema.sql` yang ada di repository ini.
4. Copy seluruh isinya dan paste ke SQL Editor Supabase.
5. Klik **Run** untuk membuat tabel, relasi, dan kebijakan keamanan (RLS).

### ▶ Langkah 5: Jalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:8080** (atau port lain yang tersedia).

---

## 📱 Cara Menggunakan

### 1️⃣ Login
- Gunakan akun yang sudah didaftarkan atau buat akun baru (jika fitur register aktif).
- Login sesuai role (Dokter, Admin, dll) untuk melihat dashboard yang sesuai.

### 2️⃣ Alur Pasien (Contoh)
1. **Pendaftaran**: Admin mendaftarkan pasien baru.
2. **Pemeriksaan**: Dokter melihat antrian, memeriksa pasien, dan membuat resep.
3. **Farmasi**: Apoteker menerima resep, menyiapkan obat, dan update status.
4. **Pembayaran**: Kasir memproses pembayaran.

---

## 🗂 Struktur Project

```
clinic-sentosa/
├── src/
│   ├── components/        # Komponen UI Reusable (Button, Input, dll)
│   ├── pages/            # Halaman-halaman aplikasi
│   │   ├── admin/        # Halaman khusus Admin
│   │   ├── doctor/       # Halaman khusus Dokter
│   │   ├── owner/        # Halaman khusus Owner
│   │   ├── patient/      # Halaman khusus Pasien
│   │   └── pharmacist/   # Halaman khusus Apoteker
│   ├── integrations/     # Integrasi pihak ketiga (Supabase)
│   ├── hooks/            # Custom React Hooks
│   └── App.tsx           # Main Application Component
├── public/               # Static assets
├── supabase_schema.sql   # Script database
└── README.md             # Dokumentasi ini
```

---

## ⚠ Troubleshooting

### ❌ Error: "Missing Supabase environment variables"
**Solusi:**
- Pastikan file `.env` sudah dibuat dan berisi URL serta Key yang benar.
- Restart server development (`npm run dev`) setelah mengubah `.env`.

### ❌ Error: "Database error / Table not found"
**Solusi:**
- Pastikan Anda sudah menjalankan script `supabase_schema.sql` di dashboard Supabase.
- Periksa koneksi internet.

---

## 🎓 Referensi & Credits

- **React**: [React Documentation](https://react.dev/)
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **Tailwind CSS**: [Tailwind CSS](https://tailwindcss.com/)
- **Shadcn UI**: [ui.shadcn.com](https://ui.shadcn.com/)
- **Lovable**: Generated with Lovable

---

## 📝 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

<div align="center">

**🏥 Dibuat dengan ❤ untuk Pelayanan Kesehatan yang Lebih Baik**

*Clinic Sentosa - Your Health, Our Priority*

</div>
