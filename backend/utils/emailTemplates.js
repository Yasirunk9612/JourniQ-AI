const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatDate = (value) => {
  if (!value) return "Not selected";
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatLkr = (amount = 0) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const baseEmail = ({ title, eyebrow = "JourniQ AI", intro, body, actionLabel, actionUrl }) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin:0;background:#F4EBDD;font-family:Inter,Arial,sans-serif;color:#071A22;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F4EBDD;padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;overflow:hidden;border-radius:28px;background:#FCFAF6;box-shadow:0 24px 60px rgba(7,26,34,0.14);">
              <tr>
                <td style="background:#071A22;padding:26px 28px;color:white;">
                  <div style="font-size:11px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:#D9A441;">${escapeHtml(eyebrow)}</div>
                  <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:34px;line-height:0.98;color:white;">${escapeHtml(title)}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#334155;">${escapeHtml(intro)}</p>
                  <div style="font-size:14px;line-height:1.7;color:#334155;">${body}</div>
                  ${
                    actionLabel && actionUrl
                      ? `<p style="margin:28px 0 8px;"><a href="${escapeHtml(actionUrl)}" style="display:inline-block;border-radius:999px;background:#0F766E;color:white;padding:13px 20px;text-decoration:none;font-size:14px;font-weight:800;">${escapeHtml(actionLabel)}</a></p>`
                      : ""
                  }
                  <p style="margin:26px 0 0;font-size:12px;line-height:1.6;color:#64748b;">This is an automated JourniQ AI email. If this was not you, please contact support.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

const verifyEmailTemplate = ({ name, verifyUrl }) => ({
  subject: "Verify your JourniQ AI travel profile",
  html: baseEmail({
    title: "Confirm your travel profile",
    intro: `Hi ${name}, welcome to JourniQ AI. Verify your email so your Sri Lanka travel profile is trusted and ready.`,
    body: "<p>Your preferences, bookings, and AI trip plans will stay connected to this account.</p>",
    actionLabel: "Verify email",
    actionUrl: verifyUrl,
  }),
});

const providerRegisteredTemplate = ({ name, role, businessName }) => ({
  subject: "Your JourniQ AI provider application was received",
  html: baseEmail({
    title: "Application received",
    intro: `Hi ${name}, your ${role === "hotel_owner" ? "hotel owner" : "activity provider"} application has been submitted.`,
    body: `<p><strong>Business:</strong> ${escapeHtml(businessName || "Not provided")}</p><p>Our admin team will review it before your dashboard is activated.</p>`,
  }),
});

const adminProviderRegisteredTemplate = ({ user }) => ({
  subject: `New provider approval request: ${user.businessName || user.name}`,
  html: baseEmail({
    title: "New provider request",
    intro: "A new provider is waiting for admin approval.",
    body: `<p><strong>Name:</strong> ${escapeHtml(user.name)}</p><p><strong>Email:</strong> ${escapeHtml(user.email)}</p><p><strong>Role:</strong> ${escapeHtml(user.role)}</p><p><strong>Business:</strong> ${escapeHtml(user.businessName || "Not provided")}</p><p><strong>District:</strong> ${escapeHtml(user.district || "Not provided")}</p>`,
  }),
});

const providerApprovedTemplate = ({ name, role, loginUrl }) => ({
  subject: "Your JourniQ AI provider account is approved",
  html: baseEmail({
    title: "You are approved",
    intro: `Hi ${name}, your ${role === "hotel_owner" ? "hotel owner" : "activity provider"} account is now active.`,
    body: "<p>You can now sign in, manage listings, respond to booking requests, and update your profile.</p>",
    actionLabel: "Open provider portal",
    actionUrl: loginUrl,
  }),
});

const providerRejectedTemplate = ({ name }) => ({
  subject: "JourniQ AI provider application update",
  html: baseEmail({
    title: "Application update",
    intro: `Hi ${name}, your provider application could not be approved at this time.`,
    body: "<p>Please contact JourniQ AI support if you want to update your details and request another review.</p>",
  }),
});

const listingStatusTemplate = ({ name, listingName, listingType, status, portalUrl }) => ({
  subject: `Your JourniQ AI ${listingType} is ${status}`,
  html: baseEmail({
    title: `${listingType} ${status}`,
    intro: `Hi ${name}, your ${listingType} listing has been reviewed.`,
    body: `<p><strong>Listing:</strong> ${escapeHtml(listingName)}</p><p><strong>Status:</strong> ${escapeHtml(status)}</p><p>${status === "approved" || status === "active" ? "Travelers can now discover this listing on JourniQ AI." : "Please review your listing details or contact support if you need help."}</p>`,
    actionLabel: "Open dashboard",
    actionUrl: portalUrl,
  }),
});

const bookingRequestTemplate = ({ travelerName, listingName, bookingId, dateLabel, totalAmount, portalUrl, kind }) => ({
  subject: `New ${kind} booking request: ${listingName}`,
  html: baseEmail({
    title: "New booking request",
    intro: `${travelerName} sent a new ${kind} booking request.`,
    body: `<p><strong>Booking ID:</strong> ${escapeHtml(bookingId)}</p><p><strong>Listing:</strong> ${escapeHtml(listingName)}</p><p><strong>Date:</strong> ${escapeHtml(dateLabel)}</p><p><strong>Total:</strong> ${escapeHtml(formatLkr(totalAmount))}</p>`,
    actionLabel: "Review booking",
    actionUrl: portalUrl,
  }),
});

const travelerBookingReceivedTemplate = ({ name, listingName, bookingId, dateLabel, totalAmount, kind }) => ({
  subject: `Your ${kind} booking request was received`,
  html: baseEmail({
    title: "Booking request sent",
    intro: `Hi ${name}, your ${kind} booking request was sent to the provider.`,
    body: `<p><strong>Booking ID:</strong> ${escapeHtml(bookingId)}</p><p><strong>Listing:</strong> ${escapeHtml(listingName)}</p><p><strong>Date:</strong> ${escapeHtml(dateLabel)}</p><p><strong>Total:</strong> ${escapeHtml(formatLkr(totalAmount))}</p><p>The provider can reply through JourniQ AI messages.</p>`,
  }),
});

const bookingStatusTemplate = ({ name, listingName, bookingId, status, portalUrl, kind }) => ({
  subject: `Your ${kind} booking is ${status}`,
  html: baseEmail({
    title: `Booking ${status}`,
    intro: `Hi ${name}, your ${kind} booking status has been updated.`,
    body: `<p><strong>Booking ID:</strong> ${escapeHtml(bookingId)}</p><p><strong>Listing:</strong> ${escapeHtml(listingName)}</p><p><strong>Status:</strong> ${escapeHtml(status)}</p>`,
    actionLabel: "Open JourniQ AI",
    actionUrl: portalUrl,
  }),
});

const passwordResetTemplate = ({ name, resetUrl }) => ({
  subject: "Reset your JourniQ AI password",
  html: baseEmail({
    title: "Password reset",
    intro: `Hi ${name}, use this secure link to reset your password.`,
    body: "<p>The link expires in 30 minutes. If you did not request it, you can ignore this email.</p>",
    actionLabel: "Reset password",
    actionUrl: resetUrl,
  }),
});

module.exports = {
  formatDate,
  verifyEmailTemplate,
  providerRegisteredTemplate,
  adminProviderRegisteredTemplate,
  providerApprovedTemplate,
  providerRejectedTemplate,
  listingStatusTemplate,
  bookingRequestTemplate,
  travelerBookingReceivedTemplate,
  bookingStatusTemplate,
  passwordResetTemplate,
};
