"use client";

export default function StepReviewStatus({ kycData }) {
  const {
    identityProof,
    addressProof,
    scanQualityIdentity,
    scanQualityAddress,
    identityDocumentPreview,
    addressDocumentPreview,
    faceLiveCapture,
    facePhotoPreview,
    faceMatchScore,
    uploadStatus,
    attempts,
  } = kycData || {};

  const attemptsIdentity = attempts?.scanIdentity ?? 0;
  const attemptsAddress = attempts?.scanAddress ?? 0;
  const uploadAttempts = attempts?.upload ?? 0;

  const labelForScore = (val) => {
    if (val == null) return "Not scanned";
    if (val <= 40) return "Poor";
    if (val <= 70) return "Average";
    return "Good";
  };

  const docStatus = (val) => {
    if (val == null) return "Not Scanned";
    if (val >= 71) return "Accepted";
    if (val >= 41) return "Low Quality - Manual Review";
    return "Rejected";
  };

  const identityQualityLabel = labelForScore(scanQualityIdentity);
  const addressQualityLabel = labelForScore(scanQualityAddress);

  const identityDocStatus = docStatus(scanQualityIdentity);
  const addressDocStatus = docStatus(scanQualityAddress);

  const matchScore = faceMatchScore ?? 0;

  let matchCategory = "Low Match - Failed Match";
  if (matchScore >= 80) matchCategory = "High Match - Accepted";
  else if (matchScore >= 50) matchCategory = "Medium Match - Manual Review Needed";

  // Simulated
  const duplicateCheck = "No duplicate found";

  const authenticityIdentity =
    identityDocStatus === "Accepted" ? "Authentic" : "Verification Needed";
  const authenticityAddress =
    addressDocStatus === "Accepted" ? "Authentic" : "Verification Needed";

  let uploadReliability = "Upload Failed";
  if (uploadStatus === "success" && uploadAttempts === 1)
    uploadReliability = "Upload Successful";
  else if (uploadStatus === "success" && uploadAttempts > 1)
    uploadReliability = "Retried and Completed";

  // ---------- Final Status Logic ----------
  const anyRejectedDoc =
    identityDocStatus === "Rejected" || addressDocStatus === "Rejected";

  const anyManualConditions =
    identityDocStatus.includes("Manual") ||
    addressDocStatus.includes("Manual") ||
    matchCategory.includes("Manual") ||
    attemptsIdentity >= 3 ||
    attemptsAddress >= 3;

  const documentsAccepted =
    identityDocStatus === "Accepted" && addressDocStatus === "Accepted";

  const highMatch = matchScore >= 80;

  let finalStatus = "approved";
  if (
    anyRejectedDoc ||
    matchScore < 50 ||
    uploadStatus === "failed" ||
    uploadStatus == null
  ) {
    finalStatus = "rejected";
  } else if (!documentsAccepted || !highMatch || anyManualConditions) {
    finalStatus = "manual";
  }

  // ---------- Detailed Reasons ----------
  const rejectionReasons = [];
  if (identityDocStatus === "Rejected")
    rejectionReasons.push("Identity document quality was too low.");
  if (addressDocStatus === "Rejected")
    rejectionReasons.push("Address document quality was too low.");
  if (matchScore < 50)
    rejectionReasons.push("Live selfie did not match the uploaded photograph.");
  if (uploadStatus === "failed")
    rejectionReasons.push("Document upload failed due to network issues.");

  const manualReviewReasons = [];
  if (identityDocStatus.includes("Manual"))
    manualReviewReasons.push("Identity document requires manual verification.");
  if (addressDocStatus.includes("Manual"))
    manualReviewReasons.push("Address document requires manual verification.");
  if (matchCategory.includes("Manual"))
    manualReviewReasons.push("Face match score is moderate and needs review.");
  if (attemptsIdentity >= 3 || attemptsAddress >= 3)
    manualReviewReasons.push("Multiple failed attempts triggered manual review.");

  // ---------- Risk Score ----------
  const riskScore = (() => {
    let score = 0;
    if (scanQualityIdentity) score += 100 - scanQualityIdentity;
    if (scanQualityAddress) score += 100 - scanQualityAddress;
    score += (100 - matchScore) / 2;
    if (attemptsIdentity > 1) score += attemptsIdentity * 5;
    if (attemptsAddress > 1) score += attemptsAddress * 5;
    return Math.min(100, Math.round(score));
  })();

  const badgeStyles = {
    approved:
      "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700",
    manual:
      "inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700",
    rejected:
      "inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700",
  };

  const badgeLabel =
    finalStatus === "approved"
      ? "Approved"
      : finalStatus === "manual"
      ? "Under Manual Review"
      : "Rejected";

  const primaryButton = () => {
    if (finalStatus === "approved") return "Finish";
    if (finalStatus === "manual") return "Okay";
    return "Retry KYC";
  };

  const formatDocName = (key) => {
    if (!key) return "Not selected";
    if (key === "PAN") return "PAN Card";
    if (key === "AADHAAR") return "Aadhaar Card";
    if (key === "PASSPORT") return "Passport";
    if (key === "VOTER_ID") return "Voter ID";
    return key;
  };

  // -------------------------------------
  // UI STARTS HERE
  // -------------------------------------

  return (
    <div className="space-y-8 pb-20">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
          Review Your KYC Submission
        </h2>
        <p className="text-sm text-slate-500">
          Here is a summary of the documents, photos, and checks performed.
        </p>
      </div>

      {/* Final Status */}
      <section className="rounded-2xl border border-slate-100 bg-white px-5 py-5 shadow-sm space-y-3">
        <span className={badgeStyles[finalStatus]}>{badgeLabel}</span>

        {/* Approved */}
        {finalStatus === "approved" && (
          <p className="text-sm text-slate-600">
            Your KYC is approved. Your account will be activated shortly.
          </p>
        )}

        {/* Manual Review */}
        {finalStatus === "manual" && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              A bank officer will review your documents shortly.
            </p>
            <ul className="list-disc pl-5 text-xs text-amber-600">
              {manualReviewReasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <p className="text-xs text-slate-400">Estimated time: 1–4 hours.</p>
          </div>
        )}

        {/* Rejected */}
        {finalStatus === "rejected" && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Your KYC could not be approved.</p>
            <ul className="list-disc pl-5 text-xs text-red-600">
              {rejectionReasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <p className="text-xs text-slate-400">
              You may reattempt KYC after 24 hours or visit a nearby branch.
            </p>
          </div>
        )}

        <button className="mt-2 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white shadow hover:bg-slate-800">
          {primaryButton()}
        </button>
      </section>

      {/* Risk Score */}
      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">
          Overall Risk Score
        </h3>
        <p className="text-2xl font-bold text-slate-800">{riskScore}/100</p>
        <p className="text-xs text-slate-500 mt-1">
          Lower scores indicate safer, more reliable KYC submissions.
        </p>
      </section>

      {/* Verification Checklist */}
      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">
          Verification Summary
        </h3>
        <ul className="space-y-1 text-xs text-slate-600">
          <li>✓ Documents Selected</li>
          <li>{identityDocStatus === "Accepted" ? "✓" : "!"} Identity Document Quality</li>
          <li>{addressDocStatus === "Accepted" ? "✓" : "!"} Address Document Quality</li>
          <li>{matchScore >= 80 ? "✓" : "!"} Face Match Score</li>
          <li>{uploadStatus === "success" ? "✓" : "!"} Upload Reliability</li>
          <li>
            {duplicateCheck === "No duplicate found" ? "✓" : "!"} Duplicate KYC Check
          </li>
        </ul>
      </section>

      {/* Document Summary */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Document Summary</h3>
        <div className="grid gap-4 md:grid-cols-2">
          
          {/* Identity */}
          <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium tracking-wide text-slate-500">
                  Proof of Identity
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatDocName(identityProof)}
                </p>
              </div>
              <span className="text-xs text-slate-500">
                {identityQualityLabel}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-16 w-20 items-center justify-center overflow-hidden rounded-lg border bg-slate-50">
                {identityDocumentPreview ? (
                  <img
                    src={identityDocumentPreview}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-[11px] text-slate-400">No image</span>
                )}
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <p><span className="font-medium">Attempts:</span> {attemptsIdentity}</p>
                <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                  {identityDocStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium tracking-wide text-slate-500">
                  Proof of Address
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatDocName(addressProof)}
                </p>
              </div>
              <span className="text-xs text-slate-500">
                {addressQualityLabel}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-16 w-20 items-center justify-center overflow-hidden rounded-lg border bg-slate-50">
                {addressDocumentPreview ? (
                  <img
                    src={addressDocumentPreview}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-[11px] text-slate-400">No image</span>
                )}
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <p><span className="font-medium">Attempts:</span> {attemptsAddress}</p>
                <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                  {addressDocStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photos Section */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Photo Summary</h3>
        <div className="grid gap-4 md:grid-cols-3">

          {/* Passport Photo */}
          <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs tracking-wide text-slate-500">
              Passport Photo
            </p>
            <div className="flex h-24 items-center justify-center overflow-hidden rounded-lg border bg-slate-50">
              {facePhotoPreview ? (
                <img
                  src={facePhotoPreview}
                  className="h-full w-auto object-contain"
                />
              ) : (
                <span className="text-[11px] text-slate-400">No photo</span>
              )}
            </div>
          </div>

          {/* Live Selfie */}
          <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs tracking-wide text-slate-500">
              Live Selfie
            </p>
            <div className="flex h-24 items-center justify-center overflow-hidden rounded-lg border bg-slate-50">
              {faceLiveCapture ? (
                <img
                  src={faceLiveCapture}
                  className="h-full w-auto object-contain"
                />
              ) : (
                <span className="text-[11px] text-slate-400">No selfie</span>
              )}
            </div>
          </div>

          {/* Face Match */}
          <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs tracking-wide text-slate-500">Face Match</p>
            <p className="text-2xl font-semibold text-slate-900">
              {matchScore}
              <span className="text-sm text-slate-500"> / 100</span>
            </p>
            <p className="text-xs text-slate-600">{matchCategory}</p>
          </div>
        </div>
      </section>

      {/* Server Checks */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Server Checks</h3>
        <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex justify-between text-xs text-slate-600">
            <span className="font-medium">Duplicate KYC Check</span>
            <span className="text-emerald-600">{duplicateCheck}</span>
          </div>
          <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row">
            <div className="flex justify-between sm:w-1/2">
              <span className="font-medium">Identity Proof Authenticity</span>
              <span>{authenticityIdentity}</span>
            </div>
            <div className="flex justify-between sm:w-1/2">
              <span className="font-medium">Address Proof Authenticity</span>
              <span>{authenticityAddress}</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span className="font-medium">Upload Reliability</span>
            <span>{uploadReliability}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
