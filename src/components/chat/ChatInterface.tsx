"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, Loader2, Paperclip, FileText, ExternalLink } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

export default function ChatInterface({ userId, userType }: { userId: string, userType: 'business' | 'creator' }) {
  const supabase = createClient();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial conversations
  useEffect(() => {
    const fetchConversations = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*, campaigns(title), business:business_id(raw_user_meta_data), creator:creator_id(raw_user_meta_data)")
        .or(`business_id.eq.${userId},creator_id.eq.${userId}`);
      
      if (data) {
        setConversations(data);
        if (data.length > 0) setActiveConversation(data[0]);
      }
      setLoading(false);
    };
    fetchConversations();
  }, [userId, supabase]);

  // Fetch and subscribe to messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConversation.id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    fetchMessages();

    // Subscribe to Realtime new messages
    const channel = supabase
      .channel(`chat_${activeConversation.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConversation.id}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, supabase]);

  const sendMessage = async (e?: React.FormEvent, attachmentUrl?: string) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !attachmentUrl) || !activeConversation) return;

    const msg = newMessage;
    setNewMessage(""); // Optimistic clear

    await supabase.from("messages").insert([{
      conversation_id: activeConversation.id,
      sender_id: userId,
      content: msg || (attachmentUrl ? "Sent an attachment" : ""),
      attachment_url: attachmentUrl || null
    }]);
  };

  const handleCloudinarySuccess = async (resultInfo: any) => {
    setUploading(true);
    try {
      const url = resultInfo.secure_url;
      await sendMessage(undefined, url);
    } catch (e) {
      console.error(e);
      alert("Failed to send attachment");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#10B981]" /></div>;

  if (conversations.length === 0) {
    return (
      <div className="pixis-card p-12 text-center border border-[var(--border-subtle)] bg-white">
        <h3 className="font-heading font-extrabold text-xl mb-2">No Messages Yet</h3>
        <p className="text-[var(--foreground)]/60">When you accept a campaign, a chat will open here.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[70vh] bg-white border border-[var(--border-subtle)] rounded-3xl overflow-hidden pixis-card">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-[var(--border-subtle)] bg-[#F5F5F0]/30 overflow-y-auto">
        {conversations.map(conv => {
          const otherUser = userType === 'business' ? conv.creator : conv.business;
          const otherName = otherUser?.raw_user_meta_data?.full_name || otherUser?.raw_user_meta_data?.company_name || "User";
          
          return (
            <button
              key={conv.id}
              onClick={() => setActiveConversation(conv)}
              className={`w-full text-left p-4 border-b border-[var(--border-subtle)] transition-colors hover:bg-white ${activeConversation?.id === conv.id ? 'bg-white border-l-4 border-l-[#10B981]' : ''}`}
            >
              <div className="font-bold text-[var(--foreground)] truncate">{otherName}</div>
              <div className="text-xs text-[var(--foreground)]/60 truncate mt-1">
                Campaign: {conv.campaigns?.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Chat Area */}
      <div className="w-2/3 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] bg-white">
          <h2 className="font-heading font-extrabold text-lg">
            {userType === 'business' 
              ? activeConversation.creator?.raw_user_meta_data?.full_name 
              : activeConversation.business?.raw_user_meta_data?.company_name || activeConversation.business?.raw_user_meta_data?.full_name}
          </h2>
          <p className="text-xs text-[#10B981] font-bold">{activeConversation.campaigns?.title}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F5F0]/10">
          {messages.map((msg, i) => {
            const isMe = msg.sender_id === userId;
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe ? 'bg-[#10B981] text-white rounded-tr-sm' : 'bg-white border border-[var(--border-subtle)] text-[var(--foreground)] rounded-tl-sm'}`}>
                  {msg.content && <p>{msg.content}</p>}
                  {msg.attachment_url && (
                    <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 p-2 bg-black/10 rounded-lg hover:bg-black/20 transition-colors">
                      <FileText size={16} />
                      <span className="font-bold underline text-xs">View Attachment</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-[var(--border-subtle)]">
          <form onSubmit={(e) => sendMessage(e)} className="flex gap-2 items-center">
            {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
              <CldUploadWidget 
                uploadPreset="ml_default"
                onSuccess={(result: any) => handleCloudinarySuccess(result.info)}
                options={{ multiple: false }}
              >
                {({ open }) => (
                  <button 
                    type="button"
                    onClick={() => open()}
                    disabled={uploading}
                    className="p-2 text-[var(--foreground)]/50 hover:text-[#10B981] transition-colors"
                    title="Attach File"
                  >
                    {uploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
                  </button>
                )}
              </CldUploadWidget>
            )}
            
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-[#F5F5F0] border border-[var(--border-subtle)] rounded-xl px-4 py-2 focus:outline-none focus:border-[#10B981] transition-colors"
            />
            <button type="submit" disabled={!newMessage.trim()} className="btn-primary p-2 px-4 rounded-xl flex items-center justify-center">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
