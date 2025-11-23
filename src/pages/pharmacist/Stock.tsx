import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Pill, FileText, Package, Search } from "lucide-react";
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

const PharmacistStock = () => {
  const navItems = [
    { label: "Dashboard", path: "/pharmacist/dashboard", icon: <Pill className="h-5 w-5" /> },
    {
      label: "Resep Masuk",
      path: "/pharmacist/prescriptions",
      icon: <FileText className="h-5 w-5" />,
    },
    { label: "Stok Obat", path: "/pharmacist/stock", icon: <Package className="h-5 w-5" /> },
  ];

  const medicines = [
    { id: "MED-001", nama: "Paracetamol 500mg", kategori: "Analgesik", stok: 250, minimal: 100, status: "Aman" },
    { id: "MED-002", nama: "Amoxicillin 500mg", kategori: "Antibiotik", stok: 45, minimal: 50, status: "Rendah" },
    { id: "MED-003", nama: "Omeprazole 20mg", kategori: "Antasida", stok: 180, minimal: 100, status: "Aman" },
    { id: "MED-004", nama: "Vitamin C 500mg", kategori: "Suplemen", stok: 300, minimal: 150, status: "Aman" },
    { id: "MED-005", nama: "Ibuprofen 400mg", kategori: "Analgesik", stok: 25, minimal: 50, status: "Kritis" },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Stok Obat" role="Apoteker">
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari obat..." className="pl-10" />
            </div>
            <Button>Tambah Obat Baru</Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Obat</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="text-right">Minimal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell className="font-medium">{medicine.id}</TableCell>
                    <TableCell>{medicine.nama}</TableCell>
                    <TableCell>{medicine.kategori}</TableCell>
                    <TableCell className="text-right font-semibold">{medicine.stok}</TableCell>
                    <TableCell className="text-right">{medicine.minimal}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          medicine.status === "Aman"
                            ? "bg-success/10 text-success border-success"
                            : medicine.status === "Rendah"
                            ? "bg-warning/10 text-warning border-warning"
                            : "bg-destructive/10 text-destructive border-destructive"
                        }
                      >
                        {medicine.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          Restock
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

export default PharmacistStock;
