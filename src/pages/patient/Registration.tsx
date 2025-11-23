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
import { useState } from "react";

const PatientRegistration = () => {
  const [formData, setFormData] = useState({
    nama: "",
    tanggalLahir: "",
    jenisKelamin: "",
    alamat: "",
    telepon: "",
    keluhan: "",
    dokter: "",
    tanggalPeriksa: "",
    jamPeriksa: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Pendaftaran berhasil! Nomor antrian Anda: A-001");
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
                  <Label htmlFor="tanggalLahir">Tanggal Lahir *</Label>
                  <Input
                    id="tanggalLahir"
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <SelectItem value="dr-sarah">Dr. Sarah Wijaya</SelectItem>
                      <SelectItem value="dr-john">Dr. John Doe</SelectItem>
                      <SelectItem value="dr-maria">Dr. Maria Tanaka</SelectItem>
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
              <Button type="submit" className="flex-1" size="lg">
                Daftar Sekarang
              </Button>
              <Button type="button" variant="outline" className="flex-1" size="lg">
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
