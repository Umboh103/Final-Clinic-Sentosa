import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Activity, FileText, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminPatientRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    nik: "",
    nama: "",
    tanggalLahir: "",
    jenisKelamin: "",
    alamat: "",
    telepon: "",
    keluhan: "",
    dokter: "",
    tanggalPeriksa: new Date().toLocaleDateString('en-CA'),
  });

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <Activity className="h-5 w-5" /> },
    {
      label: "Pendaftaran Pasien",
      path: "/admin/patient-registration",
      icon: <FileText className="h-5 w-5" />,
    },
    { label: "Pembayaran", path: "/admin/payments", icon: <CreditCard className="h-5 w-5" /> },
    { label: "Laporan", path: "/admin/reports", icon: <FileText className="h-5 w-5" /> },
    {
      label: "Manajemen Pasien",
      path: "/admin/patient-management",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'doctor');

    if (data) setDoctors(data);
    if (error) console.error('Error fetching doctors:', error);
  };

  const handleSearchNIK = async () => {
    if (!formData.nik) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('nik', formData.nik)
        .single();

      if (data) {
        setFormData({
          ...formData,
          nama: data.full_name,
          tanggalLahir: data.date_of_birth || "",
          jenisKelamin: data.gender || "",
          alamat: data.address || "",
          telepon: data.phone || "",
        });
        toast.success("Data pasien ditemukan");
      } else {
        toast.info("Pasien belum terdaftar, silakan isi data baru");
      }
    } catch (error) {
      console.error('Error searching patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upsert Patient
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .upsert({
          nik: formData.nik,
          full_name: formData.nama,
          date_of_birth: formData.tanggalLahir,
          gender: formData.jenisKelamin,
          address: formData.alamat,
          phone: formData.telepon,
        }, { onConflict: 'nik' })
        .select()
        .single();

      if (patientError) throw patientError;

      // 2. Get Queue Number
      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('date', formData.tanggalPeriksa);

      const queueNumber = (count || 0) + 1;

      // 3. Create Appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientData.id,
          doctor_id: formData.dokter || null,
          date: formData.tanggalPeriksa,
          symptoms: formData.keluhan,
          queue_number: queueNumber,
          status: 'waiting_doctor'
        });

      if (appointmentError) throw appointmentError;

      toast.success(`Pendaftaran berhasil! Nomor antrian: ${queueNumber}`);

      // Reset form
      setFormData({
        nik: "",
        nama: "",
        tanggalLahir: "",
        jenisKelamin: "",
        alamat: "",
        telepon: "",
        keluhan: "",
        dokter: "",
        tanggalPeriksa: new Date().toLocaleDateString('en-CA'),
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || "Gagal melakukan pendaftaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Pendaftaran Pasien" role="Admin">
      <Card className="shadow-soft max-w-4xl">
        <CardHeader>
          <CardTitle>Form Pendaftaran Pasien</CardTitle>
          <CardDescription>
            Daftarkan pasien baru atau cari pasien lama menggunakan NIK
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-foreground border-b pb-2">Data Pribadi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nik">NIK *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="nik"
                      placeholder="Masukkan NIK"
                      value={formData.nik}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                      required
                    />
                    <Button type="button" variant="secondary" onClick={handleSearchNIK} disabled={loading}>
                      Cari
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap *</Label>
                  <Input
                    id="nama"
                    placeholder="Masukkan nama lengkap"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
                  <Input
                    id="tanggalLahir"
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
                  <Select
                    value={formData.jenisKelamin}
                    onValueChange={(val) => setFormData({ ...formData, jenisKelamin: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Input
                    id="alamat"
                    placeholder="Masukkan alamat lengkap"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telepon">Nomor Telepon</Label>
                  <Input
                    id="telepon"
                    placeholder="08xxxxxxxxxx"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Examination Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-foreground border-b pb-2">Data Pemeriksaan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tanggalPeriksa">Tanggal Periksa *</Label>
                  <Input
                    id="tanggalPeriksa"
                    type="date"
                    value={formData.tanggalPeriksa}
                    onChange={(e) => setFormData({ ...formData, tanggalPeriksa: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dokter">Pilih Dokter</Label>
                  <Select
                    value={formData.dokter}
                    onValueChange={(val) => setFormData({ ...formData, dokter: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih dokter pemeriksa" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {doctors.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="keluhan">Keluhan Utama *</Label>
                  <Input
                    id="keluhan"
                    placeholder="Contoh: Demam tinggi sudah 3 hari"
                    value={formData.keluhan}
                    onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Mendaftar..." : "Daftar Antrian"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminPatientRegistration;
