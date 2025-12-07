import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, ChevronDown, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CuteCard from "../../components/ui/CuteCard";
import CuteButton from "../../components/ui/CuteButton";
import CuteSection from "../../components/ui/CuteSection";

const FAQS = [
  {
    question: "How do I scan a document?",
    answer:
      "Go to the 'Scan' tab, align your document within the frame, and tap the camera button. We'll handle the rest!",
  },
  {
    question: "Can I export to Excel?",
    answer:
      "Yes! After scanning, select 'Excel' from the export options. Our AI will attempt to structure the data into columns automatically.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We encrypt all documents and do not share your data with third parties without your consent.",
  },
  {
    question: "How does the AI Chat work?",
    answer:
      "The AI reads the text from your scanned document and lets you ask questions about it, like 'What is the total?' or 'Summarize this'.",
  },
];

const HelpCenter = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-950 pb-20">
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-neutral-100 dark:border-neutral-800">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft
            size={24}
            className="text-neutral-600 dark:text-neutral-300"
          />
        </button>
        <h1 className="text-xl font-yuruka text-neutral-900 dark:text-white">
          Help Center
        </h1>
      </div>

      <div className="p-6 max-w-2xl mx-auto w-full">
        <CuteSection>
          <h2 className="text-2xl font-yuruka text-neutral-900 dark:text-white mb-4">
            How can we help you?
          </h2>
          <div className="relative mb-8">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-900 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-accentblue/50 transition-all text-neutral-800 dark:text-white"
            />
          </div>
        </CuteSection>

        <CuteSection delay={0.1}>
          <div className="flex flex-col gap-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <CuteCard
                  key={index}
                  className="p-0 overflow-hidden cursor-pointer border-none shadow-sm hover:shadow-md transition-shadow"
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                >
                  <div className="p-4 flex justify-between items-center bg-white dark:bg-neutral-900">
                    <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">
                      {faq.question}
                    </h3>
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={20} className="text-neutral-400" />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-neutral-50 dark:bg-neutral-800/50"
                      >
                        <p className="p-4 text-sm text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CuteCard>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-300 mb-3">
                  <Search size={28} />
                </div>
                <h3 className="text-lg font-bold text-neutral-500">
                  No results
                </h3>
                <p className="text-sm text-neutral-400">
                  Try different keywords
                </p>
              </motion.div>
            )}
          </div>
        </CuteSection>

        <CuteSection delay={0.3} className="mt-8">
          <div className="bg-linear-to-br from-accentpink/10 to-purple-500/10 rounded-3xl p-6 text-center border border-accentpink/20">
            <h3 className="font-bold text-neutral-900 dark:text-white mb-2">
              Still have questions?
            </h3>
            <p className="text-sm text-neutral-500 mb-6">
              Our cute support team is here to help!
            </p>
            <CuteButton
              fullWidth
              className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200"
            >
              <MessageCircle size={18} /> Contact Support
            </CuteButton>
          </div>
        </CuteSection>
      </div>
    </div>
  );
};

export default HelpCenter;
