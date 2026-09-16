'use client';

import { useState } from 'react';

type UploadedFile = {
  name: string;
  type: string;
  size: number;
  url: string;
};

export default function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] =
    useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadedFile(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error?.message || 'Upload failed.',
        );
      }

      setUploadedFile(result.data.file);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Upload failed.',
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Upload Dispute Evidence
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        Upload a PNG, JPEG, or PDF file up to 2 MB.
      </p>

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="mt-6 space-y-4"
      >
        <input
          type="file"
          accept="image/png,image/jpeg,application/pdf"
          onChange={(event) => {
            setSelectedFile(event.target.files?.[0] ?? null);
            setError(null);
            setUploadedFile(null);
          }}
          disabled={isUploading}
          className="block w-full rounded-lg border border-slate-300 p-3 text-sm"
        />

        <button
          type="submit"
          disabled={isUploading || !selectedFile}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Upload evidence'}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {uploadedFile && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800">
            Upload successful
          </p>

          <p className="mt-1 text-sm text-green-700">
            {uploadedFile.name}
          </p>

          {uploadedFile.type.startsWith('image/') ? (
            <img
              src={uploadedFile.url}
              alt="Uploaded dispute evidence"
              className="mt-4 max-h-80 max-w-full rounded-lg border border-green-200"
            />
          ) : (
            <a
              href={uploadedFile.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-medium text-blue-700 underline"
            >
              Open uploaded PDF
            </a>
          )}
        </div>
      )}
    </section>
  );
}
