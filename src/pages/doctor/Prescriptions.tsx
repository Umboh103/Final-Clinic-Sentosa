import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Activity, FileText, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";

const DoctorPrescriptions = () => {
  const [medications, setMedications] = useState([
    { id: 1, name: "", dosage: "", frequency: "", duration: "" },
  ]);

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

  const addMedication = () => {
    setMedications([
      ...medications,
      { id: Date.now(), name: "", dosage: "", frequency: "", duration: "" },
    ]);
  };

  const removeMedication = (id: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((med) => med.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Resep berhasil dibuat dan dikirim ke apotek!");
  };

  return (
    <DashboardLayout navItems={navItems} title="Buat Resep" role="Dokter">
      <Card className="shadow-soft max-w-4xl">
        <CardHeader>
          <CardTitle>Form Resep Obat</CardTitle>
          <CardDescription>Buat resep obat untuk pasien</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>No. Rekam Medis</Label>
                <Input value="MR-001" readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Nama Pasien</Label>
                <Input value="John Doe" readOnly className="bg-muted" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Diagnosis</Label>
              <Input value="Flu ringan" readOnly className="bg-muted" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Daftar Obat</Label>
                <Button type="button" size="sm" onClick={addMedication} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Obat
                </Button>
              </div>

              {medications.map((med, index) => (
                <Card key={med.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nama Obat *</Label>
                            <Input placeholder="Nama obat" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Dosis *</Label>
                            <Input placeholder="500mg" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Frekuensi *</Label>
                            <Input placeholder="3x sehari" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Durasi *</Label>
                            <Input placeholder="7 hari" required />
                          </div>
                        </div>
                      </div>
                      {medications.length > 1 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() => removeMedication(med.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Instruksi Tambahan</Label>
              <Input placeholder="Diminum setelah makan..." />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Kirim Resep ke Apotek
              </Button>
              <Button type="button" variant="outline" className="flex-1">
                Simpan Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default DoctorPrescriptions;
