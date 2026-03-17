import { useState, useRef, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Download, Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, XCircle, Eye, FileDown } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
  type MigrationModule, type ParseResult,
  MODULE_DEFS, downloadTemplate, parseMigrationFile, exportAsMigration,
  toVisitorLogs, toSurveyResponses,
} from '@/lib/migration';

const MigrationPanel = () => {
  const addVisitor = useAppStore((s) => s.addVisitor);
  const addSurvey = useAppStore((s) => s.addSurvey);
  const addAuditLog = useAppStore((s) => s.addAuditLog);
  const currentUser = useAppStore((s) => s.currentUser);
  const visitors = useAppStore((s) => s.visitors);
  const surveys = useAppStore((s) => s.surveys);

  const fileRef = useRef<HTMLInputElement>(null);

  // Template download state
  const [templateModule, setTemplateModule] = useState<MigrationModule>('visitors');
  const [templateFormat, setTemplateFormat] = useState<'csv' | 'json'>('csv');

  // Import state
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingFileName, setPendingFileName] = useState('');

  // Export state
  const [exportModule, setExportModule] = useState<MigrationModule>('visitors');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  /* ---------- Upload handler ---------- */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      toast.error('Please select a .csv or .json file.');
      return;
    }
    setPendingFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = parseMigrationFile(reader.result as string, file.name);
      setParseResult(result);
      setShowPreview(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  /* ---------- Import handler ---------- */
  const handleImport = () => {
    if (!parseResult || parseResult.records.length === 0) return;
    setShowConfirm(false);
    setShowPreview(false);

    const mod = parseResult.module;
    let count = 0;

    if (mod === 'visitors' || mod === 'letters') {
      const logs = toVisitorLogs(parseResult.records, mod === 'letters');
      logs.forEach((v) => addVisitor(v));
      count = logs.length;
    } else if (mod === 'surveys') {
      const responses = toSurveyResponses(parseResult.records);
      responses.forEach((s) => addSurvey(s));
      count = responses.length;
    }

    addAuditLog({
      userId: currentUser?.id || '',
      userName: currentUser?.fullName || '',
      action: 'Migration Import',
      details: `Imported ${count} ${MODULE_DEFS[mod].label} records from "${pendingFileName}".`,
    });

    toast.success(`Successfully imported ${count} ${MODULE_DEFS[mod].label} records.`);
    setParseResult(null);
  };

  /* ---------- Export reports as migration ---------- */
  const handleExportAsMigration = () => {
    if (exportModule === 'visitors') {
      const nonLetterVisitors = visitors.filter(v => v.purpose !== 'Incoming Letter') as unknown as Record<string, unknown>[];
      exportAsMigration('visitors', nonLetterVisitors, exportFormat);
    } else if (exportModule === 'letters') {
      const letterVisitors = visitors.filter(v => v.purpose === 'Incoming Letter') as unknown as Record<string, unknown>[];
      exportAsMigration('letters', letterVisitors, exportFormat);
    } else {
      exportAsMigration('surveys', surveys as unknown as Record<string, unknown>[], exportFormat);
    }
    addAuditLog({
      userId: currentUser?.id || '',
      userName: currentUser?.fullName || '',
      action: 'Migration Export',
      details: `Exported ${MODULE_DEFS[exportModule].label} data as ${exportFormat.toUpperCase()} migration file.`,
    });
  };

  /* ---------- Preview columns ---------- */
  const previewColumns = useMemo(() => {
    if (!parseResult) return [];
    return MODULE_DEFS[parseResult.module].columns.slice(0, 6);
  }, [parseResult]);

  return (
    <>
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground mb-1">Data Migration</h2>
          <p className="text-sm text-muted-foreground">Bulk import/export data using CSV or JSON migration files.</p>
        </div>

        {/* Download Template */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Download Migration Template</Label>
          <p className="text-xs text-muted-foreground">Get a pre-formatted template with column headers, sample data, and instructions.</p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Module</Label>
              <Select value={templateModule} onValueChange={(v) => setTemplateModule(v as MigrationModule)}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(MODULE_DEFS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Format</Label>
              <Select value={templateFormat} onValueChange={(v) => setTemplateFormat(v as 'csv' | 'json')}>
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => downloadTemplate(templateModule, templateFormat)}>
              <Download className="w-4 h-4 mr-2" /> Download Template
            </Button>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Upload Migration File */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Upload Migration File</Label>
          <p className="text-xs text-muted-foreground">Upload a filled-out CSV or JSON migration file. The system will validate and preview the data before importing.</p>
          <div className="flex gap-3">
            <input ref={fileRef} type="file" accept=".csv,.json" className="hidden" onChange={handleFileSelect} />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" /> Select Migration File
            </Button>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Export Reports as Migration */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Export Reports as Migration File</Label>
          <p className="text-xs text-muted-foreground">Download existing data in migration-compatible format for editing and re-importing.</p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Module</Label>
              <Select value={exportModule} onValueChange={(v) => setExportModule(v as MigrationModule)}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(MODULE_DEFS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Format</Label>
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as 'csv' | 'json')}>
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleExportAsMigration}>
              <FileDown className="w-4 h-4 mr-2" /> Export as Migration
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview Dialog */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" /> Migration Preview
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                    {pendingFileName}
                  </Badge>
                  {parseResult && (
                    <Badge variant="secondary">
                      {MODULE_DEFS[parseResult.module].label}
                    </Badge>
                  )}
                  {parseResult && (
                    <Badge variant="secondary">
                      {parseResult.records.length} record{parseResult.records.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                {/* Errors */}
                {parseResult && parseResult.errors.length > 0 && (
                  <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 space-y-1">
                    <p className="text-xs font-semibold text-destructive flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Errors</p>
                    <ul className="text-xs text-destructive space-y-0.5 max-h-24 overflow-y-auto">
                      {parseResult.errors.map((e, i) => <li key={i}>• {e}</li>)}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {parseResult && parseResult.warnings.length > 0 && (
                  <div className="rounded-md border border-warning/50 bg-warning/10 p-3 space-y-1">
                    <p className="text-xs font-semibold text-warning flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Warnings</p>
                    <ul className="text-xs text-warning space-y-0.5 max-h-24 overflow-y-auto">
                      {parseResult.warnings.map((w, i) => <li key={i}>• {w}</li>)}
                    </ul>
                  </div>
                )}

                {/* Data preview */}
                {parseResult && parseResult.records.length > 0 && (
                  <ScrollArea className="max-h-52 rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs w-10">#</TableHead>
                          {previewColumns.map(c => (
                            <TableHead key={c.key} className="text-xs">{c.label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parseResult.records.slice(0, 10).map((rec, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                            {previewColumns.map(c => (
                              <TableCell key={c.key} className="text-xs max-w-[120px] truncate">
                                {rec[c.key] || '—'}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {parseResult.records.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        … and {parseResult.records.length - 10} more rows
                      </p>
                    )}
                  </ScrollArea>
                )}

                {parseResult && parseResult.records.length > 0 && parseResult.errors.length === 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> File is valid and ready to import.
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setParseResult(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!parseResult || parseResult.records.length === 0 || parseResult.errors.length > 0}
              onClick={() => { setShowPreview(false); setShowConfirm(true); }}
            >
              Proceed to Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Migration Import</AlertDialogTitle>
            <AlertDialogDescription>
              This will add <strong>{parseResult?.records.length ?? 0} {parseResult ? MODULE_DEFS[parseResult.module].label : ''}</strong> records to the system.
              This action is logged for audit purposes. Proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setParseResult(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport}>Import Records</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MigrationPanel;
