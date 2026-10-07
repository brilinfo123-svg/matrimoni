"use client";

import styles from "./SkeletonLoader.module.scss";

type SkeletonLoaderProps = {
  variant: "conversations" | "messages";
  count?: number;
};

export default function SkeletonLoader({
  variant,
  count,
}: SkeletonLoaderProps) {
  const itemCount = count ?? (variant === "conversations" ? 6 : 5);

  if (variant === "conversations") {
    return (
      <div className={styles.conversationList} aria-label="Loading conversations" aria-busy="true">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div className={styles.conversationItem} key={index}>
            <span className={styles.avatar} />
            <div className={styles.conversationDetails}>
              <div className={styles.conversationTop}>
                <span className={styles.nameLine} />
                <span className={styles.timeLine} />
              </div>
              <span className={styles.previewLine} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.messageList} aria-label="Loading messages" aria-busy="true">
      {Array.from({ length: itemCount }).map((_, index) => {
        const incoming = index % 2 === 0;
        const bubbleSize = [styles.bubbleShort, styles.bubbleLong, styles.bubbleMedium][index % 3];

        return (
          <div
            className={`${styles.messageRow} ${incoming ? styles.incoming : styles.outgoing}`}
            key={index}
          >
            {incoming && <span className={styles.messageAvatar} />}
            <div className={styles.messageContent}>
              <span className={`${styles.bubble} ${bubbleSize}`} />
              <span className={styles.metaLine} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
