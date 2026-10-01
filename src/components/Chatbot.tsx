import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  ChevronDown,
  HelpCircle,
  Leaf,
  ExternalLink,
} from 'lucide-react';
import { ChatMessage, ScanRecord } from '../types';

interface ChatbotProps {
  activeScan?: ScanRecord | null;
  onNavigateToView?: (view: 'dashboard' | 'camera' | 'result' | 'guide') => void;
}

const INITIAL_SUGGESTIONS = [
  'How do I scan a leaf with LeafLens?',
  'What nutrient deficiencies can you detect?',
  'How does offline mode work?',
  'Is my plant photo private and saved?',
  'How do I fix interveinal chlorosis?',
];

export const Chatbot: React.FC<ChatbotProps> = ({ activeScan, onNavigateToView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      role: 'model',
      content:
        "🌿 **Hi, I'm the LeafLens Assistant!**\n\nI can help you with anything about the **LeafLens** web app—like how to use the live camera scanner, how the offline diagnostic guide works, or explaining plant nutrient deficiencies and organic remedies.\n\nWhat can I help you with?",
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    setHasInteracted(true);
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentScan: activeScan
            ? {
                plantName: activeScan.diagnosis.plantName,
                primaryDiagnosis: activeScan.diagnosis.primaryDiagnosis,
                shortSummary: activeScan.diagnosis.shortSummary,
                severity: activeScan.diagnosis.severity,
                visualSymptoms: activeScan.diagnosis.visualSymptoms,
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `model_${Date.now()}`,
        role: 'model',
        content: data.reply || "I'm ready to answer any questions about LeafLens or plant care.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chatbot error:', err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        content: `⚠️ Sorry, I encountered an issue connecting to the assistant (${err.message || 'Network error'}). Please try asking again.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'model',
        content:
          "🌿 **Chat conversation restarted.**\n\nAsk me anything about using the LeafLens web app, leaf deficiency symptoms, foliar remedies, or app features!",
        timestamp: Date.now(),
      },
    ]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to format assistant markdown text cleanly
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }

          // Bullet point
          if (line.trim().startsWith('- ') || line.trim().startsWith('• ') || line.trim().startsWith('* ')) {
            const rawBulletText = line.trim().replace(/^[-•*]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-emerald-400 mt-1 text-[9px] shrink-0">●</span>
                <span dangerouslySetInnerHTML={{ __html: parseInlineStyles(rawBulletText) }} />
              </div>
            );
          }

          // Numbered list (e.g. "1. ")
          const numberedMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
          if (numberedMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="font-semibold text-emerald-400 text-xs shrink-0">{numberedMatch[1]}.</span>
                <span dangerouslySetInnerHTML={{ __html: parseInlineStyles(numberedMatch[2]) }} />
              </div>
            );
          }

          // Heading
          if (line.trim().startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-emerald-300 text-xs mt-2 pt-1 border-t border-slate-700/40">
                {line.trim().replace('### ', '')}
              </h4>
            );
          }

          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: parseInlineStyles(line) }} />
          );
        })}
      </div>
    );
  };

  const parseInlineStyles = (text: string) => {
    // Escape simple HTML
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold **text**
    const bolded = escaped.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
    // Inline code `code`
    const coded = bolded.replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-emerald-300 px-1 py-0.5 rounded text-[11px] font-mono">$1</code>');

    return coded;
  };

  return (
    <>
      {/* Floating Toggle Button in Corner */}
      <div className="fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open LeafLens Assistant"
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-3 rounded-full shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-emerald-400/30"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-100 group-hover:rotate-12 transition-transform duration-200" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-xs leading-tight tracking-wide flex items-center gap-1">
                LeafLens Chat
                <Sparkles className="w-3 h-3 text-emerald-200" />
              </span>
              <span className="text-[10px] text-emerald-100/90 font-medium">Ask questions & guide</span>
            </div>
          </button>
        )}
      </div>

      {/* Expanded Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="LeafLens Chatbot Assistant"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[390px] h-[540px] max-h-[82vh] bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Leaf className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white leading-tight">LeafLens Guide</h3>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-semibold text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">App guide & plant deficiency answers</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart conversation"
                aria-label="Restart conversation"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Nav / Active Context Pill */}
          {activeScan && (
            <div className="px-3 py-1.5 bg-emerald-950/40 border-b border-emerald-900/30 flex items-center justify-between text-[11px] text-emerald-300">
              <span className="truncate">
                🌱 Active Scan: <strong>{activeScan.diagnosis.plantName}</strong> ({activeScan.diagnosis.primaryDiagnosis})
              </span>
              <button
                onClick={() => handleSendMessage(`Explain the ${activeScan.diagnosis.primaryDiagnosis} found in my ${activeScan.diagnosis.plantName} scan and what immediate remedy to apply.`)}
                className="text-xs text-emerald-400 hover:text-emerald-200 underline font-medium ml-2 shrink-0 cursor-pointer"
              >
                Ask about this
              </button>
            </div>
          )}

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`relative group max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                      isUser
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs'
                        : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    ) : (
                      renderFormattedContent(message.content)
                    )}

                    {/* Copy button for model responses */}
                    {!isUser && (
                      <button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        title="Copy answer"
                        className="absolute -bottom-2.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-900 border border-slate-700 rounded-md text-slate-400 hover:text-white cursor-pointer shadow"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-slate-300">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading / Thinking Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-slate-400 flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-medium">LeafLens is thinking</span>
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts (if chat is fresh or just started) */}
          {messages.length <= 3 && !isLoading && (
            <div className="px-3 pb-2 pt-1 border-t border-slate-800/80 bg-slate-900/60">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-emerald-400" />
                Suggested Questions
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto scrollbar-none">
                {INITIAL_SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-[11px] text-left px-2 py-1 rounded-lg bg-slate-800 hover:bg-emerald-950/50 hover:text-emerald-300 hover:border-emerald-500/40 border border-slate-700/70 text-slate-300 transition cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Shortcuts Bar (Camera, Field Guide) */}
          {onNavigateToView && (
            <div className="px-3 py-1 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>App Shortcuts:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onNavigateToView('camera');
                    setIsOpen(false);
                  }}
                  className="text-emerald-400 hover:underline cursor-pointer"
                >
                  Live Camera
                </button>
                <span>•</span>
                <button
                  onClick={() => {
                    onNavigateToView('guide');
                    setIsOpen(false);
                  }}
                  className="text-emerald-400 hover:underline cursor-pointer"
                >
                  Offline Field Guide
                </button>
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about LeafLens, symptoms, remedies..."
                disabled={isLoading}
                className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message"
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:hover:bg-emerald-600 transition cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-slate-500 text-center mt-1.5">
              Powered by LeafLens botanical diagnostics & Gemini AI
            </p>
          </div>
        </div>
      )}
    </>
  );
};
