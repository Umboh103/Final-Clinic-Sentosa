import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Users, Activity, DollarSign, Calendar, FileText, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    todayPatients: 0,
    todayExaminations: 0,
    todayRevenue: 0,
    tomorrowAppointments: 0
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);

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

  useEffect(() => {
    fetchStats();
    fetchRecentAppointments();
    fetchPendingPayments();

    // Realtime
    const channel = supabase
      .channel('admin_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchStats();
        fetchRecentAppointments();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        fetchStats();
        fetchPendingPayments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    const today = new Date().toLocaleDateString('en-CA');
    const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-CA');

    // Today's patients (appointments)
    const { count: todayCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('date', today);

    // Today's examinations (completed or in progress)
    const { count: examCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .in('status', ['in_examination', 'completed', 'waiting_pharmacy', 'medicine_ready']);

    // Today's revenue
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .gte('created_at', today) // created_at is timestamp, so gte today string works for "since midnight"
      .eq('status', 'paid');

    const revenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Tomorrow's appointments
    const { count: tomorrowCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('date', tomorrow);

    setStats({
      todayPatients: todayCount || 0,
      todayExaminations: examCount || 0,
      todayRevenue: revenue,
      tomorrowAppointments: tomorrowCount || 0
    });
  };

  const fetchRecentAppointments = async () => {
    const today = new Date().toLocaleDateString('en-CA');
    const { data } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        queue_number,
        status,
        patients (full_name),
        profiles:doctor_id (full_name)
      `)
      .eq('date', today)
      .order('queue_number', { ascending: true });

    if (data) setRecentAppointments(data);
  };

  const fetchPendingPayments = async () => {
    const { data } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        queue_number,
        patients (full_name),
        payments (amount, status)
      `)
      .eq('status', 'completed')
      .is('payments', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setPendingPayments(data);
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      'waiting_doctor': { label: 'Menunggu', class: 'bg-yellow-100 text-yellow-700' },
      'in_examination': { label: 'Diperiksa', class: 'bg-blue-100 text-blue-700' },
      'waiting_pharmacy': { label: 'Ke Apotek', class: 'bg-purple-100 text-purple-700' },
      'medicine_ready': { label: 'Obat Siap', class: 'bg-green-100 text-green-700' },
      'completed': { label: 'Selesai', class: 'bg-gray-100 text-gray-700' },
    };
    const badge = badges[status] || { label: status, class: 'bg-gray-100' };
    return <Badge className={badge.class}>{badge.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout navItems={navItems} title="Dashboard Admin" role="Admin">
      <div className="flex justify-end mb-4">
        <Button onClick={() => { fetchStats(); fetchRecentAppointments(); fetchPendingPayments(); }} variant="outline" size="sm">
          Refresh Data
        </Button>
      </div>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pasien Hari Ini"
            value={stats.todayPatients.toString()}
            icon={<Users className="h-6 w-6 text-primary" />}
            description="Total pendaftaran"
          />
          <StatCard
            title="Pemeriksaan"
            value={stats.todayExaminations.toString()}
            icon={<Activity className="h-6 w-6 text-secondary" />}
            description="Sedang/selesai"
          />
          <StatCard
            title="Pendapatan Hari Ini"
            value={formatCurrency(stats.todayRevenue)}
            icon={<DollarSign className="h-6 w-6 text-success" />}
            description="Total pembayaran"
          />
          <StatCard
            title="Jadwal Besok"
            value={stats.tomorrowAppointments.toString()}
            icon={<Calendar className="h-6 w-6 text-accent" />}
            description="Janji temu terdaftar"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Antrian Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Antrian</TableHead>
                    <TableHead>Pasien</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAppointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">{apt.queue_number}</TableCell>
                      <TableCell>{apt.patients?.full_name}</TableCell>
                      <TableCell>{getStatusBadge(apt.status)}</TableCell>
                    </TableRow>
                  ))}
                  {recentAppointments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Belum ada pendaftaran hari ini
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pending Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Pembayaran Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Antrian</TableHead>
                    <TableHead>Pasien</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">{apt.queue_number}</TableCell>
                      <TableCell>{apt.patients?.full_name}</TableCell>
                      <TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {pendingPayments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Semua pembayaran sudah lunas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
