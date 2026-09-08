"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

import styles from "./language_switcher.module.scss";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  uk: "УКР",
};

export function LanguageSwitcher() {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(nextLocale: string) {
    setOpen(false);
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div className={styles.languageSwitcher} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={t("language")}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
        </svg>
        <span>{LOCALE_LABELS[locale] ?? locale.toUpperCase()}</span>
      </button>

      {open && (
        <ul className={styles.dropdown} role="listbox">
          {routing.locales.map((loc) => (
            <li key={loc}>
              <button
                type="button"
                role="option"
                aria-selected={loc === locale}
                className={loc === locale ? styles.active : undefined}
                onClick={() => handleSelect(loc)}
              >
                {LOCALE_LABELS[loc] ?? loc.toUpperCase()}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
