import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Shield, Users, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  role: 'cashier' | 'manager' | 'admin';
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading, isManager, isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && user && !isManager && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [user, loading, isManager, isAdmin, navigate, toast]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading users",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setUsers(data || []);
    }
    setLoadingUsers(false);
  };

  useEffect(() => {
    if (user && (isManager || isAdmin)) {
      fetchUsers();
    }
  }, [user, isManager, isAdmin]);

  const handleRoleChange = async (userId: string, profileId: string, newRole: 'cashier' | 'manager' | 'admin') => {
    setUpdatingRole(profileId);

    // Update profile role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profileId);

    if (profileError) {
      toast({
        title: "Error updating role",
        description: profileError.message,
        variant: "destructive",
      });
      setUpdatingRole(null);
      return;
    }

    // Update user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: userId, 
        role: newRole 
      }, { 
        onConflict: 'user_id,role' 
      });

    if (roleError) {
      // Try to delete existing role and insert new one
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });
    }

    toast({
      title: "Role updated",
      description: `User role changed to ${newRole}`,
    });

    // Refresh users list
    await fetchUsers();
    setUpdatingRole(null);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      default: return 'secondary';
    }
  };

  if (loading || loadingUsers) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || (!isManager && !isAdmin)) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">Admin Panel</h1>
        </div>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={fetchUsers}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Users Section */}
        <section className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage user roles and permissions
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.name}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(profile.role)}>
                        {profile.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(profile.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      {isAdmin ? (
                        <Select
                          value={profile.role}
                          onValueChange={(value: 'cashier' | 'manager' | 'admin') => 
                            handleRoleChange(profile.user_id, profile.id, value)
                          }
                          disabled={updatingRole === profile.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cashier">Cashier</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          View only
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Info */}
        <section className="bg-muted/50 rounded-xl p-4">
          <h3 className="font-medium text-sm mb-2">Role Permissions</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><strong>Cashier:</strong> Process transactions, view products</li>
            <li><strong>Manager:</strong> All cashier permissions + manage products, void/refund transactions</li>
            <li><strong>Admin:</strong> All manager permissions + manage users and roles</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
