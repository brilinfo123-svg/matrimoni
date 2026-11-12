import type { Metadata } from "next";
import Link from "next/link";
import {
  FiArrowLeft,
  FiShield,
  FiCreditCard,
  FiRefreshCw,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

import styles from "./refund.module.scss";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | EverMilan",
  description:
    "Read EverMilan's refund, cancellation and payment policy for Contact Pack and Monthly Premium memberships.",
};

export default function RefundPolicyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          <FiArrowLeft />
          Back to Home
        </Link>

        <section className={styles.hero}>
          <div className={styles.heroIcon}>
            <FiShield />
          </div>

          <span className={styles.eyebrow}>EVERMILAN POLICIES</span>

          <h1>Refund & Cancellation Policy</h1>

          <p>
            Your trust matters to us. Please read our policy to understand
            how payments, cancellations and refund requests are handled
            when using EverMilan.
          </p>

          <span className={styles.updated}>
            Last updated: 4 November 2026
          </span>
        </section>

        <section className={styles.introCard}>
          <FiAlertCircle className={styles.introIcon} />

          <div>
            <h2>Our commitment</h2>
            <p>
              EverMilan aims to provide a transparent and reliable
              experience. If you experience a payment problem or believe
              you have been charged incorrectly, please contact us so
              we can review your request.
            </p>
          </div>
        </section>

        <div className={styles.content}>
          <section className={styles.policySection}>
            <span className={styles.sectionNumber}>01</span>
            <div>
              <h2>Digital Services & Paid Plans</h2>
              <p>
                EverMilan offers digital membership services that allow
                registered members to access additional matrimonial
                profile contact details.
              </p>

              <div className={styles.planGrid}>
                <article className={styles.planCard}>
                  <div className={styles.planIcon}>
                    <FiCreditCard />
                  </div>
                  <h3>Contact Pack</h3>
                  <strong>₹50</strong>
                  <span>20 additional contact unlock credits</span>
                </article>

                <article className={styles.planCard}>
                  <div className={styles.planIcon}>
                    <FiShield />
                  </div>
                  <h3>Monthly Premium</h3>
                  <strong>₹100</strong>
                  <span>Unlimited contact unlocks for 30 days</span>
                </article>
              </div>

              <p>
                These are digital services. Benefits are made available
                to your account after successful payment verification.
              </p>
            </div>
          </section>

          <section className={styles.policySection}>
            <span className={styles.sectionNumber}>02</span>
            <div>
              <h2>Contact Pack Refunds</h2>
              <p>
                Contact Pack purchases provide 20 additional contact
                unlock credits.
              </p>

              <ul>
                <li>
                  Credits already used to unlock profile contact details
                  are not eligible for a refund, except where required
                  by applicable law.
                </li>
                <li>
                  If a technical issue prevents purchased credits from
                  being added to your account, please contact our support
                  team for assistance.
                </li>
              </ul>
            </div>
          </section>

          <section className={styles.policySection}>
            <span className={styles.sectionNumber}>03</span>
            <div>
              <h2>Monthly Premium Refunds</h2>
              <p>
                Monthly Premium provides unlimited contact unlocks for
                30 days from activation.
              </p>

              <ul>
                <li>
                  Premium benefits begin after successful payment
                  verification and activation.
                </li>
                <li>
                  Once the membership has been activated and used,
                  payments are generally non-refundable, except in
                  cases of duplicate charges, verified service failures
                  or where required by applicable law.
                </li>
                <li>
                  If you have paid but Premium has not been activated
                  due to a technical issue, contact us for assistance.
                </li>
                <li>
                  Monthly Premium is a one-time 30-day purchase and
                  does not automatically renew unless we explicitly
                  introduce and disclose an automatic renewal feature.
                </li>
              </ul>
            </div>
          </section>

          <section className={styles.policySection}>
            <span className={styles.sectionNumber}>04</span>
            <div>
              <h2>Duplicate & Failed Payments</h2>
              <p>
                If your account is charged more than once for the same
                purchase, or money is deducted but the order is not
                completed, please contact us.
              </p>

              <ul>
                <li>
                  Duplicate successful payments will be reviewed for
                  a refund of the extra payment.
                </li>
                <li>
                  If a payment fails but money is deducted, the amount
                  may be automatically reversed by the bank or payment
                  provider.
                </li>
                <li>
                  If the amount is not reversed, contact us with your
                  payment details so we can investigate.
                </li>
              </ul>
            </div>
          </section>

          <section className={styles.policySection}>
            <span className={styles.sectionNumber}>05</span>
            <div>
              <h2>How to Request a Refund</h2>

              <div className={styles.requestCard}>
                <h3>To request a refund or report a payment issue, contact
                our support team through our Contact Us page.</h3>

                <Link href="/contact" className={styles.contactButton}>
                  Contact Support
                </Link>
              </div>
            </div>
          </section>

          <section className={styles.policySection}>
            <span className={styles.sectionNumber}>06</span>
            <div>
              <h2>Refund Review & Processing Time</h2>
              <p>
                We will review refund requests and may ask for additional
                information to verify the transaction.
              </p>

              <div className={styles.infoRow}>
                <FiClock />
                <p>
                  Once a refund is approved, it will be initiated through
                  the original payment method wherever possible.
                  The time taken for the amount to appear in your account
                  depends on your bank and payment provider.
                </p>
              </div>

              <p>
                Submitting a refund request does not automatically mean
                that the request has been approved.
              </p>
            </div>
          </section>

          <section className={styles.policySection}>
            <span className={styles.sectionNumber}>07</span>
            <div>
              <h2>Cancellation Policy</h2>
              <p>
                Contact Pack purchases and Monthly Premium memberships
                are one-time digital purchases. There is no automatic
                renewal under the current plans.
              </p>

              <p>
                You may stop using the service at any time. However,
                cancelling or choosing not to use a purchased service
                does not automatically qualify a payment for a refund.
                Refund eligibility is governed by the terms above and
                applicable law.
              </p>
            </div>
          </section>

          <section className={styles.policySection}>
            <span className={styles.sectionNumber}>08</span>
            <div>
              <h2>Policy Updates</h2>
              <p>
                EverMilan may update this Refund & Cancellation Policy
                when our services, payment processes or legal
                requirements change. The latest version will be
                published on this page with its updated date.
              </p>
            </div>
          </section>
        </div>

        <section className={styles.footerCard}>
          <div className={styles.footerIcon}>
            <FiRefreshCw />
          </div>

          <h2>Need help with a payment?</h2>

          <p>
            If you have questions about a transaction, refund or
            membership, our support team is here to help.
          </p>

          <Link href="/contact" className={styles.footerButton}>
            Get in Touch
          </Link>
        </section>
      </div>
    </main>
  );
}