'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Check, CornerDownLeft, RefreshCw } from 'lucide-react';
import { ChatMessage, api } from '@/lib/api';

interface ChatInterfaceProps {
  templateId: string;
  templateName: string;
  currentFields: Record<string, any>;
  onFieldsUpdated: (newFields: Record<string, any>, renderedText?: string) => void;
  documentId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  templateId,
  templateName,
  currentFields,
  onFieldsUpdated,
  documentId,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello, I'm your Legal Counsel Assistant for drafting this **${templateName}**. I will guide you through the required parameters, suggest standard corporate clauses, and populate your agreement in real-time. To begin, who are the primary parties entering into this agreement?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([
    'Use standard sample parties',
    'Set governing law to Delaware',
    'Fill with standard defaults',
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageToSend?: string) => {
    const text = messageToSend || input.trim();
    if (!text || loading) return;

    setInput('');
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      const resp = await api.sendChatMessage({
        template_id: templateId,
        message: text,
        current_fields: currentFields,
        history: newHistory,
        document_id: documentId,
      });

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: resp.reply,
        extracted_fields: resp.extracted_fields,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (resp.suggested_replies && resp.suggested_replies.length > 0) {
        setSuggestedReplies(resp.suggested_replies);
      }

      onFieldsUpdated(resp.all_fields, resp.rendered_content);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Apologies, I encountered a connection issue while processing that parameter. Please try again or edit the field directly in the Form tab.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
      // Ensure focus is kept on input field (fixing Class 10.5 issue!)
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      
      {/* Assistant Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Legal Counsel Assistant</div>
            <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Drafting Session (Cerebras Fast Inference)
            </div>
          </div>
        </div>

        <button
          onClick={() => handleSend('Use standard defaults')}
          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-white border border-slate-200 rounded-md shadow-2xs hover:bg-slate-50 transition"
          title="Auto-fill with standard commercial parameters"
        >
          Auto-fill Defaults
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
              <span>{m.role === 'user' ? 'You' : 'Counsel'}</span>
              <span>•</span>
              <span>{m.timestamp}</span>
            </div>

            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-slate-900 text-white rounded-br-none shadow-sm'
                  : 'bg-slate-100/90 text-slate-800 rounded-bl-none border border-slate-200/60'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>

              {/* Extracted Fields Chips */}
              {m.extracted_fields && Object.keys(m.extracted_fields).length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                  {Object.entries(m.extracted_fields).map(([k, v]) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono"
                    >
                      <Check className="w-2.5 h-2.5" />
                      <strong>{k}:</strong> {String(v)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl w-fit border border-slate-200/60 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
            <span>Analyzing legal provisions &amp; updating clauses...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick-Replies */}
      {suggestedReplies.length > 0 && !loading && (
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/40 flex flex-wrap gap-1.5">
          {suggestedReplies.map((reply, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(reply)}
              className="text-[11px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full shadow-2xs transition truncate max-w-full"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type party names, terms, or ask a legal drafting question..."
            disabled={loading}
            className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 placeholder:text-slate-400"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg transition shadow-sm flex items-center justify-center flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 mt-1.5 px-1">
          Drafting assistance powered by Cerebras fast-inference engine.
        </p>
      </div>

    </div>
  );
};
