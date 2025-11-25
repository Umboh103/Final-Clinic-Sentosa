import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Calendar, FileText, Clock, Receipt, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PatientReceipt = () => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { label: "Dashboard", path: "/patient/dashboard", icon: <Calendar className="h-5 w-5" /> },
    { label: "Pendaftaran", path: "/patient/registration", icon: <FileText className="h-5 w-5" /> },
    { label: "Riwayat Pemeriksaan", path: "/patient/history", icon: <Clock className="h-5 w-5" /> },
    { label: "Jadwal", path: "/patient/schedule", icon: <Calendar className="h-5 w-5" /> },
    { label: "Struk Pembayaran", path: "/patient/receipt", icon: <Receipt className="h-5 w-5" /> },
  ];

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if patient exists first
      const { data: patients } = await supabase.from('patients').select('id').eq('id', user.id);

      if (!patients || patients.length === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          status,
          created_at,
          method,
          appointments!inner (
            date,
            profiles:doctor_id (full_name)
          )
        `)
        .eq('appointments.patient_id', user.id) // Filter by patient via appointment
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setReceipts(data);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <CardHeader>
          <CardTitle>Riwayat Pembayaran</CardTitle>
          <CardDescription>Daftar transaksi dan struk pembayaran Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Dokter</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      {new Date(receipt.created_at).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>{receipt.appointments?.profiles?.full_name || 'Dokter Umum'}</TableCell>
                    <TableCell className="capitalize">{receipt.method || '-'}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(receipt.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={receipt.status === 'paid' ? 'default' : 'outline'} className={receipt.status === 'paid' ? 'bg-green-100 text-green-700' : ''}>
                        {receipt.status === 'paid' ? 'Lunas' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => window.print()}>
                        <Download className="h-4 w-4 mr-2" />
                        Cetak
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {receipts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Belum ada riwayat pembayaran
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PatientReceipt;
