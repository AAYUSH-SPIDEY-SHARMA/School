'use client';

import { AlertCircle, CheckCircle2, CloudUpload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/ui/Button';
import { registerCloudinaryAsset } from '@/lib/actions/media';

interface UploadItem {
  name: string;
  status: 'uploading' | 'done' | 'failed';
  message?: string;
}

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/avif,application/pdf';
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

/**
 * Upload files straight from the browser to Cloudinary.
 *
 * The file never passes through this application's server. It goes browser →
 * Cloudinary, authorised by a short-lived signature the server produced after
 * checking the user's role. That matters under the full-quality policy, where
 * originals are deliberately large: routing them through a serverless function
 * would be slow, costly and pointless.
 *
 * ⚠️ Nothing here is a security control. The type and size checks below exist
 * so the user gets an immediate answer instead of waiting for a rejection; the
 * signature endpoint authorises, and `registerCloudinaryAsset` re-validates
 * everything before a row is written.
 */
export function MediaUploader() {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [items, setItems] = React.useState<UploadItem[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);

  function update(name: string, patch: Partial<UploadItem>) {
    setItems((current) =>
      current.map((item) => (item.name === name ? { ...item, ...patch } : item)),
    );
  }

  async function uploadOne(file: File): Promise<void> {
    const isImage = file.type.startsWith('image/');
    const limit = isImage ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;

    if (file.size > limit) {
      update(file.name, {
        status: 'failed',
        message: `Too large — the limit is ${Math.round(limit / 1024 / 1024)} MB.`,
      });
      return;
    }

    // 1. Ask our server to authorise and sign this upload.
    const signResponse = await fetch('/api/media/sign', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ resourceType: isImage ? 'image' : 'raw' }),
    });

    if (!signResponse.ok) {
      update(file.name, {
        status: 'failed',
        message:
          signResponse.status === 403 || signResponse.status === 401
            ? 'You do not have permission to upload.'
            : 'Could not prepare the upload.',
      });
      return;
    }

    const signed = await signResponse.json();

    // 2. Send the file to Cloudinary with exactly the signed parameters.
    //    Anything not signed would be rejected, so this must mirror the server.
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', signed.apiKey);
    form.append('timestamp', String(signed.timestamp));
    form.append('signature', signed.signature);
    for (const [key, value] of Object.entries(signed.params)) {
      if (key === 'timestamp') continue;
      form.append(key, String(value));
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${signed.cloudName}/${isImage ? 'image' : 'raw'}/upload`;

    const uploadResponse = await fetch(endpoint, { method: 'POST', body: form });

    if (!uploadResponse.ok) {
      update(file.name, { status: 'failed', message: 'Upload was rejected.' });
      return;
    }

    const uploaded = await uploadResponse.json();

    // 3. Record it, which re-validates and verifies EXIF removal server-side.
    const result = await registerCloudinaryAsset({
      publicId: uploaded.public_id,
      url: uploaded.secure_url,
      fileName: file.name,
      mimeType: file.type,
      fileSize: uploaded.bytes ?? file.size,
      width: uploaded.width ?? null,
      height: uploaded.height ?? null,
      containsMinors: false,
    });

    if (!result.ok) {
      update(file.name, { status: 'failed', message: result.error });
      return;
    }

    update(file.name, {
      status: 'done',
      message: result.data.metadataStripped
        ? 'Uploaded. Location data removed.'
        : '⚠ Uploaded, but location data could not be confirmed as removed.',
    });
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const list = Array.from(files);
    setItems(list.map((file) => ({ name: file.name, status: 'uploading' })));
    setBusy(true);

    // Sequential rather than parallel: full-quality originals are large, and a
    // dozen simultaneous multi-megabyte uploads on a school's connection is
    // slower overall than doing them one at a time.
    for (const file of list) {
      await uploadOne(file);
    }

    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragging
            ? 'border-cta bg-info-soft'
            : 'border-border-strong bg-surface-sunken'
        }`}
      >
        <CloudUpload aria-hidden="true" className="mx-auto size-9 text-foreground-subtle" />

        <p className="mt-3 text-body font-medium text-foreground">
          Drop files here, or choose them
        </p>
        <p className="mx-auto mt-1 max-w-md text-body-sm text-foreground-muted">
          JPEG, PNG, WebP, AVIF or PDF. Images up to 10&nbsp;MB, documents up to
          25&nbsp;MB. Files are stored at full quality — nothing is compressed.
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          className="sr-only"
          onChange={(event) => void handleFiles(event.target.files)}
        />

        <Button
          type="button"
          className="mt-5"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? 'Uploading…' : 'Choose files'}
        </Button>

        <p className="mt-4 text-caption text-foreground-muted">
          Location data is removed from every photograph on upload. A phone
          picture of a classroom often carries GPS coordinates.
        </p>
      </div>

      {items.length > 0 ? (
        <ul aria-live="polite" className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.name}
              className="flex items-start gap-2.5 rounded-md border border-border bg-surface px-3 py-2.5 text-body-sm"
            >
              {item.status === 'uploading' ? (
                <Loader2
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 animate-spin text-foreground-subtle"
                />
              ) : item.status === 'done' ? (
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-success"
                />
              ) : (
                <AlertCircle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-error"
                />
              )}

              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">
                  {item.name}
                </span>
                {item.message ? (
                  <span
                    className={
                      item.status === 'failed'
                        ? 'text-error'
                        : 'text-foreground-muted'
                    }
                  >
                    {item.message}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
