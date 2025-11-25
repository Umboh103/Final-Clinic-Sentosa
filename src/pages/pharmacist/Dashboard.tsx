import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Pill, FileText, Package, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PharmacistDashboard = () => {
  const [stats, setStats] = useState({
    todayPrescriptions: 0,
    waitingPharmacy: 0,
    medicineReady: 0,
    lowStock: 0
  });
  const [completedToday, setCompletedToday] = useState<any[]>([]);
  const [lowStockMedicines, setLowStockMedicines] = useState<any[]>([]);

  const navItems = [
    { label: "Dashboard", path: "/pharmacist/dashboard", icon: <Pill className="h-5 w-5" /> },
    {
      label: "Resep Masuk",
      path: "/pharmacist/prescriptions",
      icon: <FileText className="h-5 w-5" />,
    },
    { label: "Stok Obat", path: "/pharmacist/stock", icon: <Package className="h-5 w-5" /> },
  ];

  useEffect(() => {
    fetchStats();
    fetchCompletedToday();
    fetchLowStock();

    // Realtime
    const channel = supabase
      .channel('pharmacist_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions' }, () => {
        fetchStats();
        fetchCompletedToday();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medicines' }, () => {
        fetchLowStock();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];

    // Today's prescriptions
    const { count: todayCount } = await supabase
      .from('prescriptions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    // Waiting pharmacy
    const { data: waitingData } = await supabase
      .from('prescriptions')
      .select('medical_records!inner(appointments!inner(status))')
      .eq('medical_records.appointments.status', 'waiting_pharmacy');

    // Medicine ready
    const { data: readyData } = await supabase
      .from('prescriptions')
      .select('medical_records!inner(appointments!inner(status))')
      .eq('medical_records.appointments.status', 'medicine_ready');

    // Low stock count
    const { count: lowStockCount } = await supabase
      .from('medicines')
      .select('*', { count: 'exact', head: true })
      .lt('stock', 50);

    setStats({
      todayPrescriptions: todayCount || 0,
      waitingPharmacy: waitingData?.length || 0,
      medicineReady: readyData?.length || 0,
      lowStock: lowStockCount || 0
    });
  };

  const fetchCompletedToday = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('prescriptions')
      .select(`
        id,
        created_at,
        medical_records (
          patients (full_name)
        )
      `)
      .eq('status', 'completed')
      .gte('created_at', today)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setCompletedToday(data);
  };

  const fetchLowStock = async () => {
    const { data } = await supabase
      .from('medicines')
      .select('*')
      .lt('stock', 50)
      .order('stock', { ascending: true })
      .limit(5);

    if (data) setLowStockMedicines(data);
  };

  return (
    <DashboardLayout navItems={navItems} title="Dashboard Apoteker" role="Apoteker">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Resep Hari Ini"
            value={stats.todayPrescriptions.toString()}
            icon={<FileText className="h-6 w-6 text-primary" />}
            description="Total resep masuk"
          />
          <StatCard
            title="Menunggu"
            value={stats.waitingPharmacy.toString()}
            icon={<Pill className="h-6 w-6 text-warning" />}
            description="Perlu disiapkan"
          />
          <StatCard
            title="Siap Diambil"
            value={stats.medicineReady.toString()}
            icon={<Package className="h-6 w-6 text-success" />}
            description="Obat sudah siap"
          />
          <StatCard
            title="Stok Rendah"
            value={stats.lowStock.toString()}
            icon={<AlertTriangle className="h-6 w-6 text-destructive" />}
            description="Perlu restock"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Completed Today */}
          <Card>
            <CardHeader>
              <CardTitle>Resep Selesai Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Pasien</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedToday.map((rx) => (
                    <TableRow key={rx.id}>
                      <TableCell>{new Date(rx.created_at).toLocaleTimeString()}</TableCell>
                      <TableCell>{rx.medical_records?.patients?.full_name}</TableCell>
                    </TableRow>
                  ))}
                  {completedToday.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Belum ada resep selesai hari ini
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle>Obat Stok Rendah</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Obat</TableHead>
                    <TableHead>Stok</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockMedicines.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell>{med.name}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          {med.stock} {med.unit}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {lowStockMedicines.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Semua stok aman
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

export default PharmacistDashboard;
