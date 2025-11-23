import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Pill, FileText, Package } from "lucide-react";
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

const PharmacistPrescriptions = () => {
  const navItems = [
    { label: "Dashboard", path: "/pharmacist/dashboard", icon: <Pill className="h-5 w-5" /> },
    {
      label: "Resep Masuk",
      path: "/pharmacist/prescriptions",
      icon: <FileText className="h-5 w-5" />,
    },
    { label: "Stok Obat", path: "/pharmacist/stock", icon: <Package className="h-5 w-5" /> },
  ];

  const prescriptions = [
    {
      id: "RX-001",
      pasien: "John Doe",
      dokter: "Dr. Sarah Wijaya",
      obat: "Paracetamol, Amoxicillin",
      tanggal: "23 Nov 2025",
      status: "Baru",
    },
    {
      id: "RX-002",
      pasien: "Jane Smith",
      dokter: "Dr. John Doe",
      obat: "Vitamin C, Antasida",
      tanggal: "23 Nov 2025",
      status: "Diproses",
    },
    {
      id: "RX-003",
      pasien: "Michael Johnson",
      dokter: "Dr. Maria Tanaka",
      obat: "Omeprazole",
      tanggal: "23 Nov 2025",
      status: "Selesai",
    },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Resep Masuk" role="Apoteker">
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Resep</TableHead>
                <TableHead>Pasien</TableHead>
                <TableHead>Dokter</TableHead>
                <TableHead>Obat</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((rx) => (
                <TableRow key={rx.id}>
                  <TableCell className="font-medium">{rx.id}</TableCell>
                  <TableCell>{rx.pasien}</TableCell>
                  <TableCell>{rx.dokter}</TableCell>
                  <TableCell className="max-w-xs truncate">{rx.obat}</TableCell>
                  <TableCell>{rx.tanggal}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        rx.status === "Selesai"
                          ? "bg-success/10 text-success border-success"
                          : rx.status === "Diproses"
                          ? "bg-warning/10 text-warning border-warning"
                          : "bg-primary/10 text-primary border-primary"
                      }
                    >
                      {rx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      {rx.status === "Baru" ? "Proses" : "Detail"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PharmacistPrescriptions;
