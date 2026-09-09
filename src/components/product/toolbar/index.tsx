import { getTranslations } from "next-intl/server";

import styles from "./toolbar.module.scss";

interface ToolbarProps {
  totalItems: number;
}

const SORT_KEYS = ["popularity", "priceAsc", "priceDesc", "newest"] as const;

export async function Toolbar({ totalItems }: ToolbarProps) {
  const t = await getTranslations("toolbar");

  return (
    <div className={styles.toolbar}>
      <span className={styles.resultsCount}>
        {t("resultsCount", { count: totalItems })}
      </span>
      <div className={styles.sort}>
        <label>{t("sortLabel")}</label>
        <select>
          {SORT_KEYS.map((key) => (
            <option key={key} value={key}>
              {t(`sort.${key}`)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
