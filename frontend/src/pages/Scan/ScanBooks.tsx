import React from "react";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon, Camera, ArrowLeft } from "lucide-react";
import ScannerMock from "../../components/scan/ScannerMock";
import CuteButton from "../../components/ui/CuteButton";
import CuteSection from "../../components/ui/CuteSection";

const ScanBooks: React.FC = () => {
  const navigate = useNavigate();

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
        <ScannerMock />

        <div className="w-full mt-8 grid grid-cols-2 gap-4">
          <CuteButton
            variant="secondary"
            onClick={() => navigate("/scan/result")}
            className="flex flex-col gap-2 h-auto py-6"
          >
            <ImageIcon size={28} />
            <span>Upload Photo</span>
          </CuteButton>

          <CuteButton
            onClick={() => navigate("/scan/result")}
            className="flex flex-col gap-2 h-auto py-6"
          >
            <Camera size={28} />
            <span>Take Photo</span>
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
