import nodemailer from 'nodemailer';

/**
 * Crea un transporter de Nodemailer usando Gmail SMTP.
 * Las variables de entorno SMTP_USER y SMTP_PASS deben estar
 * configuradas en Vercel (y en .env.local para desarrollo).
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Las variables de entorno SMTP_USER y SMTP_PASS no están configuradas.');
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Prode Mundial 26" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
