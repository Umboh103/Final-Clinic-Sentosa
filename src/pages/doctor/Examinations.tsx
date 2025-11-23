import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Activity, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const DoctorExaminations = () => {
  const navItems = [
    { label: "Dashboard", path: "/doctor/dashboard", icon: <Activity className="h-5 w-5" /> },
    {
      label: "Pemeriksaan Pasien",
      path: "/doctor/examinations",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Buat Resep",
      path: "/doctor/prescriptions",
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Hasil pemeriksaan berhasil disimpan!");
  };

  return (
    <DashboardLayout navItems={navItems} title="Pemeriksaan Pasien" role="Dokter">
      <Card className="shadow-soft max-w-4xl">
        <CardHeader>
          <CardTitle>Form Pemeriksaan Pasien</CardTitle>
          <CardDescription>Input hasil pemeriksaan dan diagnosis pasien</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>No. Antrian</Label>
                <Input value="A-001" readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Nama Pasien</Label>
                <Input value="John Doe" readOnly className="bg-muted" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Keluhan Pasien</Label>
              <Textarea value="Demam dan batuk sejak 3 hari yang lalu" readOnly rows={2} className="bg-muted" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tekanan Darah</Label>
                <Input placeholder="120/80 mmHg" />
              </div>
              <div className="space-y-2">
                <Label>Suhu Tubuh</Label>
                <Input placeholder="36.5°C" />
              </div>
              <div className="space-y-2">
                <Label>Berat Badan</Label>
                <Input placeholder="70 kg" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Anamnesis *</Label>
              <Textarea rows={4} placeholder="Catatan anamnesis pasien..." required />
            </div>

            <div className="space-y-2">
              <Label>Diagnosis *</Label>
              <Textarea rows={3} placeholder="Diagnosis penyakit pasien..." required />
            </div>

            <div className="space-y-2">
              <Label>Tindakan / Terapi</Label>
              <Textarea rows={3} placeholder="Tindakan medis yang dilakukan..." />
            </div>

            <div className="space-y-2">
              <Label>Catatan Tambahan</Label>
              <Textarea rows={3} placeholder="Catatan tambahan untuk pasien..." />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Simpan Hasil Pemeriksaan
              </Button>
              <Button type="button" variant="outline" className="flex-1">
                Buat Resep
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default DoctorExaminations;
