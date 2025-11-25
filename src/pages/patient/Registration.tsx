import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Calendar, FileText, Clock, Receipt } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PatientRegistration = () => {
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
    tanggalPeriksa: new Date().toISOString().split('T')[0],
  });

  const navItems = [
    { label: "Dashboard", path: "/patient/dashboard", icon: <Calendar className="h-5 w-5" /> },
    {
      label: "Pendaftaran",
      path: "/patient/registration",
      icon: <FileText className="h-5 w-5" />,
    },
    { label: "Riwayat Pemeriksaan", path: "/patient/history", icon: <Clock className="h-5 w-5" /> },
    { label: "Jadwal", path: "/patient/schedule", icon: <Calendar className="h-5 w-5" /> },
    { label: "Struk Pembayaran", path: "/patient/receipt", icon: <Receipt className="h-5 w-5" /> },
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'doctor');

      if (data) setDoctors(data);
      if (error) console.error('Error fetching doctors:', error);
    };

    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Upsert Patient
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .upsert({
          id: user?.id, // Force ID to match Auth ID
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

      // 2. Get Queue Number (Simple count + 1 for the day)
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
          doctor_id: formData.dokter || null, // Optional
          date: formData.tanggalPeriksa,
          symptoms: formData.keluhan,
          queue_number: queueNumber,
          status: 'waiting_doctor'
        });

      if (appointmentError) throw appointmentError;

      toast.success(`Pendaftaran berhasil! Nomor antrian Anda: ${queueNumber}`);

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
        tanggalPeriksa: new Date().toISOString().split('T')[0],
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || "Gagal melakukan pendaftaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Pendaftaran Pemeriksaan" role="Pasien">
      <Card className="shadow-soft max-w-4xl">
        <CardHeader>
          <CardTitle>Form Pendaftaran Pemeriksaan</CardTitle>
          <CardDescription>
            Lengkapi data berikut untuk mendaftar pemeriksaan di Klinik Sentosa
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
                  <Input
                    id="nik"
                    placeholder="Masukkan NIK"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    required
                  />
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tanggalLahir">Tanggal Lahir *</Label>
                  <Input
                    id="tanggalLahir"
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jenisKelamin">Jenis Kelamin *</Label>
                  <Select
                    value={formData.jenisKelamin}
                    onValueChange={(value) => setFormData({ ...formData, jenisKelamin: value })}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="telepon">Nomor Telepon *</Label>
                <Input
                  id="telepon"
                  placeholder="08xxxxxxxxxx"
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat Lengkap *</Label>
                <Textarea
                  id="alamat"
                  placeholder="Masukkan alamat lengkap"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Medical Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-foreground border-b pb-2">
                Informasi Pemeriksaan
              </h3>
              <div className="space-y-2">
                <Label htmlFor="keluhan">Keluhan Utama *</Label>
                <Textarea
                  id="keluhan"
                  placeholder="Jelaskan keluhan Anda"
                  value={formData.keluhan}
                  onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dokter">Pilih Dokter</Label>
                  <Select
                    value={formData.dokter}
                    onValueChange={(value) => setFormData({ ...formData, dokter: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih dokter (opsional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {doctors.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.full_name || "Dokter Tanpa Nama"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggalPeriksa">Tanggal Periksa</Label>
                  <Input
                    id="tanggalPeriksa"
                    type="date"
                    value={formData.tanggalPeriksa}
                    onChange={(e) => setFormData({ ...formData, tanggalPeriksa: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" size="lg" disabled={loading}>
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </Button>
              <Button type="button" variant="outline" className="flex-1" size="lg" onClick={() => setFormData({
                nik: "",
                nama: "",
                tanggalLahir: "",
                jenisKelamin: "",
                alamat: "",
                telepon: "",
                keluhan: "",
                dokter: "",
                tanggalPeriksa: new Date().toISOString().split('T')[0],
              })}>
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PatientRegistration;
