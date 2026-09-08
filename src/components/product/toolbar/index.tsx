import styles from "./toolbar.module.scss";

interface ToolbarProps {
  totalItems: number;
}

export function Toolbar({ totalItems }: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <span className={styles.resultsCount}>Показано {totalItems} товарів</span>
      <div className={styles.sort}>
        <label>Сортувати за:</label>
        <select>
          <option>За популярністю</option>
          <option>Від дешевих до дорогих</option>
          <option>Від дорогих до дешевих</option>
          <option>Новинки</option>
        </select>
      </div>
    </div>
  );
}
