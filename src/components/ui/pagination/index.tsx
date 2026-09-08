import styles from "./pagination.module.scss";

export function Pagination() {
  return (
    <div className={styles.pagination}>
      <button className={styles.pageBtn} disabled>
        ←
      </button>
      <button className={`${styles.pageBtn} ${styles.activePage}`}>1</button>
      <button className={styles.pageBtn}>2</button>
      <button className={styles.pageBtn}>3</button>
      <button className={styles.pageBtn}>→</button>
    </div>
  );
}
