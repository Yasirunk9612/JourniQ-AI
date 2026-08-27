const nodemailer = require("nodemailer");

let transporter;

const getFrontendUrl = () => (process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");

const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const pass = (process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || "").replace(/\s+/g, "");

  if (!user || !pass) return null;

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return transporter;
};

const getFromAddress = () => {
  const user = process.env.GMAIL_USER || process.env.EMAIL_USER;
  return process.env.EMAIL_FROM || `JourniQ AI <${user}>`;
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) return { skipped: true, reason: "No recipient email." };

  const mailer = getTransporter();
  if (!mailer) {
    console.warn("[email] Skipped email. Add GMAIL_USER and GMAIL_APP_PASSWORD to backend/.env.");
    return { skipped: true, reason: "Email transport is not configured." };
  }

  try {
    const info = await mailer.sendMail({
      from: getFromAddress(),
      to,
      subject,
      html,
      text,
    });
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error("[email] Failed to send email:", error.message);
    return { sent: false, error: error.message };
  }
};

const sendMany = async (messages) => Promise.allSettled(messages.filter(Boolean).map(sendEmail));

module.exports = {
  getFrontendUrl,
  sendEmail,
  sendMany,
};
