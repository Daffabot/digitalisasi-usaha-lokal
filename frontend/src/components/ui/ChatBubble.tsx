import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Bot, User } from "lucide-react";
import getGravatarUrl from "../../lib/gravatar";
import { getStoredUser } from "../../services/authService";

interface ChatBubbleProps {
  message: string;
  isAi?: boolean;
  timestamp?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isAi = false,
  timestamp,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    try {
      const user = getStoredUser();
      const email = user?.email;
      if (!email) return;
      getGravatarUrl(email, 80)
        .then((url) => {
          if (mounted) setAvatarUrl(url);
        })
        .catch(() => {
          /* ignore */
        });
    } catch {
      /* ignore */
    }
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full gap-2 mb-2 items-start",
        isAi ? "justify-start" : "justify-end"
      )}
    >
      {isAi && (
        <div className="w-7 h-7 rounded-full bg-linear-to-tr from-accentpink to-purple-400 flex items-center justify-center text-white shadow-sm shrink-0">
          <Bot size={14} />
        </div>
      )}

      <div
        className={cn(
          "max-w-[65%] px-3 py-2 rounded-lg text-xs leading-tight relative warp-break-word",
          isAi
            ? "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-tl-none border border-neutral-100 dark:border-neutral-700"
            : "bg-accentblue text-white rounded-tr-none"
        )}
      >
        <p className="whitespace-pre-wrap">{message}</p>

        {timestamp && (
          <span
            className={cn(
              "block text-[10px] opacity-70 w-full text-right mt-1",
              isAi ? "text-neutral-400" : "text-blue-100"
            )}
          >
            {timestamp}
          </span>
        )}
      </div>

      {!isAi && (
        <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="You"
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={14} />
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ChatBubble;
