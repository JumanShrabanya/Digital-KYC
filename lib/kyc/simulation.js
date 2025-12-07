// Helper functions for simulated KYC logic. Pure in-memory, edge-friendly.

// Random integer between min and max inclusive
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function simulateDocumentQuality(docType, fileBase64) {
  const qualityScore = randomInt(30, 95);

  let qualityLabel = "Poor";
  if (qualityScore >= 71) qualityLabel = "Good";
  else if (qualityScore >= 41) qualityLabel = "Average";

  // For now, authenticity is simulated based on quality only
  const authenticity = qualityLabel === "Good" ? "Authentic" : "Verification Needed";

  return {
    docType,
    qualityScore,
    qualityLabel,
    authenticity,
    previewBase64: fileBase64,
  };
}

export function simulatePhotoUpload(fileBase64) {
  return {
    success: true,
    previewBase64: fileBase64,
  };
}

export function simulateFaceMatch() {
  const matchScore = randomInt(40, 100);

  let category = "Low Match";
  if (matchScore >= 80) category = "High Match";
  else if (matchScore >= 50) category = "Medium Match";

  return {
    matchScore,
    category,
  };
}

export function simulateDuplicateCheck() {
  // 95% no duplicate, 5% duplicate detected
  const isDuplicate = Math.random() < 0.05;

  return {
    duplicate: isDuplicate,
    matchedCustomerId: isDuplicate ? `CUST-${randomInt(100000, 999999)}` : null,
  };
}

export function computeFinalDecision(payload) {
  const {
    identity,
    address,
    faceMatchScore,
    attempts = {},
  } = payload || {};

  const identityStatus = identity?.status;
  const addressStatus = address?.status;

  const anyRejectedDoc =
    identityStatus === "Rejected" || addressStatus === "Rejected";

  const anyManualCondition =
    identityStatus?.includes("Manual") ||
    addressStatus?.includes("Manual") ||
    (faceMatchScore != null && faceMatchScore >= 50 && faceMatchScore < 80) ||
    (attempts.identity ?? 0) >= 3 ||
    (attempts.address ?? 0) >= 3;

  let finalStatus = "approved";

  if (anyRejectedDoc || (faceMatchScore != null && faceMatchScore < 50)) {
    finalStatus = "rejected";
  } else if (anyManualCondition) {
    finalStatus = "manual";
  }

  // Simple risk score: higher is riskier, 0-100 scale
  const identityScore = identity?.qualityScore ?? 0;
  const addressScore = address?.qualityScore ?? 0;
  const docRisk = 100 - Math.min(100, (identityScore + addressScore) / 2);
  const faceRisk = faceMatchScore != null ? 100 - faceMatchScore : 50;
  const attemptRisk =
    ((attempts.identity ?? 0) + (attempts.address ?? 0)) * 5;

  const rawRisk = docRisk * 0.5 + faceRisk * 0.4 + attemptRisk * 0.1;
  const riskScore = Math.max(0, Math.min(100, Math.round(rawRisk)));

  const reasons = [];
  if (anyRejectedDoc) reasons.push("One or more documents failed quality checks");
  if (faceMatchScore != null && faceMatchScore < 50)
    reasons.push("Face match score below acceptable threshold");
  if (anyManualCondition && finalStatus !== "rejected")
    reasons.push("Some signals require manual verification");

  return {
    finalStatus,
    riskScore,
    reasons,
  };
}
