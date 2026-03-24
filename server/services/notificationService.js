import { buildReminderFeed } from '../../src/lib/analytics.js';
import { canSendReminderEmails, sendReminderEmail } from './emailService.js';
import {
  getNotificationState,
  listUsers,
  updateNotificationState,
} from './userStore.js';

const DEFAULT_POLL_MS = Number(process.env.NOTIFICATION_POLL_MS || 300000);
const DEFAULT_COOLDOWN_MS = Number(process.env.REMINDER_EMAIL_COOLDOWN_MS || 21600000);
const DEFAULT_MAX_ITEMS = Number(process.env.REMINDER_EMAIL_MAX_ITEMS || 4);

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildReminderSignature(reminders, launchAdvisor) {
  const signatureParts = reminders
    .slice(0, DEFAULT_MAX_ITEMS)
    .map((reminder) => `${reminder.id}:${reminder.priority}`);

  signatureParts.push(`${launchAdvisor?.status || 'none'}:${launchAdvisor?.bestCoinId || 'none'}`);
  return signatureParts.join('|');
}

function buildEmailSubject(reminders, launchAdvisor) {
  const topReminder = reminders[0];

  if (topReminder) {
    return `MemeSense Alert: ${topReminder.title}`;
  }

  return `MemeSense Launch Watch: ${launchAdvisor?.bestCoinName || 'Meme market'} update`;
}

function buildEmailText({ user, reminders, launchAdvisor, appBaseUrl }) {
  const intro = `Hi ${user.name}, here are your latest MemeSense reminders.`;
  const reminderLines = reminders
    .slice(0, DEFAULT_MAX_ITEMS)
    .map((reminder, index) => `${index + 1}. ${reminder.title}: ${reminder.message}`);
  const launchLine = launchAdvisor
    ? `Launch Advisor: ${launchAdvisor.headline}. Best window: ${launchAdvisor.bestWindow}.`
    : '';
  const footer = appBaseUrl ? `Open dashboard: ${appBaseUrl}/alerts` : 'Open your MemeSense dashboard for more detail.';

  return [intro, '', ...reminderLines, '', launchLine, '', footer].filter(Boolean).join('\n');
}

function buildEmailHtml({ user, reminders, launchAdvisor, appBaseUrl }) {
  const reminderCards = reminders
    .slice(0, DEFAULT_MAX_ITEMS)
    .map(
      (reminder) => `
        <div style="border:1px solid rgba(148,163,184,0.2);border-radius:16px;padding:16px;margin-bottom:12px;background:#0f172a;">
          <div style="font-size:16px;font-weight:700;color:#f8fafc;">${escapeHtml(reminder.title)}</div>
          <div style="margin-top:8px;font-size:14px;line-height:1.7;color:#cbd5e1;">${escapeHtml(reminder.message)}</div>
        </div>`,
    )
    .join('');

  const launchBlock = launchAdvisor
    ? `
      <div style="border:1px solid rgba(6,182,212,0.22);border-radius:20px;padding:18px;background:linear-gradient(135deg, rgba(6,182,212,0.12), rgba(217,70,239,0.08));margin-top:20px;">
        <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#67e8f9;">Launch Advisor</div>
        <div style="margin-top:10px;font-size:20px;font-weight:700;color:#f8fafc;">${escapeHtml(launchAdvisor.headline)}</div>
        <div style="margin-top:10px;font-size:14px;line-height:1.7;color:#cbd5e1;">${escapeHtml(launchAdvisor.body)}</div>
        <div style="margin-top:12px;font-size:14px;color:#a5f3fc;"><strong>Best window:</strong> ${escapeHtml(launchAdvisor.bestWindow)}</div>
      </div>`
    : '';

  const ctaHref = appBaseUrl ? `${appBaseUrl}/alerts` : '#';
  const cta = appBaseUrl
    ? `<a href="${escapeHtml(ctaHref)}" style="display:inline-block;margin-top:24px;background:#22d3ee;color:#082f49;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:9999px;">Open MemeSense</a>`
    : '';

  return `
    <div style="background:#020617;padding:32px;font-family:Arial,sans-serif;color:#e2e8f0;">
      <div style="max-width:680px;margin:0 auto;border:1px solid rgba(255,255,255,0.08);border-radius:28px;padding:28px;background:#020817;">
        <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#94a3b8;">MemeSense AI</div>
        <h1 style="margin:12px 0 0;font-size:30px;line-height:1.2;color:#f8fafc;">Hi ${escapeHtml(user.name)}, your meme coin reminders are ready</h1>
        <p style="margin-top:14px;font-size:15px;line-height:1.8;color:#cbd5e1;">
          Your saved meme coins are being monitored for trend breakouts, fake-hype warnings, dump risk, and launch timing.
        </p>
        <div style="margin-top:24px;">${reminderCards}</div>
        ${launchBlock}
        ${cta}
      </div>
    </div>`;
}

async function maybeSendUserReminderEmail({ user, reminders, launchAdvisor, appBaseUrl, force = false }) {
  if (!user.reminderSettings?.enabled || !reminders.length) {
    return false;
  }

  const now = Date.now();
  const signature = buildReminderSignature(reminders, launchAdvisor);
  const notificationState = await getNotificationState(user.id);
  const lastSentAtMs = notificationState?.lastReminderEmailAt
    ? new Date(notificationState.lastReminderEmailAt).getTime()
    : 0;
  const cooldownElapsed = !lastSentAtMs || now - lastSentAtMs >= DEFAULT_COOLDOWN_MS;
  const signatureChanged = signature !== notificationState?.lastReminderSignature;

  if (!force && !signatureChanged && !cooldownElapsed) {
    return false;
  }

  const subject = buildEmailSubject(reminders, launchAdvisor);
  const html = buildEmailHtml({ user, reminders, launchAdvisor, appBaseUrl });
  const text = buildEmailText({ user, reminders, launchAdvisor, appBaseUrl });
  const response = await sendReminderEmail({
    to: user.email,
    subject,
    html,
    text,
  });

  await updateNotificationState(user.id, {
    lastReminderEmailAt: new Date(now).toISOString(),
    lastReminderSignature: signature,
    lastReminderEmailId: response?.id || '',
  });

  return true;
}

export async function sendReminderEmailForUser({ user, getDashboardPayload, force = true, toEmail = '' }) {
  if (!canSendReminderEmails()) {
    throw new Error('Email delivery is not configured.');
  }

  const { payload } = await getDashboardPayload({ refresh: true });
  const reminders = buildReminderFeed({
    coins: payload.coins,
    watchlist: user.watchlist,
    alertPreferences: user.alertPreferences,
    reminderSettings: user.reminderSettings,
  });

  if (!reminders.length) {
    return {
      sent: false,
      reason: 'no_reminders',
    };
  }

  const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
  const effectiveUser = toEmail
    ? {
        ...user,
        email: String(toEmail).trim(),
      }
    : user;

  const sent = await maybeSendUserReminderEmail({
    user: effectiveUser,
    reminders,
    launchAdvisor: payload.launchAdvisor,
    appBaseUrl,
    force,
  });

  return {
    sent,
    reminderCount: reminders.length,
  };
}

export async function runReminderDeliveryCycle({ getDashboardPayload }) {
  if (!canSendReminderEmails()) {
    return {
      delivered: 0,
      skipped: 'email_not_configured',
    };
  }

  const users = await listUsers();
  const deliverableUsers = users.filter(
    (user) => user.email && user.reminderSettings?.enabled && user.reminderSettings?.emailDigest,
  );

  if (!deliverableUsers.length) {
    return {
      delivered: 0,
      skipped: 'no_email_subscribers',
    };
  }

  const { payload } = await getDashboardPayload();
  const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
  let delivered = 0;

  for (const user of deliverableUsers) {
    try {
      const reminders = buildReminderFeed({
        coins: payload.coins,
        watchlist: user.watchlist,
        alertPreferences: user.alertPreferences,
        reminderSettings: user.reminderSettings,
      });

      const sent = await maybeSendUserReminderEmail({
        user,
        reminders,
        launchAdvisor: payload.launchAdvisor,
        appBaseUrl,
      });

      if (sent) {
        delivered += 1;
      }
    } catch (error) {
      console.error(`[notifications] Failed to process ${user.email}:`, error.message);
    }
  }

  return { delivered };
}

export function startReminderScheduler({ getDashboardPayload }) {
  if (!canSendReminderEmails()) {
    console.log('[notifications] Email scheduler is disabled. Add RESEND_API_KEY and RESEND_FROM_EMAIL to enable reminder emails.');
    return { stop() {} };
  }

  const intervalId = setInterval(() => {
    runReminderDeliveryCycle({ getDashboardPayload }).catch((error) => {
      console.error('[notifications] Delivery cycle failed:', error.message);
    });
  }, DEFAULT_POLL_MS);

  setTimeout(() => {
    runReminderDeliveryCycle({ getDashboardPayload }).catch((error) => {
      console.error('[notifications] Initial delivery cycle failed:', error.message);
    });
  }, 8000);

  console.log(`[notifications] Email scheduler started with poll interval ${DEFAULT_POLL_MS}ms.`);

  return {
    stop() {
      clearInterval(intervalId);
    },
  };
}
