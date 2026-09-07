import Link from "next/link";

import styles from "./category_grid.module.scss";

const categories = [
  {
    name: "Graphics Cards",
    slug: "gpu",
    code: "GPU",
  },
  {
    name: "Processors",
    slug: "cpu",
    code: "CPU",
  },
  {
    name: "Motherboards",
    slug: "motherboards",
    code: "MB",
  },
  {
    name: "Memory",
    slug: "ram",
    code: "RAM",
  },
  {
    name: "Storage",
    slug: "ssd",
    code: "SSD",
  },
  {
    name: "Power Supplies",
    slug: "psu",
    code: "PSU",
  },
];

export function CategoryGrid() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>EXPLORE</span>

            <h2>Shop by category</h2>
          </div>

          <Link href="/products">View all products →</Link>
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
                <h3>{category.name}</h3>
                <span>Explore →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
