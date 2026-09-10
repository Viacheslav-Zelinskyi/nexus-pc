import { defineRouting } from "next-intl/routing";

export const locales = { uk: "uk", en: "en" } as const;

export type Locales = (typeof locales)[keyof typeof locales];

export const routing = defineRouting({
  locales: Object.values(locales),
  defaultLocale: locales.en,
});
