import { useEffect, useRef, useState } from "react";
import CuteButton from "../../components/ui/CuteButton";
import { Camera, RotateCw } from "lucide-react";

type Props = {
  fileType?: "excel" | "pdf";
};

export default function CameraCapture({ fileType = "excel" }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      setError(null);

      let stream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "environment" } },
          audio: false,
        });
      } catch {
        // Fallback if environment camera unavailable
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      
      // Set active first so video element is rendered
      setActive(true);
      
      // Wait for next tick to ensure video element is in DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;

        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.error("Play failed:", playErr);
          // Retry play after a short delay
          setTimeout(async () => {
            try {
              await videoRef.current?.play();
            } catch (retryErr) {
              console.error("Retry play failed:", retryErr);
            }
          }, 300);
        }
      }
    } catch (err) {
      console.error("Camera init failed:", err);
      setError("Camera access failed. Check device permission.");
      setActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setActive(false);
  };

  const capture = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    return new Promise<void>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            setCapturedBlob(blob);
            // stop camera after capture for preview
            stopCamera();
          }
          resolve();
        },
        "image/jpeg",
        0.9
      );
    });
  };

  const retake = async () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setCapturedBlob(null);
    await startCamera();
  };

  const submit = async () => {
    if (!capturedBlob) return;
    setIsUploading(true);
    try {
      const file = new File([capturedBlob], `capture-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      const { uploadOcr } = await import("../../services/ocrService");
      type OcrUploadResponse = { job_id: string };
      const resp = (await uploadOcr(file, fileType)) as OcrUploadResponse;
      // navigate to result page with job_id (same pattern as other upload flows)
      const jobId = encodeURIComponent(resp.job_id);
      window.history.pushState({}, "", `/scan/result?job_id=${jobId}`);
      window.location.href = `/scan/result?job_id=${jobId}`;
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || "Upload failed");
      } else {
        setError(String(err) || "Upload failed");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {!active && !previewUrl && (
        <CuteButton
          onClick={startCamera}
          className="w-full flex flex-col gap-2 h-auto py-6"
        >
          <Camera size={28} />
          <span>Take Photo</span>
        </CuteButton>
      )}

      {active && (
        <div className="w-full flex flex-col items-center gap-3">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full rounded-2xl bg-black aspect-video"
            style={{ objectFit: 'cover' }}
          />
          <div className="flex items-center gap-2">
            <CuteButton onClick={capture} className="px-4 py-2">
              Capture
            </CuteButton>
            <CuteButton
              variant="secondary"
              onClick={stopCamera}
              className="px-4 py-2"
            >
              Cancel
            </CuteButton>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="w-full flex flex-col items-center gap-3">
          <img
            src={previewUrl}
            alt="preview"
            className="w-full rounded-2xl object-cover"
          />
          <div className="flex items-center gap-2">
            <CuteButton onClick={retake} className="px-4 py-2">
              <RotateCw size={16} /> Retake
            </CuteButton>
            <CuteButton
              onClick={submit}
              disabled={isUploading}
              className="px-4 py-2"
            >
              {isUploading ? "Uploading…" : "Use Photo"}
            </CuteButton>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}