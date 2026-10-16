"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiMail,
  FiMessageCircle,
  FiShield,
  FiClock,
  FiSend,
  FiArrowLeft,
} from "react-icons/fi";

import styles from "./page.module.scss";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send your message.");
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "General Inquiry",
        message: "",
      });
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Link href="/" className={styles.backLink}>
            <FiArrowLeft />
            Back to Home
          </Link>

           <span className={styles.eyebrow}>WE ARE HERE FOR YOU</span>
{/*
          <h1>
            Let&apos;s start a <span>conversation.</span>
          </h1>

          <p>
            Have a question or need assistance with your matrimonial
            journey? We&apos;re here to help you feel confident and
            supported every step of the way.
          </p> */}
        </div>
      </section>

{/* <section className={styles.hero}>
  <Image
    src="/public/images/hero/Contact_us_Banner.png"
    alt="Contact EverMilan support — we're here to help"
    width={1728}
    height={832}
    priority
    sizes="100vw"
    className={styles.heroImage}
  />
</section> */}

      <section className={styles.content}>
        <div className={styles.contactInfo}>
          <span className={styles.sectionLabel}>GET IN TOUCH</span>
          <h2>How can we help you?</h2>
          <p className={styles.infoDescription}>
            Reach out to our support team for help with your account,
            profile, privacy, or any other questions.
          </p>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FiMail />
            </div>
            <div>
              <h3>Email Support</h3>
              <p>Send us your questions anytime.</p>
              <a href="mailto:support@evermilan.com">
                support@evermilan.com
              </a>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FiShield />
            </div>
            <div>
              <h3>Safety & Privacy</h3>
              <p>
                Have a concern about a profile or your privacy?
              </p>
              <Link href="/safety-tips">Visit Safety Centre</Link>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FiClock />
            </div>
            <div>
              <h3>Our Support Promise</h3>
              <p>
                We aim to review enquiries and respond as soon as
                possible.
              </p>
            </div>
          </div>

          <div className={styles.privacyNote}>
            <FiMessageCircle />
            <p>
              Your trust matters. Please avoid including passwords,
              verification codes, or other sensitive information in
              your message.
            </p>
          </div>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formHeading}>
            <span className={styles.sectionLabel}>CONTACT FORM</span>
            <h2>Send us a message</h2>
            <p>Fill in the details below and we&apos;ll be happy to help.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={254}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="subject">What can we help with?</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option>General Inquiry</option>
                <option>Account & Login</option>
                <option>Profile Assistance</option>
                <option>Report a Profile</option>
                <option>Privacy & Security</option>
                <option>Technical Issue</option>
                <option>Feedback & Suggestions</option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="message">Your Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Tell us how we can help..."
                value={formData.message}
                onChange={handleChange}
                rows={6}
                minLength={10}
                maxLength={3000}
                required
              />
              <span className={styles.characterCount}>
                {formData.message.length}/3000 characters
              </span>
            </div>

            {status === "success" && (
              <div className={styles.successMessage} role="status">
                Your message has been sent successfully. Thank you for
                contacting us!
              </div>
            )}

            {status && status !== "success" && (
              <div className={styles.errorMessage} role="alert">
                {status}
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
              {!isSubmitting && <FiSend />}
            </button>

            <p className={styles.formFootnote}>
              By submitting this form, you agree to our{" "}
              <Link href="/privacy-policy">Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}