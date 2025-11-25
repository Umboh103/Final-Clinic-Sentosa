import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Activity, FileText, CreditCard, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

const AdminReports = () => {
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingPayments: 0
  });

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
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          queue_number,
          status,
          created_at,
          patients (full_name, phone),
          profiles:doctor_id (full_name),
          payments (amount, status, method)
        `)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setReportData(data);

        // Calculate stats
        const uniquePatients = new Set(data.map(a => a.patients?.full_name)).size;
        const paidPayments = data.filter(a => a.payments && a.payments.length > 0 && a.payments[0].status === 'paid');
        const totalRevenue = paidPayments.reduce((sum, a) => sum + Number(a.payments[0]?.amount || 0), 0);
        const pendingCount = data.filter(a => a.status === 'completed' && (!a.payments || a.payments.length === 0)).length;

        setStats({
          totalPatients: uniquePatients,
          totalAppointments: data.length,
          totalRevenue: totalRevenue,
          pendingPayments: pendingCount
        });
      }
    } catch (error: any) {
      console.error('Error fetching report:', error);
      toast.error("Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    if (reportData.length === 0) {
      toast.error("Tidak ada data untuk didownload");
      return;
    }

    // Format data untuk Excel
    const excelData = reportData.map((apt, index) => ({
      'No': String(index + 1),
      'Tanggal': new Date(apt.created_at).toLocaleDateString('id-ID'),
      'Waktu': new Date(apt.created_at).toLocaleTimeString('id-ID'),
      'No. Antrian': apt.queue_number || '-',
      'Pasien': apt.patients?.full_name || '-',
      'Telepon': apt.patients?.phone || '-',
      'Dokter': apt.profiles?.full_name || '-',
      'Status': apt.status,
      'Pembayaran': apt.payments && apt.payments.length > 0
        ? `Rp ${Number(apt.payments[0].amount).toLocaleString('id-ID')}`
        : 'Belum dibayar',
      'Status Bayar': apt.payments && apt.payments.length > 0 && apt.payments[0].status === 'paid'
        ? 'Lunas'
        : 'Pending'
    }));

    // Add summary row
    excelData.push({
      'No': '',
      'Tanggal': '',
      'Waktu': '',
      'No. Antrian': '',
      'Pasien': '',
      'Telepon': '',
      'Dokter': 'TOTAL',
      'Status': '',
      'Pembayaran': `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`,
      'Status Bayar': ''
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },  // No
      { wch: 12 }, // Tanggal
      { wch: 10 }, // Waktu
      { wch: 10 }, // No. Antrian
      { wch: 20 }, // Pasien
      { wch: 15 }, // Telepon
      { wch: 20 }, // Dokter
      { wch: 15 }, // Status
      { wch: 15 }, // Pembayaran
      { wch: 12 }  // Status Bayar
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Appointment");

    // Add summary sheet
    const summaryData = [
      { 'Keterangan': 'Total Pasien', 'Nilai': stats.totalPatients },
      { 'Keterangan': 'Total Appointment', 'Nilai': stats.totalAppointments },
      { 'Keterangan': 'Total Pendapatan', 'Nilai': `Rp ${stats.totalRevenue.toLocaleString('id-ID')}` },
      { 'Keterangan': 'Pembayaran Pending', 'Nilai': stats.pendingPayments },
      { 'Keterangan': 'Periode', 'Nilai': `${dateRange.start} s/d ${dateRange.end}` }
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Ringkasan");

    // Download
    const fileName = `Laporan_Admin_${dateRange.start}_${dateRange.end}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success("Laporan berhasil didownload!");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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

  return (
    <DashboardLayout navItems={navItems} title="Laporan Admin" role="Admin">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pasien</p>
                  <p className="text-2xl font-bold">{stats.totalPatients}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Appointment</p>
                  <p className="text-2xl font-bold">{stats.totalAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-success opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <FileText className="h-8 w-8 text-accent opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pembayaran Pending</p>
                  <p className="text-2xl font-bold text-warning">{stats.pendingPayments}</p>
                </div>
                <CreditCard className="h-8 w-8 text-warning opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Laporan Appointment</CardTitle>
                <CardDescription>Riwayat appointment dan pembayaran</CardDescription>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex gap-2 items-center">
                  <Label className="whitespace-nowrap">Dari:</Label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-40"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <Label className="whitespace-nowrap">Sampai:</Label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-40"
                  />
                </div>
                <Button onClick={downloadExcel} disabled={loading || reportData.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Memuat data...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>No. Antrian</TableHead>
                      <TableHead>Pasien</TableHead>
                      <TableHead>Dokter</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Pembayaran</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell>{new Date(apt.created_at).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell className="font-medium">{apt.queue_number}</TableCell>
                        <TableCell>{apt.patients?.full_name || '-'}</TableCell>
                        <TableCell>{apt.profiles?.full_name || '-'}</TableCell>
                        <TableCell>{getStatusBadge(apt.status)}</TableCell>
                        <TableCell className="text-right">
                          {apt.payments && apt.payments.length > 0 && apt.payments[0].status === 'paid' ? (
                            <span className="font-semibold text-success">
                              {formatCurrency(apt.payments[0].amount)}
                            </span>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {reportData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Tidak ada data untuk periode ini
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
