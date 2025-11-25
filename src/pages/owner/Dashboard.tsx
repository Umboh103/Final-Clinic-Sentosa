import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Building2, FileText, Users, DollarSign, Activity, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const OwnerDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    monthlyIncome: 0,
    totalExaminations: 0,
    dailyPatients: 0,
    dailyIncome: 0
  });

  const navItems = [
    { label: "Dashboard", path: "/owner/dashboard", icon: <Building2 className="h-5 w-5" /> },
    { label: "Laporan", path: "/owner/reports", icon: <FileText className="h-5 w-5" /> },
    { label: "Manajemen Akun", path: "/owner/accounts", icon: <Users className="h-5 w-5" /> },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const todayStr = today.toISOString().split('T')[0];

    // 1. Total Patients (All time)
    const { count: totalPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    // 2. Monthly Income
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid')
      .gte('created_at', firstDayOfMonth);

    const monthlyIncome = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // 3. Total Examinations (Monthly)
    const { count: totalExaminations } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('date', firstDayOfMonth);

    // 4. Daily Stats
    const { count: dailyPatients } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('date', todayStr);

    const { data: dailyPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid')
      .gte('created_at', todayStr); // Approximate for today

    const dailyIncome = dailyPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    setStats({
      totalPatients: totalPatients || 0,
      monthlyIncome,
      totalExaminations: totalExaminations || 0,
      dailyPatients: dailyPatients || 0,
      dailyIncome
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout navItems={navItems} title="Dashboard Pemilik" role="Pemilik Klinik">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Pasien"
          value={stats.totalPatients.toString()}
          icon={<Users className="h-6 w-6 text-primary" />}
          description="Total terdaftar"
        />
        <StatCard
          title="Pendapatan Bulan Ini"
          value={formatCurrency(stats.monthlyIncome)}
          icon={<DollarSign className="h-6 w-6 text-success" />}
          description="Total pemasukan"
        />
        <StatCard
          title="Pemeriksaan Bulan Ini"
          value={stats.totalExaminations.toString()}
          icon={<Activity className="h-6 w-6 text-accent" />}
          description="Total layanan medis"
        />
        <StatCard
          title="Pasien Hari Ini"
          value={stats.dailyPatients.toString()}
          icon={<TrendingUp className="h-6 w-6 text-secondary" />}
          description="Antrian hari ini"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatCard
          title="Rata-rata Pasien/Hari"
          value={Math.round(stats.totalExaminations / 30).toString()} // Rough estimate
          icon={<Activity className="h-6 w-6 text-primary" />}
          description="Estimasi bulan ini"
        />
        <StatCard
          title="Pendapatan Hari Ini"
          value={formatCurrency(stats.dailyIncome)}
          icon={<DollarSign className="h-6 w-6 text-success" />}
          description="Pemasukan hari ini"
        />
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
