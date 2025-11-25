import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Building2, FileText, Users, UserPlus, Edit, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const OwnerAccounts = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    role: "patient"
  });

  const navItems = [
    { label: "Dashboard", path: "/owner/dashboard", icon: <Building2 className="h-5 w-5" /> },
    { label: "Laporan", path: "/owner/reports", icon: <FileText className="h-5 w-5" /> },
    { label: "Manajemen Akun", path: "/owner/accounts", icon: <Users className="h-5 w-5" /> },
  ];

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('profiles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Gagal memuat data pengguna');
        return;
      }

      if (profiles) {
        // Map to add auth_users structure for compatibility
        const profilesWithAuth = profiles.map(profile => ({
          ...profile,
          auth_users: {
            email: profile.email || 'Email tidak tersedia',
            last_sign_in_at: null // We'll add this later if needed
          }
        }));
        setUsers(profilesWithAuth);
      }
    } catch (err) {
      console.error('Catch error:', err);
      toast.error('Terjadi kesalahan saat memuat data');
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: users.length,
      admin: users.filter(u => u.role === 'admin').length,
      doctor: users.filter(u => u.role === 'doctor').length,
      pharmacist: users.filter(u => u.role === 'pharmacist').length,
      patient: users.filter(u => u.role === 'patient').length,
      owner: users.filter(u => u.role === 'owner').length,
    };
  }, [users]);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchRole = roleFilter === 'all' || user.role === roleFilter;
      const matchSearch =
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.auth_users?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [users, roleFilter, searchQuery]);

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setFormData({
      email: user.auth_users?.email || "",
      full_name: user.full_name || "",
      role: user.role
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: formData.role
        })
        .eq('id', selectedUser.id);

      if (error) throw error;
      toast.success("Data pengguna berhasil diperbarui");
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error("Gagal memperbarui data pengguna");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'doctor': return 'bg-green-100 text-green-700 border-green-200';
      case 'pharmacist': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'owner': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'doctor': return 'Dokter';
      case 'pharmacist': return 'Apoteker';
      case 'owner': return 'Owner';
      case 'patient': return 'Pasien';
      default: return role;
    }
  };

  const formatLastLogin = (lastSignIn: string | null) => {
    if (!lastSignIn) return 'Belum pernah login';

    const date = new Date(lastSignIn);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID');
  };

  return (
    <DashboardLayout navItems={navItems} title="Manajemen Akun" role="Pemilik Klinik">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Admin</p>
                <p className="text-2xl font-bold text-blue-600">{stats.admin}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Dokter</p>
                <p className="text-2xl font-bold text-green-600">{stats.doctor}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Apoteker</p>
                <p className="text-2xl font-bold text-purple-600">{stats.pharmacist}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Owner</p>
                <p className="text-2xl font-bold text-red-600">{stats.owner}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Pasien</p>
                <p className="text-2xl font-bold text-gray-600">{stats.patient}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table Card */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Daftar Akun Pengguna</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Kelola akses dan hak pengguna sistem</p>
              </div>
              <Button onClick={() => navigate('/staff-register')} className="w-full md:w-auto">
                <UserPlus className="h-4 w-4 mr-2" />
                Tambah Staff Baru
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">Semua Role</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="doctor">Dokter</SelectItem>
                    <SelectItem value="pharmacist">Apoteker</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="patient">Pasien</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-4">
              Menampilkan {filteredUsers.length} dari {users.length} pengguna
            </p>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Login Terakhir</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.auth_users?.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatLastLogin(user.auth_users?.last_sign_in_at)}
                      </TableCell>
                      <TableCell>
                        <Dialog open={isDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => !open && setIsDialogOpen(false)}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => openEditDialog(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Pengguna</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={formData.email} disabled className="bg-muted" />
                              </div>
                              <div className="space-y-2">
                                <Label>Nama Lengkap</Label>
                                <Input
                                  value={formData.full_name}
                                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Role</Label>
                                <Select
                                  value={formData.role}
                                  onValueChange={(val) => setFormData({ ...formData, role: val })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="doctor">Dokter</SelectItem>
                                    <SelectItem value="pharmacist">Apoteker</SelectItem>
                                    <SelectItem value="owner">Owner</SelectItem>
                                    <SelectItem value="patient">Pasien</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                                {loading ? "Menyimpan..." : "Simpan"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Tidak ada pengguna yang sesuai dengan filter
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OwnerAccounts;
