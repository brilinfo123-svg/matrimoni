"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiHeart,
  FiKey,
  FiLock,
  FiMail,
  FiShield,
} from "react-icons/fi";

import styles from "./forgot-password.module.scss";

type Step = "email" | "otp" | "password" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const clearMessages = () => {
    setError("");
    setMessage("");
  };

  // --------------------------------
  // STEP 1 - SEND OTP
  // --------------------------------

  const handleSendOtp = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    clearMessages();

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to send reset instructions.",
        );
        return;
      }

      setEmail(normalizedEmail);
      setStep("otp");

      setMessage(
        "If an account exists with this email, a verification code has been sent.",
      );
    } catch (error) {
      console.error("FORGOT_PASSWORD_ERROR:", error);

      setError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------
  // STEP 2 - VERIFY OTP
  // --------------------------------

  const handleVerifyOtp = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    clearMessages();

    const cleanOtp = otp.replace(/\D/g, "");

    if (cleanOtp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/auth/verify-reset-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp: cleanOtp,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Invalid or expired OTP.",
        );
        return;
      }

      setStep("password");
      setMessage("OTP verified successfully.");
    } catch (error) {
      console.error("VERIFY_OTP_ERROR:", error);

      setError(
        "Unable to verify OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------
  // STEP 3 - RESET PASSWORD
  // --------------------------------

  const handleResetPassword = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    clearMessages();

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to reset your password.",
        );
        return;
      }

      setStep("success");
    } catch (error) {
      console.error("RESET_PASSWORD_ERROR:", error);

      setError(
        "Unable to reset your password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------
  // BACK
  // --------------------------------

  const goBack = () => {
    clearMessages();

    if (step === "otp") {
      setStep("email");
      setOtp("");
      return;
    }

    if (step === "password") {
      setStep("otp");
      setPassword("");
      setConfirmPassword("");
      return;
    }

    if (step === "email") {
      window.location.href = "/login";
    }
  };

  // --------------------------------
  // START AGAIN
  // --------------------------------

  const startAgain = () => {
    setStep("email");
    setEmail("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    clearMessages();
  };

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className={styles.wrapper}>
        {/* =========================
            LEFT PANEL
        ========================= */}

        <section className={styles.visualPanel}>
          <div className={styles.visualPattern} />

          <div className={styles.visualContent}>
            <Link
              href="/"
              className={styles.logo}
            >
              <span className={styles.logoIcon}>
                <FiHeart aria-hidden="true" />
              </span>

              <span className={styles.logoText}>
                <strong>Matrimonial</strong>
                <small>
                  Meaningful connections
                </small>
              </span>
            </Link>

            <div className={styles.visualMessage}>
              <span className={styles.visualEyebrow}>
                Account recovery
              </span>

              <h1>
                Getting back
                <span> should be simple.</span>
              </h1>

              <p>
                Verify your email, create a new password,
                and continue your journey.
              </p>
            </div>

            <div className={styles.visualCard}>
              <span className={styles.visualCardIcon}>
                <FiShield aria-hidden="true" />
              </span>

              <div>
                <strong>Your privacy matters</strong>

                <span>
                  Your verification code and password are
                  securely protected.
                </span>
              </div>
            </div>
          </div>

          <div className={styles.decorativeLock}>
            <FiLock aria-hidden="true" />
          </div>

          <div className={styles.orbitOne} />
          <div className={styles.orbitTwo} />
        </section>

        {/* =========================
            FORM PANEL
        ========================= */}

        <section className={styles.formPanel}>
          <div className={styles.formWrapper}>
            <div className={styles.mobileLogo}>
              <Link
                href="/"
                className={styles.logo}
              >
                <span className={styles.logoIcon}>
                  <FiHeart aria-hidden="true" />
                </span>

                <span className={styles.logoText}>
                  <strong>Matrimonial</strong>
                  <small>
                    Meaningful connections
                  </small>
                </span>
              </Link>
            </div>

            {/* =========================
                STEP 1
            ========================= */}

            {step === "email" && (
              <>
                <button
                  type="button"
                  className={styles.backLink}
                  onClick={goBack}
                >
                  <FiArrowLeft />
                  <span>Back to login</span>
                </button>

                <div className={styles.formHeader}>
                  <span className={styles.formIcon}>
                    <FiMail />
                  </span>

                  <div>
                    <h2>Forgot password?</h2>

                    <p>
                      We&apos;ll send you a verification
                      code.
                    </p>
                  </div>
                </div>

                <p className={styles.description}>
                  Enter the email address associated with
                  your account. If the account exists,
                  we&apos;ll send you a 6-digit verification
                  code.
                </p>

                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}

                <form
                  className={styles.form}
                  onSubmit={handleSendOtp}
                >
                  <div className={styles.field}>
                    <label htmlFor="email">
                      Email address
                    </label>

                    <div
                      className={
                        styles.inputWrapper
                      }
                    >
                      <FiMail
                        className={styles.inputIcon}
                      />

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(
                            event.target.value,
                          )
                        }
                        placeholder="Enter your email"
                        autoComplete="email"
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className={styles.spinner}
                        />
                        <span>
                          Sending code...
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          Send verification code
                        </span>

                        <FiArrowRight />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* =========================
                STEP 2
            ========================= */}

            {step === "otp" && (
              <>
                <button
                  type="button"
                  className={styles.backLink}
                  onClick={goBack}
                >
                  <FiArrowLeft />
                  <span>Change email</span>
                </button>

                <div className={styles.formHeader}>
                  <span className={styles.formIcon}>
                    <FiKey />
                  </span>

                  <div>
                    <h2>Verify your email</h2>

                    <p>
                      Enter the 6-digit code we sent.
                    </p>
                  </div>
                </div>

                <p className={styles.description}>
                  We sent a verification code to{" "}
                  <strong>{email}</strong>.
                </p>

                {message && (
                  <div className={styles.successMessage}>
                    <FiCheck />
                    <span>{message}</span>
                  </div>
                )}

                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}

                <form
                  className={styles.form}
                  onSubmit={handleVerifyOtp}
                >
                  <div className={styles.field}>
                    <label htmlFor="otp">
                      Verification code
                    </label>

                    <div
                      className={
                        styles.inputWrapper
                      }
                    >
                      <FiKey
                        className={styles.inputIcon}
                      />

                      <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(event) =>
                          setOtp(
                            event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6),
                          )
                        }
                        placeholder="Enter 6-digit code"
                        autoComplete="one-time-code"
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={
                      isLoading ||
                      otp.length !== 6
                    }
                  >
                    {isLoading ? (
                      <>
                        <span
                          className={styles.spinner}
                        />
                        <span>
                          Verifying...
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          Verify code
                        </span>

                        <FiArrowRight />
                      </>
                    )}
                  </button>
                </form>

                <button
                  type="button"
                  className={styles.tryAgain}
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    clearMessages();
                  }}
                >
                  Didn&apos;t receive the code?
                </button>
              </>
            )}

            {/* =========================
                STEP 3
            ========================= */}

            {step === "password" && (
              <>
                <button
                  type="button"
                  className={styles.backLink}
                  onClick={goBack}
                >
                  <FiArrowLeft />
                  <span>Back to verification</span>
                </button>

                <div className={styles.formHeader}>
                  <span className={styles.formIcon}>
                    <FiLock />
                  </span>

                  <div>
                    <h2>Create new password</h2>

                    <p>
                      Choose a secure password.
                    </p>
                  </div>
                </div>

                <p className={styles.description}>
                  Your email has been verified. Create a
                  new password for your account.
                </p>

                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}

                <form
                  className={styles.form}
                  onSubmit={handleResetPassword}
                >
                  <div className={styles.field}>
                    <label htmlFor="password">
                      New password
                    </label>

                    <div
                      className={
                        styles.inputWrapper
                      }
                    >
                      <FiLock
                        className={styles.inputIcon}
                      />

                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(event) =>
                          setPassword(
                            event.target.value,
                          )
                        }
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        required
                      />

                      <button
                        type="button"
                        className={
                          styles.passwordToggle
                        }
                        onClick={() =>
                          setShowPassword(
                            (current) => !current,
                          )
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <FiEyeOff />
                        ) : (
                          <FiEye />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="confirmPassword">
                      Confirm password
                    </label>

                    <div
                      className={
                        styles.inputWrapper
                      }
                    >
                      <FiLock
                        className={styles.inputIcon}
                      />

                      <input
                        id="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value,
                          )
                        }
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        required
                      />

                      <button
                        type="button"
                        className={
                          styles.passwordToggle
                        }
                        onClick={() =>
                          setShowConfirmPassword(
                            (current) => !current,
                          )
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff />
                        ) : (
                          <FiEye />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className={styles.spinner}
                        />
                        <span>
                          Updating password...
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          Update password
                        </span>

                        <FiArrowRight />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* =========================
                SUCCESS
            ========================= */}

            {step === "success" && (
              <div className={styles.successState}>
                <div className={styles.successIcon}>
                  <FiCheck />
                </div>

                <span
                  className={styles.successEyebrow}
                >
                  Password updated
                </span>

                <h2>Password changed successfully</h2>

                <p>
                  Your password has been updated. You
                  can now sign in using your new password.
                </p>

                <Link
                  href="/login"
                  className={styles.loginButton}
                >
                  <FiArrowLeft />
                  <span>Back to login</span>
                </Link>

                <button
                  type="button"
                  className={styles.tryAgain}
                  onClick={startAgain}
                >
                  Reset another account
                </button>
              </div>
            )}

            <div className={styles.securityNote}>
              <FiShield />
              <span>
                Your password and verification details are
                securely protected.
              </span>
            </div>

            <p className={styles.terms}>
              By continuing, you agree to our{" "}
              <Link href="/terms">Terms</Link> and{" "}
              <Link href="/privacy">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}