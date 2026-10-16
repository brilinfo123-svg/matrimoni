
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiCalendar, FiClock } from "react-icons/fi";

import { blogs } from "@/data/blogs";
import styles from "./page.module.scss";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = blogs.find((item) => item.slug === slug);

  if (!blog) {
    return { title: "Blog Not Found | EverMilan" };
  }

  return {
    title: `${blog.title} | EverMilan`,
    description: blog.excerpt,
  };
}

export default async function BlogDetailsPage({ params }: Props) {
  const { slug } = await params;
  const blog = blogs.find((item) => item.slug === slug);

  if (!blog) notFound();

  const relatedBlogs = blogs
    .filter(
      (item) =>
        item.category === blog.category && item.slug !== blog.slug
    )
    .slice(0, 3);

  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <div className={styles.wrapper}>
        <Link href="/blogs" className={styles.backLink}>
          <FiArrowLeft />
          Back to Blogs
        </Link>

        <span className={styles.category}>{blog.category}</span>
        </div>

        <h1>{blog.title}</h1>
        <p className={styles.excerpt}>{blog.excerpt}</p>

        <div className={styles.meta}>
          <span><FiCalendar /> {blog.date}</span>
          <span><FiClock /> {blog.readTime}</span>
        </div>

        <div className={`${styles.blogCover} ${styles[blog.theme]}`}>
            <blog.icon size={72} strokeWidth={1.4} />
            </div>

        <div className={styles.content}>
          {blog.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <section className={styles.articleCta}>
          <h2>Your meaningful connection starts here.</h2>
          <p>
            Discover compatible profiles and take the next step
            towards a meaningful relationship.
          </p>
          <Link href="/register">Create Your Profile</Link>
        </section>
      </article>

      {relatedBlogs.length > 0 && (
        <section className={styles.related}>
          <h2>Related Articles</h2>

          <div className={styles.relatedGrid}>
            {relatedBlogs.map((item) => (
              <Link
                key={item.slug}
                href={`/blogs/${item.slug}`}
                className={styles.relatedCard}
              >
                <span>{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                <strong>Read Article →</strong>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
