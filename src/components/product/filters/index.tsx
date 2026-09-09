import { getTranslations } from "next-intl/server";

import styles from "./filters.module.scss";

const CATEGORY_KEYS = [
  "all",
  "gpu",
  "cpu",
  "motherboards",
  "ram",
  "storage",
  "psu",
  "cooling",
] as const;

const BRANDS = ["NVIDIA", "AMD", "Intel", "ASUS", "MSI", "Corsair"];

export async function Filters() {
  const t = await getTranslations("filters");

  return (
    <aside className={styles.sidebar}>
      <div className={styles.filterGroup}>
        <h3>{t("categoriesTitle")}</h3>
        <ul>
          {CATEGORY_KEYS.map((key, idx) => (
            <li key={key}>
              <button className={idx === 0 ? styles.activeFilter : ""}>
                {t(`categories.${key}`)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.filterGroup}>
        <h3>{t("brandTitle")}</h3>
        {BRANDS.map((brand) => (
          <label key={brand} className={styles.checkboxLabel}>
            <input type="checkbox" />
            <span className={styles.checkboxText}>{brand}</span>
          </label>
        ))}
      </div>

      <div className={styles.filterGroup}>
        <h3>{t("priceTitle")}</h3>
        <div className={styles.priceInputs}>
          <input type="number" placeholder={t("priceFrom")} />
          <span>-</span>
          <input type="number" placeholder={t("priceTo")} />
        </div>
      </div>
    </aside>
  );
}
