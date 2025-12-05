import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, FileText, Paperclip } from "lucide-react";
import { motion } from "framer-motion";
import ChatBubble from "../../components/ui/ChatBubble";
import CuteButton from "../../components/ui/CuteButton";
import { cn } from "../../lib/utils";

const ChatAssistant = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! I've analyzed your document (Invoice_Mar_001.pdf). It seems to be an invoice for office supplies. What would you like to know about it?",
      isAi: true,
      timestamp: "Just now",
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newUserMsg = {
      id: Date.now(),
      text: inputValue,
      isAi: false,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI delay
    setTimeout(() => {
      const newAiMsg = {
        id: Date.now() + 1,
        text: "I see! Based on the document, the total amount is $1,248.50 and the due date is March 25th, 2024. Would you like me to add this to your expense report?",
        isAi: true,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, newAiMsg]);
      setIsTyping(false);
    }, 1500);
  };

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
            Viewing context: <strong>Invoice_Mar_001.pdf</strong>
          </span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.text}
            isAi={msg.isAi}
            timestamp={msg.timestamp}
          />
        ))}

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
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 p-4 pb-safe">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <button className="p-2 text-neutral-400 hover:text-accentblue transition-colors">
            <Paperclip size={20} />
          </button>
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
