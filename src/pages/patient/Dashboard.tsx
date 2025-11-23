import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Calendar, FileText, Clock, Receipt } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PatientDashboard = () => {
  const navigate = useNavigate();

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

  const upcomingAppointments = [
    { date: "25 Nov 2025", time: "10:00", doctor: "Dr. Sarah Wijaya", type: "Pemeriksaan Umum" },
    { date: "28 Nov 2025", time: "14:00", doctor: "Dr. John Doe", type: "Kontrol Rutin" },
  ];

  const recentVisits = [
    {
      date: "20 Nov 2025",
      doctor: "Dr. Sarah Wijaya",
      diagnosis: "Flu ringan",
      status: "Selesai",
    },
    { date: "15 Nov 2025", doctor: "Dr. John Doe", diagnosis: "Cek kesehatan", status: "Selesai" },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Dashboard Pasien" role="Pasien">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Kunjungan"
          value="12"
          icon={<FileText className="h-6 w-6 text-primary" />}
          description="Sepanjang tahun ini"
        />
        <StatCard
          title="Jadwal Mendatang"
          value="2"
          icon={<Calendar className="h-6 w-6 text-secondary" />}
          description="Dalam 7 hari ke depan"
        />
        <StatCard
          title="Resep Aktif"
          value="3"
          icon={<FileText className="h-6 w-6 text-accent" />}
          description="Perlu diambil"
        />
        <StatCard
          title="Tagihan"
          value="Rp 0"
          icon={<Receipt className="h-6 w-6 text-success" />}
          description="Semua lunas"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Jadwal Pemeriksaan
            </CardTitle>
            <CardDescription>Jadwal pemeriksaan Anda yang akan datang</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.map((apt, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{apt.doctor}</p>
                  <p className="text-sm text-muted-foreground mt-1">{apt.type}</p>
                  <p className="text-sm text-primary font-medium mt-2">
                    {apt.date} - {apt.time}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Detail
                </Button>
              </div>
            ))}
            <Button
              onClick={() => navigate("/patient/schedule")}
              className="w-full"
              variant="outline"
            >
              Lihat Semua Jadwal
            </Button>
          </CardContent>
        </Card>

        {/* Recent Visits */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Riwayat Kunjungan
            </CardTitle>
            <CardDescription>Riwayat pemeriksaan terakhir Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentVisits.map((visit, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{visit.doctor}</p>
                  <p className="text-sm text-muted-foreground mt-1">{visit.diagnosis}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-sm text-muted-foreground">{visit.date}</p>
                    <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full font-medium">
                      {visit.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Button
              onClick={() => navigate("/patient/history")}
              className="w-full"
              variant="outline"
            >
              Lihat Riwayat Lengkap
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6 shadow-soft">
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>Layanan yang mungkin Anda butuhkan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate("/patient/registration")}
              className="h-auto py-6"
              variant="outline"
            >
              <div className="text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold">Daftar Pemeriksaan</p>
                <p className="text-xs text-muted-foreground mt-1">Buat janji baru</p>
              </div>
            </Button>
            <Button
              onClick={() => navigate("/patient/receipt")}
              className="h-auto py-6"
              variant="outline"
            >
              <div className="text-center">
                <Receipt className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold">Lihat Struk</p>
                <p className="text-xs text-muted-foreground mt-1">Riwayat pembayaran</p>
              </div>
            </Button>
            <Button
              onClick={() => navigate("/patient/history")}
              className="h-auto py-6"
              variant="outline"
            >
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold">Rekam Medis</p>
                <p className="text-xs text-muted-foreground mt-1">Lihat riwayat</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PatientDashboard;
