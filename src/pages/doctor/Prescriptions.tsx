import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Activity, FileText, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const DoctorPrescriptions = () => {
  const [medications, setMedications] = useState([
    { id: Date.now(), medicineId: "", quantity: 1, instructions: "" },
  ]);
  const [availableMedicines, setAvailableMedicines] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/doctor/dashboard", icon: <Activity className="h-5 w-5" /> },
    {
      label: "Pemeriksaan Pasien",
      path: "/doctor/examinations",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Buat Resep",
      path: "/doctor/prescriptions",
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  useEffect(() => {
    fetchMedicines();
    fetchMedicalRecords();
  }, []);

  const fetchMedicines = async () => {
    const { data, error } = await supabase.from('medicines').select('*').gt('stock', 0);
    if (data) setAvailableMedicines(data);
  };

  const fetchMedicalRecords = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch medical records that need prescriptions (status: waiting_pharmacy)
    const { data: records, error: recordsError } = await supabase
      .from('medical_records')
      .select(`
        id,
        created_at,
        diagnosis,
        patients (full_name),
        appointments!inner (
          id,
          status
        )
      `)
      .eq('doctor_id', user.id)
      .eq('needs_prescription', true)
      .order('created_at', { ascending: false });

    if (recordsError) {
      console.error('Error fetching medical records:', recordsError);
      return;
    }

    // Filter out records that already have prescriptions
    if (records) {
      const recordIds = records.map(r => r.id);

      const { data: existingPrescriptions } = await supabase
        .from('prescriptions')
        .select('medical_record_id')
        .in('medical_record_id', recordIds);

      const prescribedRecordIds = new Set(existingPrescriptions?.map(p => p.medical_record_id) || []);

      const recordsWithoutPrescriptions = records.filter(r => !prescribedRecordIds.has(r.id));

      setMedicalRecords(recordsWithoutPrescriptions);
    }
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { id: Date.now(), medicineId: "", quantity: 1, instructions: "" },
    ]);
  };

  const removeMedication = (id: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((med) => med.id !== id));
    }
  };

  const updateMedication = (id: number, field: string, value: any) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordId) {
      toast.error("Pilih data rekam medis terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // 1. Create Prescription
      const { data: prescription, error: presError } = await supabase
        .from('prescriptions')
        .insert({
          medical_record_id: selectedRecordId,
          doctor_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (presError) throw presError;

      // 2. Create Prescription Items
      const itemsToInsert = medications.map(med => ({
        prescription_id: prescription.id,
        medicine_id: med.medicineId,
        quantity: med.quantity,
        instructions: med.instructions
      }));

      const { error: itemsError } = await supabase
        .from('prescription_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast.success("Resep berhasil dibuat dan dikirim ke apotek!");

      // Reset
      setMedications([{ id: Date.now(), medicineId: "", quantity: 1, instructions: "" }]);
      setSelectedRecordId("");
      fetchMedicalRecords(); // Refresh list

    } catch (error: any) {
      console.error('Error creating prescription:', error);
      toast.error(error.message || "Gagal membuat resep");
    } finally {
      setLoading(false);
    }
  };

  const selectedRecord = medicalRecords.find(r => r.id === selectedRecordId);

  return (
    <DashboardLayout navItems={navItems} title="Buat Resep" role="Dokter">
      <Card className="shadow-soft max-w-4xl">
        <CardHeader>
          <CardTitle>Form Resep Obat</CardTitle>
          <CardDescription>Buat resep obat untuk pasien yang memerlukan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Pilih Pasien yang Memerlukan Resep</Label>
              <Select value={selectedRecordId} onValueChange={setSelectedRecordId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pasien..." />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {medicalRecords.map((record) => (
                    <SelectItem key={record.id} value={record.id}>
                      {new Date(record.created_at).toLocaleDateString()} - {record.patients?.full_name} ({record.diagnosis})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {medicalRecords.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Tidak ada pasien yang menunggu resep. Pastikan Anda sudah mencentang "Pasien memerlukan resep obat" saat pemeriksaan.
                </p>
              )}
            </div>

            {selectedRecord && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Nama Pasien</Label>
                  <p className="font-medium">{selectedRecord.patients?.full_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Diagnosis</Label>
                  <p className="font-medium">{selectedRecord.diagnosis}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Daftar Obat</Label>
                <Button type="button" size="sm" onClick={addMedication} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Obat
                </Button>
              </div>

              {medications.map((med, index) => (
                <Card key={med.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nama Obat *</Label>
                            <Select
                              value={med.medicineId}
                              onValueChange={(val) => updateMedication(med.id, 'medicineId', val)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih obat" />
                              </SelectTrigger>
                              <SelectContent className="bg-popover z-50">
                                {availableMedicines.map(m => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.name} (Stok: {m.stock} {m.unit})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Jumlah *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={med.quantity}
                              onChange={(e) => updateMedication(med.id, 'quantity', parseInt(e.target.value))}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Instruksi / Dosis *</Label>
                          <Input
                            placeholder="Contoh: 3x1 sesudah makan"
                            value={med.instructions}
                            onChange={(e) => updateMedication(med.id, 'instructions', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      {medications.length > 1 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() => removeMedication(med.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" disabled={loading || !selectedRecordId}>
                {loading ? "Mengirim..." : "Kirim Resep ke Apotek"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default DoctorPrescriptions;
