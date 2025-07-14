import nodemailer from "nodemailer";

const disabled = process.env.EMAIL_ENABLED === "false";

let transporter;
if (!disabled) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export const sendMail = async ({ to, subject, html }) => {
  if (disabled) return console.log("✉️  Email disabled:", { to, subject });
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"DevSpace" <no-reply@devspace.io>',
    to,
    subject,
    html,
  });
};