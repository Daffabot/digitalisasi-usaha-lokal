import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowUpDown,
  FileText,
  MoreVertical,
  Image as ImageIcon,
  FileSpreadsheet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CuteCard from "../../components/ui/CuteCard";
import { cn } from "../../lib/utils";

// Mock Data
const MOCK_DOCS = [
  {
    id: "1",
    title: "Invoice_Mar_001.pdf",
    date: "2024-03-20",
    size: "1.2 MB",
    type: "pdf",
    thumbnail: "https://picsum.photos/100/100?random=1",
  },
  {
    id: "2",
    title: "Contract_Vendor_A.jpg",
    date: "2024-03-19",
    size: "3.4 MB",
    type: "image",
    thumbnail: "https://picsum.photos/100/100?random=2",
  },
  {
    id: "3",
    title: "Receipt_Lunch.png",
    date: "2024-03-18",
    size: "0.8 MB",
    type: "image",
    thumbnail: "https://picsum.photos/100/100?random=3",
  },
  {
    id: "4",
    title: "Meeting_Notes_Q1.xlsx",
    date: "2024-03-15",
    size: "45 KB",
    type: "excel",
    thumbnail: null,
  },
  {
    id: "5",
    title: "Project_Proposal_v2.pdf",
    date: "2024-03-10",
    size: "5.6 MB",
    type: "pdf",
    thumbnail: "https://picsum.photos/100/100?random=4",
  },
];

const History = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterType, setFilterType] = useState<
    "all" | "pdf" | "image" | "excel"
  >("all");

  // Filter and Sort Logic
  const filteredDocs = useMemo(() => {
    const docs = MOCK_DOCS.filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterType === "all" || doc.type === filterType)
    );

    return docs.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [searchTerm, sortOrder, filterType]);

  const getIcon = (type: string) => {
    switch (type) {
      case "excel":
        return <FileSpreadsheet className="text-green-500" />;
      case "image":
        return <ImageIcon className="text-purple-500" />;
      default:
        return <FileText className="text-accentblue" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex flex-col gap-4 sticky top-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md z-30 pb-4 border-b border-neutral-100 dark:border-neutral-800 -mx-6 px-6 pt-2">
        <h1 className="text-3xl font-yuruka text-neutral-900 dark:text-white">
          History
        </h1>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-accentblue/50 transition-all text-neutral-800 dark:text-white placeholder-neutral-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {(["all", "pdf", "image", "excel"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap cursor-pointer",
                  filterType === type
                    ? "bg-accentblue text-white border border-blue-300"
                    : "bg-white dark:bg-neutral-800 text-neutral-500 border border-b-4 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50"
                )}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            className="p-2 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-accentblue transition-colors shrink-0 cursor-pointer"
          >
            <ArrowUpDown
              size={18}
              className={
                sortOrder === "asc"
                  ? "rotate-180 transition-transform"
                  : "transition-transform"
              }
            />
          </button>
        </div>
      </div>

      {/* Document List */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc, index) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <CuteCard
                  onClick={() => navigate(`/history/${doc.id}`)}
                  className="p-3 flex items-center gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer group transition-all active:scale-[0.98]"
                >
                  {/* Thumbnail / Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0 border border-neutral-100 dark:border-neutral-700">
                    {doc.thumbnail ? (
                      <img
                        src={doc.thumbnail}
                        alt="thumb"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getIcon(doc.type)
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-neutral-800 dark:text-neutral-200 truncate pr-4 text-base">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                      <span className="uppercase font-bold bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-[10px]">
                        {doc.type}
                      </span>
                      <span>•</span>
                      <span>{doc.date}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <button className="p-2 text-neutral-300 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </CuteCard>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-300 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-neutral-500">
                No documents found
              </h3>
              <p className="text-sm text-neutral-400">
                Try adjusting your filters
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default History;
