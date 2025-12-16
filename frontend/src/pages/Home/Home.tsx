import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "../../services/authService";
import { ChevronRight, FileClock, Plus, MessageSquare } from "lucide-react";
import CuteCard from "../../components/ui/CuteCard";
import CuteButton from "../../components/ui/CuteButton";
import CuteSection from "../../components/ui/CuteSection";
import { getChatHistory } from "../../services/chatService";

const Home: React.FC = () => {
  const navigate = useNavigate();

  type ChatItem = {
    chat_id?: string;
    id?: string | number;
    _id?: string;
    title?: string;
    created_at?: number | string;
    updated_at?: number | string;
  };

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);

  function toDateFromMaybeEpoch(v?: number | string) {
    if (v === undefined || v === null) return null;
    if (typeof v === "number") {
      return v > 1e12 ? new Date(v) : new Date(v * 1000);
    }
    const n = Number(v);
    if (!Number.isNaN(n)) {
      return n > 1e12 ? new Date(n) : new Date(n * 1000);
    }
    const d = new Date(String(v));
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }

  function isSameDayAsToday(ts?: number | string) {
    const d = toDateFromMaybeEpoch(ts);
    if (!d) return false;
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }

  useEffect(() => {
    let mounted = true;
    const loadChats = async () => {
      setLoading(true);
      try {
        const res = await getChatHistory();
        if (!mounted) return;
        const resp = res as unknown;
        const asRecord = resp && typeof resp === "object" ? (resp as Record<string, unknown>) : null;
        const items: ChatItem[] = asRecord && Array.isArray(asRecord.chats)
          ? (asRecord.chats as ChatItem[])
          : Array.isArray(resp)
          ? (resp as ChatItem[])
          : [];
        setChats(items);
      } catch (err) {
        console.error("Failed to load recent chats", err);
        if (!mounted) return;
        // Check if it's a 401 error - user will be redirected by RouteGuard
        const error = err as { status?: number };
        if (error.status === 401) {
          // console.debug("Unauthorized - token expired, route guard will handle redirect");
        } else {
          // For other errors, show empty state
          setChats([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    loadChats();
    
    return () => { mounted = false; };
  }, []);

  const stored = getStoredUser();
  const displayName =
    (stored?.full_name ?? "user").trim().split(/\s+/)[0] || "user";

  return (
    <div className="flex flex-col gap-6">
      <CuteSection>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-yuruka text-neutral-900 dark:text-white mb-1">
              Hello, {displayName}! 👋
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Here is what's happening today.
            </p>
          </div>
          <CuteButton size="sm" onClick={() => navigate("/scan")}>
            <Plus size={18} /> New Scan
          </CuteButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CuteCard className="bg-linear-to-br from-accentblue to-blue-400 text-white border-none">
            <div className="flex flex-col h-full justify-between">
              <div className="p-3 bg-white/20 w-fit rounded-xl mb-4">
                <MessageSquare size={24} />
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Chats</p>
                <h3 className="text-3xl font-yuruka">{(chats?.length ?? 0).toLocaleString()}</h3>
              </div>
            </div>
          </CuteCard>

          <CuteCard className="bg-linear-to-br from-accentpink to-pink-400 text-white border-none">
            <div className="flex flex-col h-full justify-between">
              <div className="p-3 bg-white/20 w-fit rounded-xl mb-4">
                <FileClock size={24} />
              </div>
              <div>
                <p className="text-pink-100 text-sm mb-1">Total Chats Today</p>
                <h3 className="text-3xl font-yuruka">{(chats || []).filter(c => isSameDayAsToday(c.created_at || c.updated_at)).length.toLocaleString()}</h3>
              </div>
            </div>
          </CuteCard>

          <CuteCard
            className="flex flex-col justify-center items-center text-center gap-2 border-dashed border-2 border-neutral-300 dark:border-neutral-700 bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer"
            onClick={() => navigate("/scan")}
          >
            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
              <Plus size={24} />
            </div>
            <p className="font-bold text-neutral-600 dark:text-neutral-300">
              Quick Scan
            </p>
          </CuteCard>
        </div>
      </CuteSection>

      <CuteSection delay={0.2}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-yuruka text-neutral-800 dark:text-white">
            Recent Chats
          </h2>
          <button
            className="text-accentblue text-sm font-bold hover:underline"
            onClick={() => navigate("/history")}
          >
            View All
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="py-6 text-neutral-500">Loading chats…</div>
          ) : chats.length > 0 ? (
            chats.slice(0, 3).map((c) => {
              const id = c.chat_id || c.id || c._id;
              const title = c.title || `Chat ${String(id)}`;
              const date = c.updated_at || c.created_at || null;
              const dateStr = date && typeof date === "number" ? new Date(date * 1000).toLocaleDateString() : date ? String(date) : "";
              return (
                <CuteCard
                  key={String(id)}
                  onClick={() => id && navigate(`/chat?chat_id=${encodeURIComponent(String(id))}`)}
                  className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/80 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-accentblue flex items-center justify-center">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-800 dark:text-neutral-200">
                        {title}
                      </h4>
                      <p className="text-xs text-neutral-400">{dateStr}</p>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-neutral-300 group-hover:text-accentblue transition-colors"
                  />
                </CuteCard>
              );
            })
          ) : (
            <div className="py-6 text-neutral-500">No recent chats</div>
          )}
        </div>
      </CuteSection>
    </div>
  );
};

export default Home;
