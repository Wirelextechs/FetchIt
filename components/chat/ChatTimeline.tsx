"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  message_type: "text" | "system" | "wallet_action";
  created_at: string;
}

interface ChatTimelineProps {
  messages: Message[];
  currentUserId: string;
  shopperId: string;
  shopperName: string;
}

export function ChatTimeline({ messages, currentUserId, shopperId, shopperName }: ChatTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
      {messages.map((msg) => {
        const isMe = msg.sender_id === currentUserId;
        const isShopper = msg.sender_id === shopperId;
        const isSystem = msg.message_type === "system" || msg.message_type === "wallet_action";

        if (isSystem) {
          return (
            <div key={msg.id} className="flex justify-center my-2">
              <span className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                {msg.content}
              </span>
            </div>
          );
        }

        return (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[80%]",
              isMe ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            {isShopper && (
              <div className="flex items-center space-x-1 mb-1 ml-1">
                <span className="text-xs font-semibold text-slate-700">{shopperName}</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 rounded-full border border-emerald-200">
                  Verified Company Shopper
                </span>
              </div>
            )}
            <div
              className={cn(
                "px-4 py-2 rounded-2xl text-sm shadow-sm",
                isMe
                  ? "bg-slate-900 text-white rounded-br-none"
                  : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
              )}
            >
              {msg.content}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 mx-1">
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
