import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, UserPlus, KeyRound, Pencil } from 'lucide-react';

const UsersPage = () => {
  const users = useAppStore((s) => s.users);
  const addUser = useAppStore((s) => s.addUser);
  const updateUser = useAppStore((s) => s.updateUser);
  const resetPassword = useAppStore((s) => s.resetPassword);
  const addAuditLog = useAppStore((s) => s.addAuditLog);
  const currentUser = useAppStore((s) => s.currentUser);

  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');

  const [resetOpen, setResetOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ username: string; fullName: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{ id: string; username: string; fullName: string } | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');

  const handleCreate = () => {
    const trimmedName = fullName.trim();
    const trimmedUser = username.trim().toLowerCase();
    if (!trimmedName || !trimmedUser) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (users.some((u) => u.username === trimmedUser)) {
      toast.error('Username already exists.');
      return;
    }
    const newUser = {
      id: `u${Date.now()}`,
      username: trimmedUser,
      role: 'semi_admin' as const,
      fullName: trimmedName,
    };
    addUser(newUser);
    addAuditLog({
      userId: currentUser?.id || '',
      userName: currentUser?.fullName || '',
      action: 'User Created',
      details: `Created staff user: ${trimmedName} (@${trimmedUser})`,
    });
    toast.success(`Staff user "${trimmedName}" created. Default password: ${trimmedUser}123`);
    setFullName('');
    setUsername('');
    setOpen(false);
  };

  const openResetDialog = (user: { username: string; fullName: string }) => {
    setResetTarget(user);
    setNewPassword('');
    setConfirmPassword('');
    setResetOpen(true);
  };

  const handleResetPassword = () => {
    if (!resetTarget) return;
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    resetPassword(resetTarget.username, newPassword);
    addAuditLog({
      userId: currentUser?.id || '',
      userName: currentUser?.fullName || '',
      action: 'Password Reset',
      details: `Reset password for user: ${resetTarget.fullName} (@${resetTarget.username})`,
    });
    toast.success(`Password reset for "${resetTarget.fullName}".`);
    setResetOpen(false);
    setResetTarget(null);
  };

  const openEditDialog = (user: { id: string; username: string; fullName: string }) => {
    setEditTarget(user);
    setEditFullName(user.fullName);
    setEditNewPassword('');
    setEditConfirmPassword('');
    setEditOpen(true);
  };

  const handleEditProfile = () => {
    if (!editTarget) return;
    const trimmedName = editFullName.trim();
    if (!trimmedName) {
      toast.error('Full name is required.');
      return;
    }
    // Update name if changed
    if (trimmedName !== editTarget.fullName) {
      updateUser(editTarget.id, { fullName: trimmedName });
      addAuditLog({
        userId: currentUser?.id || '',
        userName: currentUser?.fullName || '',
        action: 'Profile Updated',
        details: `Updated name for @${editTarget.username}: "${editTarget.fullName}" → "${trimmedName}"`,
      });
    }
    // Update password if provided
    if (editNewPassword) {
      if (editNewPassword.length < 6) {
        toast.error('Password must be at least 6 characters.');
        return;
      }
      if (editNewPassword !== editConfirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }
      resetPassword(editTarget.username, editNewPassword);
      addAuditLog({
        userId: currentUser?.id || '',
        userName: currentUser?.fullName || '',
        action: 'Password Changed',
        details: `Password changed for @${editTarget.username}`,
      });
    }
    toast.success('Profile updated successfully.');
    setEditOpen(false);
    setEditTarget(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Accounts</h1>
          <p className="text-sm text-muted-foreground">Manage system users and roles</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="w-4 h-4 mr-2" /> Add Staff User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Staff User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Juan Dela Cruz" />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. juan" />
              </div>
              <p className="text-xs text-muted-foreground">
                Default password will be <strong>username + 123</strong> (e.g. juan123)
              </p>
              <Button onClick={handleCreate} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => (
          <Card key={u.id} className="p-5 stat-card-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  {u.fullName[0]}
                </div>
                <div>
                  <p className="font-medium">{u.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {u.role === 'super_admin' ? 'Super Admin' : 'Semi Admin'} — @{u.username}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  title="Edit Profile"
                  onClick={() => openEditDialog(u)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  title="Reset Password"
                  onClick={() => openResetDialog(u)}
                >
                  <KeyRound className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          {resetTarget && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Set a new password for <strong>{resetTarget.fullName}</strong> (@{resetTarget.username})
              </p>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
              </div>
              <Button onClick={handleResetPassword} className="w-full">
                <KeyRound className="w-4 h-4 mr-2" /> Reset Password
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Editing profile for <strong>@{editTarget.username}</strong>
              </p>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={editFullName} onChange={(e) => setEditFullName(e.target.value)} placeholder="Full name" />
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <Label className="text-sm font-medium">Change Password <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input type="password" value={editNewPassword} onChange={(e) => setEditNewPassword(e.target.value)} placeholder="New password (min 6 chars)" />
                {editNewPassword && (
                  <Input type="password" value={editConfirmPassword} onChange={(e) => setEditConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                )}
              </div>
              <Button onClick={handleEditProfile} className="w-full">
                <Pencil className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
