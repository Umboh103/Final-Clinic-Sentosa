import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Building2, FileText, Users, Download, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OwnerReports = () => {
  const navItems = [
    { label: "Dashboard", path: "/owner/dashboard", icon: <Building2 className="h-5 w-5" /> },
    { label: "Laporan", path: "/owner/reports", icon: <FileText className="h-5 w-5" /> },
    { label: "Manajemen Akun", path: "/owner/accounts", icon: <Users className="h-5 w-5" /> },
  ];

  const reportTypes = [
    {
      title: "Laporan Harian",
      description: "Ringkasan aktivitas dan keuangan hari ini",
      icon: <Calendar className="h-8 w-8 text-primary" />,
      period: "daily",
    },
    {
      title: "Laporan Mingguan",
      description: "Analisis performa 7 hari terakhir",
      icon: <TrendingUp className="h-8 w-8 text-secondary" />,
      period: "weekly",
    },
    {
      title: "Laporan Bulanan",
      description: "Laporan lengkap bulan berjalan",
      icon: <FileText className="h-8 w-8 text-accent" />,
      period: "monthly",
    },
    {
      title: "Laporan Tahunan",
      description: "Ringkasan performa tahunan klinik",
      icon: <Building2 className="h-8 w-8 text-success" />,
      period: "yearly",
    },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Laporan Keuangan & Operasional" role="Pemilik Klinik">
      <div className="mb-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Filter Laporan</CardTitle>
            <CardDescription>Pilih periode dan jenis laporan yang ingin diunduh</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="jan">Januari 2025</SelectItem>
                  <SelectItem value="feb">Februari 2025</SelectItem>
                  <SelectItem value="mar">Maret 2025</SelectItem>
                  <SelectItem value="nov">November 2025</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
              <Button>Terapkan Filter</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => (
          <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-primary/10 rounded-lg">{report.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">{report.title}</h3>
                  <p className="text-muted-foreground mb-4">{report.description}</p>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Laporan {report.period.charAt(0).toUpperCase() + report.period.slice(1)}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 shadow-soft">
        <CardHeader>
          <CardTitle>Laporan Custom</CardTitle>
          <CardDescription>Buat laporan dengan parameter khusus sesuai kebutuhan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Mulai</label>
              <input type="date" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Akhir</label>
              <input type="date" className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <Button className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Generate Laporan Custom
          </Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default OwnerReports;
