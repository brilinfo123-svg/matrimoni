"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiHeart,
  FiLock,
  FiMail,
  FiShield,
} from "react-icons/fi";

import styles from "./login.module.scss";

type LoginResponse = {
  success?: boolean;
  message?: string;
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Get a safe internal callback URL.
   *
   * Allowed:
   * /search
   * /dashboard
   * /profile/123
   *
   * Block:
   * https://example.com
   * //example.com
   */
  const getCallbackUrl = () => {
    if (typeof window === "undefined") {
      return "/dashboard";
    }

    const params = new URLSearchParams(
      window.location.search,
    );

    const rawCallbackUrl =
      params.get("callbackUrl");

    if (
      rawCallbackUrl &&
      rawCallbackUrl.startsWith("/") &&
      !rawCallbackUrl.startsWith("//")
    ) {
      return rawCallbackUrl;
    }

    return "/dashboard";
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    // Prevent double submit
    if (isLoading) {
      return;
    }

    // --------------------------------
    // Clear previous errors
    // --------------------------------

    setEmailError("");
    setPasswordError("");
    setErrorMessage("");

    const cleanEmail = email
      .trim()
      .toLowerCase();

    const cleanPassword = password;

    let hasError = false;

    // --------------------------------
    // Email validation
    // --------------------------------

    if (!cleanEmail) {
      setEmailError(
        "Please enter your email address.",
      );

      hasError = true;
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail,
      )
    ) {
      setEmailError(
        "Please enter a valid email address.",
      );

      hasError = true;
    }

    // --------------------------------
    // Password validation
    // --------------------------------

    if (!cleanPassword) {
      setPasswordError(
        "Please enter your password.",
      );

      hasError = true;
    }

    // Stop if validation failed
    if (hasError) {
      return;
    }

    setIsLoading(true);

    try {
      const callbackUrl =
        getCallbackUrl();

      // --------------------------------
      // Debug logs
      // --------------------------------

      console.log(
        "=================================",
      );

      console.log(
        "LOGIN: Starting login request",
      );

      console.log(
        "LOGIN: Email:",
        cleanEmail,
      );

      console.log(
        "LOGIN: Remember me:",
        rememberMe,
      );

      console.log(
        "LOGIN: Callback URL:",
        callbackUrl,
      );

      console.log(
        "=================================",
      );

      // --------------------------------
      // Custom JWT Login API
      // --------------------------------

      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          /*
           * Important:
           * This allows the browser to
           * receive/store the HTTP-only
           * matrimonial_session cookie.
           */
          credentials: "include",

          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPassword,
          }),
        },
      );

      console.log(
        "LOGIN: API status:",
        response.status,
      );

      // --------------------------------
      // Safely parse response
      // --------------------------------

      let data: LoginResponse = {};

      try {
        data = await response.json();
      } catch (jsonError) {
        console.error(
          "LOGIN: Could not parse API response:",
          jsonError,
        );

        throw new Error(
          "Invalid response received from login server.",
        );
      }

      console.log(
        "LOGIN: API response:",
        data,
      );

      // --------------------------------
      // Login failed
      // --------------------------------

      if (
        !response.ok ||
        !data.success
      ) {
        console.error(
          "LOGIN: Login failed:",
          data.message,
        );

        setPasswordError(
          data.message ||
            "The email or password you entered is incorrect.",
        );

        setIsLoading(false);

        return;
      }

      // --------------------------------
      // Login successful
      // --------------------------------

      console.log(
        "=================================",
      );

      console.log(
        "LOGIN: Login successful!",
      );

      console.log(
        "LOGIN: User ID:",
        data.user?.id,
      );

      console.log(
        "LOGIN: User:",
        data.user?.firstName,
        data.user?.lastName,
      );

      console.log(
        "LOGIN: Session cookie created.",
      );

      console.log(
        "LOGIN: Redirecting to:",
        callbackUrl,
      );

      console.log(
        "=================================",
      );

      /*
       * Use full browser navigation.
       *
       * This ensures the newly-created
       * HTTP-only cookie is available
       * when the next protected page
       * loads.
       */
      window.location.assign(
        callbackUrl,
      );
    } catch (error) {
      console.error(
        "=================================",
      );

      console.error(
        "LOGIN_ERROR:",
        error,
      );

      console.error(
        "=================================",
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please check your connection and try again.",
      );

      setIsLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className={styles.wrapper}>
        {/* ================================
            LEFT VISUAL PANEL
        ================================= */}

        <section className={styles.visualPanel}>
          <div
            className={styles.visualBackground}
          />

          <div
            className={styles.visualContent}
          >
            <Link
              href="/"
              className={styles.logo}
            >
              <span
                className={styles.logoIcon}
              >
                <FiHeart
                  aria-hidden="true"
                />
              </span>

              <span>
                <strong>
                  Matrimonial
                </strong>

                <small>
                  Meaningful connections
                </small>
              </span>
            </Link>

            <div
              className={
                styles.visualMessage
              }
            >
              <span
                className={
                  styles.visualEyebrow
                }
              >
                Welcome back
              </span>

              <h1>
                Your next
                <span>
                  {" "}
                  meaningful connection
                </span>
                could be waiting.
              </h1>

              <p>
                Sign in to continue
                discovering people who
                share your values,
                interests, and vision for
                the future.
              </p>
            </div>

            <div
              className={
                styles.visualCard
              }
            >
              <div
                className={
                  styles.visualCardIcon
                }
              >
                <FiShield
                  aria-hidden="true"
                />
              </div>

              <div>
                <strong>
                  Your privacy matters
                </strong>

                <span>
                  You stay in control of
                  your profile and
                  connections.
                </span>
              </div>
            </div>
          </div>

          <div
            className={
              styles.decorativeHeart
            }
          >
            <FiHeart
              aria-hidden="true"
            />
          </div>

          <div
            className={styles.orbitOne}
          />

          <div
            className={styles.orbitTwo}
          />
        </section>

        {/* ================================
            LOGIN PANEL
        ================================= */}

        <section
          className={styles.formPanel}
        >
          <div
            className={styles.formWrapper}
          >
            {/* Mobile Logo */}

            <div
              className={
                styles.mobileLogo
              }
            >
              <Link
                href="/"
                className={styles.logo}
              >
                <span
                  className={
                    styles.logoIcon
                  }
                >
                  <FiHeart
                    aria-hidden="true"
                  />
                </span>

                <span>
                  <strong>
                    Matrimonial
                  </strong>

                  <small>
                    Meaningful connections
                  </small>
                </span>
              </Link>
            </div>

            {/* Header */}

            <div
              className={
                styles.formHeader
              }
            >
              <span
                className={
                  styles.formIcon
                }
              >
                <FiLock
                  aria-hidden="true"
                />
              </span>

              <div>
                <h2>
                  Welcome back
                </h2>

                <p>
                  Sign in to your
                  account to continue.
                </p>
              </div>
            </div>

            {/* Login Form */}

            <form
              className={styles.form}
              onSubmit={handleSubmit}
              noValidate
            >
              {/* ================================
                  GENERAL ERROR
              ================================= */}

              {errorMessage && (
                <div
                  className={
                    styles.errorMessage
                  }
                  role="alert"
                  aria-live="polite"
                >
                  <span
                    className={
                      styles.errorIcon
                    }
                  >
                    !
                  </span>

                  <div>
                    <strong>
                      Sign in unsuccessful
                    </strong>

                    <p>
                      {errorMessage}
                    </p>
                  </div>

                  <button
                    type="button"
                    className={
                      styles.errorClose
                    }
                    onClick={() =>
                      setErrorMessage(
                        "",
                      )
                    }
                    aria-label="Dismiss error"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* ================================
                  EMAIL
              ================================= */}

              <div
                className={styles.field}
              >
                <label htmlFor="email">
                  Email address
                </label>

                <div
                  className={`${
                    styles.inputWrapper
                  } ${
                    emailError
                      ? styles.inputError
                      : ""
                  }`}
                >
                  <FiMail
                    className={
                      styles.inputIcon
                    }
                    aria-hidden="true"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(
                        event.target.value,
                      );

                      if (emailError) {
                        setEmailError("");
                      }

                      if (errorMessage) {
                        setErrorMessage("");
                      }
                    }}
                    placeholder="Enter your email"
                    autoComplete="email"
                    aria-invalid={
                      !!emailError
                    }
                    aria-describedby={
                      emailError
                        ? "email-error"
                        : undefined
                    }
                    required
                    disabled={isLoading}
                  />
                </div>

                {emailError && (
                  <span
                    id="email-error"
                    className={
                      styles.fieldError
                    }
                    role="alert"
                  >
                    {emailError}
                  </span>
                )}
              </div>

              {/* ================================
                  PASSWORD
              ================================= */}

              <div
                className={styles.field}
              >
                <div
                  className={
                    styles.labelRow
                  }
                >
                  <label htmlFor="password">
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className={
                      styles.forgotLink
                    }
                  >
                    Forgot password?
                  </Link>
                </div>

                <div
                  className={`${
                    styles.inputWrapper
                  } ${
                    passwordError
                      ? styles.inputError
                      : ""
                  }`}
                >
                  <FiLock
                    className={
                      styles.inputIcon
                    }
                    aria-hidden="true"
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) => {
                      setPassword(
                        event.target.value,
                      );

                      if (passwordError) {
                        setPasswordError("");
                      }

                      if (errorMessage) {
                        setErrorMessage("");
                      }
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-invalid={
                      !!passwordError
                    }
                    aria-describedby={
                      passwordError
                        ? "password-error"
                        : undefined
                    }
                    required
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    className={
                      styles.passwordToggle
                    }
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current,
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <FiEyeOff
                        aria-hidden="true"
                      />
                    ) : (
                      <FiEye
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>

                {passwordError && (
                  <span
                    id="password-error"
                    className={
                      styles.fieldError
                    }
                    role="alert"
                  >
                    {passwordError}
                  </span>
                )}
              </div>

              {/* ================================
                  REMEMBER ME
              ================================= */}

              <label
                className={styles.remember}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked,
                    )
                  }
                  disabled={isLoading}
                />

                <span
                  className={
                    styles.checkbox
                  }
                >
                  <FiArrowRight
                    aria-hidden="true"
                  />
                </span>

                <span>
                  Remember me
                </span>
              </label>

              {/* ================================
                  SUBMIT
              ================================= */}

              <button
                type="submit"
                className={
                  styles.submitButton
                }
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span
                      className={
                        styles.spinner
                      }
                    />

                    <span>
                      Signing in...
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      Sign in
                    </span>

                    <FiArrowRight
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}

            <div
              className={styles.divider}
            >
              <span />
              <p>New here?</p>
              <span />
            </div>

            {/* Register */}

            <Link
              href="/register"
              className={
                styles.createAccount
              }
            >
              <span>
                Create your profile
              </span>

              <FiArrowRight
                aria-hidden="true"
              />
            </Link>

            {/* Security */}

            <div
              className={
                styles.securityNote
              }
            >
              <FiShield
                aria-hidden="true"
              />

              <span>
                Your account information
                is kept private.
              </span>
            </div>

            {/* Terms */}

            <p className={styles.terms}>
              By continuing, you agree
              to our{" "}
              <Link href="/terms">
                Terms
              </Link>{" "}
              and{" "}
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