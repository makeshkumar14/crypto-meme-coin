import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';

const starterPrompts = [
  'What is a meme coin?',
  'Explain liquidity in simple words',
  'What is the best meme to launch around right now?',
  'Is PEPE looking organic or fake hype?',
];

export function ChatAssistant() {
  const { chatWithAssistant, user } = useAppContext();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: user
        ? 'Ask about any meme coin, crypto basics, your watchlist reminders, launch timing, or name ideas.'
        : 'Ask about any tracked meme coin, crypto basics, launch timing, or name ideas. Sign in if you want personal reminder answers too.',
      suggestions: starterPrompts,
    },
  ]);

  useEffect(() => {
    setMessages((current) => {
      const [firstMessage, ...rest] = current;
      if (!firstMessage || firstMessage.id !== 'welcome') {
        return current;
      }

      return [
        {
          ...firstMessage,
          text: user
            ? 'Ask about any meme coin, crypto basics, your watchlist reminders, launch timing, or name ideas.'
            : 'Ask about any tracked meme coin, crypto basics, launch timing, or name ideas. Sign in if you want personal reminder answers too.',
        },
        ...rest,
      ];
    });
  }, [user]);

  const quickPrompts = useMemo(() => {
    const latestAssistant = [...messages].reverse().find((message) => message.role === 'assistant');
    return latestAssistant?.suggestions?.length ? latestAssistant.suggestions : starterPrompts;
  }, [messages]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) {
      return;
    }

    setMessages((current) => [...current, { id: `${Date.now()}-user`, role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithAssistant(trimmed);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text: response.reply,
          suggestions: response.suggestions || [],
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: 'assistant',
          text: error.message || 'I could not answer right now. Try again after the dashboard refreshes.',
          suggestions: starterPrompts,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((value) => !value)}
        className={`fixed bottom-4 left-4 z-[70] flex items-center gap-3 rounded-full border border-cyan-400/20 bg-slate-950/90 px-5 py-4 text-base font-semibold text-cyan-100 shadow-[0_20px_60px_rgba(6,182,212,0.18)] backdrop-blur-xl transition hover:bg-slate-900 ${open ? '' : 'animate-corner-bounce hover:animate-none'}`}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        Meme AI
      </button>

      {open ? (
        <aside className="fixed bottom-20 left-4 z-[70] flex h-[min(44rem,calc(100vh-7rem))] w-[min(42rem,calc(100vw-2rem))] flex-col rounded-[32px] border border-cyan-400/20 bg-slate-950/95 p-5 shadow-[0_30px_100px_rgba(8,145,178,0.25)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Grounded Chat</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
                Answers are grounded in the live meme coin dataset, your saved settings, and a built-in beginner learning guide.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cyan-200">
              <Bot size={20} />
            </div>
          </div>

          <div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl px-4 py-3 text-sm leading-7 ${
                  message.role === 'user'
                    ? 'ml-8 bg-cyan-400 text-slate-950 sm:ml-16'
                    : 'mr-8 border border-white/10 bg-white/[0.04] text-slate-100 sm:mr-16'
                }`}
              >
                {message.text}
              </div>
            ))}
            {loading ? (
              <div className="mr-8 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 sm:mr-16">
                Thinking through the latest signals...
              </div>
            ) : null}
          </div>

          <div className="mt-5">
            <div className="mb-4 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-200 transition hover:bg-white/[0.08]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2.5">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask about a coin, crypto basics, launch timing, or reminders"
                className="w-full bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400 text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}
