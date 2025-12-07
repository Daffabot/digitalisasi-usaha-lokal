import { apiRequest } from "../lib/apiClient";

export async function postChat(chatId: string | null, message: string) {
  const body = {
    "id-chat": chatId,
    message: [
      {
        content: message,
        role: "user",
      },
    ],
  };
  return apiRequest(`/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function getChatHistory() {
  return apiRequest(`/chat/history`, { method: "GET" });
}

export async function getChat(chatId: string) {
  return apiRequest(`/chat/${encodeURIComponent(chatId)}`, { method: "GET" });
}
