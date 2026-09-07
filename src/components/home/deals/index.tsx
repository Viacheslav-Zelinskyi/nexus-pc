import Link from "next/link";

import styles from "./deals.module.scss";
import Image from "next/image";

const deals = [
  {
    category: "GPU",
    title: "Upgrade your graphics",
    description: "Next-generation performance.",
    image: "/images/home/gpu.png",
    href: "/products/gpu",
  },
  {
    category: "CPU",
    title: "Power your build",
    description: "High-performance processors.",
    image: "/images/home/cpu.png",
    href: "/products/cpu",
  },
  {
    category: "STORAGE",
    title: "More space. More speed.",
    description: "Fast NVMe storage.",
    image: "/images/home/nvme.png",
    href: "/products/ssd",
  },
];

export function Deals() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>SHOP SMART</span>

            <h2>Explore components</h2>
          </div>
        </div>

        <div className={styles.grid}>
          {deals.map((deal) => (
            <Link key={deal.category} href={deal.href} className={styles.card}>
              <span className={styles.category}>{deal.category}</span>

              <div className={styles.imageWrapper}>
                <Image
                  src={deal.image}
                  alt={deal.title}
                  fill
                  sizes="230px"
                />
              </div>

              <div className={styles.content}>
                <h3>{deal.title}</h3>
                <p>{deal.description}</p>
              </div>

              <span className={styles.arrow}>↗</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
