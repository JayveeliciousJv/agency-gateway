import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, ArrowRight, ArrowLeft, AlertTriangle, Upload, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_WIDTH = 480;
const JPEG_QUALITY = 0.7;

interface StepCameraProps {
  photo: string;
  onCapture: (imageData: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepCamera = ({ photo, onCapture, onNext, onBack }: StepCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraState, setCameraState] = useState<'idle' | 'active' | 'captured' | 'error'>(() =>
    photo ? 'captured' : 'idle'
  );
  const [errorMsg, setErrorMsg] = useState('');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setErrorMsg('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      setCameraState('active');
    } catch (err: any) {
      setCameraState('error');
      if (err.name === 'NotAllowedError') {
        setErrorMsg('Camera access denied. Please allow camera permissions.');
      } else if (err.name === 'NotFoundError') {
        setErrorMsg('No camera found on this device.');
      } else {
        setErrorMsg('Unable to access camera. Please check your device settings.');
      }
    }
  }, []);

  useEffect(() => {
    if (cameraState === 'active' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(console.error);
    }
  }, [cameraState]);

  // Auto-start camera on mount if no photo
  useEffect(() => {
    if (!photo) {
      startCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    onCapture(dataUrl);
    stopCamera();
    setCameraState('captured');
  }, [onCapture, stopCamera]);

  const retake = useCallback(() => {
    onCapture('');
    setCameraState('idle');
    setTimeout(() => startCamera(), 100);
  }, [onCapture, startCamera]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        onCapture(dataUrl);
        stopCamera();
        setCameraState('captured');
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }, [onCapture, stopCamera]);

  return (
    <div className="animate-fade-in">
      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-lg font-semibold text-card-foreground mb-2">Photo Capture</h2>
        <p className="text-sm text-muted-foreground mb-5">Position your face within the frame and click capture.</p>

        <div className="relative rounded-xl border-2 border-border bg-muted/30 overflow-hidden aspect-[4/3] max-w-[360px] mx-auto">
          {/* Face guide overlay */}
          {cameraState === 'active' && (
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
              <div className="w-36 h-44 border-2 border-dashed border-primary/50 rounded-[50%]" />
              <span className="absolute bottom-3 text-xs text-primary/70 bg-background/80 px-2 py-0.5 rounded">
                Center your face
              </span>
            </div>
          )}

          {cameraState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <User className="w-12 h-12 text-muted-foreground/30" />
              <Button type="button" variant="outline" size="sm" onClick={startCamera}>
                <Camera className="w-4 h-4 mr-1" /> Open Camera
              </Button>
            </div>
          )}

          {cameraState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
              <AlertTriangle className="w-8 h-8 text-destructive/60" />
              <p className="text-xs text-destructive text-center">{errorMsg}</p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={startCamera}>Retry</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-1" /> Upload
                </Button>
              </div>
            </div>
          )}

          {cameraState === 'active' && (
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />
          )}

          {cameraState === 'captured' && photo && (
            <img src={photo} alt="Captured visitor" className="w-full h-full object-cover" />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

        {/* Camera action buttons */}
        {cameraState === 'active' && (
          <div className="flex gap-2 max-w-[360px] mx-auto mt-4">
            <Button type="button" size="sm" className="flex-1" onClick={capture}>
              <Camera className="w-4 h-4 mr-1" /> Capture
            </Button>
          </div>
        )}

        {cameraState === 'captured' && (
          <div className="max-w-[360px] mx-auto mt-4">
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={retake}>
              <RefreshCw className="w-4 h-4 mr-1" /> Retake Photo
            </Button>
          </div>
        )}

        {!photo && cameraState !== 'error' && cameraState !== 'active' && (
          <p className="text-xs text-destructive text-center mt-3">Photo is required to proceed.</p>
        )}

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" className="flex-1" onClick={() => { stopCamera(); onBack(); }}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button type="button" className="flex-1" disabled={!photo} onClick={onNext}>
            Next <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepCamera;
