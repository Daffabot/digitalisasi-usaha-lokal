import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowUpDown,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CuteCard from "../../components/ui/CuteCard";
import { getChatHistory } from "../../services/chatService";

const History = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  type ChatItem = {
    chat_id?: string;
    id?: string;
    _id?: string;
    title?: string;
    summary?: string;
    preview?: string;
    last_message?: { content?: string };
    updated_at?: string;
    created_at?: string;
    date?: string;
  };
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter and Sort Logic
  const filteredDocs = useMemo(() => {
    const docs = chats.filter((chat) => {
      const title = (chat.title || chat.summary || chat.preview || "").toString();
      return title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return docs.sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || a.date || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || b.date || 0).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [searchTerm, sortOrder, chats]);

  function formatDateValue(v: unknown) {
    if (!v) return "";
    // numeric timestamps from API are in seconds (float)
    if (typeof v === "number") return new Date(v * 1000).toLocaleDateString();
    const asNum = Number(v);
    if (!Number.isNaN(asNum) && String(asNum).length >= 10) return new Date(asNum * 1000).toLocaleDateString();
    try {
      return new Date(String(v)).toLocaleDateString();
    } catch {
      return String(v);
    }
  }

  // no-op: chat history uses MessageSquare icon

  useEffect(() => {
    let mounted = true;
    const loadHistory = async () => {
      setLoading(true);
      try {
        const h = await getChatHistory();
        if (!mounted) return;
        // API returns { chats: [...] } — accept both shapes for robustness
        const resp = h as unknown;
        const asRecord = resp && typeof resp === "object" ? (resp as Record<string, unknown>) : null;
        const items = asRecord && Array.isArray(asRecord.chats)
          ? (asRecord.chats as ChatItem[])
          : Array.isArray(resp)
          ? (resp as ChatItem[])
          : [];
        setChats(items);
      } catch (err) {
        console.error("Failed to load chat history", err);
        if (!mounted) return;
        // Check if it's a 401 error - user will be redirected by RouteGuard
        const error = err as { status?: number };
        if (error.status === 401) {
          console.debug("Unauthorized - token expired, route guard will handle redirect");
        } else {
          // For other errors, show empty state
          setChats([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadHistory();

    return () => {
      mounted = false;
    };
  }, []);

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
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-accentblue/50 transition-all text-neutral-800 dark:text-white placeholder-neutral-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-xl text-sm font-bold">Chats</span>
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
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
                <div className="text-neutral-500">Loading chats…</div>
              </motion.div>
            ) : filteredDocs.length > 0 ? (
            filteredDocs.map((chat: ChatItem, index: number) => {
              const id = chat.chat_id || chat.id || chat._id;
              const title = (chat.title || chat.summary || chat.preview || chat.last_message?.content || `Chat ${String(id).slice(0,8)}`);
              const date = chat.updated_at || chat.created_at || chat.date || null;
              const dateStr = formatDateValue(date);

              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <CuteCard
                    onClick={() => id && navigate(`/chat?chat_id=${encodeURIComponent(String(id))}`)}
                    className="p-3 flex items-center gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer group transition-all active:scale-[0.98]"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-100 dark:border-neutral-700 text-accentblue">
                      <MessageSquare size={22} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-neutral-800 dark:text-neutral-200 truncate pr-4 text-base">
                        {title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                        <span>{dateStr}</span>
                      </div>
                    </div>

                    <button className="p-2 text-neutral-300 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </CuteCard>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-300 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-neutral-500">No chats found</h3>
              <p className="text-sm text-neutral-400">Start a new chat from Scan or Upload a document</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default History;
