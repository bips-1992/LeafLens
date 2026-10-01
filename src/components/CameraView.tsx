import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, SwitchCamera, Zap, ZapOff, Image as ImageIcon, Sparkles, X, RotateCcw, ArrowRight, AlertCircle } from 'lucide-react';
import { playShutterSound } from '../utils/audio';
import { SAMPLE_LEAVES, SampleLeaf } from '../data/sampleLeaves';

interface CameraViewProps {
  onCapture: (imageDataUrl: string, sampleHint?: string) => void;
  onClose: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedHint, setCapturedHint] = useState<string | undefined>(undefined);
  const [showSamplesModal, setShowSamplesModal] = useState<boolean>(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(true);

  // Stop current stream tracks
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start camera stream
  const startCamera = useCallback(
    async (mode: 'environment' | 'user') => {
      setIsLoadingCamera(true);
      setCameraError(null);

      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API is not supported in this browser.');
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
          },
          audio: false,
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(newStream);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          await videoRef.current.play();
        }

        // Check torch capabilities
        const videoTrack = newStream.getVideoTracks()[0];
        if (videoTrack && typeof videoTrack.getCapabilities === 'function') {
          const capabilities = videoTrack.getCapabilities() as { torch?: boolean };
          setHasTorch(Boolean(capabilities.torch));
        } else {
          setHasTorch(false);
        }
      } catch (err: any) {
        console.warn('Failed to start camera:', err);
        let msg = 'Could not access camera.';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          msg = 'Camera permission was denied. Please allow camera permissions in browser settings.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          msg = 'No camera device found on this system.';
        } else {
          msg = err.message || 'Camera initialization error.';
        }
        setCameraError(msg);
      } finally {
        setIsLoadingCamera(false);
      }
    },
    [stream]
  );

  // Initial camera mount
  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopStream();
    };
  }, [facingMode]);

  // Toggle torch
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextTorch = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  // Flip camera
  const switchFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Snap photo from video feed
  const takePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if front-facing user camera
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    playShutterSound();
    setCapturedImage(dataUrl);
    setCapturedHint(undefined);
  };

  // File fallback upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCapturedImage(result);
        setCapturedHint(undefined);
      }
    };
    reader.readAsDataURL(file);
  };

  // Pick sample leaf
  const handleSelectSample = (sample: SampleLeaf) => {
    setCapturedImage(sample.dataUrl);
    setCapturedHint(`${sample.species} with ${sample.tag}`);
    setShowSamplesModal(false);
  };

  // Retake
  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedHint(undefined);
    if (!stream) {
      startCamera(facingMode);
    }
  };

  // Confirm and analyze
  const handleConfirm = () => {
    if (capturedImage) {
      stopStream();
      onCapture(capturedImage, capturedHint);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white select-none overflow-hidden">
      {/* Hidden offscreen canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input fallback */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Overlay Bar */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <button
          onClick={() => {
            stopStream();
            onClose();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-sm text-white/90 hover:bg-black/70 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>

        <div className="flex items-center gap-2">
          {hasTorch && !capturedImage && (
            <button
              onClick={toggleTorch}
              className={`p-2.5 rounded-full backdrop-blur transition cursor-pointer ${
                torchOn ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20' : 'bg-black/50 text-white hover:bg-black/70'
              }`}
              title="Toggle Flash / Torch"
            >
              {torchOn ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
            </button>
          )}

          {!capturedImage && (
            <button
              onClick={switchFacingMode}
              className="p-2.5 rounded-full bg-black/50 backdrop-blur text-white hover:bg-black/70 transition cursor-pointer"
              title="Flip camera"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
        {capturedImage ? (
          // Freeze-Frame Captured Preview
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={capturedImage}
              alt="Captured leaf"
              className="max-h-full max-w-full object-contain"
            />

            {/* Target HUD on captured photo */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
              <div className="w-64 h-64 sm:w-80 sm:h-80 border-2 border-emerald-400/50 rounded-3xl relative">
                <span className="absolute top-2 left-3 text-[10px] uppercase tracking-wider font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded">
                  Target Acquired
                </span>
              </div>
            </div>
          </div>
        ) : cameraError ? (
          // Camera Error / Permission Screen
          <div className="max-w-md p-6 mx-4 text-center rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Camera Unavailable</h3>
            <p className="text-sm text-slate-400 mb-6">{cameraError}</p>

            <div className="space-y-3">
              <button
                onClick={() => startCamera(facingMode)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Camera
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                Choose from Photos
              </button>

              <button
                onClick={() => setShowSamplesModal(true)}
                className="w-full py-2 px-4 rounded-xl border border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Try Sample Leaf (No Camera Needed)
              </button>
            </div>
          </div>
        ) : (
          // Live Video Stream
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
            />

            {isLoadingCamera && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                  <span className="text-xs text-slate-300">Starting camera sensor...</span>
                </div>
              </div>
            )}

            {/* Botanical Scan Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              {/* Central Leaf Frame */}
              <div className="relative w-64 h-72 sm:w-80 sm:h-96 rounded-3xl border border-white/20">
                {/* Corner Guides */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                {/* Animated Scanning Laser Line */}
                <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-[bounce_3s_infinite]" />

                {/* Framing Instruction */}
                <div className="absolute -top-10 inset-x-0 flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur text-xs font-medium text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Place affected leaf in frame
                  </span>
                </div>

                {/* Secondary Tip */}
                <div className="absolute -bottom-10 inset-x-0 flex justify-center text-center">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur text-[11px] text-slate-300">
                    Hold steady with clear lighting on veins
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-30 pb-8 pt-4 px-6 bg-gradient-to-t from-black via-black/90 to-transparent">
        {capturedImage ? (
          // Actions after capture
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <button
              onClick={handleRetake}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Photo</span>
            </button>

            <button
              onClick={handleConfirm}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer active:scale-98"
            >
              <span>Analyze Leaf</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // Live Shutter Controls
          <div className="max-w-md mx-auto flex items-center justify-between">
            {/* Gallery Upload Fallback */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:text-white transition cursor-pointer"
              title="Upload photo from library"
            >
              <div className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur">
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Gallery</span>
            </button>

            {/* Shutter Button */}
            <button
              onClick={takePhoto}
              disabled={isLoadingCamera || !!cameraError}
              className="relative group p-1 rounded-full cursor-pointer transition active:scale-95 disabled:opacity-40"
              title="Take Photo"
            >
              <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group-hover:border-emerald-400 transition-colors">
                <div className="w-16 h-16 rounded-full bg-white group-hover:bg-emerald-400 transition-colors shadow-inner" />
              </div>
            </button>

            {/* Sample Leaves Demo */}
            <button
              onClick={() => setShowSamplesModal(true)}
              className="flex flex-col items-center gap-1 p-2 text-emerald-300 hover:text-emerald-200 transition cursor-pointer"
              title="Try preset sample leaf"
            >
              <div className="w-11 h-11 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 flex items-center justify-center backdrop-blur">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">Samples</span>
            </button>
          </div>
        )}
      </div>

      {/* Preset Sample Leaves Modal */}
      {showSamplesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Select a Diagnostic Sample Leaf
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Test the AI image recognition model instantly without a live camera
                </p>
              </div>
              <button
                onClick={() => setShowSamplesModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 overflow-y-auto pr-1">
              {SAMPLE_LEAVES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-emerald-500/50 hover:bg-emerald-950/20 transition text-left cursor-pointer group"
                >
                  <img
                    src={sample.dataUrl}
                    alt={sample.name}
                    className="w-14 h-14 rounded-lg object-cover bg-slate-900 border border-slate-800 flex-shrink-0 group-hover:scale-105 transition"
                  />
                  <div className="min-w-0">
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-1 ${sample.accent}`}>
                      {sample.tag}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-300">
                      {sample.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 italic truncate">
                      {sample.species}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowSamplesModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Back to Camera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
