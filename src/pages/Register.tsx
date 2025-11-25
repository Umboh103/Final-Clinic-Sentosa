import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Sign up user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'patient',
                    },
                },
            });

            if (authError) throw authError;

            // 2. Ensure profile exists (manual creation as fallback)
            if (authData.user) {
                // Wait a bit for trigger to execute
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Check if profile exists
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', authData.user.id)
                    .single();

                // If profile doesn't exist, create it manually
                if (!existingProfile) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert({
                            id: authData.user.id,
                            full_name: fullName,
                            role: 'patient',
                            email: email
                        });

                    if (profileError) {
                        console.error('Profile creation error:', profileError);
                        // Don't throw, profile might have been created by trigger
                    }
                } else {
                    // Update email if profile exists but email is missing
                    await supabase
                        .from('profiles')
                        .update({ email: email, full_name: fullName })
                        .eq('id', authData.user.id);
                }
            }

            toast.success("Registrasi berhasil! Silakan login.");
            navigate("/login");
        } catch (error: any) {
            console.error("Registration error:", error);
            toast.error(error.message || "Gagal registrasi");
        } finally {
            setLoading(false);
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
                        Pendaftaran Pasien Baru
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Nama Lengkap
                            </Label>
                            <Input
                                id="fullName"
                                placeholder="Masukkan nama lengkap"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="h-11"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Masukkan email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-11"
                                required
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
                                required
                            />
                        </div>

                        {/* Register Button */}
                        <Button type="submit" className="w-full h-11 text-base shadow-soft" size="lg" disabled={loading}>
                            {loading ? "Loading..." : "Daftar"}
                        </Button>

                        {/* Back to Login */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11"
                            onClick={() => navigate("/login")}
                        >
                            Sudah punya akun? Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;
