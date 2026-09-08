import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import styles from "./header.module.scss";
import { LanguageSwitcher } from "./language_switcher";

export function Header() {
  const t = useTranslations("header");

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          {t("logo")}
        </Link>

        <nav className={styles.navLinks}>
          <Link href="/builder">{t("builder")}</Link>
          <Link href="/products" className={styles.active}>
            {t("catalog")}
          </Link>
        </nav>

        <div className={styles.userActions}>
          <LanguageSwitcher />

          <button className={styles.iconButton} aria-label={t("search")}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          <Link
            href="/account"
            className={styles.iconButton}
            aria-label={t("account")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>

          <Link
            href="/cart"
            className={styles.iconButton}
            aria-label={t("cart")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className={styles.cartBadge}>2</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
