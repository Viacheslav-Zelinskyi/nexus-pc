import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import styles from "./deals.module.scss";

const DEAL_ITEMS = [
  {
    id: "gpu",
    image: "/images/home/gpu.png",
    href: "/products/gpu",
  },
  {
    id: "cpu",
    image: "/images/home/cpu.png",
    href: "/products/cpu",
  },
  {
    id: "storage",
    image: "/images/home/nvme.png",
    href: "/products/ssd",
  },
];

export function Deals() {
  const t = useTranslations("home.deals");

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>{t("eyebrow")}</span>
            <h2>{t("title")}</h2>
          </div>
        </div>

        <div className={styles.grid}>
          {DEAL_ITEMS.map((deal) => (
            <Link key={deal.id} href={deal.href} className={styles.card}>
              <span className={styles.category}>
                {t(`items.${deal.id}.category`)}
              </span>

              <div className={styles.imageWrapper}>
                <Image
                  src={deal.image}
                  alt={t(`items.${deal.id}.title`)}
                  fill
                  sizes="230px"
                />
              </div>

              <div className={styles.content}>
                <h3>{t(`items.${deal.id}.title`)}</h3>
                <p>{t(`items.${deal.id}.description`)}</p>
              </div>

              <span className={styles.arrow}>↗</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
