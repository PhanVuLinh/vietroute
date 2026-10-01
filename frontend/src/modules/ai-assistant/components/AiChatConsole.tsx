import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Copy,
  Check,
  Mic,
  MicOff,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import type { AiChatMessage } from "../hooks/useAiAssistant";
import { AiInsightCards } from "./AiInsightCards";
import { cn } from "@/shared/utils/cn";
import { toast } from "@/shared/components/feedback/Toast";

interface AiChatConsoleProps {
  messages: AiChatMessage[];
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
}

export const AiChatConsole: React.FC<AiChatConsoleProps> = ({
  messages,
  isTyping,
  onSendMessage,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isTyping) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Tính năng nhận diện giọng nói tiếng Việt
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Trình duyệt không hỗ trợ Web Speech API nhận diện giọng nói.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "vi-VN";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Lỗi micro:", err);
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
      {/* 1. Console Header */}
      <div className="p-3.5 sm:p-4 border-b border-border/80 flex items-center justify-between bg-card/80 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs sm:text-sm text-foreground">
                VietRoute Copilot
              </h3>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Trực tuyến</span>
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Hệ thống RAG hỗ trợ ra quyết định & tối ưu hóa vận hành
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearChat}
          className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
          title="Làm mới cuộc trò chuyện"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Làm mới hội thoại</span>
        </Button>
      </div>

      {/* 2. Message History Box */}
      <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-4 min-h-[350px]">
        {messages.map((msg) => {
          const isAi = msg.sender === "AI";

          return (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 max-w-[92%] sm:max-w-[85%]",
                isAi ? "mr-auto items-start" : "ml-auto flex-row-reverse items-start"
              )}
            >
              {/* Avatar Chip */}
              <div
                className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold",
                  isAi
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-muted text-foreground border border-border"
                )}
              >
                {isAi ? <Sparkles className="h-3.5 w-3.5 text-primary" /> : <User className="h-3.5 w-3.5" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1 min-w-0">
                <div
                  className={cn(
                    "p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed relative group",
                    isAi
                      ? "bg-muted/50 border border-border/80 text-foreground rounded-tl-sm shadow-2xs"
                      : "bg-primary text-primary-foreground rounded-tr-sm shadow-xs font-medium"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Insight Action Card if present */}
                  {msg.insights && <AiInsightCards insights={msg.insights} />}

                  {/* Copy button */}
                  {isAi && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                      title="Sao chép câu trả lời"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>

                <div
                  className={cn(
                    "text-[10px] text-muted-foreground px-1 font-mono",
                    !isAi && "text-right"
                  )}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-start">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="p-3 bg-muted/50 border border-border/80 rounded-2xl rounded-tl-sm text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
              <span>Copilot đang phân tích số liệu...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Footer Form */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-border/80 bg-card/90 shrink-0">
        {isListening && (
          <div className="mb-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 flex items-center gap-2 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span>Đang lắng nghe giọng nói tiếng Việt... Hãy nói câu hỏi điều hành của bạn.</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Hỏi trợ lý AI hoặc bấm micro để nói..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            className="flex-1 h-10 text-xs sm:text-sm bg-background font-sans"
          />

          {/* Micro Button */}
          <Button
            type="button"
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={toggleListening}
            className={`h-10 w-10 shrink-0 cursor-pointer ${
              isListening ? "animate-pulse shadow-md" : ""
            }`}
            title={isListening ? "Dừng ghi âm" : "Ra lệnh bằng giọng nói tiếng Việt"}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4 text-primary" />
            )}
          </Button>

          {/* Send Button */}
          <Button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="h-10 px-4 gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
          >
            <span>Gửi</span>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
