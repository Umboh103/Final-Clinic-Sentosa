import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Activity, FileText, CreditCard } from "lucide-react";
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

const AdminPatientRegistration = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Pasien berhasil didaftarkan! No. Antrian: A-025");
  };

  return (
    <DashboardLayout navItems={navItems} title="Pendaftaran Pasien" role="Admin">
      <Card className="shadow-soft max-w-4xl">
        <CardHeader>
          <CardTitle>Form Pendaftaran Pasien Baru</CardTitle>
          <CardDescription>Daftarkan pasien untuk pemeriksaan di Klinik Sentosa</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Lengkap *</Label>
                <Input placeholder="Nama pasien" required />
              </div>
              <div className="space-y-2">
                <Label>NIK / No. KTP *</Label>
                <Input placeholder="16 digit NIK" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Lahir *</Label>
                <Input type="date" required />
              </div>
              <div className="space-y-2">
                <Label>Jenis Kelamin *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>No. Telepon *</Label>
                <Input placeholder="08xxxxxxxxxx" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Alamat Lengkap *</Label>
              <Textarea rows={3} placeholder="Alamat lengkap pasien" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Keluhan Utama *</Label>
                <Textarea rows={4} placeholder="Jelaskan keluhan pasien" required />
              </div>
              <div className="space-y-2">
                <Label>Pilih Dokter</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih dokter" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="dr1">Dr. Sarah Wijaya</SelectItem>
                    <SelectItem value="dr2">Dr. John Doe</SelectItem>
                    <SelectItem value="dr3">Dr. Maria Tanaka</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Daftarkan Pasien
              </Button>
              <Button type="button" variant="outline" className="flex-1">
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminPatientRegistration;
