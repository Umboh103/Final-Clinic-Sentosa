import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Activity, FileText, CreditCard, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const AdminPatientManagement = () => {
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

  const patients = [
    {
      id: "P-001",
      nama: "John Doe",
      nik: "1234567890123456",
      telepon: "081234567890",
      alamat: "Jl. Merdeka No. 10",
      kunjunganTerakhir: "23 Nov 2025",
      status: "Aktif",
    },
    {
      id: "P-002",
      nama: "Jane Smith",
      nik: "1234567890123457",
      telepon: "081234567891",
      alamat: "Jl. Sudirman No. 20",
      kunjunganTerakhir: "22 Nov 2025",
      status: "Aktif",
    },
    {
      id: "P-003",
      nama: "Michael Johnson",
      nik: "1234567890123458",
      telepon: "081234567892",
      alamat: "Jl. Gatot Subroto No. 30",
      kunjunganTerakhir: "20 Nov 2025",
      status: "Aktif",
    },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Manajemen Pasien" role="Admin">
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari pasien (nama, NIK, telepon)..." className="pl-10" />
            </div>
            <Button>Tambah Pasien Baru</Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pasien</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Kunjungan Terakhir</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.id}</TableCell>
                    <TableCell>{patient.nama}</TableCell>
                    <TableCell>{patient.nik}</TableCell>
                    <TableCell>{patient.telepon}</TableCell>
                    <TableCell className="max-w-xs truncate">{patient.alamat}</TableCell>
                    <TableCell>{patient.kunjunganTerakhir}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Detail
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminPatientManagement;
