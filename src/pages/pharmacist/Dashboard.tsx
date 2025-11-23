import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Pill, FileText, Package, AlertTriangle } from "lucide-react";

const PharmacistDashboard = () => {
  const navItems = [
    { label: "Dashboard", path: "/pharmacist/dashboard", icon: <Pill className="h-5 w-5" /> },
    {
      label: "Resep Masuk",
      path: "/pharmacist/prescriptions",
      icon: <FileText className="h-5 w-5" />,
    },
    { label: "Stok Obat", path: "/pharmacist/stock", icon: <Package className="h-5 w-5" /> },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Dashboard Apoteker" role="Apoteker">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Resep Hari Ini"
          value="18"
          icon={<FileText className="h-6 w-6 text-primary" />}
          description="Resep baru"
        />
        <StatCard
          title="Diproses"
          value="12"
          icon={<Pill className="h-6 w-6 text-success" />}
          description="Sedang disiapkan"
        />
        <StatCard
          title="Selesai"
          value="6"
          icon={<Package className="h-6 w-6 text-accent" />}
          description="Siap diambil"
        />
        <StatCard
          title="Stok Rendah"
          value="5"
          icon={<AlertTriangle className="h-6 w-6 text-warning" />}
          description="Perlu restock"
        />
      </div>
    </DashboardLayout>
  );
};

export default PharmacistDashboard;
