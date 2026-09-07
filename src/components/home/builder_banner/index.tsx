import Link from "next/link";

import styles from "./builder_banner.module.scss";

export function BuilderBanner() {
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
          <span className={styles.eyebrow}>NEXUS PC BUILDER</span>

          <h2>
            Your build.
            <br />
            <span>Our compatibility engine.</span>
          </h2>

          <p>
            Pick your components and we&apos;ll check sockets, form factors, power
            requirements and compatibility before you buy.
          </p>

          <Link href="/builder">Start building →</Link>
        </div>
      </div>
    </section>
  );
}
