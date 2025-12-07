"use client";

import SelectableCard from "./SelectableCard";

const IDENTITY_OPTIONS = [
  { key: "PAN", label: "PAN Card", recommended: true },
  { key: "AADHAAR", label: "Aadhaar Card" },
  { key: "PASSPORT", label: "Passport" },
];

const ADDRESS_OPTIONS = [
  { key: "AADHAAR", label: "Aadhaar Card", recommended: true },
  { key: "PASSPORT", label: "Passport" },
  { key: "VOTER_ID", label: "Voter ID" },
];

export default function DocumentSelectionStep({
  kycData,
  setKycData,
  error,
}) {
  const identity = kycData.identityProof || null;
  const address = kycData.addressProof || null;

  const includesPanAndAadhaar = () => {
    const set = new Set([identity, address].filter(Boolean));
    return set.has("PAN") && set.has("AADHAAR");
  };

  const showPassportWarning = identity === "PASSPORT" || address === "PASSPORT";

  const isValidCombination = identity && address && includesPanAndAadhaar();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-100 bg-white/80 px-3 py-3 shadow-sm ring-1 ring-slate-900/5 sm:px-4 sm:py-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Select Your KYC Documents
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            PAN and Aadhaar are mandatory for digital account opening.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Proof of Identity <span className="text-red-500">*</span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {IDENTITY_OPTIONS.map((opt) => (
              <SelectableCard
                key={opt.key}
                label={opt.label}
                groupName="Proof of Identity"
                recommended={opt.recommended}
                selected={identity === opt.key}
                onSelect={() =>
                  setKycData((prev) => ({
                    ...prev,
                    identityProof: opt.key,
                  }))
                }
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Proof of Address <span className="text-red-500">*</span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {ADDRESS_OPTIONS.map((opt) => (
              <SelectableCard
                key={opt.key}
                label={opt.label}
                groupName="Proof of Address"
                recommended={opt.recommended}
                selected={address === opt.key}
                onSelect={() =>
                  setKycData((prev) => ({
                    ...prev,
                    addressProof: opt.key,
                  }))
                }
              />
            ))}
          </div>
        </div>
      </div>

      {showPassportWarning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:px-4 sm:py-3 sm:text-sm">
          Passport must have at least 6 months validity at the time of submission.
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 sm:px-4 sm:py-4">
        <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Smart Recommendation
        </h3>
        <p className="text-xs text-slate-600 sm:text-sm">
          For fastest approval, we recommend:
        </p>
        <ul className="space-y-1 text-xs text-slate-600 sm:text-sm">
          <li>
            <span className="font-medium">Proof of Identity:</span> PAN Card
          </li>
          <li>
            <span className="font-medium">Proof of Address:</span> Aadhaar Card
          </li>
        </ul>
      </div>

      {!isValidCombination && error && (
        <p className="text-xs font-medium text-red-600 sm:text-sm">
          Proof of Identity & Proof of Address is mandatory for digital KYC.
        </p>
      )}
    </div>
  );
}
