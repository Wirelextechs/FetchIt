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
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
      {messages.map((msg) => {
        const isMe = msg.sender_id === currentUserId;
        const isShopper = msg.sender_id === shopperId;
        const isSystem = msg.message_type === "system" || msg.message_type === "wallet_action";

        if (isSystem) {
          return (
            <div key={msg.id} className="flex justify-center my-2">
              <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full font-medium shadow-sm border border-border">
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
                <span className="text-xs font-semibold text-foreground">{shopperName}</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] text-emerald-500 font-medium bg-emerald-500/10 px-1.5 rounded-full border border-emerald-500/20">
                  Verified Company Shopper
                </span>
              </div>
            )}
            <div
              className={cn(
                "px-4 py-2 rounded-2xl text-sm shadow-sm",
                isMe
                  ? "bg-foreground text-background rounded-br-none"
                  : "bg-card text-foreground border border-border rounded-bl-none"
              )}
            >
              {msg.content}
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 mx-1">
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
