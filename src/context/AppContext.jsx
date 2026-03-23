import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchDashboardData } from '../lib/api';

const USER_STORAGE_KEY = 'memesense-user';
const WATCHLIST_STORAGE_KEY = 'memesense-watchlist';
const ALERT_PREFERENCES_STORAGE_KEY = 'memesense-alert-preferences';
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [usingMockSocialData, setUsingMockSocialData] = useState(false);
  const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [alertPreferences, setAlertPreferences] = useState({
    newTrends: true,
    fakeHype: true,
    dumps: true,
    launchWindows: true,
  });

  async function loadDashboard(options = {}) {
    setLoading(true);
    setError('');

    try {
      const result = await fetchDashboardData(options);
      setCoins(result.coins || []);
      setUsingMockSocialData(Boolean(result.usingMockSocialData));
      setLastUpdated(result.lastUpdated || new Date().toISOString());
    } catch (loadError) {
      setCoins([]);
      setError(loadError.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    try {
      const rawUser = localStorage.getItem(USER_STORAGE_KEY);
      const rawWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      const rawAlertPreferences = localStorage.getItem(ALERT_PREFERENCES_STORAGE_KEY);
      if (rawUser) {
        setUser(JSON.parse(rawUser));
      }
      if (rawWatchlist) {
        setWatchlist(JSON.parse(rawWatchlist));
      }
      if (rawAlertPreferences) {
        setAlertPreferences(JSON.parse(rawAlertPreferences));
      }
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(WATCHLIST_STORAGE_KEY);
      localStorage.removeItem(ALERT_PREFERENCES_STORAGE_KEY);
    }
  }, []);

  function persistUser(nextUser) {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }

  function persistWatchlist(nextWatchlist) {
    setWatchlist(nextWatchlist);
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(nextWatchlist));
  }

  function signIn({ name, email }) {
    persistUser({ name: name || email.split('@')[0], email, initials: (name || email).slice(0, 2).toUpperCase() });
  }

  function signUp({ name, email }) {
    persistUser({ name, email, initials: name.slice(0, 2).toUpperCase() });
  }

  function signOut() {
    persistUser(null);
  }

  function toggleWatchlist(coinId) {
    const next = watchlist.includes(coinId) ? watchlist.filter((id) => id !== coinId) : [...watchlist, coinId];
    persistWatchlist(next);
  }

  function updateAlertPreference(key) {
    const nextPreferences = {
      ...alertPreferences,
      [key]: !alertPreferences[key],
    };
    setAlertPreferences(nextPreferences);
    localStorage.setItem(ALERT_PREFERENCES_STORAGE_KEY, JSON.stringify(nextPreferences));
  }

  const watchlistCoins = useMemo(() => coins.filter((coin) => watchlist.includes(coin.id)), [coins, watchlist]);

  const value = useMemo(
    () => ({
      coins,
      loading,
      error,
      lastUpdated,
      usingMockSocialData,
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
    }),
    [coins, loading, error, lastUpdated, usingMockSocialData, user, watchlist, watchlistCoins, alertPreferences],
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
