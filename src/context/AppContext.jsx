import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { buildReminderFeed } from '../lib/analytics';
import {
  askAssistant,
  fetchDashboardData,
  fetchSession,
  fetchUserReminders,
  sendReminderEmailNow,
  signInUser,
  signOutUser,
  signUpUser,
  updatePreferences,
  updateWatchlist,
} from '../lib/api';
import {
  DEFAULT_ALERT_PREFERENCES,
  DEFAULT_REMINDER_SETTINGS,
  DEFAULT_THEME,
  normalizeAlertPreferences,
  normalizeReminderSettings,
} from '../lib/defaults';

const GUEST_WATCHLIST_STORAGE_KEY = 'memesense-guest-watchlist';
const GUEST_ALERT_PREFERENCES_STORAGE_KEY = 'memesense-guest-alert-preferences';
const GUEST_REMINDER_SETTINGS_STORAGE_KEY = 'memesense-guest-reminder-settings';
const THEME_STORAGE_KEY = 'memesense-theme';

const AppContext = createContext(null);

function readJsonStorage(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function readGuestState() {
  return {
    watchlist: Array.isArray(readJsonStorage(GUEST_WATCHLIST_STORAGE_KEY, []))
      ? readJsonStorage(GUEST_WATCHLIST_STORAGE_KEY, [])
      : [],
    alertPreferences: normalizeAlertPreferences(
      readJsonStorage(GUEST_ALERT_PREFERENCES_STORAGE_KEY, DEFAULT_ALERT_PREFERENCES),
    ),
    reminderSettings: normalizeReminderSettings(
      readJsonStorage(GUEST_REMINDER_SETTINGS_STORAGE_KEY, DEFAULT_REMINDER_SETTINGS),
    ),
    theme:
      typeof window !== 'undefined'
        ? window.localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME
        : DEFAULT_THEME,
  };
}

function writeGuestWatchlist(nextWatchlist) {
  writeJsonStorage(GUEST_WATCHLIST_STORAGE_KEY, nextWatchlist);
}

function writeGuestAlertPreferences(nextPreferences) {
  writeJsonStorage(GUEST_ALERT_PREFERENCES_STORAGE_KEY, nextPreferences);
}

function writeGuestReminderSettings(nextSettings) {
  writeJsonStorage(GUEST_REMINDER_SETTINGS_STORAGE_KEY, nextSettings);
}

function clearGuestState() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(GUEST_WATCHLIST_STORAGE_KEY);
  window.localStorage.removeItem(GUEST_ALERT_PREFERENCES_STORAGE_KEY);
  window.localStorage.removeItem(GUEST_REMINDER_SETTINGS_STORAGE_KEY);
}

function applyTheme(nextTheme) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  document.documentElement.classList.toggle('light', nextTheme === 'light');
  window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
}

function arraysEqual(left = [], right = []) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((item, index) => item === right[index]);
}

export function AppProvider({ children }) {
  const guestState = readGuestState();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [usingFallbackSocialData, setUsingFallbackSocialData] = useState(false);
  const [launchAdvisor, setLaunchAdvisor] = useState(null);
  const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState(guestState.watchlist);
  const [alertPreferences, setAlertPreferences] = useState(guestState.alertPreferences);
  const [reminderSettings, setReminderSettings] = useState(guestState.reminderSettings);
  const [theme, setTheme] = useState(guestState.theme);
  const [reminders, setReminders] = useState([]);
  const [sendingReminderEmail, setSendingReminderEmail] = useState(false);

  useEffect(() => {
    applyTheme(guestState.theme);
  }, [guestState.theme]);

  async function loadDashboard(options = {}) {
    setLoading(true);
    setError('');

    try {
      const result = await fetchDashboardData(options);
      setCoins(result.coins || []);
      setUsingFallbackSocialData(Boolean(result.usingFallbackSocialData));
      setLaunchAdvisor(result.launchAdvisor || null);
      setLastUpdated(result.lastUpdated || new Date().toISOString());
      setReminders((currentReminders) =>
        result.userReminders?.length && user ? result.userReminders : currentReminders,
      );
    } catch (loadError) {
      setCoins([]);
      setLaunchAdvisor(null);
      setError(loadError.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  function commitUser(nextUser) {
    if (!nextUser) {
      setUser(null);
      return;
    }

    setUser(nextUser);
    setWatchlist(nextUser.watchlist || []);
    setAlertPreferences(normalizeAlertPreferences(nextUser.alertPreferences));
    setReminderSettings(normalizeReminderSettings(nextUser.reminderSettings));
    setTheme(nextUser.theme || DEFAULT_THEME);
    applyTheme(nextUser.theme || DEFAULT_THEME);
  }

  async function restoreSession() {
    setAuthLoading(true);

    try {
      const result = await fetchSession();
      if (result.user) {
        commitUser(result.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  async function mergeGuestStateIntoAccount(accountUser) {
    const guest = readGuestState();
    const nextWatchlist = [...new Set([...(accountUser.watchlist || []), ...guest.watchlist])];
    const nextAlertPreferences = normalizeAlertPreferences({
      ...accountUser.alertPreferences,
      ...guest.alertPreferences,
    });
    const nextReminderSettings = normalizeReminderSettings({
      ...accountUser.reminderSettings,
      ...guest.reminderSettings,
    });
    const nextTheme = guest.theme || accountUser.theme || DEFAULT_THEME;

    let mergedUser = accountUser;

    if (!arraysEqual(nextWatchlist, accountUser.watchlist || [])) {
      const watchlistResult = await updateWatchlist(nextWatchlist);
      mergedUser = watchlistResult.user;
    }

    const preferencesChanged =
      JSON.stringify(nextAlertPreferences) !== JSON.stringify(mergedUser.alertPreferences || {}) ||
      JSON.stringify(nextReminderSettings) !== JSON.stringify(mergedUser.reminderSettings || {}) ||
      nextTheme !== (mergedUser.theme || DEFAULT_THEME);

    if (preferencesChanged) {
      const preferencesResult = await updatePreferences({
        alertPreferences: nextAlertPreferences,
        reminderSettings: nextReminderSettings,
        theme: nextTheme,
      });
      mergedUser = preferencesResult.user;
    }

    commitUser(mergedUser);
    clearGuestState();
    return mergedUser;
  }

  useEffect(() => {
    loadDashboard();
    restoreSession();
  }, []);

  useEffect(() => {
    applyTheme(theme);

    if (!user) {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme, user]);

  useEffect(() => {
    let cancelled = false;

    async function refreshReminders() {
      if (!user) {
        const guestReminders = buildReminderFeed({
          coins,
          watchlist,
          alertPreferences,
          reminderSettings,
        });

        if (!cancelled) {
          setReminders(guestReminders);
        }
        return;
      }

      try {
        const result = await fetchUserReminders();
        if (!cancelled) {
          setReminders(result.reminders || []);
          if (result.launchAdvisor) {
            setLaunchAdvisor(result.launchAdvisor);
          }
        }
      } catch {
        if (!cancelled) {
          setReminders([]);
        }
      }
    }

    refreshReminders();

    return () => {
      cancelled = true;
    };
  }, [user, coins, watchlist, alertPreferences, reminderSettings]);

  async function signIn(form) {
    try {
      const result = await signInUser(form);
      const mergedUser = await mergeGuestStateIntoAccount(result.user);
      await loadDashboard();
      return mergedUser;
    } catch (authError) {
      setError(authError.message || 'Unable to sign in.');
      throw authError;
    }
  }

  async function signUp(form) {
    try {
      const result = await signUpUser(form);
      const mergedUser = await mergeGuestStateIntoAccount(result.user);
      await loadDashboard();
      return mergedUser;
    } catch (authError) {
      setError(authError.message || 'Unable to sign up.');
      throw authError;
    }
  }

  async function signOut() {
    try {
      await signOutUser();
      setUser(null);
      const guest = readGuestState();
      setWatchlist(guest.watchlist);
      setAlertPreferences(guest.alertPreferences);
      setReminderSettings(guest.reminderSettings);
      setTheme(window.localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME);
      setReminders(buildReminderFeed({
        coins,
        watchlist: guest.watchlist,
        alertPreferences: guest.alertPreferences,
        reminderSettings: guest.reminderSettings,
      }));
    } catch (signOutError) {
      setError(signOutError.message || 'Unable to sign out.');
      throw signOutError;
    }
  }

  async function toggleWatchlist(coinId) {
    const nextWatchlist = watchlist.includes(coinId)
      ? watchlist.filter((id) => id !== coinId)
      : [...watchlist, coinId];

    if (!user) {
      setWatchlist(nextWatchlist);
      writeGuestWatchlist(nextWatchlist);
      return;
    }

    try {
      const result = await updateWatchlist(nextWatchlist);
      commitUser(result.user);
    } catch (watchlistError) {
      setError(watchlistError.message || 'Unable to update watchlist.');
    }
  }

  async function updateAlertPreference(key) {
    const nextPreferences = {
      ...alertPreferences,
      [key]: !alertPreferences[key],
    };

    if (!user) {
      setAlertPreferences(nextPreferences);
      writeGuestAlertPreferences(nextPreferences);
      return;
    }

    try {
      const result = await updatePreferences({ alertPreferences: nextPreferences });
      commitUser(result.user);
    } catch (preferencesError) {
      setError(preferencesError.message || 'Unable to update alert preferences.');
    }
  }

  async function updateReminderPreference(key) {
    const nextSettings = {
      ...reminderSettings,
      [key]: !reminderSettings[key],
    };

    if (!user) {
      setReminderSettings(nextSettings);
      writeGuestReminderSettings(nextSettings);
      return;
    }

    try {
      const result = await updatePreferences({ reminderSettings: nextSettings });
      commitUser(result.user);
    } catch (reminderError) {
      setError(reminderError.message || 'Unable to update reminder settings.');
    }
  }

  async function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    if (!user) {
      setTheme(nextTheme);
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      return;
    }

    try {
      const result = await updatePreferences({ theme: nextTheme });
      commitUser(result.user);
    } catch (themeError) {
      setError(themeError.message || 'Unable to update theme.');
    }
  }

  async function chatWithAssistant(message) {
    return askAssistant(message);
  }

  async function triggerReminderEmail(toEmail = '') {
    setSendingReminderEmail(true);

    try {
      return await sendReminderEmailNow(toEmail);
    } catch (sendError) {
      setError(sendError.message || 'Unable to send reminder email.');
      throw sendError;
    } finally {
      setSendingReminderEmail(false);
    }
  }

  const watchlistCoins = useMemo(
    () => coins.filter((coin) => watchlist.includes(coin.id)),
    [coins, watchlist],
  );

  const value = useMemo(
    () => ({
      coins,
      loading,
      authLoading,
      error,
      lastUpdated,
      usingFallbackSocialData,
      launchAdvisor,
      refresh: () => loadDashboard({ refresh: true }),
      user,
      signIn,
      signUp,
      signOut,
      watchlist,
      watchlistCoins,
      toggleWatchlist,
      alertPreferences,
      updateAlertPreference,
      reminderSettings,
      updateReminderPreference,
      reminders,
      sendingReminderEmail,
      theme,
      toggleTheme,
      chatWithAssistant,
      triggerReminderEmail,
    }),
    [
      coins,
      loading,
      authLoading,
      error,
      lastUpdated,
      usingFallbackSocialData,
      launchAdvisor,
      user,
      watchlist,
      watchlistCoins,
      alertPreferences,
      reminderSettings,
      reminders,
      sendingReminderEmail,
      theme,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
