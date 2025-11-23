import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Calendar, FileText, Clock, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PatientSchedule = () => {
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

  const appointments = [
    {
      id: "APT-001",
      tanggal: "25 Nov 2025",
      jam: "10:00 - 11:00",
      dokter: "Dr. Sarah Wijaya",
      jenisPemeriksaan: "Pemeriksaan Umum",
      status: "Terkonfirmasi",
    },
    {
      id: "APT-002",
      tanggal: "28 Nov 2025",
      jam: "14:00 - 15:00",
      dokter: "Dr. John Doe",
      jenisPemeriksaan: "Kontrol Rutin",
      status: "Menunggu Konfirmasi",
    },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Jadwal Pemeriksaan" role="Pasien">
      <div className="space-y-6">
        {appointments.map((apt) => (
          <Card key={apt.id} className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-foreground">{apt.jenisPemeriksaan}</h3>
                    <Badge
                      variant={apt.status === "Terkonfirmasi" ? "default" : "outline"}
                      className={
                        apt.status === "Terkonfirmasi"
                          ? "bg-success/10 text-success border-success"
                          : "bg-warning/10 text-warning border-warning"
                      }
                    >
                      {apt.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Tanggal:</span>
                      <span className="font-medium text-foreground">{apt.tanggal}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Jam:</span>
                      <span className="font-medium text-foreground">{apt.jam}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Dokter:</span>
                      <span className="font-medium text-foreground">{apt.dokter}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Receipt className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">No. Janji:</span>
                      <span className="font-medium text-foreground">{apt.id}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm">Lihat Detail</Button>
                  <Button size="sm" variant="outline">
                    Reschedule
                  </Button>
                  <Button size="sm" variant="destructive">
                    Batalkan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {appointments.length === 0 && (
          <Card className="shadow-soft">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Tidak Ada Jadwal
              </h3>
              <p className="text-muted-foreground mb-6">
                Anda belum memiliki jadwal pemeriksaan yang terdaftar
              </p>
              <Button>Buat Janji Baru</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientSchedule;
