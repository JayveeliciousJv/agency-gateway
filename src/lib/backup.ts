import { toast } from 'sonner';

const STORE_KEY = 'app-store';

interface BackupData {
  version: number;
  timestamp: string;
  data: Record<string, unknown>;
}

const REQUIRED_KEYS = ['profile', 'services', 'purposes', 'visitors', 'surveys', 'users'];

function validate(parsed: unknown): parsed is BackupData {
  if (!parsed || typeof parsed !== 'object') return false;
  const obj = parsed as Record<string, unknown>;
  if (typeof obj.version !== 'number' || typeof obj.timestamp !== 'string') return false;
  if (!obj.data || typeof obj.data !== 'object') return false;
  const data = obj.data as Record<string, unknown>;
  return REQUIRED_KEYS.every((k) => k in data);
}

export function exportBackup() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) { toast.error('No data found to backup.'); return; }

    const parsed = JSON.parse(raw);
    const backup: BackupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      data: parsed.state ?? parsed,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup downloaded successfully.');
  } catch {
    toast.error('Failed to create backup.');
  }
}

export function createAutoBackup(): string | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const key = `${STORE_KEY}-auto-backup-${Date.now()}`;
    localStorage.setItem(key, raw);
    return key;
  } catch {
    return null;
  }
}

export function importBackup(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!validate(parsed)) {
          toast.error('Invalid backup file. Missing required data fields.');
          resolve(false);
          return;
        }

        // Auto-backup current data before restoring
        const autoKey = createAutoBackup();

        // Restore: Zustand persist stores under { state: ..., version: 0 }
        const current = localStorage.getItem(STORE_KEY);
        let wrapper: Record<string, unknown> = { state: parsed.data, version: 0 };
        if (current) {
          try {
            const cur = JSON.parse(current);
            wrapper = { ...cur, state: parsed.data };
          } catch { /* use default wrapper */ }
        }

        localStorage.setItem(STORE_KEY, JSON.stringify(wrapper));
        toast.success(
          `Backup from ${new Date(parsed.timestamp).toLocaleDateString()} restored. Reloading...` +
          (autoKey ? ' A safety backup was saved automatically.' : '')
        );
        setTimeout(() => window.location.reload(), 1200);
        resolve(true);
      } catch {
        toast.error('Failed to read backup file. Ensure it is valid JSON.');
        resolve(false);
      }
    };
    reader.onerror = () => { toast.error('Error reading file.'); resolve(false); };
    reader.readAsText(file);
  });
}
