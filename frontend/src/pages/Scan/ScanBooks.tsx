import React from "react";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon, ArrowLeft } from "lucide-react";
import CameraCapture from "../../components/scan/CameraCapture";
import CuteButton from "../../components/ui/CuteButton";
import CuteSection from "../../components/ui/CuteSection";

type UploadOcrResponse = {
  job_id: string;
};

const ScanBooks: React.FC = () => {
  const navigate = useNavigate();

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const triggerFile = () => fileInputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    try {
      const { uploadOcr } = await import("../../services/ocrService");
      const resp: UploadOcrResponse = await uploadOcr(f, "excel");
      // navigate to result page with job_id
      window.history.pushState({}, "", `/scan/result?job_id=${encodeURIComponent(resp.job_id)}`);
      // use location replace to avoid React navigation here (UploadResult reads from URL)
      window.location.href = `/scan/result?job_id=${encodeURIComponent(resp.job_id)}`;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err);
        alert(err.message || "Upload failed");
      } else {
        console.error(err);
        alert("Upload failed");
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft
            size={24}
            className="text-neutral-600 dark:text-neutral-300"
          />
        </button>
        <h1 className="text-2xl font-yuruka text-neutral-900 dark:text-white">
          Scan Document
        </h1>
      </div>

      <CuteSection className="flex-1 flex flex-col items-center">
        <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <CameraCapture />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <CuteButton
            variant="secondary"
            onClick={triggerFile}
            className="flex flex-col gap-2 h-auto py-6"
          >
            <ImageIcon size={28} />
            <span>Upload Photo</span>
          </CuteButton>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-400 max-w-xs">
          Ensure the document is well-lit and edges are visible for the best
          result.
        </p>
      </CuteSection>
    </div>
  );
};

export default ScanBooks;
