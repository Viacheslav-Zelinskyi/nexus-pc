import { useTranslations } from "next-intl";

import { GPUCanvas } from "../gpu_canvas";
import styles from "./hero.module.scss";
import { Link } from "@/i18n/navigation";

export function Hero() {
  const t = useTranslations("home.hero");

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>{t("eyebrow")}</span>

          <h1>
            {t.rich("title", {
              accent: (chunks) => (
                <>
                  <br />
                  <span className={styles.accent}>{chunks}</span>
                </>
              ),
            })}
          </h1>

          <p>{t("subtitle")}</p>

          <div className={styles.actions}>
            <Link href="/builder" className={styles.primaryButton}>
              {t("primaryCta")}
            </Link>

            <Link href="/products" className={styles.secondaryButton}>
              {t("secondaryCta")}
            </Link>
          </div>

          <div className={styles.stats}>
            <div>
              <strong>500+</strong>
              <span>{t("stats.components")}</span>
            </div>

            <div>
              <strong>24h</strong>
              <span>{t("stats.dispatch")}</span>
            </div>

            <div>
              <strong>100%</strong>
              <span>{t("stats.genuine")}</span>
            </div>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.glow} />

          <div className={styles.productVisual}>
            <GPUCanvas />
          </div>
        </div>
      </div>
    </section>
  );
}
