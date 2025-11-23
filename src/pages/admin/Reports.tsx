import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Activity, FileText, CreditCard, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";

const AdminReports = () => {
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

  return (
    <DashboardLayout navItems={navItems} title="Laporan" role="Admin">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Pasien Bulan Ini"
          value="342"
          icon={<Users className="h-6 w-6 text-primary" />}
          trend={{ value: "15%", isPositive: true }}
        />
        <StatCard
          title="Total Pendapatan"
          value="Rp 45.2jt"
          icon={<CreditCard className="h-6 w-6 text-success" />}
          trend={{ value: "22%", isPositive: true }}
        />
        <StatCard
          title="Rata-rata Kunjungan"
          value="28/hari"
          icon={<Activity className="h-6 w-6 text-accent" />}
          description="Bulan ini"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Laporan Harian</CardTitle>
            <CardDescription>Ringkasan aktivitas hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Laporan Harian
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Laporan Mingguan</CardTitle>
            <CardDescription>Ringkasan 7 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Laporan Mingguan
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Laporan Bulanan</CardTitle>
            <CardDescription>Ringkasan bulan berjalan</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Laporan Bulanan
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Laporan Custom</CardTitle>
            <CardDescription>Buat laporan sesuai kebutuhan</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Buat Laporan Custom
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
