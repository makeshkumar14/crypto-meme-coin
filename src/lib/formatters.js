export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value || 0);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value || 0);
}

export function formatPercent(value, digits = 2) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${Number(value || 0).toFixed(digits)}%`;
}

export function formatRelativeTime(isoString) {
  if (!isoString) {
    return 'just now';
  }

  const deltaMs = Date.now() - new Date(isoString).getTime();
  const deltaMinutes = Math.max(0, Math.round(deltaMs / 60000));

  if (deltaMinutes < 1) {
    return 'just now';
  }
  if (deltaMinutes < 60) {
    return `${deltaMinutes}m ago`;
  }
  return `${Math.round(deltaMinutes / 60)}h ago`;
}
