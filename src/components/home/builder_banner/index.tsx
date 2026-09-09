import Link from "next/link";

import styles from "./builder_banner.module.scss";
import { useTranslations } from "next-intl";

export function BuilderBanner() {
    const t = useTranslations("home.builderBanner");
    
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.visual}>
          <div className={styles.circle} />
          <span className={styles.cpu}>CPU</span>
          <span className={styles.gpu}>GPU</span>
          <span className={styles.ram}>RAM</span>
          <span className={styles.ssd}>SSD</span>
        </div>

        <div className={styles.content}>
          <span className={styles.eyebrow}>{t("eyebrow")}</span>

          <h2>
            {t("title.line1")}
            <br />
            <span>{t("title.line2")}</span>
          </h2>

          <p>
            {t("description")}
          </p>

          <Link href="/builder">{t("cta")}</Link>
        </div>
      </div>
    </section>
  );
}
