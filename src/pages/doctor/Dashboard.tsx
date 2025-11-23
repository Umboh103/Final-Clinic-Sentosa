import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Users, Activity, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const navigate = useNavigate();

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

  const queuePatients = [
    { no: "A-001", nama: "John Doe", keluhan: "Demam dan batuk", waktu: "09:00" },
    { no: "A-002", nama: "Jane Smith", keluhan: "Sakit kepala", waktu: "09:30" },
    { no: "A-003", nama: "Michael Johnson", keluhan: "Sakit perut", waktu: "10:00" },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Dashboard Dokter" role="Dokter">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pasien Hari Ini"
          value="15"
          icon={<Users className="h-6 w-6 text-primary" />}
          description="Total pasien terdaftar"
        />
        <StatCard
          title="Selesai Diperiksa"
          value="8"
          icon={<Activity className="h-6 w-6 text-success" />}
          description="Pemeriksaan selesai"
        />
        <StatCard
          title="Dalam Antrian"
          value="3"
          icon={<Clock className="h-6 w-6 text-warning" />}
          description="Menunggu pemeriksaan"
        />
        <StatCard
          title="Resep Dibuat"
          value="12"
          icon={<FileText className="h-6 w-6 text-accent" />}
          description="Hari ini"
        />
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Antrian Pasien Hari Ini
          </CardTitle>
          <CardDescription>Daftar pasien yang menunggu untuk diperiksa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {queuePatients.map((patient, index) => (
            <div
              key={patient.no}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border"
            >
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                  {patient.no}
                </Badge>
                <div>
                  <p className="font-semibold text-foreground">{patient.nama}</p>
                  <p className="text-sm text-muted-foreground mt-1">{patient.keluhan}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{patient.waktu}</span>
                <Button size="sm" onClick={() => navigate("/doctor/examinations")}>
                  Periksa
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
