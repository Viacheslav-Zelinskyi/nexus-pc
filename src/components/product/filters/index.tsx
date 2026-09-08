import styles from "./filters.module.scss";

const CATEGORIES = [
  "Усі компоненти",
  "GPU",
  "CPU",
  "Материнські плати",
  "RAM",
  "Накопичувачі",
  "Блоки живлення",
  "Охолодження",
];
const BRANDS = ["NVIDIA", "AMD", "Intel", "ASUS", "MSI", "Corsair"];

export function Filters() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.filterGroup}>
        <h3>Категорії</h3>
        <ul>
          {CATEGORIES.map((category, idx) => (
            <li key={category}>
              <button className={idx === 0 ? styles.activeFilter : ""}>
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.filterGroup}>
        <h3>Бренд</h3>
        {BRANDS.map((brand) => (
          <label key={brand} className={styles.checkboxLabel}>
            <input type="checkbox" />
            <span className={styles.checkboxText}>{brand}</span>
          </label>
        ))}
      </div>

      <div className={styles.filterGroup}>
        <h3>Ціна</h3>
        <div className={styles.priceInputs}>
          <input type="number" placeholder="Від" />
          <span>-</span>
          <input type="number" placeholder="До" />
        </div>
      </div>
    </aside>
  );
}
