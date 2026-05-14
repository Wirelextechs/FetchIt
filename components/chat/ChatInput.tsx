"use client";

import { useState } from "react";
import { Send, Image as ImageIcon } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 p-3 safe-area-bottom z-10 sticky bottom-0">
      <div className="flex items-end space-x-2 bg-slate-100 rounded-2xl p-1 border border-slate-200 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400 transition-all">
        <button
          disabled={disabled}
          className="p-3 text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 text-sm text-slate-800 disabled:opacity-50 outline-none"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="p-3 text-emerald-600 disabled:text-slate-400 hover:bg-emerald-50 rounded-xl transition-colors mb-0.5"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
