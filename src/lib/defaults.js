export const DEFAULT_ALERT_PREFERENCES = {
  newTrends: true,
  fakeHype: true,
  dumps: true,
  launchWindows: true,
};

export const DEFAULT_REMINDER_SETTINGS = {
  enabled: true,
  emailDigest: false,
  riskAlerts: true,
  wishlistAlerts: true,
};

export const DEFAULT_THEME = 'dark';

export function normalizeAlertPreferences(value = {}) {
  return {
    ...DEFAULT_ALERT_PREFERENCES,
    ...(value || {}),
  };
}

export function normalizeReminderSettings(value = {}) {
  return {
    ...DEFAULT_REMINDER_SETTINGS,
    ...(value || {}),
  };
}
