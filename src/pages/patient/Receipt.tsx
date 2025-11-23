import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Calendar, FileText, Clock, Receipt as ReceiptIcon, Download } from "lucide-react";
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

const PatientReceipt = () => {
  const navItems = [
    { label: "Dashboard", path: "/patient/dashboard", icon: <Calendar className="h-5 w-5" /> },
    {
      label: "Pendaftaran",
      path: "/patient/registration",
      icon: <FileText className="h-5 w-5" />,
    },
    { label: "Riwayat Pemeriksaan", path: "/patient/history", icon: <Clock className="h-5 w-5" /> },
    { label: "Jadwal", path: "/patient/schedule", icon: <Calendar className="h-5 w-5" /> },
    { label: "Struk Pembayaran", path: "/patient/receipt", icon: <ReceiptIcon className="h-5 w-5" /> },
  ];

  const receipts = [
    {
      id: "INV-001",
      tanggal: "20 Nov 2025",
      layanan: "Pemeriksaan Umum",
      dokter: "Dr. Sarah Wijaya",
      biayaPemeriksaan: 150000,
      biayaObat: 75000,
      total: 225000,
      status: "Lunas",
    },
    {
      id: "INV-002",
      tanggal: "15 Nov 2025",
      layanan: "Cek Kesehatan",
      dokter: "Dr. John Doe",
      biayaPemeriksaan: 150000,
      biayaObat: 25000,
      total: 175000,
      status: "Lunas",
    },
    {
      id: "INV-003",
      tanggal: "10 Nov 2025",
      layanan: "Konsultasi",
      dokter: "Dr. Sarah Wijaya",
      biayaPemeriksaan: 100000,
      biayaObat: 50000,
      total: 150000,
      status: "Lunas",
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout navItems={navItems} title="Struk Pembayaran" role="Pasien">
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Riwayat Pembayaran</h2>
              <p className="text-muted-foreground mt-1">
                Daftar struk pembayaran pemeriksaan Anda
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Invoice</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Layanan</TableHead>
                  <TableHead>Dokter</TableHead>
                  <TableHead className="text-right">Pemeriksaan</TableHead>
                  <TableHead className="text-right">Obat</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">{receipt.id}</TableCell>
                    <TableCell>{receipt.tanggal}</TableCell>
                    <TableCell>{receipt.layanan}</TableCell>
                    <TableCell>{receipt.dokter}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(receipt.biayaPemeriksaan)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(receipt.biayaObat)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(receipt.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        {receipt.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Total Pembayaran:</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(receipts.reduce((sum, r) => sum + r.total, 0))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PatientReceipt;
