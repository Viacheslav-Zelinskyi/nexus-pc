"use client";

import { useState } from "react";

import styles from "./accordion_item.module.scss";

interface AccordionItemProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function AccordionItem({
  title,
  defaultOpen = false,
  children,
}: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.item}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{title}</span>
        <span
          className={open ? `${styles.icon} ${styles.iconOpen}` : styles.icon}
        >
          +
        </span>
      </button>

      {open && <div className={styles.panel}>{children}</div>}
    </div>
  );
}
