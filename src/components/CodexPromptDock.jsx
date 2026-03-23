import { useEffect, useState } from 'react';
import {
  CODEX_PROMPT_EVENT,
  clearCodexPrompt,
  readCodexPromptSnapshot,
} from '../lib/codexPromptBridge';

function formatCapturedTime(capturedAt) {
  if (!capturedAt) {
    return 'Just now';
  }

  return new Date(capturedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function CodexPromptDock() {
  const [snapshot, setSnapshot] = useState(() => readCodexPromptSnapshot());
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return undefined;
    }

    const handlePromptUpdate = (event) => {
      setSnapshot(event.detail ?? readCodexPromptSnapshot());
      setCopyMessage('');
    };

    window.addEventListener(CODEX_PROMPT_EVENT, handlePromptUpdate);

    return () => {
      window.removeEventListener(CODEX_PROMPT_EVENT, handlePromptUpdate);
    };
  }, []);

  useEffect(() => {
    if (!copyMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyMessage('');
    }, 1800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copyMessage]);

  if (!import.meta.env.DEV || !snapshot.prompt) {
    return null;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snapshot.prompt);
      setCopyMessage('Copied');
    } catch {
      setCopyMessage('Select the text and copy it manually.');
    }
  }

  function handleClear() {
    clearCodexPrompt();
    setSnapshot(readCodexPromptSnapshot());
    setCopyMessage('');
  }

  return (
    <aside className="fixed bottom-4 right-4 z-[80] w-[min(26rem,calc(100vw-2rem))] rounded-[28px] border border-cyan-400/25 bg-slate-950/90 p-4 text-left shadow-[0_24px_80px_rgba(6,182,212,0.2)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
            Codex Prompt
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            21st.dev cannot push straight into Codex, so the latest toolbar prompt is mirrored
            here.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300">
          {formatCapturedTime(snapshot.capturedAt)}
        </span>
      </div>

      <textarea
        readOnly
        value={snapshot.prompt}
        className="mt-4 h-40 w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-xs leading-6 text-slate-100 outline-none"
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          {copyMessage || 'Use Copy for Codex, then paste the prompt into this chat.'}
        </p>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/5"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100 transition hover:border-cyan-200/30 hover:bg-cyan-300/15"
          >
            Copy for Codex
          </button>
        </div>
      </div>
    </aside>
  );
}
