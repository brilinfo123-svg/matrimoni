import Link from "next/link";
import {
  FiArrowLeft,
  FiHeart,
  FiMessageCircle,
  FiStar,
  FiUsers,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";

import styles from "./page.module.scss";

export const metadata = {
  title: "Success Stories | EverMilan",
  description:
    "Discover relationship journeys and celebrate meaningful connections with EverMilan, a matrimonial platform built around compatibility, trust, and lasting relationships.",
};

const stories = [
  {
    id: 1,
    names: "A Journey of Understanding",
    category: "A CONNECTION BUILT ON TRUST",
    duration: "Their journey",
    quote:
      "Sometimes, the most meaningful connections begin with a simple conversation and grow through understanding, honesty, and shared values.",
    initials: "A & R",
    theme: "rose",
  },
  {
    id: 2,
    names: "Finding Common Ground",
    category: "SHARED VALUES, SHARED DREAMS",
    duration: "Their journey",
    quote:
      "Finding someone who respects your ambitions and understands your priorities can make the journey towards a life partnership truly special.",
    initials: "S & K",
    theme: "lavender",
  },
  {
    id: 3,
    names: "A Beautiful New Beginning",
    category: "FROM INTRODUCTION TO CONNECTION",
    duration: "Their journey",
    quote:
      "Every relationship has its own pace. Taking time to communicate openly and learn about each other can help build a meaningful bond.",
    initials: "M & A",
    theme: "peach",
  },
];

const highlights = [
  {
    icon: FiHeart,
    title: "Meaningful Connections",
    text: "Focus on compatibility, values, and mutual understanding.",
  },
  {
    icon: FiMessageCircle,
    title: "Honest Conversations",
    text: "Build familiarity through respectful and open communication.",
  },
  {
    icon: FiUsers,
    title: "Every Journey Is Unique",
    text: "Celebrate individual stories without comparing timelines.",
  },
];

export default function SuccessStoriesPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroDecoration} />

        <div className={styles.heroContent}>

          <span className={styles.eyebrow}>
            <FiHeart />
            LOVE, TRUST & TOGETHERNESS
          </span>

          <h1>
            Success <span>Stories</span>
          </h1>

          <p>
            Every meaningful connection has a story worth celebrating.
          </p>
        </div>
      </section>

      <section className={styles.introduction}>
        <span className={styles.sectionLabel}>EVERY STORY MATTERS</span>
        <h2>
          Different journeys. <span>One beautiful possibility.</span>
        </h2>
        <p>
          Meaningful relationships grow through trust, shared values,
          honest conversations, and the willingness to understand
          one another. Explore the qualities that make every journey special.
        </p>
      </section>

      <section className={styles.storiesSection}>
        <div className={styles.storiesGrid}>
          {stories.map((story) => (
            <article
              className={`${styles.storyCard} ${styles[story.theme]}`}
              key={story.id}
            >
              <div className={styles.storyVisual}>
                <div className={styles.decorativeCircle} />
                <div className={styles.heartBadge}>
                  <FiHeart />
                </div>
                <div className={styles.coupleMonogram}>
                  <span>{story.initials}</span>
                  <small>A STORY OF CONNECTION</small>
                </div>
                <div className={styles.visualCaption}>
                  <FiStar />
                  <span>Every connection is unique</span>
                </div>
              </div>

              <div className={styles.storyContent}>
                <span className={styles.storyCategory}>
                  {story.category}
                </span>
                <h3>{story.names}</h3>
                <p className={styles.quote}>
                  &ldquo;{story.quote}&rdquo;
                </p>

                <div className={styles.storyFooter}>
                  <span className={styles.storyDuration}>
                    {story.duration}
                  </span>
                  <FiHeart className={styles.footerHeart} />
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className={styles.disclaimer}>
          These are illustrative relationship stories, not verified
          testimonials from EverMilan members.
        </p>
      </section>

      <section className={styles.valuesSection}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionLabel}>THE FOUNDATION OF LOVE</span>
          <h2>
            What makes a connection <span>meaningful?</span>
          </h2>
        </div>

        <div className={styles.highlightsGrid}>
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <article className={styles.highlightCard} key={item.title}>
                <div className={styles.highlightIcon}>
                  <Icon />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaIcon}>
          <FiHeart />
        </div>

        <span className={styles.sectionLabel}>YOUR STORY STARTS HERE</span>
        <h2>
          Ready to begin your own <span>beautiful journey?</span>
        </h2>
        <p>
          Create your profile, explore compatible people, and take
          the first step towards a meaningful connection.
        </p>

        <div className={styles.ctaActions}>
          <Link href="/register" className={styles.primaryButton}>
            Create Your Profile
            <FiArrowRight />
          </Link>

          <Link href="/search" className={styles.secondaryButton}>
            Explore Profiles
          </Link>
        </div>

        <div className={styles.trustNote}>
          <FiCheckCircle />
          <span>Take your time. Build a connection that feels right.</span>
        </div>
      </section>
    </main>
  );
}