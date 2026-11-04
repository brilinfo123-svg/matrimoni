"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiCheck,
  FiArrowLeft,
  FiPhone,
  FiUnlock,
  FiStar,
  FiShield,
} from "react-icons/fi";
import styles from "./contact-plans.module.scss";

type ContactBalance = {
  freeTotal: number;
  freeUsed: number;
  freeRemaining: number;
  contactCredits: number;
  premiumActive: boolean;
  premiumUntil: string | null;
  totalAvailable: number | "unlimited";
  unlockedCount: number;
};

const plans = [
  {
    id: "contact_pack",
    name: "Contact Pack",
    price: "₹50",
    period: "one-time",
    description: "Get 20 additional contact unlocks.",
    icon: FiPhone,
    features: [
      "20 contact unlock credits",
      "One credit per new profile",
      "Already unlocked profiles stay accessible",
      "Credits remain after Premium expires",
    ],
    button: "Buy Contact Pack",
  },
  {
    id: "monthly",
    name: "Monthly Premium",
    price: "₹100",
    period: "30 days",
    description: "Connect without worrying about contact credits.",
    icon: FiStar,
    popular: true,
    features: [
      "Unlimited contact unlocks for 30 days",
      "No free or pack credits deducted",
      "Your Contact Pack credits stay safe",
      "Use remaining credits after Premium expires",
    ],
    button: "Get Monthly Premium",
  },
];

export default function ContactPlansPage() {
  const [balance, setBalance] = useState<ContactBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successPlan, setSuccessPlan] = useState("");

  async function loadBalance() {
    try {
      const response = await fetch("/api/contacts/balance", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBalance(data.balance);
      }
    } catch (err) {
      console.error("CONTACT_BALANCE_ERROR:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBalance();
  }, []);


  async function handleActivate(planId: string) {
    console.log("Selected plan:", planId);
  
    setActivating(planId);
    setMessage("");
    setError("");
  
    try {
      const response = await fetch("/api/contacts/activate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: planId }),
      });
  
      const data = await response.json();
  
      console.log("Activation response:", response.status, data);
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to activate plan.");
      }
  
      setMessage(data.message || "Plan activated successfully!");

        setSuccessPlan(
        planId === "contact_pack"
            ? "Contact Pack"
            : "Monthly Premium"
        );

        setShowSuccessDialog(true);

        await loadBalance();
  
      await loadBalance();
    } catch (err) {
      console.error("PLAN_ACTIVATION_ERROR:", err);
  
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setActivating("");
    }
  }
  

  const premiumActive = Boolean(balance?.premiumActive);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/profile" className={styles.backLink}>
          <FiArrowLeft />
          Back to Profile
        </Link>

        {balance && (
          <section className={styles.balanceCard}>
            <div>
              <span className={styles.balanceLabel}>YOUR CURRENT BALANCE</span>
              <h2>
                {premiumActive
                  ? "Unlimited contacts"
                  : `${balance.freeRemaining + balance.contactCredits} contacts available`}
              </h2>
              <p>
                {balance.freeRemaining} free unlocks remaining
                {" · "}
                {balance.contactCredits} pack credits
              </p>
            </div>

            <div className={styles.balanceIcon}>
              <FiUnlock />
            </div>
          </section>
        )}

        {premiumActive && (
          <div className={styles.activeNotice}>
            <span className={styles.activeDot} />
            Your Monthly Premium plan is currently active.
          </div>
        )}

        {message && (
          <div className={styles.successMessage}>{message}</div>
        )}

        {error && (
          <div className={styles.errorMessage}>{error}</div>
        )}

        <div className={styles.planGrid}>
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isPremium = plan.id === "monthly";
            const isActive = isPremium && premiumActive;

            return (
              <article
                key={plan.id}
                className={`${styles.planCard} ${
                  plan.popular ? styles.premiumCard : ""
                }`}
              >
                {plan.popular && (
                  <span className={styles.popularBadge}>
                    MOST POPULAR
                  </span>
                )}

                <div className={styles.planIcon}>
                  <Icon />
                </div>

                <h2>{plan.name}</h2>
                <p className={styles.description}>{plan.description}</p>

                <div className={styles.price}>
                  {plan.price}
                  <span> / {plan.period}</span>
                </div>

                <div className={styles.featureList}>
                  {plan.features.map((feature) => (
                    <div className={styles.feature} key={feature}>
                      <span className={styles.checkIcon}>
                        <FiCheck />
                      </span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                type="button"
                className={`${styles.planButton} ${
                    plan.popular ? styles.premiumButton : ""
                }`}
                disabled={loading || Boolean(activating) || isActive}
                onClick={() => handleActivate(plan.id)}
                >
                {activating === plan.id
                    ? "Please wait..."
                    : isActive
                    ? "Premium Active"
                    : plan.button}
                </button>
              </article>
            );
          })}
        </div>

        <section className={styles.freePlan}>
          <div className={styles.freeIcon}>
            <FiShield />
          </div>
          <div>
            <h3>Start with our Free Plan</h3>
            <p>
              Every new member gets 5 free contact unlocks.
              No payment is required to use your free unlocks.
            </p>
          </div>
          <span className={styles.freeTag}>FREE</span>
        </section>

        <p className={styles.footerNote}>
          Contact unlocks are charged only once per profile.
          If you have already unlocked a profile, viewing its contact
          again will not use another credit.
        </p>
        {showSuccessDialog && (
            <div
                className={styles.successOverlay}
                onClick={() => setShowSuccessDialog(false)}
            >
                <div
                className={styles.successDialog}
                onClick={(e) => e.stopPropagation()}
                >
                <button
                    type="button"
                    className={styles.dialogClose}
                    onClick={() => setShowSuccessDialog(false)}
                    aria-label="Close dialog"
                >
                    ×
                </button>

                <div className={styles.successIcon}>
                    <FiCheck />
                </div>

                <span className={styles.successEyebrow}>
                    CONGRATULATIONS!
                </span>

                <h2>Your Plan Is Activated!</h2>

                <p>
                    Your <strong>{successPlan}</strong> has been activated
                    successfully. You can now enjoy your EverMilan benefits.
                </p>

                <button
                    type="button"
                    className={styles.dialogButton}
                    onClick={() => setShowSuccessDialog(false)}
                >
                    Done
                </button>
                </div>
            </div>
            )}
      </div>
    </div>
  );
}