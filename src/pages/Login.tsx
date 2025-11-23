import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, Lock } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  const roles = [
    { value: "patient", label: "Pasien", path: "/patient/dashboard" },
    { value: "admin", label: "Admin", path: "/admin/dashboard" },
    { value: "doctor", label: "Dokter", path: "/doctor/dashboard" },
    { value: "pharmacist", label: "Apoteker", path: "/pharmacist/dashboard" },
    { value: "owner", label: "Pemilik Klinik", path: "/owner/dashboard" },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error("Pilih role terlebih dahulu");
      return;
    }

    if (!username || !password) {
      toast.error("Username dan password harus diisi");
      return;
    }

    const role = roles.find((r) => r.value === selectedRole);
    if (role) {
      toast.success(`Login berhasil sebagai ${role.label}`);
      navigate(role.path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
      
      <Card className="w-full max-w-md shadow-large relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Klinik Sentosa</CardTitle>
          <CardDescription className="text-base">
            Masuk ke Sistem Informasi Klinik
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Pilih Role</Label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                      selectedRole === role.value
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-soft"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Username
              </Label>
              <Input
                id="username"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Login Button */}
            <Button type="submit" className="w-full h-11 text-base shadow-soft" size="lg">
              Masuk
            </Button>

            {/* Back to Home */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={() => navigate("/")}
            >
              Kembali ke Beranda
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Demo Prototype - Semua role dapat diakses tanpa autentikasi nyata
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
