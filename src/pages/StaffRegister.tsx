import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const StaffRegister = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        full_name: "",
        role: "admin" as "admin" | "doctor" | "pharmacist"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Password tidak cocok!");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password minimal 6 karakter!");
            return;
        }

        setLoading(true);

        try {
            // 1. Sign up user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.full_name,
                        role: formData.role
                    }
                }
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
                            full_name: formData.full_name,
                            role: formData.role,
                            email: formData.email
                        });

                    if (profileError) {
                        console.error('Profile creation error:', profileError);
                    }
                } else {
                    // Update email if profile exists but email is missing
                    await supabase
                        .from('profiles')
                        .update({
                            email: formData.email,
                            full_name: formData.full_name,
                            role: formData.role
                        })
                        .eq('id', authData.user.id);
                }
            }

            toast.success("Staff berhasil didaftarkan! Silakan login.");
            navigate('/login');

        } catch (error: any) {
            console.error('Error registering staff:', error);
            toast.error(error.message || "Gagal mendaftar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Registrasi Staff</CardTitle>
                    <CardDescription>Daftar sebagai Admin, Dokter, atau Apoteker</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nama Lengkap *</Label>
                            <Input
                                placeholder="Masukkan nama lengkap"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Password *</Label>
                            <Input
                                type="password"
                                placeholder="Minimal 6 karakter"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Konfirmasi Password *</Label>
                            <Input
                                type="password"
                                placeholder="Ulangi password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Role *</Label>
                            <Select value={formData.role} onValueChange={(val: any) => setFormData({ ...formData, role: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="doctor">Dokter</SelectItem>
                                    <SelectItem value="pharmacist">Apoteker</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Mendaftar..." : "Daftar Sebagai Staff"}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            <p>
                                Sudah punya akun?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-primary hover:underline"
                                >
                                    Login di sini
                                </button>
                            </p>
                            <p className="mt-2">
                                Daftar sebagai pasien?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate('/register')}
                                    className="text-primary hover:underline"
                                >
                                    Registrasi Pasien
                                </button>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default StaffRegister;
