import { createClient } from "@/lib/supabase/server";
import { Code, Copy, AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TrackingScriptPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const trackingSnippet = `<!-- Adswish Tracking Pixel -->
<script>
  (function(k,o,l,a,b,r,i,q){
    k['AdswishObject']=b;k[b]=k[b]||function(){
    (k[b].q=k[b].q||[]).push(arguments)},k[b].l=1*new Date();r=o.createElement(l),
    i=o.getElementsByTagName(l)[0];r.async=1;r.src=a;i.parentNode.insertBefore(r,i)
  })(window,document,'script','https://adswish.com/track.js','kq');

  kq('init', '${user.id}');
</script>
<!-- End Adswish Tracking Pixel -->`;

  const conversionSnippet = `<!-- Adswish Conversion Event -->
<script>
  kq('track', 'purchase', {
    order_id: 'ORDER_12345', // Replace dynamically
    value: 100.00,           // Replace dynamically
    currency: 'GBP'
  });
</script>
<!-- End Adswish Conversion Event -->`;

  return (
    <div className="space-y-8 fade-in-up w-full">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">
          Tracking Scripts
        </h1>
        <p className="text-[var(--foreground)]/60 mt-1 font-medium">
          Install these scripts on your e-commerce store to track clicks and sales from your creators.
        </p>
      </div>

      <div className="pixis-card bg-white p-8 border border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
            <Code size={20} />
          </div>
          <h2 className="text-xl font-bold">1. Base Tracking Pixel</h2>
        </div>
        <p className="text-[var(--text-secondary)] mb-4 text-sm font-medium">
          Paste this code into the <code className="bg-[#F5F5F0] px-1 rounded text-red-500">&lt;head&gt;</code> section of every page on your website. This enables cookie tracking when a user clicks a creator's link.
        </p>
        <div className="relative mb-8">
          <pre className="bg-[#1C1C1E] text-white p-4 rounded-xl text-sm font-mono overflow-x-auto">
            {trackingSnippet}
          </pre>
        </div>

        <div className="flex items-center gap-3 mb-6 pt-8 border-t border-[var(--border-subtle)]">
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]">
            <AlertCircle size={20} />
          </div>
          <h2 className="text-xl font-bold">2. Conversion Event</h2>
        </div>
        <p className="text-[var(--text-secondary)] mb-4 text-sm font-medium">
          Place this code on your "Thank You" or order confirmation page. Make sure to dynamically replace the <code>order_id</code> and <code>value</code> with the actual order details from your store.
        </p>
        <div className="relative">
          <pre className="bg-[#1C1C1E] text-white p-4 rounded-xl text-sm font-mono overflow-x-auto">
            {conversionSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
