import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT || 587);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendPasswordResetOtp(
  email: string,
  otp: string,
) {
  await transporter.sendMail({
    from:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER,

    to: email,

    subject: "Your Matrimonial password reset code",

    text: `Your password reset verification code is ${otp}. This code expires in 10 minutes.`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 560px;
        margin: auto;
        padding: 30px;
      ">
        <h2 style="color:#a83268;">
          Matrimonial
        </h2>

        <p>
          We received a request to reset your password.
        </p>

        <p>
          Your verification code is:
        </p>

        <div style="
          margin: 25px 0;
          padding: 18px;
          text-align:center;
          background:#fff2f6;
          border-radius:12px;
          color:#a83268;
          font-size:32px;
          font-weight:bold;
          letter-spacing:8px;
        ">
          ${otp}
        </div>

        <p>
          This code will expire in
          <strong>10 minutes</strong>.
        </p>

        <p style="color:#777;">
          If you did not request a password reset,
          you can safely ignore this email.
        </p>
      </div>
    `,
  });
}