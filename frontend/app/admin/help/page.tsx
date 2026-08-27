"use client";

import ChatWorkspace from "@/components/chat/ChatWorkspace";

export default function AdminHelpPage() {
  return (
    <div className="space-y-5">
      <ChatWorkspace
        title="Help inbox"
        description="Admin support conversations from tourists, hotel owners, and activity providers."
        supportOnly
      />
    </div>
  );
}
