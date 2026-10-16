import Link from "next/link";
import {
  FiArrowLeft,
  FiHeart,
  FiShield,
  FiUsers,
  FiTarget,
  FiCheckCircle,
  FiMessageCircle,
  FiStar,
} from "react-icons/fi";

import styles from "./page.module.scss";

export const metadata = {
  title: "About Us | EverMilan",
  description:
    "Discover EverMilan, a matrimonial platform dedicated to meaningful connections, genuine relationships, and helping people find their life partners.",
};

const values = [
  {
    icon: FiHeart,
    title: "Meaningful Connections",
    description:
      "We believe finding a life partner is about shared values, mutual respect, and a connection that grows stronger with time.",
  },
  {
    icon: FiShield,
    title: "Privacy & Trust",
    description:
      "Your privacy matters. We encourage thoughtful sharing, responsible interactions, and a respectful matrimonial experience.",
  },
  {
    icon: FiUsers,
    title: "Everyone Belongs",
    description:
      "Every individual has a unique story. We aim to create a welcoming space where people can explore compatible relationships.",
  },
  {
    icon: FiTarget,
    title: "Compatibility First",
    description:
      "We help members explore potential partners through personal preferences, shared interests, and important life goals.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description:
      "Share your interests, values, and preferences to introduce yourself authentically.",
  },
  {
    number: "02",
    title: "Discover Compatible Matches",
    description:
      "Explore profiles and find people whose goals and expectations align with yours.",
  },
  {
    number: "03",
    title: "Build a Meaningful Bond",
    description:
      "Connect, communicate, and take your time getting to know someone special.",
  },
];

export default function AboutPage() {
  return (
    <main className={styles.page}>
       
      <section className={styles.hero}>
        <div className={styles.heroGlow} />

        <div className={styles.heroContent}>

          <div className={styles.eyebrow}>
            <FiHeart />
            <span>OUR STORY, YOUR JOURNEY</span>
          </div>

          <h1>
            About <span>EverMilan</span>
          </h1>

          <p>
            Bringing hearts closer, one meaningful connection at a time.
          </p>

          <div className={styles.heroDecoration}>
            <FiHeart />
          </div>
        </div>
      </section>
      <div className="container">
      <section className={styles.introSection}>
        <div className={styles.introVisual}>
          <div className={styles.visualCard}>
            <div className={styles.visualIcon}>
              <FiHeart />
            </div>
            <span className={styles.visualLabel}>MADE FOR CONNECTIONS</span>
            <h2>
              Every great love story begins with a meaningful connection.
            </h2>
            <div className={styles.visualLine} />
            <p>Discover someone who feels like home.</p>
            <FiHeart className={styles.floatingHeart} />
          </div>
        </div>

        <div className={styles.introContent}>
          <span className={styles.sectionLabel}>WHO WE ARE</span>
          <h2>
            More than a match.
            <br />
            A journey towards <span>togetherness.</span>
          </h2>
          <p>
            At EverMilan, we believe that finding a life partner is one of
            life&apos;s most meaningful journeys. It is about discovering
            someone who understands your dreams, respects your values, and
            shares your vision for the future.
          </p>
          <p>
            Our platform is designed to help individuals and families
            explore compatible matrimonial connections in a welcoming,
            thoughtful, and respectful environment.
          </p>
          <p>
            Whether you are beginning your search or taking the next step,
            we want to make your journey feel more personal and meaningful.
          </p>

          <Link href="/register" className={styles.primaryButton}>
            Start Your Journey
            <FiHeart />
          </Link>
        </div>
      </section>

      <section className={styles.valuesSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>WHAT MATTERS TO US</span>
          <h2>
            The values behind <span>every connection</span>
          </h2>
          <p>
            The principles that guide us in helping people discover
            relationships built on understanding and trust.
          </p>
        </div>

        <div className={styles.valuesGrid}>
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <article className={styles.valueCard} key={value.title}>
                <div className={styles.valueIcon}>
                  <Icon />
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.journeySection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>YOUR JOURNEY WITH US</span>
          <h2>
            Three steps towards <span>something beautiful</span>
          </h2>
          <p>
            Finding your special someone can begin with a few simple steps.
          </p>
        </div>

        <div className={styles.stepsGrid}>
          {steps.map((step) => (
            <article className={styles.stepCard} key={step.number}>
              <span className={styles.stepNumber}>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.promiseSection}>
        <div className={styles.promiseIcon}>
          <FiShield />
        </div>

        <div className={styles.promiseContent}>
          <span className={styles.sectionLabel}>OUR PROMISE</span>
          <h2>Your journey deserves care, respect, and understanding.</h2>
          <p>
            We encourage honest profiles, respectful communication, and
            thoughtful decisions. Take your time getting to know each
            other, protect your personal information, and move forward
            at a pace that feels right for you.
          </p>

          <Link href="/safety-tips" className={styles.textLink}>
            Explore Safety Tips
            <FiArrowLeft className={styles.linkArrow} />
          </Link>
        </div>

        <FiStar className={styles.promiseDecoration} />
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaIcon}>
          <FiMessageCircle />
        </div>
        <h2>
          Your story could be the next <span>beautiful beginning.</span>
        </h2>
        <p>
          Take the first step towards finding someone who shares your
          dreams, values, and vision for the future.
        </p>

        <div className={styles.ctaActions}>
          <Link href="/register" className={styles.primaryButton}>
            Create Your Profile
            <FiHeart />
          </Link>

          <Link href="/search" className={styles.secondaryButton}>
            Explore Profiles
          </Link>
        </div>

        <div className={styles.ctaTrust}>
          <FiCheckCircle />
          <span>A thoughtful beginning to a meaningful relationship</span>
        </div>
      </section>
      </div>
    </main>
  );
}