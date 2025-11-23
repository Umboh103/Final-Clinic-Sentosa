import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Building2, FileText, Users, DollarSign, Activity, TrendingUp } from "lucide-react";

const OwnerDashboard = () => {
  const navItems = [
    { label: "Dashboard", path: "/owner/dashboard", icon: <Building2 className="h-5 w-5" /> },
    { label: "Laporan", path: "/owner/reports", icon: <FileText className="h-5 w-5" /> },
    { label: "Manajemen Akun", path: "/owner/accounts", icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Dashboard Pemilik" role="Pemilik Klinik">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Pasien Bulan Ini"
          value="428"
          icon={<Users className="h-6 w-6 text-primary" />}
          trend={{ value: "18%", isPositive: true }}
        />
        <StatCard
          title="Pendapatan Bulan Ini"
          value="Rp 68.5jt"
          icon={<DollarSign className="h-6 w-6 text-success" />}
          trend={{ value: "25%", isPositive: true }}
        />
        <StatCard
          title="Total Pemeriksaan"
          value="385"
          icon={<Activity className="h-6 w-6 text-accent" />}
          trend={{ value: "15%", isPositive: true }}
        />
        <StatCard
          title="Growth Rate"
          value="22%"
          icon={<TrendingUp className="h-6 w-6 text-secondary" />}
          description="vs bulan lalu"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatCard
          title="Rata-rata Pasien/Hari"
          value="28"
          icon={<Activity className="h-6 w-6 text-primary" />}
          description="Bulan ini"
        />
        <StatCard
          title="Pendapatan Rata-rata/Hari"
          value="Rp 4.2jt"
          icon={<DollarSign className="h-6 w-6 text-success" />}
          description="Bulan ini"
        />
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
