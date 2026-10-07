"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiHeart,
  FiLogOut,
  FiMenu,
  FiMessageCircle,
  FiSearch,
  FiUser,
  FiX,
  FiBell,
} from "react-icons/fi";

import {
  useMessageNotifications,
} from "@/components/MessageNotificationProvider/MessageNotificationProvider";

import styles from "./index.module.scss";

const navigation = [
  {
    label: "Notification",
    href: "/settings",
    icon: FiBell,
  },
  {
    label: "Discover",
    href: "/search",
    icon: FiSearch,
  },
  {
    label: "Matches",
    href: "/matches",
    icon: FiHeart,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: FiMessageCircle,
  },
];

type CurrentUser = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;

  /*
   * Profile photo
   *
   * Your API should return the first
   * profile photo here.
   */
  photos?: string;
};

type MeResponse = {
  success?: boolean;
  user?: CurrentUser;
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const [isLoadingUser, setIsLoadingUser] =
    useState(true);

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  /*
   * -----------------------------------------
   * Message notifications
   * -----------------------------------------
   */

  const { unreadCount } =
    useMessageNotifications();

  /*
   * -----------------------------------------
   * Get currently logged-in user
   * -----------------------------------------
   */

  const loadCurrentUser = async () => {
    try {
      setIsLoadingUser(true);

      const response = await fetch(
        "/api/auth/me",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data: MeResponse =
        await response.json();

      if (
        data.success &&
        data.user
      ) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error(
        "HEADER_AUTH_ERROR:",
        error,
      );

      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  /*
   * -----------------------------------------
   * Load user when Header mounts
   * -----------------------------------------
   */

  useEffect(() => {
    loadCurrentUser();
  }, []);

  /*
   * -----------------------------------------
   * Close mobile menu
   * -----------------------------------------
   */

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  /*
   * -----------------------------------------
   * Logout
   * -----------------------------------------
   */

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    closeMenu();

    try {
      console.log(
        "HEADER: Logging out...",
      );

      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await response.json();

      console.log(
        "HEADER: Logout response:",
        data,
      );

      setUser(null);

      window.location.assign("/");
    } catch (error) {
      console.error(
        "LOGOUT_ERROR:",
        error,
      );

      setUser(null);

      window.location.assign("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  /*
   * -----------------------------------------
   * User state
   * -----------------------------------------
   */

  const isLoggedIn =
    !isLoadingUser && !!user;

  /*
   * -----------------------------------------
   * Build user name
   * -----------------------------------------
   */

  const userName =
    `${user?.firstName || ""} ${
      user?.lastName || ""
    }`.trim() || "My Account";

  /*
   * -----------------------------------------
   * Profile photo
   * -----------------------------------------
   */

  const profilePhoto = user?.photos || "";
  /*
   * -----------------------------------------
   * Unread message count
   * -----------------------------------------
   */

  const formattedUnreadCount =
    unreadCount > 99
      ? "99+"
      : unreadCount;

  return (
    <header className={styles.header}>
      <div className={styles.container}>

        {/* =====================================
            LOGO
        ====================================== */}

        <Link
          href="/"
          className={styles.logo}
          onClick={closeMenu}
          aria-label="Matrimonial home"
        >
          <span
            className={styles.logoIcon}
          >
            <FiHeart
              aria-hidden="true"
            />
          </span>

          <span
            className={styles.logoText}
          >
            <span
              className={styles.logoMain}
            >
              Logo
            </span>

            <span
              className={styles.logoTagline}
            >
              Find your meaningful
              connection
            </span>
          </span>
        </Link>

        {/* =====================================
            DESKTOP NAVIGATION
        ====================================== */}

        <nav
          className={styles.desktopNav}
          aria-label="Main navigation"
        >
          {navigation.map((item) => {
            const Icon = item.icon;

            const isMessages =
              item.href === "/messages";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={styles.navLink}
              >
                {isMessages ? (
                  <span
                    className={
                      styles.messageNavIcon
                    }
                  >
                    <Icon
                      aria-hidden="true"
                    />

                    {unreadCount > 0 && (
                      <span
                        className={
                          styles.messageBadge
                        }
                        aria-label={`${unreadCount} unread messages`}
                      >
                        {formattedUnreadCount}
                      </span>
                    )}
                  </span>
                ) : (
                  <Icon
                    aria-hidden="true"
                  />
                )}

                <span>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* =====================================
            DESKTOP ACTIONS
        ====================================== */}

        <div
          className={
            styles.desktopActions
          }
        >
          {isLoadingUser ? (
            <div
              className={
                styles.authLoading
              }
              aria-hidden="true"
            />
          ) : isLoggedIn ? (
            <>
              {/* User */}

              <Link
                href="/dashboard"
                className={
                  styles.userButton
                }
                aria-label="Open dashboard"
              >
                <span
                  className={
                    styles.userAvatar
                  }
                >
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={userName}
                      className={
                        styles.userAvatarImage
                      }
                    />
                  ) : (
                    <FiUser
                      aria-hidden="true"
                    />
                  )}
                </span>

                <span
                  className={
                    styles.userName
                  }
                >
                  {userName}
                </span>
              </Link>

              {/* Logout */}

              <button
                type="button"
                className={
                  styles.logoutButton
                }
                onClick={
                  handleLogout
                }
                disabled={
                  isLoggingOut
                }
              >
                <FiLogOut
                  aria-hidden="true"
                />

                <span>
                  {isLoggingOut
                    ? "Logging out..."
                    : "Logout"}
                </span>
              </button>
            </>
          ) : (
            <>
              {/* Login */}

              <Link
                href="/login"
                className={
                  styles.loginButton
                }
              >
                <FiUser
                  aria-hidden="true"
                />

                <span>
                  Login
                </span>
              </Link>

              {/* Register */}

              <Link
                href="/register"
                className={
                  styles.registerButton
                }
              >
                Create Profile
              </Link>
            </>
          )}
        </div>

        {/* =====================================
            MOBILE MENU BUTTON
        ====================================== */}

        <button
          type="button"
          className={
            styles.menuButton
          }
          onClick={() =>
            setIsMenuOpen(
              (prev) => !prev,
            )
          }
          aria-label={
            isMenuOpen
              ? "Close menu"
              : "Open menu"
          }
          aria-expanded={
            isMenuOpen
          }
          aria-controls="mobile-navigation"
        >
          {isMenuOpen ? (
            <FiX />
          ) : (
            <FiMenu />
          )}
        </button>
      </div>

      {/* =======================================
          MOBILE NAVIGATION
      ======================================== */}

      <div
        id="mobile-navigation"
        className={`${styles.mobileMenu} ${
          isMenuOpen
            ? styles.mobileMenuOpen
            : ""
        }`}
      >
        <nav
          className={
            styles.mobileNav
          }
          aria-label="Mobile navigation"
        >
          {navigation.map((item) => {
            const Icon = item.icon;

            const isMessages =
              item.href === "/messages";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  styles.mobileNavLink
                }
                onClick={
                  closeMenu
                }
              >
                <span
                  className={
                    styles.mobileNavIcon
                  }
                >
                  <Icon
                    aria-hidden="true"
                  />

                  {isMessages &&
                    unreadCount > 0 && (
                      <span
                        className={
                          styles.mobileMessageBadge
                        }
                        aria-label={`${unreadCount} unread messages`}
                      >
                        {
                          formattedUnreadCount
                        }
                      </span>
                    )}
                </span>

                <span>
                  {item.label}
                </span>
              </Link>
            );
          })}

          <div
            className={
              styles.mobileDivider
            }
          />

          {/* =================================
              MOBILE AUTH
          ================================== */}

          {isLoadingUser ? (
            <div
              className={
                styles.mobileAuthLoading
              }
            >
              Loading...
            </div>
          ) : isLoggedIn ? (
            <>
              {/* Mobile Account */}

              <Link
                href="/dashboard"
                className={
                  styles.mobileAccount
                }
                onClick={
                  closeMenu
                }
              >
                <span
                  className={
                    styles.mobileAccountAvatar
                  }
                >
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={userName}
                      className={
                        styles.mobileAccountAvatarImage
                      }
                    />
                  ) : (
                    <FiUser
                      aria-hidden="true"
                    />
                  )}
                </span>

                <span>
                  <strong>
                    {userName}
                  </strong>

                  <small>
                    My Dashboard
                  </small>
                </span>
              </Link>

              {/* Mobile Logout */}

              <button
                type="button"
                className={
                  styles.mobileLogout
                }
                onClick={
                  handleLogout
                }
                disabled={
                  isLoggingOut
                }
              >
                <FiLogOut
                  aria-hidden="true"
                />

                <span>
                  {isLoggingOut
                    ? "Logging out..."
                    : "Logout"}
                </span>
              </button>
            </>
          ) : (
            <>
              {/* Mobile Login */}

              <Link
                href="/login"
                className={
                  styles.mobileLogin
                }
                onClick={
                  closeMenu
                }
              >
                <FiUser
                  aria-hidden="true"
                />

                <span>
                  Login
                </span>
              </Link>

              {/* Mobile Register */}

              <Link
                href="/register"
                className={
                  styles.mobileRegister
                }
                onClick={
                  closeMenu
                }
              >
                Create Profile
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
