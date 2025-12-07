"use client";

import { useEffect, useState } from "react";

export default function StepUploadDocument({ kycData, setKycData, error, autoStart = false }) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const uploadStatus = kycData?.uploadStatus || null;
  const uploadAttempts = kycData?.attempts?.upload ?? 0;

  useEffect(() => {
    if (!isUploading) return;

    setUploadProgress(0);
    let progress = 0;

    const totalDuration = 2500; // ~2.5s
    const stepMs = 150;
    const increment = 100 / (totalDuration / stepMs);

    const intervalId = setInterval(() => {
      progress = Math.min(100, progress + increment);
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(intervalId);

        const isSuccess = Math.random() < 0.8; // 80% success
        if (isSuccess) {
          setLocalError(null);
          setKycData((prev) => ({
            ...prev,
            uploadStatus: "success",
            attempts: {
              ...(prev?.attempts || {}),
              upload: uploadAttempts + 1,
            },
          }));
        } else {
          const message =
            "Network timeout. Please retry. We will resume from last point.";
          setLocalError(message);
          setKycData((prev) => ({
            ...prev,
            uploadStatus: "failed",
            attempts: {
              ...(prev?.attempts || {}),
              upload: uploadAttempts + 1,
            },
          }));
        }

        setIsUploading(false);
      }
    }, stepMs);

    return () => clearInterval(intervalId);
  }, [isUploading, setKycData, uploadAttempts]);

  const handleStart = () => {
    setLocalError(null);
    setIsUploading(true);
  };

  // Auto-start upload when entering this step (if requested) and not already successful
  useEffect(() => {
    if (autoStart && !isUploading && uploadStatus !== "success") {
      handleStart();
    }
  }, [autoStart, isUploading, uploadStatus]);

  const effectiveError = error || localError;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
          Upload Your Document
        </h2>
        <p className="text-xs text-slate-500 sm:text-sm">
          We are uploading your scanned document to the KYC servers.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-100 bg-white px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center justify-between text-xs text-slate-500 sm:text-sm">
          <span>Upload progress</span>
          <span className="font-medium text-slate-700">
            {Math.round(uploadProgress)}%
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-sky-500 transition-[width] duration-150 ease-out"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>

        {uploadStatus === "success" && !effectiveError && (
          <p className="text-xs font-medium text-emerald-600 sm:text-sm">
            Document uploaded successfully. You can proceed to the next step.
          </p>
        )}

        {uploadStatus === "failed" && effectiveError && (
          <p className="text-xs font-medium text-red-600 sm:text-sm">
            {effectiveError}
          </p>
        )}

        <p className="text-[11px] text-slate-500 sm:text-xs">
          Attempts used: <span className="font-semibold">{uploadAttempts}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleStart}
          disabled={isUploading}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {uploadStatus === "failed" ? "Retry Upload" : "Start Upload"}
        </button>
      </div>
    </div>
  );
}
