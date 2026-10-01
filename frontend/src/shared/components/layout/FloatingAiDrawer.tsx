import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  X,
  MessageSquare,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/shared/components/ui/sheet";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { useAiAssistant } from "@/modules/ai-assistant/hooks/useAiAssistant";
import { AiChatConsole } from "@/modules/ai-assistant/components/AiChatConsole";
import { AiAnomalyMonitor } from "@/modules/ai-assistant/components/AiAnomalyMonitor";
import { AiEtaCalculator } from "@/modules/ai-assistant/components/AiEtaCalculator";

export const FloatingAiDrawer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { messages, isTyping, sendMessage, clearChat } = useAiAssistant();

  // Phím tắt toàn cầu Alt + A để bật/tắt Trợ lý AI
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* 1. Nút nổi Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40 group">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative flex items-center gap-2 p-3.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
          title="Mở Trợ lý AI Copilot (Phím tắt: Alt + A)"
        >
          <div className="relative">
            <Bot className="h-5 w-5 animate-bounce" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
          </div>

          <span className="hidden sm:inline font-bold text-xs tracking-tight">
            AI Copilot
          </span>

          <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] bg-white/20 text-white/90 font-mono">
            Alt+A
          </span>
        </button>
      </div>

      {/* 2. Side Drawer Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="p-0 w-full sm:max-w-md md:max-w-lg border-l border-border flex flex-col h-full bg-background">
          <SheetTitle className="sr-only">VietRoute AI Copilot Drawer</SheetTitle>

          {/* Drawer Header */}
          <div className="p-3.5 border-b border-border flex items-center justify-between bg-card/80 shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">
                  VietRoute AI Assistant (Toàn Cục)
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Sẵn sàng giải đáp dữ liệu vận hành từ mọi phân hệ
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Drawer Body with Tabs */}
          <div className="flex-1 min-h-0 flex flex-col p-3 overflow-hidden">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid grid-cols-3 h-8 bg-muted/80 p-0.5 shrink-0 mb-3">
                <TabsTrigger value="chat" className="text-xs font-semibold gap-1 py-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>Chat Copilot</span>
                </TabsTrigger>
                <TabsTrigger value="anomalies" className="text-xs font-semibold gap-1 py-1">
                  <ShieldAlert className="h-3 w-3" />
                  <span>Bất thường</span>
                </TabsTrigger>
                <TabsTrigger value="eta" className="text-xs font-semibold gap-1 py-1">
                  <Zap className="h-3 w-3" />
                  <span>Tính ETA</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 min-h-0 m-0">
                <AiChatConsole
                  messages={messages}
                  isTyping={isTyping}
                  onSendMessage={sendMessage}
                  onClearChat={clearChat}
                />
              </TabsContent>

              <TabsContent value="anomalies" className="flex-1 min-h-0 m-0 overflow-y-auto pr-1">
                <AiAnomalyMonitor />
              </TabsContent>

              <TabsContent value="eta" className="flex-1 min-h-0 m-0 overflow-y-auto pr-1">
                <AiEtaCalculator />
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
