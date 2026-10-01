import React from "react";
import {
  Clock,
  Truck,
  Navigation,
  Fuel,
  Building2,
  Sparkles,
  Anchor,
} from "lucide-react";
import { SUGGESTED_PROMPTS } from "../hooks/useAiAssistant";

interface AiPromptSuggestionsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  Clock,
  Truck,
  Navigation,
  Fuel,
  Building2,
  Anchor,
};

export const AiPromptSuggestions: React.FC<AiPromptSuggestionsProps> = ({
  onSelectPrompt,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground px-1 select-none">
        <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        <span>Gợi ý tác vụ phân tích AI</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => {
          const Icon = iconMap[prompt.icon] || Sparkles;

          return (
            <button
              key={prompt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPrompt(prompt.text)}
              className="text-left p-2.5 rounded-xl border border-border/80 bg-card/60 hover:bg-card hover:border-primary/50 hover:shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none group flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                  {prompt.category}
                </span>
              </div>
              <p className="text-xs text-foreground font-medium line-clamp-2 leading-relaxed">
                {prompt.text}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
