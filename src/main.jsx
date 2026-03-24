import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ChatAssistant } from './components/ChatAssistant';
import { CodexPromptDock } from './components/CodexPromptDock';
import { AppProvider } from './context/AppContext';
import { storeCodexPrompt } from './lib/codexPromptBridge';
import './styles.css';

const codexPromptPlugin = {
  displayName: 'Codex Bridge',
  pluginName: 'codex-bridge',
  description: 'Keeps the latest 21st.dev prompt ready for Codex.',
  iconSvg: null,
  onPromptTransmit: async (prompt) => {
    const snapshot = storeCodexPrompt(prompt);

    if (!snapshot || typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(snapshot.prompt);
    } catch {
      // The dock still keeps the latest prompt available.
    }
  },
};

const toolbarConfig = {
  plugins: [codexPromptPlugin],
};

const TOOLBAR_ROOT_ID = 'stagewise-toolbar-root';
const TOOLBAR_ANCHOR_TAG = 'stagewise-companion-anchor';

async function mountTwentyFirstToolbar() {
  if (!import.meta.env.DEV) {
    return;
  }

  if (!document.body || document.body.querySelector(TOOLBAR_ANCHOR_TAG)) {
    return;
  }

  const existingToolbarRoot = document.getElementById(TOOLBAR_ROOT_ID);
  if (existingToolbarRoot) {
    existingToolbarRoot.remove();
  }

  try {
    const { TwentyFirstToolbar } = await import('@21st-extension/toolbar-react');

    const toolbarRoot = document.createElement('div');
    toolbarRoot.id = TOOLBAR_ROOT_ID;
    document.body.appendChild(toolbarRoot);

    ReactDOM.createRoot(toolbarRoot).render(
      <React.StrictMode>
        <TwentyFirstToolbar config={toolbarConfig} enabled />
      </React.StrictMode>,
    );

    window.setTimeout(() => {
      if (!document.body?.querySelector(TOOLBAR_ANCHOR_TAG)) {
        console.warn(
          '[21st.dev] Toolbar did not initialize. Install the 21st.dev IDE extension, keep a single IDE window open, and select the target window from the toolbar settings.',
        );
      }
    }, 500);
  } catch (error) {
    console.error(
      '[21st.dev] Failed to mount the toolbar. Prompts will not reach the IDE until the toolbar is running.',
      error,
    );
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
        <ChatAssistant />
        <CodexPromptDock />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountTwentyFirstToolbar, { once: true });
} else {
  mountTwentyFirstToolbar();
}
