import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Activity, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const DoctorExaminations = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    blood_pressure: "",
    temperature: "",
    weight: "",
    diagnosis: "",
    notes: "",
    needsMedicine: false
  });

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
    fetchQueue();

    // Realtime subscription
    const channel = supabase
      .channel('doctor_queue_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `status=in.waiting_doctor,in_examination`
      }, () => {
        fetchQueue();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQueue = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients (full_name, date_of_birth, phone)
      `)
      .eq('doctor_id', user.id)
      .eq('date', today)
      .in('status', ['waiting_doctor', 'in_examination'])
      .order('queue_number', { ascending: true });

    if (data) setQueue(data);
    if (error) console.error('Error fetching queue:', error);
  };

  const handleCallPatient = async (appointment: any) => {
    setLoading(true);
    try {
      // Update status to "in_examination"
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'in_examination' })
        .eq('id', appointment.id);

      if (error) throw error;

      setSelectedPatient(appointment);
      toast.success(`Pasien ${appointment.patients.full_name} dipanggil`);
    } catch (error: any) {
      console.error('Error calling patient:', error);
      toast.error("Gagal memanggil pasien");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // 1. Create Medical Record
      const { error: recordError } = await supabase
        .from('medical_records')
        .insert({
          appointment_id: selectedPatient.id,
          patient_id: selectedPatient.patient_id,
          doctor_id: user.id,
          diagnosis: formData.diagnosis,
          notes: formData.notes,
          needs_prescription: formData.needsMedicine
        });

      if (recordError) throw recordError;

      // 2. Update Appointment Status
      const newStatus = formData.needsMedicine ? 'waiting_pharmacy' : 'completed';

      const { error: statusError } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', selectedPatient.id);

      if (statusError) throw statusError;

      if (formData.needsMedicine) {
        toast.success("Pemeriksaan selesai. Silakan buat resep di menu 'Buat Resep'");
      } else {
        toast.success("Pemeriksaan selesai. Pasien tidak memerlukan obat.");
      }

      // Reset
      setSelectedPatient(null);
      setFormData({
        blood_pressure: "",
        temperature: "",
        weight: "",
        diagnosis: "",
        notes: "",
        needsMedicine: false
      });

    } catch (error: any) {
      console.error('Error saving examination:', error);
      toast.error(error.message || "Gagal menyimpan data pemeriksaan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Pemeriksaan Pasien" role="Dokter">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Antrian Pasien</CardTitle>
            <CardDescription>Daftar pasien menunggu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {queue.map((apt) => (
              <div key={apt.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">#{apt.queue_number}</span>
                  <Badge variant={apt.status === 'in_examination' ? 'default' : 'outline'}>
                    {apt.status === 'waiting_doctor' ? 'Menunggu' : 'Sedang Diperiksa'}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{apt.patients.full_name}</p>
                <p className="text-xs text-muted-foreground">{apt.symptoms}</p>
                {apt.status === 'waiting_doctor' && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleCallPatient(apt)}
                    disabled={loading}
                  >
                    Panggil Pasien
                  </Button>
                )}
              </div>
            ))}
            {queue.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Tidak ada pasien dalam antrian
              </p>
            )}
          </CardContent>
        </Card>

        {/* Examination Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Form Pemeriksaan</CardTitle>
            <CardDescription>
              {selectedPatient
                ? `Pasien: ${selectedPatient.patients.full_name}`
                : 'Pilih pasien dari antrian'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPatient ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tekanan Darah</Label>
                    <Input
                      placeholder="120/80"
                      value={formData.blood_pressure}
                      onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Suhu (°C)</Label>
                    <Input
                      placeholder="36.5"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Berat (kg)</Label>
                    <Input
                      placeholder="65"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Keluhan Pasien</Label>
                  <Textarea value={selectedPatient.symptoms} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label>Diagnosis *</Label>
                  <Textarea
                    placeholder="Diagnosis penyakit"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Catatan Tambahan</Label>
                  <Textarea
                    placeholder="Catatan pemeriksaan"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="needsMedicine"
                    checked={formData.needsMedicine}
                    onChange={(e) => setFormData({ ...formData, needsMedicine: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="needsMedicine" className="cursor-pointer">
                    Pasien memerlukan resep obat
                  </Label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Menyimpan..." : "Selesai Pemeriksaan"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedPatient(null)}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Panggil pasien dari antrian untuk memulai pemeriksaan</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DoctorExaminations;
