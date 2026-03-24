const RESEND_API_URL = 'https://api.resend.com/emails';

function getRequiredEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.RESEND_FROM_EMAIL || '',
  };
}

export function canSendReminderEmails() {
  const { apiKey, from } = getRequiredEmailConfig();
  return Boolean(apiKey && from);
}

export async function sendReminderEmail({ to, subject, html, text }) {
  const { apiKey, from } = getRequiredEmailConfig();

  if (!apiKey || !from) {
    throw new Error('Email delivery is not configured.');
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email delivery failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
