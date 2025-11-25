import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Users, Activity, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    todayQueue: 0,
    inExamination: 0,
    completed: 0,
    needPrescription: 0
  });
  const [waitingPatients, setWaitingPatients] = useState<any[]>([]);
  const [recentExaminations, setRecentExaminations] = useState<any[]>([]);

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

  useEffect(() => {
    fetchStats();
    fetchWaitingPatients();
    fetchRecentExaminations();

    // Realtime
    const channel = supabase
      .channel('doctor_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchStats();
        fetchWaitingPatients();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_records' }, () => {
        fetchStats();
        fetchRecentExaminations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    // Today's queue (waiting_doctor)
    const { count: queueCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', user.id)
      .eq('status', 'waiting_doctor')
      .gte('created_at', today);

    // In examination
    const { count: examCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', user.id)
      .eq('status', 'in_examination');

    // Completed today
    const { count: completedCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', user.id)
      .in('status', ['completed', 'waiting_pharmacy', 'medicine_ready'])
      .gte('created_at', today);

    // Need prescription (waiting_pharmacy without prescription)
    const { data: waitingPharmacy } = await supabase
      .from('medical_records')
      .select(`
        id,
        appointments!inner (
          id,
          status,
          doctor_id
        )
      `)
      .eq('doctor_id', user.id)
      .eq('appointments.status', 'waiting_pharmacy');

    // Filter out those that already have prescriptions
    let needPrescriptionCount = 0;
    if (waitingPharmacy) {
      const recordIds = waitingPharmacy.map(r => r.id);
      const { data: prescriptions } = await supabase
        .from('prescriptions')
        .select('medical_record_id')
        .in('medical_record_id', recordIds);

      const prescribedIds = new Set(prescriptions?.map(p => p.medical_record_id) || []);
      needPrescriptionCount = waitingPharmacy.filter(r => !prescribedIds.has(r.id)).length;
    }

    setStats({
      todayQueue: queueCount || 0,
      inExamination: examCount || 0,
      completed: completedCount || 0,
      needPrescription: needPrescriptionCount
    });
  };

  const fetchWaitingPatients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('appointments')
      .select(`
        id,
        queue_number,
        created_at,
        patients (full_name, phone)
      `)
      .eq('doctor_id', user.id)
      .eq('status', 'waiting_doctor')
      .eq('date', today) // Filter by today's date
      .order('queue_number', { ascending: true })
      .limit(5);

    if (data) setWaitingPatients(data);
  };

  const fetchRecentExaminations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('medical_records')
      .select(`
        id,
        diagnosis,
        created_at,
        patients (full_name)
      `)
      .eq('doctor_id', user.id)
      .gte('created_at', today)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setRecentExaminations(data);
  };

  return (
    <DashboardLayout navItems={navItems} title="Dashboard Dokter" role="Dokter">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Antrian Hari Ini"
            value={stats.todayQueue.toString()}
            icon={<Clock className="h-6 w-6 text-yellow-600" />}
            description="Menunggu dipanggil"
          />
          <StatCard
            title="Sedang Diperiksa"
            value={stats.inExamination.toString()}
            icon={<Activity className="h-6 w-6 text-blue-600" />}
            description="Dalam pemeriksaan"
          />
          <StatCard
            title="Selesai Hari Ini"
            value={stats.completed.toString()}
            icon={<Users className="h-6 w-6 text-green-600" />}
            description="Pasien ditangani"
          />
          <StatCard
            title="Perlu Resep"
            value={stats.needPrescription.toString()}
            icon={<FileText className="h-6 w-6 text-purple-600" />}
            description="Belum dibuat resep"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Waiting Patients */}
          <Card>
            <CardHeader>
              <CardTitle>Pasien Menunggu</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Antrian</TableHead>
                    <TableHead>Nama Pasien</TableHead>
                    <TableHead>Waktu Daftar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitingPatients.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-bold text-lg">{apt.queue_number}</TableCell>
                      <TableCell>{apt.patients?.full_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(apt.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {waitingPatients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Tidak ada pasien menunggu
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Examinations */}
          <Card>
            <CardHeader>
              <CardTitle>Pemeriksaan Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Pasien</TableHead>
                    <TableHead>Diagnosis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentExaminations.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-sm">
                        {new Date(record.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>{record.patients?.full_name}</TableCell>
                      <TableCell className="text-sm">{record.diagnosis}</TableCell>
                    </TableRow>
                  ))}
                  {recentExaminations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Belum ada pemeriksaan hari ini
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

export default DoctorDashboard;
