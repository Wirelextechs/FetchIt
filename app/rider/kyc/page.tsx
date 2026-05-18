"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  CreditCard, 
  Image as ImageIcon, 
  Camera, 
  Bike, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  UploadCloud,
  ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import Webcam from "react-webcam";

type Step = 1 | 2 | 3 | 4 | 5;

export default function RiderKycPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Step state
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState(""); // Regex Target: GHA-XXXXXXXXX-X
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  
  // Selfie States & Webcam References
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const [vehicleModel, setVehicleModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");

  // Pipeline Status State
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    reason?: string;
  } | null>(null);

  // Refs for custom trigger inputs
  const idFileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Convert Base64 Data URI to standard File Object
  const base64ToFile = (base64String: string, filename: string): File => {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Helper: Capture screenshot from live stream
  const captureSelfie = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setSelfiePreview(imageSrc);
        try {
          const file = base64ToFile(imageSrc, `selfie_${Date.now()}.jpg`);
          setSelfieFile(file);
          setCameraError(null);
        } catch (err) {
          console.error("Failed to convert captured selfie base64 to file:", err);
        }
      }
    }
  };

  // Validation Checkers
  const isIdValid = (id: string) => {
    const regex = /^GHA-\d{9}-\d$/;
    return regex.test(id);
  };

  const handleIdNumberChange = (val: string) => {
    // Automatically capitalize and insert hyphens for superior UX
    let clean = val.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    if (clean.startsWith("GHA")) {
      if (clean.length > 3 && clean[3] !== "-") {
        clean = "GHA-" + clean.substring(3);
      }
      if (clean.length > 13 && clean[13] !== "-") {
        clean = clean.substring(0, 13) + "-" + clean.substring(13);
      }
    } else if (clean.length > 0 && !clean.startsWith("G")) {
      clean = "GHA-" + clean;
    }
    setIdNumber(clean.substring(0, 15));
  };

  // Step Navigations
  const nextStep = () => {
    if (currentStep < 5) setCurrentStep((prev) => (prev + 1) as Step);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step);
  };

  // File Handlers
  const handleIdCardSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdCardFile(file);
      setIdCardPreview(URL.createObjectURL(file));
    }
  };

  const handleSelfieCaptured = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelfieFile(file);
      setSelfiePreview(URL.createObjectURL(file));
    }
  };

  // Submit and Upload to Supabase Storage
  const handlePipelineSubmit = async () => {
    if (!user) {
      alert("Please log in to submit verification documents.");
      return;
    }
    if (!idCardFile || !selfieFile) {
      alert("Missing ID card or Selfie image upload.");
      return;
    }

    setVerifying(true);
    setCurrentStep(5);

    try {
      // 1. Upload ID Card to Supabase storage
      const idCardExt = idCardFile.name.split(".").pop();
      const idCardPath = `${user.id}/id_card_${Date.now()}.${idCardExt}`;
      const { error: idUploadError } = await supabase.storage
        .from("kyc_documents")
        .upload(idCardPath, idCardFile, { cacheControl: "3600", upsert: true });

      if (idUploadError) throw new Error("ID Card upload failed: " + idUploadError.message);

      // 2. Upload Selfie to Supabase storage
      const selfieExt = selfieFile.name.split(".").pop();
      const selfiePath = `${user.id}/selfie_${Date.now()}.${selfieExt}`;
      const { error: selfieUploadError } = await supabase.storage
        .from("kyc_documents")
        .upload(selfiePath, selfieFile, { cacheControl: "3600", upsert: true });

      if (selfieUploadError) throw new Error("Selfie upload failed: " + selfieUploadError.message);

      // 3. Get Public URLs
      const { data: idUrlData } = supabase.storage.from("kyc_documents").getPublicUrl(idCardPath);
      const { data: selfieUrlData } = supabase.storage.from("kyc_documents").getPublicUrl(selfiePath);

      if (!idUrlData.publicUrl || !selfieUrlData.publicUrl) {
        throw new Error("Could not retrieve file public URLs.");
      }

      // 4. Trigger Next.js API verification route
      const response = await fetch("/api/kyc/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provided_full_name: fullName,
          provided_id_number: idNumber,
          id_card_url: idUrlData.publicUrl,
          selfie_url: selfieUrlData.publicUrl,
          vehicle_model: vehicleModel,
          license_plate: licensePlate,
          rider_id: user.id
        })
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setVerificationResult({ success: true });
      } else {
        setVerificationResult({ 
          success: false, 
          reason: resData.reason || resData.error || "Automated OCR/Face Verification rejected your submission." 
        });
      }

    } catch (err: any) {
      console.error(err);
      setVerificationResult({
        success: false,
        reason: err.message || "An unexpected network error occurred."
      });
    } finally {
      setVerifying(false);
    }
  };

  const resetPipelineForm = () => {
    setVerificationResult(null);
    setCurrentStep(1);
    setFullName("");
    setIdNumber("");
    setIdCardFile(null);
    setIdCardPreview(null);
    setSelfieFile(null);
    setSelfiePreview(null);
    setVehicleModel("");
    setLicensePlate("");
  };

  // Step Indicators Render
  const renderStepIndicators = () => {
    if (currentStep === 5) return null;
    return (
      <div className="flex items-center justify-between w-full max-w-xs mx-auto mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border transition-all ${
              currentStep === s 
                ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                : currentStep > s 
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-500" 
                  : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-400"
            }`}>
              {s}
            </div>
            {s < 4 && (
              <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                currentStep > s ? "bg-emerald-500" : "bg-slate-200 dark:bg-white/10"
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-8 relative overflow-y-auto pb-40">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Back to Profile Button */}
      {currentStep !== 5 && (
        <button 
          onClick={() => router.push("/rider/dashboard")}
          className="self-start mb-4 flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Radar Dashboard
        </button>
      )}

      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col justify-start mt-2">
        {renderStepIndicators()}

        <div className="w-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl relative">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: PERSONAL DECLARATION */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3 border border-emerald-500/20">
                    <User className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">Personal Declaration</h2>
                  <p className="text-xs text-slate-500 mt-1">Enter your exact matching details for verification.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Full Name (Exactly as on ID)</label>
                    <input
                      type="text"
                      placeholder="e.g. KOFI OSEI AMANKWAH"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold transition-all text-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Ghana Card Number</label>
                    <input
                      type="text"
                      placeholder="e.g. GHA-123456789-0"
                      value={idNumber}
                      onChange={(e) => handleIdNumberChange(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold tracking-wider transition-all text-slate-950 dark:text-white"
                    />
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] text-slate-400">Required format: GHA-XXXXXXXXX-X</span>
                      {idNumber && (
                        <span className={`text-[9px] font-black uppercase ${isIdValid(idNumber) ? "text-emerald-500" : "text-rose-500"}`}>
                          {isIdValid(idNumber) ? "Format Valid" : "Format Invalid"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  disabled={!fullName.trim() || !isIdValid(idNumber)}
                  onClick={nextStep}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 disabled:opacity-40 transition-all shadow-lg active:scale-95 mt-4"
                >
                  Continue to Upload
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: ID CARD UPLOAD */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3 border border-emerald-500/20">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">Ghana Card Scan</h2>
                  <p className="text-xs text-slate-500 mt-1">Upload a clear front photo of your national ID.</p>
                </div>

                <input 
                  type="file" 
                  ref={idFileInputRef}
                  accept="image/*"
                  onChange={handleIdCardSelected}
                  className="hidden"
                />

                <div 
                  onClick={() => idFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[30px] p-8 text-center cursor-pointer transition-all ${
                    idCardPreview 
                      ? "border-emerald-500/50 bg-emerald-500/5" 
                      : "border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 bg-slate-50/50 dark:bg-slate-950/20"
                  }`}
                >
                  {idCardPreview ? (
                    <div className="space-y-4">
                      <img 
                        src={idCardPreview} 
                        alt="ID Preview" 
                        className="max-h-40 mx-auto rounded-xl object-contain shadow-md"
                      />
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Document Selected successfully</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-200/50 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-500">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-850 dark:text-white">Tap to upload your ID card</p>
                        <p className="text-[9px] text-slate-400">Supports JPEG, PNG or WebP</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={prevStep}
                    className="flex-1 border border-slate-200 dark:border-white/10 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-slate-950 dark:hover:text-white transition-colors active:scale-95"
                  >
                    Back
                  </button>
                  <button
                    disabled={!idCardFile}
                    onClick={nextStep}
                    className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 disabled:opacity-40 transition-all shadow-lg active:scale-95"
                  >
                    Liveness Step
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: LIVE LIVENESS CHECK */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3 border border-emerald-500/20">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">Liveness Selfie Check</h2>
                  <p className="text-xs text-slate-500 mt-1">To ensure security, take a live selfie now.</p>
                </div>

                {/* Webcam glassmorphic card container with rounded corners and hidden overflow */}
                <div className="relative w-full aspect-video rounded-[30px] overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-950/90 shadow-2xl flex items-center justify-center">
                  {cameraError ? (
                    <div className="p-6 text-center space-y-3 z-10">
                      <XCircle className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
                      <p className="text-xs font-bold text-rose-500 leading-relaxed max-w-xs mx-auto">
                        {cameraError}
                      </p>
                    </div>
                  ) : selfiePreview ? (
                    // Captured Static Preview
                    <img 
                      src={selfiePreview} 
                      alt="Captured Selfie Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Live video feed
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        facingMode: facingMode,
                        width: 1280,
                        height: 720
                      }}
                      onUserMediaError={() => setCameraError("Camera access is required for verification. Please enable it in your browser settings.")}
                      onUserMedia={() => setCameraError(null)}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Camera Toggler overlay */}
                  {!selfiePreview && !cameraError && (
                    <button
                      onClick={() => setFacingMode((prev) => prev === "user" ? "environment" : "user")}
                      className="absolute top-4 right-4 bg-slate-950/70 hover:bg-slate-950 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all z-20 shadow-md"
                      title="Switch Camera"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Switchable Controls Area */}
                {selfiePreview ? (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center">Selfie captured successfully</p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setSelfiePreview(null);
                          setSelfieFile(null);
                        }}
                        className="flex-1 border border-slate-200 dark:border-white/10 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-slate-950 dark:hover:text-white transition-colors active:scale-95 bg-white/5"
                      >
                        Retake
                      </button>
                      <button
                        onClick={nextStep}
                        className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95"
                      >
                        Confirm & Continue
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!cameraError && (
                      <button
                        onClick={captureSelfie}
                        className="w-full bg-white dark:bg-slate-800 text-slate-950 dark:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-md active:scale-95 border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4 text-emerald-500 animate-pulse" />
                        Capture Photo
                      </button>
                    )}
                    
                    <div className="flex gap-4">
                      <button
                        onClick={prevStep}
                        className="flex-1 border border-slate-200 dark:border-white/10 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-slate-950 dark:hover:text-white transition-colors active:scale-95"
                      >
                        Back
                      </button>
                      <button
                        disabled={true}
                        className="flex-1 bg-slate-150 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest cursor-not-allowed border border-transparent"
                      >
                        Confirm & Continue
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 4: VEHICLE DETAILS */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3 border border-emerald-500/20">
                    <Bike className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">Vehicle Details</h2>
                  <p className="text-xs text-slate-500 mt-1">Enter details of your vehicle to handle gig transport.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Motorbike Brand / Model</label>
                    <input
                      type="text"
                      placeholder="e.g. Royal 125, Honda Ace"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold transition-all text-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">License Plate</label>
                    <input
                      type="text"
                      placeholder="e.g. M-26-AS-489"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold transition-all text-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    onClick={prevStep}
                    className="flex-1 border border-slate-200 dark:border-white/10 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-slate-950 dark:hover:text-white transition-colors active:scale-95"
                  >
                    Back
                  </button>
                  <button
                    disabled={!vehicleModel.trim() || !licensePlate.trim()}
                    onClick={handlePipelineSubmit}
                    className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 disabled:opacity-40 transition-all shadow-lg active:scale-95"
                  >
                    Run Verify
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: PIPELINE PROCESSING & FINAL ACTION RESPONSE */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-8"
              >
                {/* Loader State */}
                {verifying && (
                  <div className="space-y-6">
                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-white/5" />
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                      <ShieldCheck className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-950 dark:text-white italic">Analyzing Verification Pipeline...</h3>
                      <p className="text-xs text-slate-500 mt-2 font-semibold animate-pulse">Running OCR Check & Facial Descriptor comparison...</p>
                    </div>
                  </div>
                )}

                {/* Final Pipeline Responses */}
                {!verifying && verificationResult && (
                  <div className="space-y-6">
                    {verificationResult.success ? (
                      <div className="space-y-6">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto border-2 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                          <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-950 dark:text-white">Verification Approved!</h3>
                          <p className="text-xs text-slate-500 mt-2 font-semibold leading-relaxed">
                            Your details match national records perfectly. Your profile is now verified and active.
                          </p>
                        </div>
                        <button
                          onClick={() => router.push("/rider/dashboard")}
                          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95"
                        >
                          Access Live Command Radar
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mx-auto border-2 border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                          <XCircle className="w-12 h-12" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-950 dark:text-white">Verification Failed</h3>
                          <p className="text-xs text-rose-500 font-bold mt-2 leading-relaxed bg-rose-500/5 py-3 px-4 rounded-2xl border border-rose-500/10 max-w-sm mx-auto">
                            Reason: {verificationResult.reason}
                          </p>
                        </div>
                        <button
                          onClick={resetPipelineForm}
                          className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-95 transition-all shadow-lg active:scale-95"
                        >
                          Retry Verification
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
