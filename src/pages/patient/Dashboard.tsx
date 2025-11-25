import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Calendar, FileText, Clock, Receipt } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVisits: 0,
    upcomingAppointments: 0,
    activePrescriptions: 0,
    unpaidBills: 0
  });
  const [upcomingList, setUpcomingList] = useState<any[]>([]);
  const [recentVisits, setRecentVisits] = useState<any[]>([]);

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Get patient ID
    const { data: patients, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', user.id);

    if (patientError || !patients || patients.length === 0) {
      // Patient not found - show empty state or redirect
      setStats({
        totalVisits: 0,
        upcomingAppointments: 0,
        activePrescriptions: 0,
        unpaidBills: 0
      });
      return;
    }

    const patient = patients[0];
    const today = new Date().toISOString().split('T')[0];

    // 1. Stats
    const { count: totalVisits } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', patient.id)
      .eq('status', 'completed');

    const { count: upcomingCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', patient.id)
      .gte('date', today)
      .neq('status', 'completed')
      .neq('status', 'cancelled');

    // Active prescriptions (appointments in pharmacy stage)
    const { count: activePrescriptions } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', patient.id)
      .in('status', ['waiting_pharmacy', 'medicine_ready']);

    // Unpaid bills
    const { data: unpaidAppts } = await supabase
      .from('appointments')
      .select('id, payments(status)')
      .eq('patient_id', patient.id)
      .eq('status', 'completed');

    const unpaidCount = unpaidAppts?.filter(a => !a.payments || a.payments.length === 0 || a.payments[0].status === 'pending').length || 0;

    setStats({
      totalVisits: totalVisits || 0,
      upcomingAppointments: upcomingCount || 0,
      activePrescriptions: activePrescriptions || 0,
      unpaidBills: unpaidCount
    });

    // 2. Upcoming List
    const { data: upcoming } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        status,
        profiles:doctor_id (full_name)
      `)
      .eq('patient_id', patient.id)
      .gte('date', today)
      .neq('status', 'completed')
      .neq('status', 'cancelled')
      .order('date', { ascending: true })
      .limit(3);

    if (upcoming) setUpcomingList(upcoming);

    // 3. Recent Visits
    const { data: recent } = await supabase
      .from('medical_records')
      .select(`
        id,
        created_at,
        diagnosis,
        doctor:doctor_id (full_name)
      `)
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (recent) setRecentVisits(recent);
  };

  return (
    <DashboardLayout navItems={navItems} title="Dashboard Pasien" role="Pasien">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Kunjungan"
          value={stats.totalVisits.toString()}
          icon={<FileText className="h-6 w-6 text-primary" />}
          description="Pemeriksaan selesai"
        />
        <StatCard
          title="Jadwal Mendatang"
          value={stats.upcomingAppointments.toString()}
          icon={<Calendar className="h-6 w-6 text-secondary" />}
          description="Janji temu aktif"
        />
        <StatCard
          title="Resep Diproses"
          value={stats.activePrescriptions.toString()}
          icon={<FileText className="h-6 w-6 text-accent" />}
          description="Di apotek"
        />
        <StatCard
          title="Tagihan Belum Lunas"
          value={stats.unpaidBills.toString()}
          icon={<Receipt className="h-6 w-6 text-warning" />}
          description="Perlu pembayaran"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Welcome / Registration Prompt for New Users */}
        {stats.totalVisits === 0 && stats.upcomingAppointments === 0 && (
          <Card className="col-span-1 lg:col-span-2 bg-primary/5 border-primary/20 shadow-soft">
            <CardHeader>
              <CardTitle className="text-primary">Selamat Datang di Klinik Sentosa!</CardTitle>
              <CardDescription>
                Sepertinya Anda belum memiliki riwayat pemeriksaan. Silakan lakukan pendaftaran untuk pemeriksaan pertama Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/patient/registration")} className="w-full sm:w-auto">
                <FileText className="mr-2 h-4 w-4" />
                Daftar Pemeriksaan Sekarang
              </Button>
            </CardContent>
          </Card>
        )}

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
            {upcomingList.map((apt) => (
              <div
                key={apt.id}
                className="flex items-start justify-between p-4 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{apt.profiles?.full_name || 'Dokter Umum'}</p>
                  <p className="text-sm text-muted-foreground mt-1">Status: {apt.status}</p>
                  <p className="text-sm text-primary font-medium mt-2">
                    {new Date(apt.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
            {upcomingList.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Tidak ada jadwal mendatang</p>
            )}
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
            {recentVisits.map((visit) => (
              <div
                key={visit.id}
                className="flex items-start justify-between p-4 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{visit.doctor?.full_name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{visit.diagnosis}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-sm text-muted-foreground">
                      {new Date(visit.created_at).toLocaleDateString('id-ID')}
                    </p>
                    <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full font-medium">
                      Selesai
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {recentVisits.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Belum ada riwayat kunjungan</p>
            )}
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
