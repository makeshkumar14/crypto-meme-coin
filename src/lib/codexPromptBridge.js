export const CODEX_PROMPT_EVENT = 'codex-toolbar-prompt';
export const CODEX_PROMPT_STORAGE_KEY = 'codex-toolbar-latest-prompt';

function emptySnapshot() {
  return {
    prompt: '',
    capturedAt: '',
  };
}

function dispatchSnapshot(snapshot) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(CODEX_PROMPT_EVENT, { detail: snapshot }));
}

export function readCodexPromptSnapshot() {
  if (typeof window === 'undefined') {
    return emptySnapshot();
  }

  try {
    const rawSnapshot = window.localStorage.getItem(CODEX_PROMPT_STORAGE_KEY);

    if (!rawSnapshot) {
      return emptySnapshot();
    }

    const parsedSnapshot = JSON.parse(rawSnapshot);

    if (typeof parsedSnapshot?.prompt !== 'string') {
      return emptySnapshot();
    }

    return {
      prompt: parsedSnapshot.prompt,
      capturedAt: typeof parsedSnapshot?.capturedAt === 'string' ? parsedSnapshot.capturedAt : '',
    };
  } catch {
    return emptySnapshot();
  }
}

export function storeCodexPrompt(prompt) {
  const normalizedPrompt = typeof prompt === 'string' ? prompt.trim() : '';

  if (typeof window === 'undefined' || !normalizedPrompt) {
    return null;
  }

  const snapshot = {
    prompt: normalizedPrompt,
    capturedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(CODEX_PROMPT_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore storage failures and still notify the app.
  }

  dispatchSnapshot(snapshot);
  return snapshot;
}

export function clearCodexPrompt() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(CODEX_PROMPT_STORAGE_KEY);
  } catch {
    // Ignore storage failures and still notify the app.
  }

  dispatchSnapshot(emptySnapshot());
}
