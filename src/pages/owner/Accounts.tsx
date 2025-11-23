import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Building2, FileText, Users, UserPlus } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

const OwnerAccounts = () => {
  const navItems = [
    { label: "Dashboard", path: "/owner/dashboard", icon: <Building2 className="h-5 w-5" /> },
    { label: "Laporan", path: "/owner/reports", icon: <FileText className="h-5 w-5" /> },
    { label: "Manajemen Akun", path: "/owner/accounts", icon: <Users className="h-5 w-5" /> },
  ];

  const accounts = [
    {
      id: "USR-001",
      nama: "Dr. Sarah Wijaya",
      email: "sarah@kliniksentosa.com",
      role: "Dokter",
      status: "Aktif",
      lastLogin: "23 Nov 2025, 08:00",
    },
    {
      id: "USR-002",
      nama: "Dr. John Doe",
      email: "john@kliniksentosa.com",
      role: "Dokter",
      status: "Aktif",
      lastLogin: "23 Nov 2025, 07:30",
    },
    {
      id: "USR-003",
      nama: "Maria Admin",
      email: "maria@kliniksentosa.com",
      role: "Admin",
      status: "Aktif",
      lastLogin: "23 Nov 2025, 06:45",
    },
    {
      id: "USR-004",
      nama: "Lisa Pharmacist",
      email: "lisa@kliniksentosa.com",
      role: "Apoteker",
      status: "Aktif",
      lastLogin: "23 Nov 2025, 08:15",
    },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Manajemen Akun" role="Pemilik Klinik">
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Daftar Akun Pengguna</h2>
              <p className="text-muted-foreground mt-1">Kelola akses dan hak pengguna sistem</p>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Pengguna
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Login Terakhir</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.id}</TableCell>
                    <TableCell>{account.nama}</TableCell>
                    <TableCell>{account.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                        {account.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{account.lastLogin}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        {account.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          Detail
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

export default OwnerAccounts;
