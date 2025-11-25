import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Calendar, FileText, Clock, Receipt, Eye } from "lucide-react";
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
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PatientHistory = () => {
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

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

  useEffect(() => {
    fetchMedicalRecords();

    // Realtime subscription
    const channel = supabase
      .channel('medical_records_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_records' }, () => {
        fetchMedicalRecords();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMedicalRecords = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get patient ID first
    const { data: patients } = await supabase
      .from('patients')
      .select('id')
      .eq('id', user.id);

    if (!patients || patients.length === 0) return;
    const patientData = patients[0];

    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        appointments (
          date,
          symptoms
        ),
        profiles:doctor_id (
          full_name
        ),
        prescriptions (
          prescription_items (
            quantity,
            instructions,
            medicines (name)
          )
        )
      `)
      .eq('patient_id', patientData.id)
      .order('created_at', { ascending: false });

    if (data) setMedicalRecords(data);
    if (error) console.error('Error fetching medical records:', error);
  };

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
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Dokter</TableHead>
                  <TableHead>Keluhan</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicalRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{record.profiles?.full_name}</TableCell>
                    <TableCell>{record.appointments?.symptoms || '-'}</TableCell>
                    <TableCell>{record.diagnosis}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedRecord(record)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Detail
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detail Rekam Medis</DialogTitle>
                          </DialogHeader>
                          {selectedRecord && (
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Tanggal Pemeriksaan</p>
                                <p className="font-medium">{new Date(selectedRecord.created_at).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Dokter</p>
                                <p className="font-medium">{selectedRecord.profiles?.full_name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Keluhan</p>
                                <p className="font-medium">{selectedRecord.appointments?.symptoms || '-'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Diagnosis</p>
                                <p className="font-medium">{selectedRecord.diagnosis}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Catatan</p>
                                <p className="font-medium">{selectedRecord.notes || '-'}</p>
                              </div>
                              {selectedRecord.prescriptions?.[0]?.prescription_items && (
                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">Resep Obat</p>
                                  <div className="space-y-2">
                                    {selectedRecord.prescriptions[0].prescription_items.map((item: any, idx: number) => (
                                      <div key={idx} className="bg-muted p-3 rounded">
                                        <p className="font-medium">{item.medicines?.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                          Jumlah: {item.quantity} | {item.instructions}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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
