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
      // The ID in the URL might be a session_id, gig_id, or direct_request_id
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id, user_id, rider_id')
        .or(`id.eq.${rawId},gig_id.eq.${rawId},direct_request_id.eq.${rawId}`)
        .eq('status', 'active')
        .maybeSingle();

      if (data) {
        setActualSessionId(data.id);
        if (data.user_id === user.id) {
          setRole('user');
        } else if (data.rider_id === user.id) {
          setRole('rider');
        }
      } else {
        console.error("Session not found or RLS block:", error);
      }
      setLoading(false);
    };

    resolveSession();
  }, [user, rawId]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
      </div>
    );
  }

  if (!user || !role || !actualSessionId) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background p-4 text-center">
        <h2 className="text-xl font-bold mb-2 italic">Access Denied</h2>
        <p className="text-muted-foreground mb-4 text-sm max-w-xs mx-auto">
          You do not have permission to view this mission's tactical comms.
        </p>
        <Link href="/" className="text-emerald-500 font-bold flex items-center gap-2 uppercase text-[10px] tracking-widest bg-emerald-500/10 px-6 py-3 rounded-xl border border-emerald-500/20">
          <ArrowLeft className="w-4 h-4" /> Go Home
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
