import Link from "next/link";

import styles from "./hero.module.scss";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>NEXUS PC / COMPONENTS</span>

          <h1>
            Build your
            <br />
            <span>next PC.</span>
          </h1>

          <p>
            High-performance components for gaming, creation and everything in
            between.
          </p>

          <div className={styles.actions}>
            <Link href="/builder" className={styles.primaryButton}>
              Build your PC
            </Link>

            <Link href="/products" className={styles.secondaryButton}>
              Shop components
            </Link>
          </div>

          <div className={styles.stats}>
            <div>
              <strong>500+</strong>
              <span>Components</span>
            </div>

            <div>
              <strong>24h</strong>
              <span>Fast dispatch</span>
            </div>

            <div>
              <strong>100%</strong>
              <span>Genuine</span>
            </div>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.glow} />

          <div className={styles.productVisual}>
            <div className={styles.gpuShape}>
              <div className={styles.gpuLogo}>NEXUS</div>
              <div className={styles.gpuFans}>
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>

          <div className={styles.visualLabel}>
            <span>FEATURED</span>
            <strong>RTX SERIES</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
