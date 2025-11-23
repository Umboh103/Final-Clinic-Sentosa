import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Calendar, FileText, Clock, Receipt } from "lucide-react";
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

const PatientHistory = () => {
  const navItems = [
    { label: "Dashboard", path: "/patient/dashboard", icon: <Calendar className="h-5 w-5" /> },
    {
      label: "Pendaftaran",
      path: "/patient/registration",
      icon: <FileText className="h-5 w-5" />,
    },
    { label: "Riwayat Pemeriksaan", path: "/patient/history", icon: <Clock className="h-5 w-5" /> },
    { label: "Jadwal", path: "/patient/schedule", icon: <Calendar className="h-5 w-5" /> },
    { label: "Struk Pembayaran", path: "/patient/receipt", icon: <Receipt className="h-5 w-5" /> },
  ];

  const medicalHistory = [
    {
      id: "MR-001",
      tanggal: "20 Nov 2025",
      dokter: "Dr. Sarah Wijaya",
      keluhan: "Demam dan batuk",
      diagnosis: "Flu ringan",
      obat: "Paracetamol, Amoxicillin",
      status: "Selesai",
    },
    {
      id: "MR-002",
      tanggal: "15 Nov 2025",
      dokter: "Dr. John Doe",
      keluhan: "Cek kesehatan rutin",
      diagnosis: "Sehat",
      obat: "Vitamin C",
      status: "Selesai",
    },
    {
      id: "MR-003",
      tanggal: "10 Nov 2025",
      dokter: "Dr. Sarah Wijaya",
      keluhan: "Sakit kepala",
      diagnosis: "Migrain",
      obat: "Ibuprofen",
      status: "Selesai",
    },
    {
      id: "MR-004",
      tanggal: "05 Nov 2025",
      dokter: "Dr. Maria Tanaka",
      keluhan: "Sakit perut",
      diagnosis: "Gastritis",
      obat: "Omeprazole, Antasida",
      status: "Selesai",
    },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Riwayat Pemeriksaan" role="Pasien">
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Rekam Medis</h2>
              <p className="text-muted-foreground mt-1">
                Riwayat lengkap pemeriksaan kesehatan Anda
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. RM</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Dokter</TableHead>
                  <TableHead>Keluhan</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Obat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicalHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.id}</TableCell>
                    <TableCell>{record.tanggal}</TableCell>
                    <TableCell>{record.dokter}</TableCell>
                    <TableCell>{record.keluhan}</TableCell>
                    <TableCell>{record.diagnosis}</TableCell>
                    <TableCell className="max-w-xs truncate">{record.obat}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Detail
                      </Button>
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

export default PatientHistory;
