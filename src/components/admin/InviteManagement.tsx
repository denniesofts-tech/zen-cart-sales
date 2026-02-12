import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Mail, Plus, Trash2, Copy, Check, RefreshCw, Link } from 'lucide-react';
import { format } from 'date-fns';

const ROLES = [
  { value: 'cashier', label: 'Cashier' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'cook', label: 'Cook' },
  { value: 'waiter', label: 'Waiter' },
] as const;

interface Invite {
  id: string;
  code: string;
  role: string;
  created_by: string;
  expires_at: string | null;
  used_at: string | null;
  used_by: string | null;
  max_uses: number;
  use_count: number;
  created_at: string;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function InviteManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingInvite, setDeletingInvite] = useState<Invite | null>(null);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [role, setRole] = useState<string>('cashier');
  const [maxUses, setMaxUses] = useState('1');
  const [expiresInDays, setExpiresInDays] = useState('7');

  const fetchInvites = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading invites', description: error.message, variant: 'destructive' });
    } else {
      setInvites(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleCreate = async () => {
    if (!profile) return;
    setSaving(true);

    const code = generateCode();
    const expiresAt = expiresInDays
      ? new Date(Date.now() + parseInt(expiresInDays) * 86400000).toISOString()
      : null;

    const { error } = await supabase.from('invites').insert([{
      code,
      role: role as 'cashier' | 'manager' | 'admin' | 'cook' | 'waiter',
      created_by: profile.user_id,
      max_uses: parseInt(maxUses) || 1,
      expires_at: expiresAt,
    }]);

    if (error) {
      toast({ title: 'Error creating invite', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Invite created', description: `Code: ${code}` });
      setIsDialogOpen(false);
      fetchInvites();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deletingInvite) return;
    const { error } = await supabase.from('invites').delete().eq('id', deletingInvite.id);
    if (error) {
      toast({ title: 'Error deleting invite', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Invite deleted' });
      setIsDeleteOpen(false);
      setDeletingInvite(null);
      fetchInvites();
    }
  };

  const copyCode = async (invite: Invite) => {
    const signupUrl = `${window.location.origin}/auth?invite=${invite.code}`;
    await navigator.clipboard.writeText(signupUrl);
    setCopiedId(invite.id);
    toast({ title: 'Invite link copied!' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatus = (invite: Invite) => {
    if (invite.use_count >= invite.max_uses) return 'used';
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) return 'expired';
    return 'active';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="default">Active</Badge>;
      case 'used': return <Badge variant="secondary">Used</Badge>;
      case 'expired': return <Badge variant="outline">Expired</Badge>;
      default: return null;
    }
  };

  return (
    <section className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create invite codes for new staff members
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchInvites}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => {
            setRole('cashier');
            setMaxUses('1');
            setExpiresInDays('7');
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invite
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.map((invite) => {
              const status = getStatus(invite);
              return (
                <TableRow key={invite.id}>
                  <TableCell className="font-mono font-medium">{invite.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{invite.role}</Badge>
                  </TableCell>
                  <TableCell>{invite.use_count}/{invite.max_uses}</TableCell>
                  <TableCell>{getStatusBadge(status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {invite.expires_at
                      ? format(new Date(invite.expires_at), 'MMM d, yyyy')
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyCode(invite)}
                        disabled={status !== 'active'}
                      >
                        {copiedId === invite.id ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Link className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingInvite(invite);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && invites.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No invites yet. Click "Create Invite" to generate one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Invite</DialogTitle>
            <DialogDescription>
              Generate an invite code for a new staff member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Max Uses</Label>
              <Input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
              />
            </div>
            <div>
              <Label>Expires In (days)</Label>
              <Input
                type="number"
                min="1"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                placeholder="Leave empty for no expiry"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invite</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? Code <strong className="font-mono">{deletingInvite?.code}</strong> will no longer work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
