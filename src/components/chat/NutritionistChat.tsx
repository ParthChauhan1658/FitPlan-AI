"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { X, Send, MessageCircle, Bot, User, Sparkles } from "lucide-react";
import { useChatContext } from "@/context/ChatContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  "Swap a meal",
  "Explain my macros",
  "Simplify a recipe",
  "High-protein snack idea",
];

// Very lightweight markdown renderer: handles **bold**, bullet lists, line breaks
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      nodes.push(<br key={`br-${i}`} />);
      continue;
    }

    const isBullet = /^[\-\*•] /.test(line);
    const cleanLine = isBullet ? line.replace(/^[\-\*•] /, "") : line;

    // Bold processing: **text**
    const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (isBullet) {
      nodes.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span className="text-brand-coral mt-0.5 flex-shrink-0">•</span>
          <span>{rendered}</span>
        </div>
      );
    } else {
      nodes.push(<p key={i} className="my-0.5">{rendered}</p>);
    }
  }

  return nodes;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-6 h-6 rounded-full bg-brand-coral/20 flex items-center justify-center flex-shrink-0">
        <Bot className="w-3.5 h-3.5 text-brand-coral" />
      </div>
      <div className="bg-white/5 border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-brand-coral/70"
              style={{
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function NutritionistChat() {
  const { planContext } = useChatContext();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      const userMsg: Message = { role: "user", content: trimmed };
      const newHistory = [...messages, userMsg];
      setMessages(newHistory);
      setInput("");
      setStreaming(true);

      // Add placeholder assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const abort = new AbortController();
      abortRef.current = abort;

      try {
        const res = await fetch("/api/chat-nutritionist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newHistory,
            planContext: planContext ?? null,
          }),
          signal: abort.signal,
        });

        if (!res.ok || !res.body) throw new Error("Stream failed");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: accumulated,
            };
            return updated;
          });
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: "Sorry, something went wrong. Please try again.",
            };
            return updated;
          });
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, planContext, streaming]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClose = () => {
    abortRef.current?.abort();
    setOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open AI Nutritionist Chat"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          open ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        }`}
        style={{
          background: "linear-gradient(135deg, #FF6044 0%, #FFB347 100%)",
          boxShadow: "0 0 0 0 rgba(255,96,68,0.5)",
          animation: "chat-pulse 2.5s ease-out infinite",
        }}
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-brand-teal border-2 border-brand-dark" />
      </button>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={handleClose}
        />
      )}

      {/* Chat Panel */}
      <div
        className={`fixed bottom-0 right-0 z-50 flex flex-col bg-brand-dark border-l border-t border-brand-border shadow-2xl transition-all duration-300 ease-in-out
          w-full h-[85vh]
          md:w-[400px] md:h-[600px] md:bottom-6 md:right-6 md:rounded-2xl md:border
          ${open ? "translate-y-0 opacity-100" : "translate-y-full md:translate-y-4 opacity-0 pointer-events-none"}`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-brand-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #FF6044 0%, #FFB347 100%)" }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">AI Nutritionist</p>
              <p className="text-xs text-gray-500 mt-0.5">Powered by FitPlan AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {planContext && (
              <span className="text-xs px-2 py-1 rounded-lg bg-brand-teal/10 text-brand-teal border border-brand-teal/20 font-medium">
                {planContext.planType} Plan
              </span>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 pb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(255,96,68,0.15) 0%, rgba(255,179,71,0.15) 100%)" }}>
                <Bot className="w-8 h-8 text-brand-coral" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Your AI Nutritionist</p>
                <p className="text-gray-500 text-sm max-w-[260px]">
                  Ask me anything about your meal plan, nutrition, or healthy eating.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 mb-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user"
                    ? "bg-brand-teal/20"
                    : "bg-brand-coral/20"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-3.5 h-3.5 text-brand-teal" />
                ) : (
                  <Bot className="w-3.5 h-3.5 text-brand-coral" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-brand-coral/15 border border-brand-coral/25 text-white rounded-2xl rounded-br-sm"
                    : "bg-white/5 border border-white/8 text-gray-200 rounded-2xl rounded-bl-sm border-l-2 border-l-brand-coral/40"
                }`}
              >
                {msg.role === "assistant" && msg.content
                  ? renderMarkdown(msg.content)
                  : msg.content}
              </div>
            </div>
          ))}

          {streaming && messages[messages.length - 1]?.content === "" && (
            <TypingIndicator />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => sendMessage(action)}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-brand-coral/25 text-brand-coral/80 hover:bg-brand-coral/10 hover:text-brand-coral transition-all font-medium"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t border-brand-border flex-shrink-0">
          <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-brand-coral/40 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your plan, nutrition, or recipes…"
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 resize-none outline-none max-h-24 overflow-y-auto"
              style={{ minHeight: "24px" }}
              disabled={streaming}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || streaming}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
              style={{
                background: input.trim() && !streaming
                  ? "linear-gradient(135deg, #FF6044 0%, #FFB347 100%)"
                  : "rgba(255,255,255,0.08)",
              }}
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <p className="text-xs text-gray-700 mt-1.5 text-center">
            Not a substitute for professional medical advice
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes chat-pulse {
          0% { box-shadow: 0 0 0 0 rgba(255,96,68,0.5); }
          70% { box-shadow: 0 0 0 12px rgba(255,96,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,96,68,0); }
        }
      `}</style>
    </>
  );
}
