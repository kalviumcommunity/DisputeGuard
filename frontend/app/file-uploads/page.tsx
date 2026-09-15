import UploadForm from './upload-form';

export default function FileUploadsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          File Uploads
        </h1>

        <p className="mt-2 text-slate-600">
          Local fallback storage for DisputeGuard evidence files.
        </p>
      </div>

      <UploadForm />

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Production note:</strong> This local uploads directory is
        intended for development only. Production storage should be replaced
        with object storage such as Amazon S3 or Google Cloud Storage.
      </div>
    </main>
  );
}
