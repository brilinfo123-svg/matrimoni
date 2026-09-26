"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  FiHeart,
  FiLogOut,
  FiMenu,
  FiMessageCircle,
  FiSearch,
  FiUser,
  FiX,
} from "react-icons/fi";

import styles from "./index.module.scss";

const navigation = [
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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: session, status } = useSession();

  const isLoggedIn =
    status === "authenticated" && !!session?.user;

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    closeMenu();

    try {
      await signOut({
        callbackUrl: "/",
      });
    } catch (error) {
      console.error("LOGOUT_ERROR:", error);
      setIsLoggingOut(false);
    }
  };

  const userName =
    session?.user?.name?.trim() || "My Account";

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link
          href="/"
          className={styles.logo}
          onClick={closeMenu}
          aria-label="Matrimonial home"
        >
          <span className={styles.logoIcon}>
            <FiHeart aria-hidden="true" />
          </span>

          <span className={styles.logoText}>
            <span className={styles.logoMain}>
              Matrimonialaksh
            </span>

            <span className={styles.logoTagline}>
              Find your meaningful connection
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className={styles.desktopNav}
          aria-label="Main navigation"
        >
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={styles.navLink}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className={styles.desktopActions}>
            {isLoggedIn ? (
              <>
                {/* User */}
                <Link
                  href="/dashboard"
                  className={styles.userButton}
                  aria-label="Open dashboard"
                >
                  <span className={styles.userIcon}>
                    <FiUser aria-hidden="true" />
                  </span>

                  <span className={styles.userName}>
                    {userName}
                  </span>
                </Link>

                {/* Logout */}
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

        {/* Mobile Menu Button */}
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={
            isMenuOpen ? "Close menu" : "Open menu"
          }
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        id="mobile-navigation"
        className={`${styles.mobileMenu} ${
          isMenuOpen ? styles.mobileMenuOpen : ""
        }`}
      >
        <nav
          className={styles.mobileNav}
          aria-label="Mobile navigation"
        >
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={styles.mobileNavLink}
                onClick={closeMenu}
              >
                <span className={styles.mobileNavIcon}>
                  <Icon aria-hidden="true" />
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className={styles.mobileDivider} />

          {isLoggedIn ? (
            <div className={styles.mobileAuthLoading}>
              Loading...
            </div>
          ) : isLoggedIn ? (
            <>
              {/* Mobile Account */}
              <Link
                href="/dashboard"
                className={styles.mobileAccount}
                onClick={closeMenu}
              >
                <span className={styles.mobileAccountIcon}>
                  <FiUser aria-hidden="true" />
                </span>

                <span>
                  <strong>{userName}</strong>
                  <small>My Dashboard</small>
                </span>
              </Link>

              {/* Mobile Logout */}
              <button
                type="button"
                className={styles.mobileLogout}
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <FiLogOut aria-hidden="true" />

                <span>
                  {isLoggingOut
                    ? "Logging out..."
                    : "Logout"}
                </span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={styles.mobileLogin}
                onClick={closeMenu}
              >
                <FiUser aria-hidden="true" />
                <span>Login</span>
              </Link>

              <Link
                href="/register"
                className={styles.mobileRegister}
                onClick={closeMenu}
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