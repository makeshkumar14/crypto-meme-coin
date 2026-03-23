import { useCallback, useEffect, useState } from 'react';
import { fetchDashboardData } from '../lib/api';

export function useDashboardData() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [usingMockSocialData, setUsingMockSocialData] = useState(false);

  const load = useCallback(async (options = {}) => {
    setLoading(true);
    setError('');

    try {
      const result = await fetchDashboardData(options);
      setCoins(result.coins || []);
      setUsingMockSocialData(Boolean(result.usingMockSocialData));
      setLastUpdated(result.lastUpdated || new Date().toISOString());
    } catch (loadError) {
      setError(loadError.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    coins,
    loading,
    error,
    lastUpdated,
    usingMockSocialData,
    refresh: () => load({ refresh: true }),
  };
}
