import { useTranslations } from "next-intl";
import Link from "next/link";

import styles from "./category_grid.module.scss";

const categories = [
  {
    slug: "gpu",
    code: "GPU",
  },
  {
    slug: "cpu",
    code: "CPU",
  },
  {
    slug: "motherboards",
    code: "MB",
  },
  {
    slug: "ram",
    code: "RAM",
  },
  {
    slug: "ssd",
    code: "SSD",
  },
  {
    slug: "psu",
    code: "PSU",
  },
];

export function CategoryGrid() {
  const t = useTranslations("home.categoryGrid");

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>{t("eyebrow")}</span>

            <h2>{t("title")}</h2>
          </div>

          <Link href="/products">{t("viewAll")}</Link>
        </div>

        <div className={styles.grid}>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products/${category.slug}`}
              className={styles.card}
            >
              <span className={styles.code}>{category.code}</span>

              <div className={styles.icon}>{category.code}</div>

              <div className={styles.info}>
                <h3>{t(`categories.${category.slug}`)}</h3>
                <span>{t("explore")}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
