import nodemailer from 'nodemailer';
import { SmtpSettings, EmailLog } from '../src/types/crm.ts';

// Default SMTP Configuration
export const defaultSmtpSettings: SmtpSettings = {
  enabled: true,
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true' || false,
  username: process.env.SMTP_USER || 'concierge.democlinic@gmail.com',
  password: process.env.SMTP_PASSWORD || '',
  from_name: 'Demo Dental & Aesthetic Clinic (Dubai Marina)',
  from_email: process.env.SMTP_FROM || 'bookings@democlinic.ae',
  reply_to: 'support@democlinic.ae',
  test_recipient: 'abdulmanankp0@gmail.com',
};

// In-memory email logs
export const emailLogs: EmailLog[] = [
  {
    id: 'elog-init-1',
    to: 'nour.alsabah@example.ae',
    subject: 'Consultation Confirmed: Teeth Whitening (Zoom In-Office) - Demo Clinic Dubai',
    type: 'booking_confirmation',
    status: 'sent',
    sent_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    preview_snippet: 'Your consultation for Teeth Whitening is confirmed on Saturday at 10:00 AM with Dr. Sarah Al-Qasimi.',
  },
  {
    id: 'elog-init-2',
    to: 'tariq.mansoor@example.com',
    subject: 'Welcome to Demo Dental & Aesthetic Clinic Dubai Marina',
    type: 'welcome',
    status: 'sent',
    sent_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    preview_snippet: 'Welcome to Demo Clinic! We provide world-class dental and aesthetic care in Dubai Marina with complimentary valet parking.',
  },
];

/**
 * Creates a Nodemailer transporter based on current SMTP settings
 */
export function getTransporter(config: SmtpSettings) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465 || config.secure,
    auth: {
      user: config.username,
      pass: config.password,
    },
    tls: {
      rejectUnauthorized: false, // Prevents self-signed cert blocks in development
    },
  });
}

/**
 * Verifies live connection to SMTP server
 */
export async function verifySmtpConnection(config: SmtpSettings): Promise<{ ok: boolean; message: string; error?: string }> {
  if (!config.host || !config.username || !config.password) {
    return {
      ok: false,
      message: 'SMTP Host, Username, and Password are required to establish connection.',
      error: 'missing_credentials',
    };
  }

  try {
    const transporter = getTransporter(config);
    await transporter.verify();
    return {
      ok: true,
      message: `Successfully connected and authenticated with SMTP server (${config.host}:${config.port}). Ready to dispatch patient emails.`,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `SMTP Connection failed: ${err.message || 'Authentication rejected'}`,
      error: err.code || err.message,
    };
  }
}

/**
 * Dispatches an email via configured SMTP (or gracefully logs simulation if credentials are not configured)
 */
export async function dispatchEmail(
  config: SmtpSettings,
  options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    type: EmailLog['type'];
    lead_id?: string;
  }
): Promise<{ ok: boolean; messageId?: string; simulated?: boolean; error?: string }> {
  const logId = 'elog-' + Math.random().toString(36).substring(2, 9);
  const nowIso = new Date().toISOString();

  // If SMTP is disabled or password is not yet configured, record clean simulation
  const hasLiveCredentials = Boolean(
    config.enabled &&
    config.host &&
    config.username &&
    config.password &&
    config.password.trim() !== ''
  );

  if (!hasLiveCredentials) {
    const simLog: EmailLog = {
      id: logId,
      to: options.to,
      subject: options.subject,
      type: options.type,
      status: 'simulated',
      sent_at: nowIso,
      lead_id: options.lead_id,
      preview_snippet: options.subject,
    };
    emailLogs.unshift(simLog);
    return { ok: true, simulated: true, messageId: 'sim-' + logId };
  }

  // Attempt real SMTP dispatch
  try {
    const transporter = getTransporter(config);
    const info = await transporter.sendMail({
      from: `"${config.from_name || 'Demo Clinic Dubai'}" <${config.from_email || config.username}>`,
      to: options.to,
      replyTo: config.reply_to || config.from_email || config.username,
      subject: options.subject,
      text: options.text || options.subject,
      html: options.html,
    });

    const successLog: EmailLog = {
      id: logId,
      to: options.to,
      subject: options.subject,
      type: options.type,
      status: 'sent',
      sent_at: nowIso,
      lead_id: options.lead_id,
      preview_snippet: options.subject,
    };
    emailLogs.unshift(successLog);

    return { ok: true, messageId: info.messageId, simulated: false };
  } catch (err: any) {
    const failedLog: EmailLog = {
      id: logId,
      to: options.to,
      subject: options.subject,
      type: options.type,
      status: 'failed',
      error: err.message || 'SMTP transmission failure',
      sent_at: nowIso,
      lead_id: options.lead_id,
      preview_snippet: options.subject,
    };
    emailLogs.unshift(failedLog);

    return { ok: false, error: err.message, simulated: false };
  }
}

// ==========================================
// BEAUTIFUL LUXURY CLINIC HTML TEMPLATES
// ==========================================

export function buildWelcomeEmailHtml(params: {
  patientName: string;
  clinicName: string;
  phone: string;
  address?: string;
  emiratesId?: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to ${params.clinicName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <!-- Top Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); padding: 36px 32px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">${params.clinicName}</h1>
              <p style="color: #ccfbf1; font-size: 13px; margin: 8px 0 0 0; font-weight: 500;">Premier Dental, Dermatology & Aesthetic Concierge • Dubai Marina</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 16px 0;">Welcome, ${params.patientName}!</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
                Thank you for registering with <strong>${params.clinicName}</strong>. Your patient profile has been successfully created in our private clinical intake system.
              </p>

              <!-- Patient Details Card -->
              <table width="100%" style="background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #0f766e;"><strong>Verified Patient Profile:</strong></p>
                    <p style="margin: 0 0 4px 0; font-size: 13px; color: #1e293b;">• <strong>Name:</strong> ${params.patientName}</p>
                    <p style="margin: 0 0 4px 0; font-size: 13px; color: #1e293b;">• <strong>Phone / WhatsApp:</strong> ${params.phone}</p>
                    ${params.emiratesId ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #1e293b;">• <strong>Emirates ID:</strong> ${params.emiratesId}</p>` : ''}
                    <p style="margin: 0; font-size: 13px; color: #1e293b;">• <strong>Address:</strong> ${params.address || 'Dubai Marina, UAE'}</p>
                  </td>
                </tr>
              </table>

              <!-- Clinic Amenities -->
              <h3 style="font-size: 14px; color: #0f172a; margin: 0 0 12px 0;">Your Patient Privileges:</h3>
              <ul style="font-size: 13px; line-height: 1.6; color: #475569; padding-left: 20px; margin: 0 0 24px 0;">
                <li><strong>24/7 AI & Staff Concierge:</strong> Instant appointment booking and inquiries directly on WhatsApp.</li>
                <li><strong>Complimentary Valet Parking:</strong> Available directly in front of the clinic tower.</li>
                <li><strong>State-of-the-Art Technology:</strong> Digital 3D iTero intraoral scanners, Zoom Whitespeed, and certified specialists.</li>
              </ul>

              <!-- Contact Button -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="https://wa.me/971501234567" style="display: inline-block; background-color: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 10px rgba(15, 118, 110, 0.25);">Chat with Clinic Concierge on WhatsApp</a>
              </div>

              <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 24px 0 0 0; text-align: center;">
                ${params.clinicName} • Marina Promenade, Al Emreef St, Dubai Marina, UAE • Tel: +971 4 800 2546
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function buildBookingConfirmationEmailHtml(params: {
  patientName: string;
  treatmentName: string;
  startAtIso: string;
  durationMin: number;
  clinicName: string;
  address?: string;
  doctorName?: string;
}) {
  const d = new Date(params.startAtIso);
  const dateStr = d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Dubai',
  });
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Dubai',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Appointment Confirmation - ${params.clinicName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <!-- Top Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 36px 32px; text-align: center;">
              <span style="background-color: #10b981; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Confirmed Appointment</span>
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 12px 0 0 0;">${params.clinicName}</h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Booking Ref: GST-CONF-${Math.random().toString(36).substring(2, 7).toUpperCase()}</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="font-size: 15px; color: #334155; margin: 0 0 20px 0;">
                Dear <strong>${params.patientName}</strong>, your clinical consultation has been confirmed. Below are your appointment details:
              </p>

              <!-- Appointment Schedule Card -->
              <table width="100%" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 15px; color: #0f172a;"><strong>Procedure:</strong> <span style="color: #0f766e;">${params.treatmentName}</span></p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;">📅 <strong>Date:</strong> ${dateStr}</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;">⏰ <strong>Time:</strong> ${timeStr} (Gulf Standard Time - Dubai)</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;">⏳ <strong>Duration:</strong> ${params.durationMin} minutes</p>
                    <p style="margin: 0; font-size: 14px; color: #334155;">📍 <strong>Location:</strong> ${params.address || 'Marina Promenade, Al Emreef St, Dubai Marina'}</p>
                  </td>
                </tr>
              </table>

              <!-- Important Arrival Notes -->
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #92400e;">Important Arrival Guidelines:</p>
                <p style="margin: 0; font-size: 12px; color: #78350f; line-height: 1.5;">
                  • Please arrive 10 minutes prior to your slot.<br>
                  • Complimentary Valet Parking is provided at the main clinic entrance.<br>
                  • Please carry your original Emirates ID or Passport for initial verification.<br>
                  • You will receive a WhatsApp reminder 24 hours prior to confirm or reschedule.
                </p>
              </div>

              <!-- Action Links -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="https://maps.google.com" style="display: inline-block; background-color: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 700; margin-right: 8px;">Open Clinic in Google Maps</a>
                <a href="https://wa.me/971501234567" style="display: inline-block; background-color: #f1f5f9; color: #334155; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 700;">WhatsApp Concierge</a>
              </div>

              <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 24px 0 0 0;">
                To reschedule or cancel, reply to this email or send us a WhatsApp message at least 12 hours in advance.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function buildTestEmailHtml(params: {
  adminName: string;
  host: string;
  port: number;
  user: string;
  clinicName: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SMTP Connection Test Succeeded</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 24px; background-color: #dcfce7; color: #15803d; font-size: 24px;">✓</span>
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 12px 0 4px 0;">SMTP Test Succeeded!</h2>
      <p style="font-size: 13px; color: #64748b; margin: 0;">Clinic CRM Email Infrastructure Online</p>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #334155;">
      Hello <strong>${params.adminName}</strong>,<br><br>
      This test message confirms that your CRM mail server connection is successfully authenticated and functioning properly.
    </p>

    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 12px; font-family: monospace;">
      <p style="margin: 0 0 4px 0;"><strong>Host:</strong> ${params.host}</p>
      <p style="margin: 0 0 4px 0;"><strong>Port:</strong> ${params.port}</p>
      <p style="margin: 0 0 4px 0;"><strong>Authenticated User:</strong> ${params.user}</p>
      <p style="margin: 0;"><strong>Status:</strong> TLS / SSL Handshake Verified</p>
    </div>

    <p style="font-size: 13px; color: #475569; margin: 0;">
      All automated new patient welcome emails and appointment booking confirmations will now dispatch reliably through this mail server.
    </p>
  </div>
</body>
</html>
  `;
}
