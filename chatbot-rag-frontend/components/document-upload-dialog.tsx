'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Loader2,
} from 'lucide-react';
import { uploadDocument } from '@/lib/api';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = 'idle' | 'uploading' | 'success' | 'error';

interface UploadedFile {
  file: File;
  status: Status;
  progress: number;
  error?: string;
  chunks?: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCEPTED = ['.pdf', '.txt', '.md', '.docx'] as const;
const ACCEPTED_MIME = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE_MB = 20;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function FileTypeIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase();
  const colors: Record<string, string> = {
    pdf:  'text-red-400',
    txt:  'text-blue-400',
    md:   'text-purple-400',
    docx: 'text-sky-400',
  };
  return (
    <FileText className={cn('w-5 h-5 shrink-0', colors[ext ?? ''] ?? 'text-muted-foreground')} />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DocumentUploadDialog({ open, onOpenChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (file: File): string | null => {
    if (!ACCEPTED_MIME.includes(file.type) && !ACCEPTED.some(ext => file.name.endsWith(ext))) {
      return `Unsupported file type. Accepted: ${ACCEPTED.join(', ')}`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Max size is ${MAX_SIZE_MB} MB`;
    }
    return null;
  };

  // ── Add files ─────────────────────────────────────────────────────────────
  const addFiles = useCallback((incoming: File[]) => {
    const entries: UploadedFile[] = incoming.map((file) => {
      const error = validate(file) ?? undefined;
      return { file, status: error ? 'error' : 'idle', progress: 0, error };
    });
    setFiles((prev) => [...prev, ...entries]);
  }, []);

  // ── Upload single file ────────────────────────────────────────────────────
  const uploadFile = useCallback(async (index: number) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: 'uploading', progress: 0 } : f))
    );

    try {
      const entry = files[index];
      const result = await uploadDocument(entry.file, (pct) =>
        setFiles((prev) =>
          prev.map((f, i) => (i === index ? { ...f, progress: pct } : f))
        )
      );
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, status: 'success', progress: 100, chunks: result.chunks }
            : f
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: 'error', error: msg } : f))
      );
    }
  }, [files]);

  // ── Upload all pending ────────────────────────────────────────────────────
  const uploadAll = async () => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'idle') await uploadFile(i);
    }
  };

  // ── Remove ────────────────────────────────────────────────────────────────
  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const pendingCount = files.filter((f) => f.status === 'idle').length;
  const hasFiles = files.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border bg-card shadow-xl gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl btn-gradient flex items-center justify-center shadow-sm">
              <FileUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Upload Documents</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                PDF, TXT, MD, DOCX · Max {MAX_SIZE_MB} MB each
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* ── Drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Drop files or click to browse"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed',
              'py-8 cursor-pointer transition-all select-none',
              isDragging
                ? 'drag-active border-primary'
                : 'border-border hover:border-primary/50 hover:bg-accent/40'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              isDragging ? 'bg-primary/20' : 'bg-muted'
            )}>
              <Upload className={cn('w-5 h-5 transition-colors', isDragging ? 'text-primary' : 'text-muted-foreground')} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {isDragging ? 'Drop to upload' : 'Drop files here'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                or <span className="text-primary font-medium">browse</span> to choose files
              </p>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
          />

          {/* ── File list */}
          {hasFiles && (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
              {files.map((f, i) => (
                <div
                  key={`${f.file.name}-${i}`}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                    f.status === 'error'
                      ? 'border-destructive/40 bg-destructive/5'
                      : f.status === 'success'
                      ? 'border-[var(--success)]/30 bg-[var(--success)]/5'
                      : 'border-border bg-muted/40'
                  )}
                >
                  <FileTypeIcon name={f.file.name} />

                  {/* Name + info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-foreground text-[13px]">{f.file.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">{formatBytes(f.file.size)}</span>
                      {f.status === 'success' && f.chunks && (
                        <>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="text-[11px] text-muted-foreground">{f.chunks} chunks indexed</span>
                        </>
                      )}
                      {f.status === 'error' && (
                        <span className="text-[11px] text-destructive truncate">{f.error}</span>
                      )}
                    </div>

                    {/* Progress bar */}
                    {f.status === 'uploading' && (
                      <div className="mt-1.5 h-1 w-full rounded-full bg-border overflow-hidden">
                        <div
                          className="progress-bar"
                          style={{ '--progress': `${f.progress}%` } as React.CSSProperties}
                        />
                      </div>
                    )}
                  </div>

                  {/* Status icon / remove */}
                  <div className="shrink-0">
                    {f.status === 'uploading' && (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    )}
                    {f.status === 'success' && (
                      <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                    )}
                    {(f.status === 'idle' || f.status === 'error') && (
                      <button
                        onClick={() => removeFile(i)}
                        className="p-0.5 rounded text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between gap-3 bg-muted/30">
          <p className="text-xs text-muted-foreground">
            {files.length === 0
              ? 'Documents are added to your knowledge base'
              : `${files.filter(f => f.status === 'success').length}/${files.length} uploaded`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setFiles([]); onOpenChange(false); }}
              className="h-8 text-xs"
            >
              Close
            </Button>
            {pendingCount > 0 && (
              <Button
                size="sm"
                onClick={uploadAll}
                className="h-8 text-xs btn-gradient text-white hover:opacity-90 transition-opacity gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload {pendingCount} file{pendingCount > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
