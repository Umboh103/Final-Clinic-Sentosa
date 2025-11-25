import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Activity, FileText, CreditCard, Search, Edit, Eye, Plus } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminPatientManagement = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    nik: "",
    full_name: "",
    date_of_birth: "",
    gender: "",
    address: "",
    phone: ""
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
    fetchPatients();

    // Realtime subscription
    const channel = supabase
      .channel('patients_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
        fetchPatients();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        appointments (
          date,
          status
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      const patientsWithLastVisit = data.map(patient => ({
        ...patient,
        lastVisit: patient.appointments?.[0]?.date || null
      }));
      setPatients(patientsWithLastVisit);
    }
    if (error) console.error('Error fetching patients:', error);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (selectedPatient) {
        // Update
        const { error } = await supabase
          .from('patients')
          .update({
            nik: formData.nik,
            full_name: formData.full_name,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            address: formData.address,
            phone: formData.phone
          })
          .eq('id', selectedPatient.id);

        if (error) throw error;
        toast.success("Data pasien berhasil diperbarui");
      } else {
        // Create
        const { error } = await supabase
          .from('patients')
          .insert({
            nik: formData.nik,
            full_name: formData.full_name,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            address: formData.address,
            phone: formData.phone
          });

        if (error) throw error;
        toast.success("Pasien baru berhasil ditambahkan");
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving patient:', error);
      toast.error(error.message || "Gagal menyimpan data pasien");
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (patient: any) => {
    setSelectedPatient(patient);
    setFormData({
      nik: patient.nik,
      full_name: patient.full_name,
      date_of_birth: patient.date_of_birth || "",
      gender: patient.gender || "",
      address: patient.address || "",
      phone: patient.phone || ""
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedPatient(null);
    setFormData({
      nik: "",
      full_name: "",
      date_of_birth: "",
      gender: "",
      address: "",
      phone: ""
    });
  };

  const filteredPatients = patients.filter(p =>
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nik?.includes(searchTerm) ||
    p.phone?.includes(searchTerm)
  );

  return (
    <DashboardLayout navItems={navItems} title="Manajemen Pasien" role="Admin">
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari pasien (nama, NIK, telepon)..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pasien Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{selectedPatient ? "Edit Pasien" : "Tambah Pasien Baru"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>NIK *</Label>
                      <Input
                        value={formData.nik}
                        onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                        placeholder="16 digit NIK"
                        maxLength={16}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nama Lengkap *</Label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tanggal Lahir</Label>
                      <Input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Jenis Kelamin</Label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      >
                        <option value="">Pilih</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Alamat</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telepon</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="08xxxxxxxxxx"
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
                  <TableHead>Nama</TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Kunjungan Terakhir</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.full_name}</TableCell>
                    <TableCell>{patient.nik}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell className="max-w-xs truncate">{patient.address}</TableCell>
                    <TableCell>
                      {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(patient)}>
                          <Edit className="h-4 w-4" />
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
