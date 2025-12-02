import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Edit2, RotateCcw, Trash2 } from "lucide-react";
import DocumentPreview from "../../components/scan/DocumentPreview";
import CuteButton from "../../components/ui/CuteButton";
import CuteSection from "../../components/ui/CuteSection";

const UploadResult: React.FC = () => {
  const navigate = useNavigate();

  const handleSave = () => {
    // Simulate save logic
    navigate("/home");
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-yuruka text-neutral-900 dark:text-white mb-2">
          Looks Good?
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Review your scan before saving.
        </p>
      </div>

      <CuteSection>
        <DocumentPreview />
      </CuteSection>

      <CuteSection delay={0.2} className="mt-8">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <CuteButton variant="outline" className="gap-2">
            <Edit2 size={18} /> Crop
          </CuteButton>
          <CuteButton variant="outline" className="gap-2">
            <RotateCcw size={18} /> Retake
          </CuteButton>
        </div>

        <div className="flex gap-4">
          <CuteButton
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => navigate("/scan")}
          >
            <Trash2 size={24} />
          </CuteButton>
          <CuteButton fullWidth onClick={handleSave} className="text-lg">
            <Check size={24} /> Save Document
          </CuteButton>
        </div>
      </CuteSection>
    </div>
  );
};

export default UploadResult;
