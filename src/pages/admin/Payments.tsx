import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Activity, FileText, CreditCard } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminPayments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'cash'
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
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    // Fetch appointments that are completed (medically)
    // And check if they have payments
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        status,
        patients (full_name),
        payments (id, status, amount, method),
        medical_records (
          prescriptions (
            prescription_items (
              quantity,
              medicines (price)
            )
          )
        )
      `)
      .eq('status', 'completed')
      .order('date', { ascending: false });

    if (data) setAppointments(data);
    if (error) console.error('Error fetching appointments:', error);
  };

  const calculateTotal = (appointment: any) => {
    let total = 50000; // Biaya Konsultasi Dasar

    const prescription = appointment.medical_records?.[0]?.prescriptions?.[0];
    if (prescription?.prescription_items) {
      prescription.prescription_items.forEach((item: any) => {
        if (item.medicines?.price) {
          total += item.quantity * item.medicines.price;
        }
      });
    }
    return total;
  };

  const handleProcessPayment = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          appointment_id: selectedAppointment.id,
          amount: paymentForm.amount,
          method: paymentForm.method as any,
          status: 'paid'
        });

      if (error) throw error;

      toast.success("Pembayaran berhasil diproses");
      fetchAppointments();
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(error.message || "Gagal memproses pembayaran");
    } finally {
      setLoading(false);
    }
  };

  const openPaymentDialog = (appointment: any) => {
    const total = calculateTotal(appointment);
    setSelectedAppointment(appointment);
    setPaymentForm({
      amount: total,
      method: 'cash'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout navItems={navItems} title="Pembayaran" role="Admin">
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pasien</TableHead>
                <TableHead>Status Medis</TableHead>
                <TableHead>Status Pembayaran</TableHead>
                <TableHead className="text-right">Estimasi Total</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((apt) => {
                const payment = apt.payments?.[0];
                const isPaid = payment?.status === 'paid';
                const total = payment ? payment.amount : calculateTotal(apt);

                return (
                  <TableRow key={apt.id}>
                    <TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell>
                    <TableCell>{apt.patients?.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {apt.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          isPaid
                            ? "bg-success/10 text-success border-success"
                            : "bg-warning/10 text-warning border-warning"
                        }
                      >
                        {isPaid ? "Lunas" : "Belum Lunas"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(total)}
                    </TableCell>
                    <TableCell>
                      {!isPaid && (
                        <Dialog open={selectedAppointment?.id === apt.id} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => openPaymentDialog(apt)}>
                              Proses
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Proses Pembayaran</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Total Tagihan</Label>
                                <Input
                                  type="number"
                                  value={paymentForm.amount}
                                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseInt(e.target.value) })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Metode Pembayaran</Label>
                                <Select
                                  value={paymentForm.method}
                                  onValueChange={(val) => setPaymentForm({ ...paymentForm, method: val })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="cash">Tunai</SelectItem>
                                    <SelectItem value="transfer">Transfer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                className="w-full"
                                onClick={handleProcessPayment}
                                disabled={loading}
                              >
                                {loading ? "Memproses..." : "Konfirmasi Pembayaran"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
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

export default AdminPayments;
