"use client";

import { useEffect, useRef, useState } from "react";

export default function StepPhotoFaceMatch({ kycData, setKycData, error }) {
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  // Initialize from kycData if available
  const [livePreview, setLivePreview] = useState(kycData?.faceLiveCapture || null);

  const uploadedFaceName = kycData?.facePhotoFileName ?? null;
  const uploadedFacePreview = kycData?.facePhotoPreview ?? null;

  useEffect(() => {
    if (!cameraActive) return;

    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError(null);
      } catch (err) {
        setCameraError("Unable to access camera. Please check permissions.");
        setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraActive]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 320;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    
    // Update both local state and kycData
    setLivePreview(dataUrl);
    setKycData((prev) => ({
      ...prev,
      faceLiveCapture: dataUrl,
      // Also store as preview for persistence
      facePhotoPreview: dataUrl,
      facePhotoFileName: `selfie-${Date.now()}.png`
    }));
    
    // send to selfie upload API (fire and forget)
    fetch("/api/upload/selfie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileBase64: dataUrl }),
    }).catch(() => {});
    
    // Stop camera after capture so the user sees the frozen frame
    setCameraActive(false);
  };

  const handleRetake = () => {
    setLivePreview(null);
    setKycData((prev) => ({
      ...prev,
      faceLiveCapture: null,
      facePhotoPreview: null, // Also clear the photo preview
      facePhotoFileName: null // Clear the filename as well
    }));
    setCameraActive(true);
  };

  const handleUploadFace = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setKycData((prev) => ({
        ...prev,
        facePhotoFileName: null,
        facePhotoPreview: null,
        faceLiveCapture: null // Also clear any existing live capture
      }));
      setLivePreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setKycData((prev) => ({
        ...prev,
        facePhotoFileName: file.name,
        facePhotoPreview: base64,
        faceLiveCapture: base64 // Also set as live capture for consistency
      }));
      setLivePreview(base64);
      
      // Send to photo upload API (fire and forget)
      fetch("/api/upload/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64: base64 }),
      }).catch(() => {});
    };
    reader.readAsDataURL(file);
  };

  // When both photos are present and we don't yet have a faceMatchScore,
  // request a simulated face match score from the backend.
  useEffect(() => {
    if (!kycData?.faceLiveCapture || !kycData?.facePhotoPreview) return;
    if (kycData?.faceMatchScore != null) return;

    fetch("/api/check/face-match", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.matchScore === "number") {
          setKycData((prev) => ({
            ...prev,
            faceMatchScore: data.matchScore,
          }));
        }
      })
      .catch(() => {});
  }, [kycData?.faceLiveCapture, kycData?.facePhotoPreview, kycData?.faceMatchScore, setKycData]);

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
          Photo & Face Match
        </h2>
        <p className="text-xs text-slate-500 sm:text-sm">
          Capture a live photo and upload your passport-size photograph so we can
          verify your identity.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Left: Live capture */}
        <div className="flex-1 space-y-4 border-b border-slate-100 pb-4 lg:border-b-0 lg:border-r lg:pr-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600 sm:text-sm">
              Live capture from camera
            </p>
            <p className="text-[11px] text-slate-500 sm:text-xs">
              Enable your webcam or mobile camera and take a clear face shot.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 h-72 sm:h-80">
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-72 w-48 bg-black sm:h-80 sm:w-56">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                ) : livePreview ? (
                  <img
                    src={livePreview}
                    alt="Live capture preview"
                    className="h-full w-full bg-slate-100 object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-400">
                    Camera preview will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>

          {cameraError && (
            <p className="text-xs font-medium text-red-600 sm:text-sm">
              {cameraError}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCameraActive((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:text-sm"
            >
              {cameraActive ? "Stop Camera" : "Enable Camera"}
            </button>
            <button
              type="button"
              onClick={handleCapture}
              disabled={!cameraActive}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:text-sm"
            >
              Capture Photo
            </button>
            {livePreview && (
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:text-sm"
              >
                Retake
              </button>
            )}
          </div>
        </div>

        {/* Right: Passport photo upload */}
        <div className="flex-1 space-y-4 lg:pl-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600 sm:text-sm">
              Upload passport-size photograph
            </p>
            <p className="text-[11px] text-slate-500 sm:text-xs">
              Upload a recent passport-size photo with a clear view of your face.
            </p>
          </div>

          <div className="rounded-xl border min-h-[25vh] border-dashed border-slate-300 bg-white/60 p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:text-sm">
                <span>Choose photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadFace}
                />
              </label>

              <div className="text-[11px] text-slate-500 sm:text-xs">
                {uploadedFaceName ? (
                  <span className="break-all">Selected: {uploadedFaceName}</span>
                ) : (
                  <span>No photo selected</span>
                )}
              </div>
            </div>

            {uploadedFacePreview && (
              <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-center bg-slate-50 py-3">
                  <img
                    src={uploadedFacePreview}
                    alt="Uploaded passport photo preview"
                    className="h-40 w-28 bg-slate-100 object-cover sm:w-32"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-red-600 sm:text-sm">
          Please capture a live photo and upload your passport photo before
          continuing.
        </p>
      )}

      <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 sm:px-5 sm:py-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
          Face capture tips
        </p>
        <ul className="mt-2 space-y-1 text-[11px] text-slate-600 sm:text-xs list-disc pl-4">
          <li>Remove hats, sunglasses, or masks before taking the photo.</li>
          <li>Face the camera directly with a neutral background.</li>
          <li>Ensure good, even lighting with no harsh shadows.</li>
          <li>Keep your entire face inside the frame.</li>
        </ul>
      </div>
    </div>
  );
}
