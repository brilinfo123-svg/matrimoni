
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const allowedSubjects = [
  "General Inquiry",
  "Account & Login",
  "Profile Assistance",
  "Report a Profile",
  "Privacy & Security",
  "Technical Issue",
  "Feedback & Suggestions",
];

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export async function POST(request: Request) {
  try {
    const {
      name,
      email,
      subject,
      message,
    } = await request.json();

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        { message: "Please provide valid contact details." },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (
      cleanName.length < 2 ||
      cleanName.length > 100 ||
      cleanMessage.length < 10 ||
      cleanMessage.length > 3000
    ) {
      return NextResponse.json(
        { message: "Please check your name and message length." },
        { status: 400 }
      );
    }

    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!allowedSubjects.includes(cleanSubject)) {
      return NextResponse.json(
        { message: "Please select a valid subject." },
        { status: 400 }
      );
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT || 465);

    if (!smtpUser || !smtpPassword) {
      console.error("Contact form SMTP credentials are missing.");

      return NextResponse.json(
        { message: "Email service is not configured. Please try again later." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const safeName = escapeHtml(cleanName);
    const safeEmail = escapeHtml(cleanEmail);
    const safeSubject = escapeHtml(cleanSubject);
    const safeMessage = escapeHtml(cleanMessage);

    await transporter.sendMail({
      from: {
        name: "EverMilan Contact Form",
        address: smtpUser,
      },
      to: smtpUser,
      replyTo: {
        name: cleanName,
        address: cleanEmail,
      },
      subject: `Contact Query: ${cleanSubject}`,
      text: [
        "New contact form submission",
        "",
        `Name: ${cleanName}`,
        `Email: ${cleanEmail}`,
        `Subject: ${cleanSubject}`,
        "",
        "Message:",
        cleanMessage,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#332832">
          <div style="background:#a83268;color:white;padding:22px;border-radius:10px 10px 0 0">
            <h2 style="margin:0">New Contact Query</h2>
            <p style="margin:8px 0 0">EverMilan Website</p>
          </div>
          <div style="padding:24px;border:1px solid #eee;border-top:0;border-radius:0 0 10px 10px">
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Subject:</strong> ${safeSubject}</p>
            <hr style="border:0;border-top:1px solid #eee;margin:20px 0" />
            <p><strong>Message:</strong></p>
            <p style="white-space:pre-wrap;line-height:1.7">${safeMessage}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true, message: "Your message has been sent successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form email failed:", error);

    return NextResponse.json(
      { message: "Unable to send your message right now. Please try again later." },
      { status: 500 }
    );
  }
}
