import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Users, Activity, DollarSign, Calendar, FileText, CreditCard } from "lucide-react";

const AdminDashboard = () => {
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
    <DashboardLayout navItems={navItems} title="Dashboard Admin" role="Admin">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pasien Hari Ini"
          value="24"
          icon={<Users className="h-6 w-6 text-primary" />}
          trend={{ value: "12%", isPositive: true }}
        />
        <StatCard
          title="Pemeriksaan"
          value="18"
          icon={<Activity className="h-6 w-6 text-secondary" />}
          trend={{ value: "5%", isPositive: true }}
        />
        <StatCard
          title="Pendapatan Hari Ini"
          value="Rp 4.5jt"
          icon={<DollarSign className="h-6 w-6 text-success" />}
          trend={{ value: "8%", isPositive: true }}
        />
        <StatCard
          title="Jadwal Besok"
          value="15"
          icon={<Calendar className="h-6 w-6 text-accent" />}
          description="Janji temu terdaftar"
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
