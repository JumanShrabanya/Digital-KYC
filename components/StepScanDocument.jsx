"use client";

import { useState } from "react";

export default function StepScanDocument({ kycData, setKycData, error }) {
  const attempts = kycData?.attempts?.scan ?? 0;
  const score = kycData?.scanQuality ?? null;
  const uploadedName = kycData?.documentImageName ?? null;
  const [previewUrl, setPreviewUrl] = useState(null);

  const labelForScore = (value) => {
    if (value == null) return null;
    if (value <= 40) return "Poor";
    if (value <= 70) return "Average";
    return "Good";
  };

  const qualityLabel = labelForScore(score);
  const maxAttempts = 3;

  const handleSimulateScan = () => {
    if (!uploadedName) {
      return;
    }

    const randomScore = Math.floor(Math.random() * 101); // 0–100
    const nextAttempts = attempts + 1;

    setKycData((prev) => ({
      ...prev,
      scanQuality: randomScore,
      attempts: {
        ...(prev?.attempts || {}),
        scan: nextAttempts,
      },
    }));
  };

  const reachedMaxWithLowScore =
    attempts >= maxAttempts && score != null && score < 70;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
          Scan Your Document
        </h2>
        <p className="text-xs text-slate-500 sm:text-sm">
          Upload a clear photo or scan of your document. Avoid glare and ensure
          good lighting before you simulate the scan.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 space-y-4">
          <div className="rounded-xl border min-h-[25vh] border-dashed border-slate-300 bg-white/60 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600 sm:text-sm">
              Upload document image
            </p>
            <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
              Upload a clear photo or scan of your document. Only one document image can be
              uploaded for this step.
            </p>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:text-sm">
                <span>Choose image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setPreviewUrl(url);
                    } else {
                      setPreviewUrl(null);
                    }
                    setKycData((prev) => ({
                      ...prev,
                      documentImageName: file ? file.name : null,
                    }));
                  }}
                />
              </label>

              <div className="text-[11px] text-slate-500 sm:text-xs">
                {uploadedName ? (
                  <span className="break-all">Selected: {uploadedName}</span>
                ) : (
                  <span>No document selected</span>
                )}
              </div>
            </div>

            {previewUrl && (
              <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <img
                  src={previewUrl}
                  alt="Uploaded document preview"
                  className="h-40 w-full bg-slate-100 object-contain"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <button
            type="button"
            onClick={handleSimulateScan}
            disabled={!uploadedName}
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Simulate Scan
          </button>

          <div className="space-y-2 rounded-xl border border-slate-100 bg-white px-3 py-3 sm:px-4 sm:py-4">
            <p className="text-xs font-medium text-slate-600 sm:text-sm">
              Scan Quality
            </p>
            {score == null ? (
              <p className="text-xs text-slate-400 sm:text-sm">
                No scan yet. Tap "Simulate Scan" to generate a quality score.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900">
                      {score} / 100
                    </p>
                    <p
                      className={`text-xs font-medium sm:text-sm
                        ${qualityLabel === "Good" ? "text-emerald-600" : ""}
                        ${qualityLabel === "Average" ? "text-amber-600" : ""}
                        ${qualityLabel === "Poor" ? "text-red-600" : ""}
                      `}
                    >
                      {qualityLabel}
                    </p>
                  </div>
                </div>

                {score < 70 && (
                  <div className="border-t border-slate-100 pt-2">
                    <p className="text-[11px] font-medium text-slate-500 sm:text-xs">
                      Tips to improve your scan:
                    </p>
                    <ul className="mt-1 space-y-0.5 text-[11px] text-slate-500 sm:text-xs list-disc pl-4">
                      <li>Place the document on a flat surface.</li>
                      <li>Avoid glare and reflections on the card.</li>
                      <li>Fill the frame so the text is clearly visible.</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <p className="mt-3 text-xs text-slate-500 sm:text-xs">
              Attempts used: <span className="font-semibold">{attempts}</span> / {maxAttempts}
            </p>
          </div>
        </div>
      </div>

      {error && score != null && score < 70 && attempts < maxAttempts && (
        <p className="text-xs font-medium text-red-600 sm:text-sm">
          Document quality is low. It might cause problem during kyc verification.
        </p>
      )}

      {reachedMaxWithLowScore && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800 sm:px-4 sm:py-3 sm:text-sm">
          Maximum attempts reached. Your case will be sent for manual verification.
        </div>
      )}
    </div>
  );
}
