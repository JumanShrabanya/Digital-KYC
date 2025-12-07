"use client";

import { useState } from "react";

export default function StepScanDocument({ kycData, setKycData, error }) {
  const identityDoc = kycData?.identityProof || "Identity document";
  const addressDoc = kycData?.addressProof || "Address document";

  const identityAttempts = kycData?.attempts?.scanIdentity ?? 0;
  const addressAttempts = kycData?.attempts?.scanAddress ?? 0;

  const identityScore = kycData?.scanQualityIdentity ?? null;
  const addressScore = kycData?.scanQualityAddress ?? null;

  const identityUploadedName = kycData?.documentImageNameIdentity ?? null;
  const addressUploadedName = kycData?.documentImageNameAddress ?? null;

  const [identityPreviewUrl, setIdentityPreviewUrl] = useState(kycData?.identityDocumentPreview || null);
  const [addressPreviewUrl, setAddressPreviewUrl] = useState(kycData?.addressDocumentPreview || null);

  const labelForScore = (value) => {
    if (value == null) return null;
    if (value <= 40) return "Poor";
    if (value <= 70) return "Average";
    return "Good";
  };

  const maxAttempts = 3;

  const identityQualityLabel = labelForScore(identityScore);
  const addressQualityLabel = labelForScore(addressScore);

  const handleSimulateScan = async (type) => {
    const isIdentity = type === "identity";
    const currentAttempts = isIdentity ? identityAttempts : addressAttempts;
    if (currentAttempts >= maxAttempts) return;
    const uploadedName = isIdentity
      ? identityUploadedName
      : addressUploadedName;

    if (!uploadedName) return;

    const base64 = isIdentity
      ? kycData?.identityDocumentBase64
      : kycData?.addressDocumentBase64;
    const docType = isIdentity ? identityDoc : addressDoc;

    let qualityScore = Math.floor(Math.random() * 101);

    if (base64 && docType) {
      try {
        const res = await fetch("/api/upload/document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ docType, fileBase64: base64 }),
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.qualityScore === "number") {
            qualityScore = data.qualityScore;
          }
        }
      } catch {
        // fall back to local random score
      }
    }

    setKycData((prev) => ({
      ...prev,
      scanQualityIdentity: isIdentity
        ? qualityScore
        : prev?.scanQualityIdentity ?? prev?.scanQualityIdentity,
      scanQualityAddress: !isIdentity
        ? qualityScore
        : prev?.scanQualityAddress ?? prev?.scanQualityAddress,
      attempts: {
        ...(prev?.attempts || {}),
        scanIdentity: isIdentity
          ? (prev?.attempts?.scanIdentity ?? 0) + 1
          : prev?.attempts?.scanIdentity ?? 0,
        scanAddress: !isIdentity
          ? (prev?.attempts?.scanAddress ?? 0) + 1
          : prev?.attempts?.scanAddress ?? 0,
      },
    }));
  };

  const identityReachedMaxWithLowScore =
    identityAttempts >= maxAttempts &&
    identityScore != null &&
    identityScore < 70;

  const addressReachedMaxWithLowScore =
    addressAttempts >= maxAttempts &&
    addressScore != null &&
    addressScore < 70;

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      const fileName = file.name;
      const previewUrl = URL.createObjectURL(file);

      if (type === "identity") {
        setIdentityPreviewUrl(previewUrl);
        setKycData((prev) => ({
          ...prev,
          documentImageNameIdentity: fileName,
          identityDocumentBase64: base64,
          identityDocumentPreview: base64, // Store base64 for persistence
          identityDocumentUrl: previewUrl, // Store URL for immediate display
        }));
      } else {
        setAddressPreviewUrl(previewUrl);
        setKycData((prev) => ({
          ...prev,
          documentImageNameAddress: fileName,
          addressDocumentBase64: base64,
          addressDocumentPreview: base64, // Store base64 for persistence
          addressDocumentUrl: previewUrl, // Store URL for immediate display
        }));
      }
    };
    reader.readAsDataURL(file);
  };

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

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Identity document panel */}
        <div className="flex-1 space-y-4">
          <div className="rounded-xl border min-h-[25vh] border-dashed border-slate-300 bg-white/60 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600 sm:text-sm">
              Upload image for identity proof ({identityDoc})
            </p>
            <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
              Upload a clear photo or scan of your identity document.
            </p>

            <div className="my-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:text-sm">
                <span>Choose image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "identity")}
                />
              </label>

              <div className="text-[11px] text-slate-500 sm:text-xs">
                {identityUploadedName ? (
                  <span className="break-all">Selected: {identityUploadedName}</span>
                ) : (
                  <span>No document selected</span>
                )}
              </div>
            </div>

            <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
              {identityPreviewUrl || kycData?.identityDocumentPreview ? (
                <img
                  src={identityPreviewUrl || kycData.identityDocumentPreview}
                  alt="Identity document preview"
                  className="h-full w-full object-contain p-1"
                  onLoad={(e) => {
                    // Revoke the object URL to avoid memory leaks
                    if (kycData?.identityDocumentUrl && !identityPreviewUrl) {
                      URL.revokeObjectURL(kycData.identityDocumentUrl);
                    }
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-500 sm:text-xs">
                  No preview available
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => handleSimulateScan("identity")}
              disabled={!identityUploadedName || identityAttempts >= maxAttempts}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Simulate Scan (Identity)
            </button>

            <div className="space-y-2 rounded-xl border border-slate-100 bg-white px-3 py-3 sm:px-4 sm:py-4">
              <p className="text-xs font-medium text-slate-600 sm:text-sm">
                Scan Quality - Identity
              </p>
              {identityScore == null ? (
                <p className="text-xs text-slate-400 sm:text-sm">
                  No scan yet. Tap "Simulate Scan" to generate a quality score.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-900">
                        {identityScore} / 100
                      </p>
                      <p
                        className={`text-xs font-medium sm:text-sm
                          ${identityQualityLabel === "Good" ? "text-emerald-600" : ""}
                          ${identityQualityLabel === "Average" ? "text-amber-600" : ""}
                          ${identityQualityLabel === "Poor" ? "text-red-600" : ""}
                        `}
                      >
                        {identityQualityLabel}
                      </p>
                    </div>
                  </div>

                  {identityScore < 70 && (
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
                Attempts used: <span className="font-semibold">{identityAttempts}</span> / {maxAttempts}
              </p>
            </div>
          </div>
        </div>

        {/* Address document panel */}
        <div className="flex-1 space-y-4">
          <div className="rounded-xl border min-h-[25vh] border-dashed border-slate-300 bg-white/60 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600 sm:text-sm">
              Upload image for address proof ({addressDoc})
            </p>
            <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
              Upload a clear photo or scan of your address document.
            </p>

            <div className="my-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:text-sm">
                <span>Choose image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "address")}
                />
              </label>

              <div className="text-[11px] text-slate-500 sm:text-xs">
                {addressUploadedName ? (
                  <span className="break-all">Selected: {addressUploadedName}</span>
                ) : (
                  <span>No document selected</span>
                )}
              </div>
            </div>

            <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
              {addressPreviewUrl || kycData?.addressDocumentPreview ? (
                <img
                  src={addressPreviewUrl || kycData.addressDocumentPreview}
                  alt="Address document preview"
                  className="h-full w-full object-contain p-1"
                  onLoad={(e) => {
                    // Revoke the object URL to avoid memory leaks
                    if (kycData?.addressDocumentUrl && !addressPreviewUrl) {
                      URL.revokeObjectURL(kycData.addressDocumentUrl);
                    }
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-500 sm:text-xs">
                  No preview available
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => handleSimulateScan("address")}
              disabled={!addressUploadedName || addressAttempts >= maxAttempts}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Simulate Scan (Address)
            </button>

            <div className="space-y-2 rounded-xl border border-slate-100 bg-white px-3 py-3 sm:px-4 sm:py-4">
              <p className="text-xs font-medium text-slate-600 sm:text-sm">
                Scan Quality - Address
              </p>
              {addressScore == null ? (
                <p className="text-xs text-slate-400 sm:text-sm">
                  No scan yet. Tap "Simulate Scan" to generate a quality score.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-900">
                        {addressScore} / 100
                      </p>
                      <p
                        className={`text-xs font-medium sm:text-sm
                          ${addressQualityLabel === "Good" ? "text-emerald-600" : ""}
                          ${addressQualityLabel === "Average" ? "text-amber-600" : ""}
                          ${addressQualityLabel === "Poor" ? "text-red-600" : ""}
                        `}
                      >
                        {addressQualityLabel}
                      </p>
                    </div>
                  </div>

                  {addressScore < 70 && (
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
                Attempts used: <span className="font-semibold">{addressAttempts}</span> / {maxAttempts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-red-600 sm:text-sm">
          Document quality is low. It might cause problem during kyc verification.
        </p>
      )}

      {(identityReachedMaxWithLowScore || addressReachedMaxWithLowScore) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800 sm:px-4 sm:py-3 sm:text-sm">
          Maximum attempts reached for one or more documents. Your case will be sent
          for manual verification.
        </div>
      )}
    </div>
  );
}
