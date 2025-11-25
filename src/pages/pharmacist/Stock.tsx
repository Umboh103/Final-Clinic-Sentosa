import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Pill, FileText, Package, Search, Plus, Edit, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PharmacistStock = () => {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    stock: 0,
    unit: "",
    price: 0
  });

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
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .order('name');

    if (data) setMedicines(data);
    if (error) console.error('Error fetching medicines:', error);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (currentMedicine) {
        // Update
        const { error } = await supabase
          .from('medicines')
          .update({
            name: formData.name,
            stock: formData.stock,
            unit: formData.unit,
            price: formData.price
          })
          .eq('id', currentMedicine.id);

        if (error) throw error;
        toast.success("Obat berhasil diperbarui");
      } else {
        // Create
        const { error } = await supabase
          .from('medicines')
          .insert({
            name: formData.name,
            stock: formData.stock,
            unit: formData.unit,
            price: formData.price
          });

        if (error) throw error;
        toast.success("Obat berhasil ditambahkan");
      }

      setIsDialogOpen(false);
      fetchMedicines();
      resetForm();
    } catch (error: any) {
      console.error('Error saving medicine:', error);
      toast.error(error.message || "Gagal menyimpan data obat");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus obat ini?")) return;

    try {
      const { error } = await supabase.from('medicines').delete().eq('id', id);
      if (error) throw error;
      toast.success("Obat berhasil dihapus");
      fetchMedicines();
    } catch (error: any) {
      console.error('Error deleting medicine:', error);
      toast.error("Gagal menghapus obat");
    }
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (medicine: any) => {
    setCurrentMedicine(medicine);
    setFormData({
      name: medicine.name,
      stock: medicine.stock,
      unit: medicine.unit,
      price: medicine.price
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setCurrentMedicine(null);
    setFormData({ name: "", stock: 0, unit: "", price: 0 });
  };

  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout navItems={navItems} title="Stok Obat" role="Apoteker">
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari obat..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Obat Baru
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{currentMedicine ? "Edit Obat" : "Tambah Obat Baru"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nama Obat</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Paracetamol 500mg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Stok</Label>
                      <Input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Satuan</Label>
                      <Input
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="Tablet/Botol"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Harga Satuan (Rp)</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    />
                  </div>
                  <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Obat</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell className="font-medium">{medicine.name}</TableCell>
                    <TableCell className="text-right font-semibold">{medicine.stock}</TableCell>
                    <TableCell>{medicine.unit}</TableCell>
                    <TableCell className="text-right">{medicine.price}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          medicine.stock > 50
                            ? "bg-success/10 text-success border-success"
                            : medicine.stock > 10
                              ? "bg-warning/10 text-warning border-warning"
                              : "bg-destructive/10 text-destructive border-destructive"
                        }
                      >
                        {medicine.stock > 50 ? "Aman" : medicine.stock > 10 ? "Menipis" : "Kritis"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(medicine)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(medicine.id)}>
                          <Trash2 className="h-4 w-4" />
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
