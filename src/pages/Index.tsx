import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, Users, Pill, FileText, Building2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Manajemen Pasien",
      description: "Pendaftaran dan pengelolaan data pasien yang terintegrasi",
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: "Pemeriksaan Digital",
      description: "Rekam medis elektronik untuk dokumentasi pemeriksaan",
    },
    {
      icon: <Pill className="h-8 w-8" />,
      title: "Apotek Terintegrasi",
      description: "Manajemen obat dan resep dalam satu sistem",
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Laporan Lengkap",
      description: "Analisis dan laporan keuangan real-time",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-primary-foreground py-20 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <Building2 className="h-10 w-10" />
              <span className="text-2xl font-bold">Klinik Sentosa</span>
            </div>
            <Button
              onClick={() => navigate("/login")}
              variant="secondary"
              size="lg"
              className="shadow-medium"
            >
              Login
            </Button>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Sistem Informasi Klinik Modern
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 leading-relaxed">
              Kelola klinik Anda dengan sistem terintegrasi untuk pendaftaran, pemeriksaan, resep,
              dan pembayaran dalam satu platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-large"
              >
                Mulai Sekarang
              </Button>
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10"
              >
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Fitur Unggulan</h2>
            <p className="text-xl text-muted-foreground">
              Solusi lengkap untuk manajemen klinik yang efisien
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card p-8 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 border border-border"
              >
                <div className="inline-flex p-4 bg-primary/10 text-primary rounded-lg mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Siap Memulai?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Bergabunglah dengan Klinik Sentosa dan tingkatkan efisiensi layanan kesehatan Anda
          </p>
          <Button
            onClick={() => navigate("/login")}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 shadow-large"
          >
            Masuk ke Sistem
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Klinik Sentosa</span>
          </div>
          <p className="text-muted-foreground">
            © 2025 Klinik Sentosa. Sistem Informasi Klinik - Final Project SAD UNKLAB
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
