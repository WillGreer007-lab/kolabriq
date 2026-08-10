const fs = require("fs");
const pages = [
  "business/campaigns", "business/profile", "business/settings",
  "creator/campaigns", "creator/earnings", "creator/profile", "creator/settings"
];
const content = `import { Clock } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center fade-in-up">
      <div className="w-20 h-20 bg-[#10B981]/10 text-[#10B981] rounded-full flex items-center justify-center mb-6">
        <Clock size={40} />
      </div>
      <h1 className="text-3xl font-heading font-extrabold text-[var(--foreground)] mb-4 tracking-tight">Coming Soon</h1>
      <p className="text-[var(--foreground)]/60 text-lg max-w-md font-medium">
        We are actively building this feature in our next phase of development.
      </p>
    </div>
  );
}`;

pages.forEach(p => fs.writeFileSync(`src/app/dashboard/${p}/page.tsx`, content));
console.log("Pages created.");
