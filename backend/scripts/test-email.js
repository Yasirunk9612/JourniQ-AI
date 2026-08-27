require("dotenv").config();
const { sendEmail } = require("../utils/emailService");

const to = process.argv[2] || process.env.ADMIN_NOTIFY_EMAIL || process.env.GMAIL_USER;

async function main() {
  const result = await sendEmail({
    to,
    subject: "JourniQ AI email test",
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px;background:#FCFAF6;color:#071A22;">
        <h1>JourniQ AI email is working</h1>
        <p>This test email was sent through Gmail SMTP from the backend.</p>
      </div>
    `,
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(result.sent ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
