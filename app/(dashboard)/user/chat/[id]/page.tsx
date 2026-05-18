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
  const sessionId = params.id;
  const [role, setRole] = useState<'user' | 'rider' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const checkRole = async () => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('user_id, rider_id')
        .eq('id', sessionId)
        .single();

      if (data) {
        if (data.user_id === user.id) {
          setRole('user');
        } else if (data.rider_id === user.id) {
          setRole('rider');
        }
      }
      setLoading(false);
    };

    checkRole();
  }, [user, sessionId]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
      </div>
    );
  }

  if (!user || !role) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">You do not have permission to view this chat.</p>
        <Link href="/" className="text-emerald-500 font-semibold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-2xl mx-auto shadow-2xl border-x border-border overflow-hidden flex flex-col">
       <ChatRoom
         sessionId={sessionId}
         role={role}
         currentUserId={user.id}
       />
    </div>
  );
}
