"use client";

import GlitchText from "@/components/ui/glitch_text";
import GlitchImage from "@/components/ui/glitch_image";
import { breakpoints, useMediaQuery } from "@/hooks/useMediaQuery";

import styles from "./page_in_development.module.scss";
import { useTranslations } from "next-intl";

export default function PageInDevelopment() {
  const isMobile = useMediaQuery(breakpoints.smallMobile);
  const t = useTranslations("pageInDevelopment");

  return (
    <div className={styles.page}>
      <GlitchImage
        src="/images/ui/page_in_development/icon.png"
        alt="Under Construction"
        width={261}
        height={261}
        speed={2}
        priority
        className={styles.icon}
      />

      <GlitchText
        speed={1}
        enableShadows
        enableOnHover={false}
        className={styles.glitchText}
      >
        {`${t("stillInDevelopment")} ${isMobile ? "" : t("checkBackLater")}`}
      </GlitchText>

      {isMobile && (
        <GlitchText
          speed={1}
          enableShadows
          enableOnHover={false}
          className={styles.glitchText}
        >
          {t("checkBackLater")}
        </GlitchText>
      )}
    </div>
  );
}
