"use client";

import { use, useEffect, useState } from "react";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function UserChatPage(props: { params: Promise<{ id: string }> }) {
  const { user, loading: authLoading } = useAuth();
  const params = use(props.params);
  const rawId = params.id;
  const [role, setRole] = useState<'user' | 'rider' | null>(null);
  const [loading, setLoading] = useState(true);
  const [actualSessionId, setActualSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const resolveSession = async () => {
      console.log(`[ChatResolve] Attempting to resolve session for ID: ${rawId}`);

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id, user_id, rider_id, status')
        .or(`id.eq.${rawId},gig_id.eq.${rawId},direct_request_id.eq.${rawId}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("[ChatResolve] Supabase error:", error);
      }

      if (data) {
        console.log("[ChatResolve] Session found:", data.id, "Status:", data.status);
        setActualSessionId(data.id);

        if (data.user_id === user.id) {
          setRole('user');
        } else if (data.rider_id === user.id) {
          setRole('rider');
        } else {
          console.warn("[ChatResolve] User is not a participant. User:", user.id, "Participants:", data.user_id, data.rider_id);
        }
      } else {
        console.warn("[ChatResolve] No session found for this ID.");
      }
      setLoading(false);
    };

    resolveSession();
  }, [user, rawId]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
           <Loader2 className="animate-spin text-emerald-500 w-10 h-10 mx-auto mb-4" />
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Initializing Tactical Link...</p>
        </div>
      </div>
    );
  }

  if (!user || !role || !actualSessionId) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background p-8 text-center">
        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-6 border border-rose-500/20">
           <ArrowLeft className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black mb-2 italic tracking-tighter">Tactical Lockout</h2>
        <p className="text-muted-foreground mb-8 text-sm max-w-xs mx-auto leading-relaxed font-medium">
          You do not have the required clearance to view this mission&apos;s communication channel.
        </p>
        <Link href="/" className="w-full max-w-xs text-emerald-500 font-bold flex items-center justify-center gap-3 uppercase text-[11px] tracking-[0.2em] bg-emerald-500/10 px-8 py-5 rounded-[24px] border border-emerald-500/20 hover:bg-emerald-500/20 transition-all active:scale-95 shadow-2xl shadow-emerald-500/10">
          <ArrowLeft className="w-4 h-4" /> Return to HQ
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-2xl mx-auto shadow-2xl border-x border-border overflow-hidden flex flex-col bg-background">
       <ChatRoom
         sessionId={actualSessionId}
         role={role}
         currentUserId={user.id}
       />
    </div>
  );
}
