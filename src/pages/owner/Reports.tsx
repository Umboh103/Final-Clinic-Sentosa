import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Building2, FileText, Users, Download, Calendar } from "lucide-react";
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

const OwnerReports = () => {
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
    end: new Date().toISOString().split('T')[0] // Today
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPatients: 0,
    totalAppointments: 0
  });

  const navItems = [
    { label: "Dashboard", path: "/owner/dashboard", icon: <Building2 className="h-5 w-5" /> },
    { label: "Laporan", path: "/owner/reports", icon: <FileText className="h-5 w-5" /> },
    { label: "Manajemen Akun", path: "/owner/accounts", icon: <Users className="h-5 w-5" /> },
  ];

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          created_at,
          amount,
          method,
          status,
          appointments (
            date,
            queue_number,
            patients (full_name, phone),
            profiles:doctor_id (full_name)
          )
        `)
        .eq('status', 'paid')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setReportData(data);

        // Calculate stats
        const totalRevenue = data.reduce((sum, p) => sum + Number(p.amount), 0);
        const uniquePatients = new Set(data.map(p => p.appointments?.patients?.full_name)).size;

        setStats({
          totalRevenue,
          totalPatients: uniquePatients,
          totalAppointments: data.length
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
    const excelData = reportData.map((payment, index) => ({
      'No': String(index + 1),
      'Tanggal': new Date(payment.created_at).toLocaleDateString('id-ID'),
      'Waktu': new Date(payment.created_at).toLocaleTimeString('id-ID'),
      'No. Antrian': payment.appointments?.queue_number || '-',
      'Pasien': payment.appointments?.patients?.full_name || '-',
      'Telepon': payment.appointments?.patients?.phone || '-',
      'Dokter': payment.appointments?.profiles?.full_name || '-',
      'Metode Pembayaran': payment.method === 'cash' ? 'Tunai' : 'Transfer',
      'Total (Rp)': Number(payment.amount)
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
      'Metode Pembayaran': '',
      'Total (Rp)': stats.totalRevenue
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
      { wch: 18 }, // Metode
      { wch: 15 }  // Total
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Pembayaran");

    // Add summary sheet
    const summaryData = [
      { 'Keterangan': 'Total Pendapatan', 'Nilai': `Rp ${stats.totalRevenue.toLocaleString('id-ID')}` },
      { 'Keterangan': 'Total Pasien', 'Nilai': stats.totalPatients },
      { 'Keterangan': 'Total Transaksi', 'Nilai': stats.totalAppointments },
      { 'Keterangan': 'Periode', 'Nilai': `${dateRange.start} s/d ${dateRange.end}` }
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Ringkasan");

    // Download
    const fileName = `Laporan_Klinik_${dateRange.start}_${dateRange.end}.xlsx`;
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

  return (
    <DashboardLayout navItems={navItems} title="Laporan Keuangan" role="Pemilik Klinik">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <FileText className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pasien</p>
                  <p className="text-2xl font-bold">{stats.totalPatients}</p>
                </div>
                <Users className="h-8 w-8 text-success opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transaksi</p>
                  <p className="text-2xl font-bold">{stats.totalAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-accent opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Laporan Pembayaran</CardTitle>
                <CardDescription>Riwayat transaksi pembayaran klinik</CardDescription>
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
                      <TableHead>Pasien</TableHead>
                      <TableHead>Dokter</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.created_at).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>{payment.appointments?.patients?.full_name || '-'}</TableCell>
                        <TableCell>{payment.appointments?.profiles?.full_name || '-'}</TableCell>
                        <TableCell className="capitalize">{payment.method === 'cash' ? 'Tunai' : 'Transfer'}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-success/10 text-success border-success">
                            Lunas
                          </Badge>
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

export default OwnerReports;
