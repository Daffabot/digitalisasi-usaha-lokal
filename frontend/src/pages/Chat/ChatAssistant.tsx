import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, FileText } from "lucide-react";
import { motion } from "framer-motion";
import ChatBubble from "../../components/ui/ChatBubble";
import CuteButton from "../../components/ui/CuteButton";
import { cn } from "../../lib/utils";

type ChatMessage = {
  id?: number | string;
  chat_id?: string;
  message?: string;
  content?: string;
  role?: string;
  created_at?: number | string;
  timestamp?: string;
  [key: string]: unknown;
};

function formatTs(v: unknown) {
  if (!v) return "";
  if (typeof v === "number") return new Date(v * 1000).toLocaleString();
  const n = Number(v);
  if (!Number.isNaN(n) && String(n).length >= 10)
    return new Date(n * 1000).toLocaleString();
  try {
    return new Date(String(v)).toLocaleString();
  } catch {
    return String(v);
  }
}

const ChatAssistant = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; isAi: boolean; timestamp?: string }>
  >([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [chatTitle, setChatTitle] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const messageText = inputValue.trim();
    const newUserMsg = {
      id: Date.now(),
      text: messageText,
      isAi: false,
      timestamp: "Just now",
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    (async () => {
      try {
        // dynamically import service functions to avoid top-level import issues
        const { postChat, getChat } = await import(
          "../../services/chatService"
        );
        // get optional chat_id from query params if present
        const params = new URLSearchParams(window.location.search);
        const qChatId = params.get("chat_id");

        const resp = await postChat(qChatId, messageText);

        // After posting, refresh chat if there's a chat id, otherwise handle immediate reply
        const chatIdToUse = resp?.chat_id || qChatId || null;
        if (chatIdToUse) {
          const chat = await getChat(chatIdToUse);
          // chat endpoint returns { chat: {...}, messages: [...] }
          const msgsRaw = chat?.messages || chat?.data || [];
          const msgs = (msgsRaw || []).map((m: ChatMessage, i: number) => ({
            id: Number(m.id || Date.now() + i + 1),
            text: (m.message || m.content || JSON.stringify(m)) as string,
            isAi: (m.role ?? "assistant") !== "user",
            timestamp: m.created_at
              ? formatTs(m.created_at)
              : m.timestamp || "",
          }));
          setMessages((prev) => [...prev, ...msgs]);
          // set chat title if available
          const c = chat?.chat || chat;
          if (c && c.title) setChatTitle(String(c.title));
        } else if (resp?.message) {
          // some responses might return immediate reply
          type ReplyItem =
            | string
            | { content?: string; role?: string; timestamp?: string };
          const reply = Array.isArray(resp.message)
            ? (resp.message as ReplyItem[])
            : ([resp.message] as ReplyItem[]);
          const msgs = reply.map((m: ReplyItem, i: number) => {
            const content = typeof m === "string" ? m : m.content ?? "";
            const role =
              typeof m === "string" ? "assistant" : m.role ?? "assistant";
            const timestamp = typeof m === "string" ? "" : m.timestamp ?? "";
            return {
              id: Date.now() + i + 1,
              text: content,
              isAi: role !== "user",
              timestamp,
            };
          });
          setMessages((prev) => [...prev, ...msgs]);
        }
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
          alert(err.message || "Failed to send message");
        } else {
          alert(String(err) || "Failed to send message");
        }
      } finally {
        try {
          // refresh messages from the current chat if available
          const { getChat } = await import("../../services/chatService");
          const params = new URLSearchParams(window.location.search);
          const qChatId = params.get("chat_id");
          if (qChatId) {
            const chat = await getChat(qChatId);
            const msgsRaw = chat?.messages || chat?.data || [];
            const msgs = (msgsRaw || []).map((m: ChatMessage, i: number) => ({
              id: Number(m.id || Date.now() + i + 1),
              text: (m.message || m.content || JSON.stringify(m)) as string,
              isAi: (m.role ?? "assistant") !== "user",
              timestamp: m.created_at
                ? formatTs(m.created_at)
                : m.timestamp || "",
            }));
            setMessages(msgs.length ? msgs : []);
            const c = chat?.chat || chat;
            if (c && c.title) setChatTitle(String(c.title));
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsTyping(false);
        }
      }
    })();
  };

  // Load chat if chat_id provided in query params
  useEffect(() => {
    (async () => {
      setLoadingMessages(true);
      try {
        const params = new URLSearchParams(window.location.search);
        const qChatId = params.get("chat_id");
        const { getChat, getChatHistory } = await import(
          "../../services/chatService"
        );

        // load chat history and pick latest if no chat_id provided
        const historyRaw = await getChatHistory();
        const asRecord =
          historyRaw && typeof historyRaw === "object"
            ? (historyRaw as Record<string, unknown>)
            : null;
        const history =
          asRecord && Array.isArray(asRecord.chats)
            ? (asRecord.chats as ChatMessage[])
            : Array.isArray(historyRaw)
            ? (historyRaw as ChatMessage[])
            : [];

        let chatIdToLoad = qChatId;
        if (!chatIdToLoad && history && history.length > 0) {
          const candidate = history[0].chat_id ?? history[0].id;
          chatIdToLoad = candidate != null ? String(candidate) : null;
        }

        if (chatIdToLoad) {
          const chatResp = await getChat(chatIdToLoad);
          const c = chatResp?.chat || chatResp || null;
          if (c && c.title) setChatTitle(String(c.title));
          const msgsRaw = chatResp?.messages || chatResp?.data || [];
          const msgs = (msgsRaw || []).map((m: ChatMessage, i: number) => ({
            id: Number(m.id || Date.now() + i + 1),
            text: (m.message || m.content || JSON.stringify(m)) as string,
            isAi: (m.role ?? "assistant") !== "user",
            timestamp: m.created_at
              ? formatTs(m.created_at)
              : m.timestamp || "",
          }));
          setMessages(msgs.length ? msgs : []);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error(err);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-950 relative">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft
              size={20}
              className="text-neutral-600 dark:text-neutral-300"
            />
          </button>
          <div>
            <h1 className="font-yuruka text-neutral-900 dark:text-white flex items-center gap-2">
              DULO AI <Sparkles size={14} className="text-accentpink" />
            </h1>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
              online
            </p>
          </div>
        </div>
        <div className="bg-accentblue/10 text-accentblue px-3 py-1 rounded-full text-xs font-bold border border-accentblue/20">
          Beta
        </div>
      </div>

      {/* Context Banner */}
      <div className="bg-accentblue/5 dark:bg-accentblue/10 px-4 py-2 border-b border-accentblue/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
          <FileText size={14} className="text-accentblue" />
          <span>
            Viewing context: <strong>{chatTitle || "—"}</strong>
          </span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-28"> 
        {loadingMessages ? (
          <div className="py-12 text-center text-neutral-500">
            Loading messages…
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg.text}
              isAi={msg.isAi}
              timestamp={msg.timestamp}
            />
          ))
        )}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-center text-xs text-neutral-400 ml-4 mb-4"
          >
            <div
              className="w-2 h-2 bg-accentpink/50 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="w-2 h-2 bg-accentpink/50 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-2 h-2 bg-accentpink/50 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
            Typing...
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="w-full bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 p-4">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-accentblue/50 transition-all">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about this document..."
              className="flex-1 bg-transparent border-none focus:outline-none text-neutral-800 dark:text-white placeholder-neutral-400 text-sm py-1"
            />
          </div>
          <CuteButton
            size="sm"
            onClick={handleSendMessage}
            className={cn(
              "w-10 h-10 rounded-full p-0 flex items-center justify-center",
              !inputValue.trim() && "opacity-50 cursor-not-allowed"
            )}
            disabled={!inputValue.trim()}
          >
            <Send size={18} />
          </CuteButton>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
