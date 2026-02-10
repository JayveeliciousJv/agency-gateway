import { Card } from '@/components/ui/card';

const UsersPage = () => {
  const users = [
    { username: 'admin', fullName: 'System Administrator', role: 'Super Admin' },
    { username: 'staff', fullName: 'Staff User', role: 'Semi Admin' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Accounts</h1>
        <p className="text-sm text-muted-foreground">Manage system users and roles</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => (
          <Card key={u.username} className="p-5 stat-card-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {u.fullName[0]}
              </div>
              <div>
                <p className="font-medium">{u.fullName}</p>
                <p className="text-xs text-muted-foreground">{u.role} — @{u.username}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;
