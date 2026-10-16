"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FiBell,
  FiHeart,
  FiLogOut,
  FiMenu,
  FiMessageCircle,
  FiSearch,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { useFavorites } from "@/components/FavoritesProvider/FavoritesProvider";
import { useMessageNotifications } from "@/components/MessageNotificationProvider/MessageNotificationProvider";

import styles from "./index.module.scss";

const navigation = [
  { label: "Notification", href: "/settings", icon: FiBell },
  { label: "Discover", href: "/search", icon: FiSearch },
  { label: "Matches", href: "/matches", icon: FiUsers },
  { label: "Favorites", href: "/favorites", icon: FiHeart },
  { label: "Messages", href: "/messages", icon: FiMessageCircle },
];

type CurrentUser = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  photos?: string | string[];
};

type MeResponse = {
  success?: boolean;
  user?: CurrentUser;
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [imageError, setImageError] = useState(false);

  const { unreadCount } = useMessageNotifications();
  const { favoriteIds } = useFavorites();

  const favoriteCount = favoriteIds.length;

  const formattedFavoriteCount =
    favoriteCount > 99 ? "99+" : favoriteCount;

  const formattedUnreadCount =
    unreadCount > 99 ? "99+" : unreadCount;

  const isLoggedIn = !isLoadingUser && Boolean(user);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const loadCurrentUser = async () => {
    try {
      setIsLoadingUser(true);

      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data: MeResponse = await response.json();

      setUser(data.success && data.user ? data.user : null);
    } catch (error) {
      console.error("HEADER_AUTH_ERROR:", error);
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    void loadCurrentUser();
  }, []);

  // Close the mobile drawer when the user presses Escape.
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  // Close the drawer if the user logs out or is no longer authenticated.
  useEffect(() => {
    if (!isLoggedIn) {
      closeMenu();
    }
  }, [isLoggedIn]);

  const firstName = user?.firstName?.trim() || "";
  const lastName = user?.lastName?.trim() || "";

  const userName =
    `${firstName} ${lastName}`.trim() || "My Account";

  const userInitials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
    "U";

  const profilePhoto = Array.isArray(user?.photos)
    ? user.photos[0] || ""
    : user?.photos || "";

  useEffect(() => {
    setImageError(false);
  }, [profilePhoto]);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    closeMenu();

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout request failed");
      }

      setUser(null);
      window.location.assign("/");
    } catch (error) {
      console.error("LOGOUT_ERROR:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderAvatar = (mobile = false) => {
    const avatarClass = mobile
      ? styles.mobileAccountAvatar
      : styles.userAvatar;

    const imageClass = mobile
      ? styles.mobileAccountAvatarImage
      : styles.userAvatarImage;

    const initialsClass = mobile
      ? styles.mobileUserInitials
      : styles.userInitials;

    if (profilePhoto && !imageError) {
      return (
        <span className={avatarClass}>
          <img
            src={profilePhoto}
            alt=""
            className={imageClass}
            onError={() => setImageError(true)}
          />
        </span>
      );
    }

    return (
      <span className={avatarClass}>
        <span className={initialsClass}>{userInitials}</span>
      </span>
    );
  };

  const renderNavigationItems = (mobile = false) => {
    return navigation.map((item) => {
      const Icon = item.icon;
      const isMessages = item.href === "/messages";
      const isFavorites = item.href === "/favorites";

      const showBadge =
        (isMessages && unreadCount > 0) ||
        (isFavorites && favoriteCount > 0);

      const badgeCount = isMessages
        ? formattedUnreadCount
        : formattedFavoriteCount;

      return (
        <Link
          key={item.href}
          href={item.href}
          className={mobile ? styles.mobileNavLink : styles.navLink}
          onClick={mobile ? closeMenu : undefined}
        >
          <span
            className={
              mobile ? styles.mobileNavIcon : styles.messageNavIcon
            }
          >
            <Icon aria-hidden="true" />

            {showBadge && (
              <span
                className={
                  mobile
                    ? styles.mobileMessageBadge
                    : styles.messageBadge
                }
                aria-label={
                  isMessages
                    ? `${unreadCount} unread messages`
                    : `${favoriteCount} favorite profiles`
                }
              >
                {badgeCount}
              </span>
            )}
          </span>

          <span>{item.label}</span>
        </Link>
      );
    });
  };

  return (
    <>
      {/* Backdrop: appears behind the drawer on mobile */}
      {isMenuOpen && isLoggedIn && (
        <button
          type="button"
          className={styles.mobileMenuOverlay}
          onClick={closeMenu}
          aria-label="Close navigation menu"
          tabIndex={-1}
        />
      )}

      <header className={styles.header}>
        <div className={styles.container}>
          {/* Logo */}
          <Link
            href="/"
            className={styles.logo}
            onClick={closeMenu}
            aria-label="Matrimonial home"
          >
            <Image
              src="/public/images/logo/EverMilan.png"
              alt="Matrimonial Logo"
              width={200}
              height={100}
              priority
            />
          </Link>

          {/* Desktop navigation */}
          <nav
            className={styles.desktopNav}
            aria-label="Main navigation"
          >
            {renderNavigationItems()}
          </nav>

          {/* Desktop actions */}
          <div className={styles.desktopActions}>
            {isLoadingUser ? (
              <div
                className={styles.authLoading}
                aria-hidden="true"
              />
            ) : isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className={styles.userButton}
                  aria-label={`Open ${userName}'s dashboard`}
                >
                  {renderAvatar()}

                  <span className={styles.userName}>
                    {userName}
                  </span>
                </Link>

                <button
                  type="button"
                  className={styles.logoutButton}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <FiLogOut aria-hidden="true" />
                  <span>
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={styles.loginButton}
                >
                  <FiUser aria-hidden="true" />
                  <span>Login</span>
                </Link>

                <Link
                  href="/register"
                  className={styles.registerButton}
                >
                  Create Profile
                </Link>
              </>
            )}
          </div>

          {/* Mobile header actions */}
          <div className={styles.mobileHeaderActions}>
            {isLoadingUser ? (
              <div
                className={styles.authLoading}
                aria-hidden="true"
              />
            ) : isLoggedIn ? (
              <button
                type="button"
                className={styles.menuButton}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
              >
                {isMenuOpen ? <FiX /> : <FiMenu />}
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className={styles.mobileHeaderLogin}
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className={styles.mobileHeaderRegister}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile slide-in navigation */}
        <div
          id="mobile-navigation"
          className={`${styles.mobileMenu} ${
            isMenuOpen && isLoggedIn ? styles.mobileMenuOpen : ""
          }`}
          aria-hidden={!isMenuOpen || !isLoggedIn}
          inert={!isMenuOpen || !isLoggedIn}
        >
          <nav
            className={styles.mobileNav}
            aria-label="Mobile navigation"
          >
            {renderNavigationItems(true)}

            <div className={styles.mobileDivider} />

            {/* Mobile account actions */}
            {isLoggedIn && (
              <>
                <Link
                  href="/profile"
                  className={styles.mobileAccount}
                  onClick={closeMenu}
                >
                  {renderAvatar(true)}

                  <span>
                    <strong>{userName}</strong>
                    <small>My Dashboard</small>
                  </span>
                </Link>

                <button
                  type="button"
                  className={styles.mobileLogout}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <FiLogOut aria-hidden="true" />
                  <span>
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </span>
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}