import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatInterface from "@/components/chat/ChatInterface";

export default async function BusinessMessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-8 fade-in-up h-full">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">
          Messages
        </h1>
        <p className="text-[var(--foreground)]/60 mt-1 font-medium">
          Chat with creators and coordinate campaign deliverables.
        </p>
      </div>

      <ChatInterface userId={user.id} userType="business" />
    </div>
  );
}
