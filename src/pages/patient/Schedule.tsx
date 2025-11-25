import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Calendar, FileText, Clock, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PatientSchedule = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { label: "Dashboard", path: "/patient/dashboard", icon: <Calendar className="h-5 w-5" /> },
    { label: "Pendaftaran", path: "/patient/registration", icon: <FileText className="h-5 w-5" /> },
    { label: "Riwayat Pemeriksaan", path: "/patient/history", icon: <Clock className="h-5 w-5" /> },
    { label: "Jadwal", path: "/patient/schedule", icon: <Calendar className="h-5 w-5" /> },
    { label: "Struk Pembayaran", path: "/patient/receipt", icon: <Receipt className="h-5 w-5" /> },
  ];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Check if patient exists first
      const { data: patients } = await supabase.from('patients').select('id').eq('id', user.id);

      if (!patients || patients.length === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          queue_number,
          status,
          symptoms,
          profiles:doctor_id (full_name)
        `)
        .eq('patient_id', user.id) // Assuming patient ID = auth ID
        .gte('date', today)
        .neq('status', 'cancelled')
        .order('date', { ascending: true });

      if (error) throw error;
      if (data) setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      'waiting_doctor': { label: 'Menunggu Dokter', class: 'bg-yellow-100 text-yellow-700' },
      'in_examination': { label: 'Sedang Diperiksa', class: 'bg-blue-100 text-blue-700' },
      'waiting_pharmacy': { label: 'Menunggu Obat', class: 'bg-purple-100 text-purple-700' },
      'medicine_ready': { label: 'Obat Siap', class: 'bg-green-100 text-green-700' },
      'completed': { label: 'Selesai', class: 'bg-gray-100 text-gray-700' },
    };
    const badge = badges[status] || { label: status, class: 'bg-gray-100' };
    return <Badge className={badge.class}>{badge.label}</Badge>;
  };

  return (
    <DashboardLayout navItems={navItems} title="Jadwal Pemeriksaan" role="Pasien">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Jadwal Mendatang</CardTitle>
          <CardDescription>Daftar janji temu pemeriksaan Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>No. Antrian</TableHead>
                  <TableHead>Dokter</TableHead>
                  <TableHead>Keluhan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      {new Date(schedule.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="font-bold text-lg">#{schedule.queue_number}</TableCell>
                    <TableCell>{schedule.profiles?.full_name || 'Dokter Umum'}</TableCell>
                    <TableCell>{schedule.symptoms}</TableCell>
                    <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                  </TableRow>
                ))}
                {schedules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Tidak ada jadwal pemeriksaan mendatang
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PatientSchedule;
