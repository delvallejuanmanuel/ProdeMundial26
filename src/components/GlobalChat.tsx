"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

type ChatMessage = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { nickname: string };
};

export default function GlobalChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Inicialización: cargar usuario y últimos mensajes
  useEffect(() => {
    const fetchUserAndMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data } = await supabase
        .from('global_chat_messages')
        .select('*, profiles(nickname)')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (data) {
        setMessages(data.reverse());
        
        // Calcular mensajes no leídos iniciales
        if (typeof window !== 'undefined') {
          const lastReadStr = localStorage.getItem('prode_chat_last_read');
          if (lastReadStr) {
            const lastRead = new Date(lastReadStr).getTime();
            const unread = data.filter(m => new Date(m.created_at).getTime() > lastRead).length;
            if (!isOpen) {
              setUnreadCount(unread);
            }
          } else {
            // Si nunca abrió el chat, marcamos todos como no leídos
            setUnreadCount(data.length);
          }
        }
      }
      setIsLoading(false);
    };
    
    fetchUserAndMessages();
  }, [supabase]);

  // Suscripción Realtime a nuevos mensajes
  useEffect(() => {
    const channel = supabase
      .channel('chat_room')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'global_chat_messages' 
      }, async (payload) => {
        const newMsg = payload.new as ChatMessage;
        
        // Si no viene el join de profile (porque Realtime no hace joins),
        // buscamos el nickname del usuario manualmente.
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', newMsg.user_id)
          .single();
          
        newMsg.profiles = profile || { nickname: 'Usuario' };
        
        setMessages(prev => [...prev, newMsg]);
        
        // Aumentamos contador de no leídos si el chat está cerrado
        setIsOpen((currentIsOpen) => {
          if (!currentIsOpen) {
            setUnreadCount(prev => prev + 1);
          } else {
            if (typeof window !== 'undefined') {
              localStorage.setItem('prode_chat_last_read', new Date().toISOString());
            }
          }
          return currentIsOpen;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Auto-scroll al final cuando se abre o llegan mensajes nuevos
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      if (typeof window !== 'undefined') {
        localStorage.setItem('prode_chat_last_read', new Date().toISOString());
      }
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const msgContent = newMessage;
    setNewMessage(""); // Limpiar input inmediatamente

    await supabase
      .from('global_chat_messages')
      .insert({ user_id: user.id, content: msgContent });
  };

  if (isLoading || !user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MessageCircle size={20} />
              Bar del Prode
            </h3>
            <button onClick={toggleChat} className="text-white/80 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
            {messages.length === 0 ? (
              <p className="text-center text-slate-500 text-sm mt-10">
                Aún no hay mensajes. ¡Sé el primero en romper el hielo!
              </p>
            ) : (
              messages.map(msg => {
                const isMine = user && msg.user_id === user.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-slate-500 mb-1 px-1">
                      {isMine ? 'Tú' : msg.profiles?.nickname || 'Usuario'}
                    </span>
                    <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm ${isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-100 dark:border-slate-700'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
            {user ? (
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0 shadow-sm"
                >
                  <Send size={18} className="-ml-0.5" />
                </button>
              </form>
            ) : (
              <div className="text-center text-sm text-slate-500 py-2">
                Inicia sesión para participar en el chat
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="relative bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
        
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950 animate-in zoom-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
