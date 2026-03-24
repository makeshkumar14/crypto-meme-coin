export const AUTH_TOKEN_STORAGE_KEY = 'memesense-auth-token';

export function readAuthToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || '';
}

export function storeAuthToken(token) {
  if (typeof window === 'undefined') {
    return;
  }

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

async function fetchJson(url, options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };
  const token = options.skipAuth ? '' : readAuthToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || `Request failed: ${response.status}`);
  }

  return payload;
}

export async function fetchDashboardData({ refresh = false } = {}) {
  const search = refresh ? '?refresh=1' : '';
  return fetchJson(`/api/dashboard${search}`);
}

export async function fetchSession() {
  return fetchJson('/api/auth/session');
}

export async function signUpUser(payload) {
  const result = await fetchJson('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });

  if (result.token) {
    storeAuthToken(result.token);
  }

  return result;
}

export async function signInUser(payload) {
  const result = await fetchJson('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });

  if (result.token) {
    storeAuthToken(result.token);
  }

  return result;
}

export async function signOutUser() {
  try {
    await fetchJson('/api/auth/signout', {
      method: 'POST',
    });
  } finally {
    storeAuthToken('');
  }
}

export async function updateWatchlist(watchlist) {
  return fetchJson('/api/user/watchlist', {
    method: 'PUT',
    body: JSON.stringify({ watchlist }),
  });
}

export async function updatePreferences(payload) {
  return fetchJson('/api/user/preferences', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function fetchUserReminders() {
  return fetchJson('/api/user/reminders');
}

export async function sendReminderEmailNow(toEmail = '') {
  return fetchJson('/api/user/reminders/send', {
    method: 'POST',
    body: JSON.stringify({ toEmail }),
  });
}

export async function askAssistant(message) {
  return fetchJson('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function fetchCoinChart(coinId, days = 7) {
  return fetchJson(`/api/coin/${encodeURIComponent(coinId)}/chart?days=${days}`, { skipAuth: true });
}
