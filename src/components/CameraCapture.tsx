import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  capturedImage?: string;
  className?: string;
}

const MAX_WIDTH = 480;
const JPEG_QUALITY = 0.7;

const CameraCapture = ({ onCapture, capturedImage, className }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'idle' | 'active' | 'captured' | 'error'>('idle');
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState('active');
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraState('error');
      if (err.name === 'NotAllowedError') {
        setErrorMsg('Camera access denied. Please allow camera permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setErrorMsg('No camera found on this device.');
      } else {
        setErrorMsg('Unable to access camera. Please check your device settings.');
      }
    }
  }, []);

  useEffect(() => {
    if (capturedImage) {
      setCameraState('captured');
    }
  }, [capturedImage]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Compress: scale down
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
  }, [onCapture]);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Camera className="w-4 h-4" />
        Photo Capture
        {cameraState === 'active' && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Camera Ready
          </span>
        )}
        {cameraState === 'captured' && (
          <span className="flex items-center gap-1 text-xs text-primary">
            <CheckCircle2 className="w-3 h-3" /> Captured
          </span>
        )}
      </div>

      <div className="relative rounded-lg border border-border bg-muted/30 overflow-hidden aspect-[4/3] max-w-[320px]">
        {cameraState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Camera className="w-10 h-10 text-muted-foreground/40" />
            <Button type="button" variant="outline" size="sm" onClick={startCamera}>
              <Camera className="w-4 h-4 mr-1" /> Open Camera
            </Button>
            <p className="text-xs text-muted-foreground text-center px-4">
              Your photo will be captured for logging and security purposes.
            </p>
          </div>
        )}

        {cameraState === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <AlertTriangle className="w-8 h-8 text-destructive/60" />
            <p className="text-xs text-destructive text-center">{errorMsg}</p>
            <Button type="button" variant="outline" size="sm" onClick={startCamera}>
              Retry
            </Button>
          </div>
        )}

        {cameraState === 'active' && (
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />
        )}

        {cameraState === 'captured' && capturedImage && (
          <img src={capturedImage} alt="Captured visitor" className="w-full h-full object-cover" />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {cameraState === 'active' && (
        <div className="flex gap-2 max-w-[320px]">
          <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => { stopCamera(); setCameraState('idle'); }}>
            <XCircle className="w-4 h-4 mr-1" /> Cancel
          </Button>
          <Button type="button" size="sm" className="flex-1" onClick={capture}>
            <Camera className="w-4 h-4 mr-1" /> Capture
          </Button>
        </div>
      )}

      {cameraState === 'captured' && (
        <Button type="button" variant="outline" size="sm" onClick={retake} className="max-w-[320px] w-full">
          <RefreshCw className="w-4 h-4 mr-1" /> Retake Photo
        </Button>
      )}
    </div>
  );
};

export default CameraCapture;
