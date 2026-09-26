import Link from "next/link";
import {
  FiArrowRight,
  FiCheck,
  FiHeart,
  FiMapPin,
  FiStar,
} from "react-icons/fi";

import styles from "./index.module.scss";

const stories = [
  {
    id: 1,
    names: "Riya & Karan",
    location: "Mumbai, India",
    story:
      "We both joined looking for someone who understood our values. A few conversations later, we realized we had much more in common than we expected.",
    initials: "RK",
    date: "Connected in 2025",
  },
  {
    id: 2,
    names: "Meera & Aditya",
    location: "Bengaluru, India",
    story:
      "What started as a simple profile visit turned into hours of conversations. We took things slowly and discovered a connection that felt natural.",
    initials: "MA",
    date: "Connected in 2025",
  },
  {
    id: 3,
    names: "Sneha & Arjun",
    location: "Delhi, India",
    story:
      "We were looking for someone with similar priorities and a positive outlook on life. Finding each other made the whole journey worthwhile.",
    initials: "SA",
    date: "Connected in 2026",
  },
  {
    id: 4,
    names: "Sonam & Aditya",
    location: "Bengaluru, India",
    story:
      "What started as a simple profile visit turned into hours of conversations. We took things slowly and discovered a connection that felt natural.",
    initials: "MA",
    date: "Connected in 2025",
  },
];

export default function SuccessStories() {
  return (
    <section className={styles.section}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className="container">
        <div className={styles.heading}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowIcon}>
              <FiHeart aria-hidden="true" />
            </span>

            <span>Real stories, real connections</span>
          </div>

          <h2 className={styles.title}>
            Sometimes, one connection
            <span> changes everything.</span>
          </h2>

          <p className={styles.description}>
            Every meaningful relationship starts somewhere. Here
            are a few stories from people who found someone worth
            getting to know.
          </p>
        </div>

        <div className={styles.storyGrid}>
          {stories.map((story, index) => (
            <article
              key={story.id}
              className={`${styles.storyCard} ${
                index === 0 ? styles.featuredCard : ""
              }`}
            >
              <div className={styles.storyTop}>
                <div className={styles.avatar}>
                  {story.initials}
                </div>

                <div className={styles.storyMeta}>
                  <h3>{story.names}</h3>

                  <span>
                    <FiMapPin aria-hidden="true" />
                    {story.location}
                  </span>
                </div>

                <div className={styles.quoteMark}>
                  “
                </div>
              </div>

              <div className={styles.stars}>
                <FiStar aria-hidden="true" />
                <FiStar aria-hidden="true" />
                <FiStar aria-hidden="true" />
                <FiStar aria-hidden="true" />
                <FiStar aria-hidden="true" />
              </div>

              <p className={styles.storyText}>
                {story.story}
              </p>

              <div className={styles.storyBottom}>
                <span className={styles.storyDate}>
                  <span className={styles.checkIcon}>
                    <FiCheck aria-hidden="true" />
                  </span>

                  {story.date}
                </span>

                <span className={styles.heartIcon}>
                  <FiHeart aria-hidden="true" />
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.bottomMessage}>
            <div className={styles.bottomIcon}>
              <FiHeart aria-hidden="true" />
            </div>

            <div>
              <strong>Your story could be next.</strong>

              <span>
                Take the first step toward a meaningful connection.
              </span>
            </div>
          </div>

          <Link
            href="/register"
            className={styles.ctaButton}
          >
            <span>Start Your Story</span>
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        {/* <div className={styles.viewStories}>
          <Link href="/success-stories">
            <span>Read more success stories</span>
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div> */}
      </div>
    </section>
  );
}