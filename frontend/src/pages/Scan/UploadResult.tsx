import { useNavigate } from "react-router-dom";
import {
  Check,
  Edit2,
  RotateCcw,
  Trash2,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Download,
} from "lucide-react";
import DocumentPreview from "../../components/scan/DocumentPreview";
import CuteButton from "../../components/ui/CuteButton";
import CuteSection from "../../components/ui/CuteSection";
import CuteCard from "../../components/ui/CuteCard";

const UploadResult = () => {
  const navigate = useNavigate();

  const handleSave = () => {
    // Simulate save logic
    navigate("/home");
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-yuruka text-neutral-900 dark:text-white mb-2">
          Scan Complete!
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          We've converted your image to text.
        </p>
      </div>

      <CuteSection>
        <DocumentPreview />
      </CuteSection>

      <CuteSection delay={0.2} className="mt-4">
        {/* Conversion Status / Download Options */}
        <CuteCard className="mb-6 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
              <Check size={16} strokeWidth={3} />
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 dark:text-white text-sm">
                Converted Successfully
              </h3>
              <p className="text-xs text-neutral-500">
                Ready for download or AI analysis
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-medium hover:border-accentblue hover:text-accentblue transition-colors">
              <FileText size={16} /> PDF
            </button>
            <button className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-medium hover:border-green-500 hover:text-green-500 transition-colors">
              <FileSpreadsheet size={16} /> Excel
            </button>
          </div>
        </CuteCard>

        {/* AI Action */}
        <div className="mb-8">
          <CuteButton
            fullWidth
            onClick={() => navigate("/chat")}
            className="bg-linear-to-r from-violet-500 to-fuchsia-500 shadow-violet-500/25 border-none animate-pulse-subtle"
          >
            <Sparkles size={20} className="text-white" />
            <span>Analyze with AI</span>
          </CuteButton>
          <p className="text-center text-xs text-neutral-400 mt-2">
            Ask questions, summarize, or extract data instantly.
          </p>
        </div>

        {/* Standard Actions */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <CuteButton variant="outline" className="gap-2">
            <Edit2 size={18} /> Edit
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
            <Download size={24} /> Save to Library
          </CuteButton>
        </div>
      </CuteSection>
    </div>
  );
};

export default UploadResult;