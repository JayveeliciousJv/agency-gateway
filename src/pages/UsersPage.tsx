import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, UserPlus } from 'lucide-react';

const UsersPage = () => {
  const users = useAppStore((s) => s.users);
  const addUser = useAppStore((s) => s.addUser);
  const addAuditLog = useAppStore((s) => s.addAuditLog);
  const currentUser = useAppStore((s) => s.currentUser);

  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');

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
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;
