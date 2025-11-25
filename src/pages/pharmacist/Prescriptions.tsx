import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Pill, FileText, Package, Eye, CheckCircle, PackageCheck } from "lucide-react";
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

const PharmacistPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

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
    fetchPrescriptions();

    const channel = supabase
      .channel('pharmacist_prescriptions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions' }, () => {
        fetchPrescriptions();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchPrescriptions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPrescriptions = async () => {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        id,
        status,
        created_at,
        profiles:doctor_id (full_name),
        medical_records (
          patients (full_name),
          appointments!inner (
            id,
            status
          )
        ),
        prescription_items (
          id,
          quantity,
          instructions,
          medicines (id, name, stock, unit, price)
        )
      `)
      .in('medical_records.appointments.status', ['waiting_pharmacy', 'medicine_ready'])
      .neq('status', 'completed')
      .order('created_at', { ascending: false });

    if (data) setPrescriptions(data);
    if (error) console.error('Error fetching prescriptions:', error);
  };

  const handlePrepareMedicine = async (prescription: any) => {
    setLoading(true);
    try {
      for (const item of prescription.prescription_items) {
        if (item.medicines.stock < item.quantity) {
          throw new Error(`Stok ${item.medicines.name} tidak cukup! Tersedia: ${item.medicines.stock}, Dibutuhkan: ${item.quantity}`);
        }
      }

      for (const item of prescription.prescription_items) {
        const newStock = item.medicines.stock - item.quantity;

        const { error: stockError } = await supabase
          .from('medicines')
          .update({ stock: newStock })
          .eq('id', item.medicines.id);

        if (stockError) throw stockError;
      }

      const appointmentId = prescription.medical_records.appointments.id;

      const { error: statusError } = await supabase
        .from('appointments')
        .update({ status: 'medicine_ready' })
        .eq('id', appointmentId);

      if (statusError) throw statusError;

      toast.success("Obat berhasil disiapkan. Siap untuk diserahkan ke pasien.");
      fetchPrescriptions();
      setSelectedPrescription(null);

    } catch (error: any) {
      console.error('Error preparing medicine:', error);
      toast.error(error.message || "Gagal menyiapkan obat");
    } finally {
      setLoading(false);
    }
  };

  const handleHandOver = async (prescription: any) => {
    setLoading(true);
    try {
      const appointmentId = prescription.medical_records.appointments.id;

      // 1. Calculate total payment
      const consultationFee = 50000;
      let medicineTotal = 0;

      for (const item of prescription.prescription_items) {
        medicineTotal += item.quantity * (item.medicines.price || 0);
      }

      const totalAmount = consultationFee + medicineTotal;

      // 2. Create Payment Record (AUTO PAYMENT)
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          appointment_id: appointmentId,
          amount: totalAmount,
          method: 'cash',
          status: 'paid'
        });

      if (paymentError) throw paymentError;

      // 3. Update Appointment Status
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId);

      if (error) throw error;

      // 4. Update Prescription Status
      const { error: presError } = await supabase
        .from('prescriptions')
        .update({ status: 'completed' })
        .eq('id', prescription.id);

      if (presError) throw presError;

      toast.success(`Obat diserahkan & pembayaran dikonfirmasi. Total: Rp ${totalAmount.toLocaleString()}`);
      fetchPrescriptions();
      setSelectedPrescription(null);

    } catch (error: any) {
      console.error('Error handing over medicine:', error);
      toast.error("Gagal menyerahkan obat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Resep Masuk" role="Apoteker">
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pasien</TableHead>
                <TableHead>Dokter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((rx) => {
                const appointmentStatus = rx.medical_records?.appointments?.status;

                return (
                  <TableRow key={rx.id}>
                    <TableCell>{new Date(rx.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{rx.medical_records?.patients?.full_name}</TableCell>
                    <TableCell>{rx.profiles?.full_name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          appointmentStatus === "medicine_ready"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : appointmentStatus === "waiting_pharmacy"
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        {appointmentStatus === 'waiting_pharmacy' ? 'Menunggu Obat' :
                          appointmentStatus === 'medicine_ready' ? 'Obat Siap' :
                            appointmentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedPrescription(rx)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Detail
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detail Resep</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Pasien</p>
                                <p className="font-medium">{rx.medical_records?.patients?.full_name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Dokter</p>
                                <p className="font-medium">{rx.profiles?.full_name}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Daftar Obat</p>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Nama Obat</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead>Harga</TableHead>
                                    <TableHead>Stok</TableHead>
                                    <TableHead>Instruksi</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {rx.prescription_items?.map((item: any) => (
                                    <TableRow key={item.id}>
                                      <TableCell>{item.medicines?.name}</TableCell>
                                      <TableCell>{item.quantity} {item.medicines?.unit}</TableCell>
                                      <TableCell>Rp {(item.medicines?.price || 0).toLocaleString()}</TableCell>
                                      <TableCell>
                                        <Badge variant={item.medicines?.stock >= item.quantity ? "outline" : "destructive"}>
                                          {item.medicines?.stock}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>{item.instructions}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                            <div className="bg-muted p-3 rounded-lg">
                              <p className="text-sm font-semibold">Total Tagihan:</p>
                              <p className="text-lg font-bold text-primary">
                                Rp {(50000 + rx.prescription_items?.reduce((sum: number, item: any) =>
                                  sum + (item.quantity * (item.medicines?.price || 0)), 0)).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                (Konsultasi: Rp 50,000 + Obat: Rp {rx.prescription_items?.reduce((sum: number, item: any) =>
                                  sum + (item.quantity * (item.medicines?.price || 0)), 0).toLocaleString()})
                              </p>
                            </div>

                            <div className="flex gap-2">
                              {appointmentStatus === 'waiting_pharmacy' && (
                                <Button
                                  className="flex-1"
                                  onClick={() => handlePrepareMedicine(rx)}
                                  disabled={loading}
                                >
                                  <PackageCheck className="h-4 w-4 mr-2" />
                                  {loading ? "Memproses..." : "Siapkan Obat"}
                                </Button>
                              )}
                              {appointmentStatus === 'medicine_ready' && (
                                <Button
                                  className="flex-1"
                                  onClick={() => handleHandOver(rx)}
                                  disabled={loading}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {loading ? "Memproses..." : "Serahkan & Konfirmasi Pembayaran"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PharmacistPrescriptions;
