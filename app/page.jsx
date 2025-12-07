"use client";

import { useState } from "react";
import Stepper from "../components/Stepper";
import DocumentSelectionStep from "../components/DocumentSelectionStep";
import StepScanDocument from "../components/StepScanDocument";
import StepUploadDocument from "../components/StepUploadDocument";
import StepPhotoFaceMatch from "../components/StepPhotoFaceMatch";
import StepReviewStatus from "../components/StepReviewStatus";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const maxStep = 5;
  const [kycData, setKycData] = useState({
    identityProof: null,
    addressProof: null,
    scanQualityIdentity: null,
    scanQualityAddress: null,
    documentImageNameIdentity: null,
    documentImageNameAddress: null,
    identityDocumentPreview: null,
    addressDocumentPreview: null,
    faceLiveCapture: null,
    facePhotoFileName: null,
    facePhotoPreview: null,
    faceMatchScore: null,
    uploadStatus: null,
    attempts: {
      scanIdentity: 0,
      scanAddress: 0,
      upload: 0,
    },
  });
  const [docError, setDocError] = useState(false);
  const [scanError, setScanError] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [faceError, setFaceError] = useState(false);

  const handleNext = () => {
    if (currentStep === 1) {
      const { identityProof, addressProof } = kycData;
      const set = new Set([identityProof, addressProof].filter(Boolean));
      const isValid =
        identityProof &&
        addressProof &&
        set.has("PAN") &&
        set.has("AADHAAR");

      if (!isValid) {
        setDocError(true);
        return;
      }

      setDocError(false);
    }

    if (currentStep === 2) {
      const scoreIdentity = kycData.scanQualityIdentity;
      const scoreAddress = kycData.scanQualityAddress;
      const attemptsIdentity = kycData.attempts?.scanIdentity ?? 0;
      const attemptsAddress = kycData.attempts?.scanAddress ?? 0;

      // Require both documents to be scanned at least once
      if (scoreIdentity == null || scoreAddress == null) {
        setScanError(true);
        return;
      }

      const identityOk =
        scoreIdentity >= 70 || (scoreIdentity < 70 && attemptsIdentity >= 3);
      const addressOk =
        scoreAddress >= 70 || (scoreAddress < 70 && attemptsAddress >= 3);

      if (!identityOk || !addressOk) {
        setScanError(true);
        return;
      }

      setScanError(false);
    }

    if (currentStep === 3) {
      const status = kycData.uploadStatus;
      if (status !== "success") {
        setUploadError(true);
        return;
      }

      setUploadError(false);
    }

    if (currentStep === 4) {
      const hasLiveCapture = !!kycData.faceLiveCapture;
      const hasUploadedPhoto = !!kycData.facePhotoPreview;

      if (!hasLiveCapture || !hasUploadedPhoto) {
        setFaceError(true);
        return;
      }

      setFaceError(false);
    }

    setCurrentStep((prev) => Math.min(maxStep, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <main className="flex min-h-screen w-full flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Onboarding
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Digital KYC - Smart Onboarding
          </h1>
          <p className="max-w-2xl text-sm text-slate-500 sm:text-base">
            Verify customers in a few guided steps  from selecting documents to
            final review. This is a single, focused flow with no page reloads.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <Stepper currentStep={currentStep} />

          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 sm:px-5 sm:py-5">
            {currentStep === 1 && (
              <DocumentSelectionStep
                kycData={kycData}
                setKycData={setKycData}
                error={docError}
              />
            )}

            {currentStep === 2 && (
              <StepScanDocument
                kycData={kycData}
                setKycData={setKycData}
                error={scanError}
              />
            )}

            {currentStep === 3 && (
              <StepUploadDocument
                kycData={kycData}
                setKycData={setKycData}
                error={uploadError}
                autoStart
              />
            )}

            {currentStep === 4 && (
              <StepPhotoFaceMatch
                kycData={kycData}
                setKycData={setKycData}
                error={faceError}
              />
            )}

            {currentStep === 5 && (
              <StepReviewStatus kycData={kycData} />
            )}

            {currentStep > 5 && (
              <div className="flex min-h-[180px] items-center justify-center text-center">
                <p className="text-sm text-slate-400 sm:text-base">
                  Step {currentStep} content will appear here.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-400">
              Step {currentStep} of {maxStep}
            </div>

            <div className="flex w-full justify-between gap-3 sm:w-auto">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 sm:flex-none sm:px-5"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === maxStep}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:flex-none sm:px-5"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
