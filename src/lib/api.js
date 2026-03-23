async function fetchJson(url) {
  const response = await fetch(url);
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
