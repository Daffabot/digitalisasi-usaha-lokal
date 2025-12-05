import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Trash2,
  Download,
  Sparkles,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CuteButton from "../../components/ui/CuteButton";
import CuteSection from "../../components/ui/CuteSection";
import CuteCard from "../../components/ui/CuteCard";
import { cn } from "../../lib/utils";

// Mock Data Fetcher
const getDocById = (id: string) => {
  return {
    id,
    title: "Invoice_Mar_001.pdf",
    date: "March 20, 2024",
    size: "1.2 MB",
    type: "pdf",
    url: "https://picsum.photos/600/800?grayscale",
    extractedText: `INVOICE #00124\n\nDate: March 20, 2024\nBill To: DULO Inc.\n\nITEMS:\n1. Office Supplies - $120.00\n2. Consulting Services - $500.00\n3. Software License - $50.00\n\nSubtotal: $670.00\nTax (10%): $67.00\nTotal: $737.00\n\nThank you for your business!`,
  };
};

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"preview" | "text">("preview");

  // In a real app, useQuery or useEffect to fetch
  const doc = getDocById(id || "1");

  if (!doc) return <div>Document not found</div>;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft
            size={24}
            className="text-neutral-600 dark:text-neutral-300"
          />
        </button>
        <div className="flex gap-2">
          <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            <Share2 size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-red-50 text-neutral-600 dark:text-neutral-300 hover:text-red-500">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Title & Info */}
        <CuteSection>
          <h1 className="text-2xl font-yuruka text-neutral-900 dark:text-white leading-tight mb-2">
            {doc.title}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
            <span>{doc.date}</span>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span>{doc.size}</span>
          </p>
        </CuteSection>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-neutral-100 dark:bg-neutral-900 rounded-2xl">
          <button
            onClick={() => setActiveTab("preview")}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all",
              activeTab === "preview"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            <ImageIcon size={16} /> Preview
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all",
              activeTab === "text"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            <FileText size={16} /> Extracted Text
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === "preview" ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="w-full bg-neutral-100 dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-inner"
              >
                <img
                  src={doc.url}
                  alt="Doc Preview"
                  className="w-full h-auto object-contain"
                />
              </motion.div>
            ) : (
              <motion.div
                key="text"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <CuteCard className="min-h-[400px] font-mono text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                  {doc.extractedText}
                </CuteCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions Footer - Fixed on Mobile, inline on Desktop if desired, but sticking to flow for now */}
        <div className="flex flex-col gap-3 mt-4">
          <CuteButton
            fullWidth
            onClick={() => navigate("/chat")}
            className="bg-linear-to-r from-accentblue to-indigo-500 shadow-indigo-500/30"
          >
            <Sparkles className="mr-2 text-yellow-300" /> Chat with AI about
            this doc
          </CuteButton>

          <CuteButton
            variant="secondary"
            fullWidth
            className="flex items-center justify-center gap-2"
          >
            <Download size={20} /> Download PDF
          </CuteButton>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
