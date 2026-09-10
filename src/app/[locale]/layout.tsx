import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";

import { Header } from "@/components/layout/header";
import { MiniCart } from "@/components/layout/mini_cart";
import { CartProvider } from "@/context/CartContext";
import { Locales, locales, routing } from "@/i18n/routing";

import "../globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    metadataBase: new URL(baseUrl),

    title: {
      default: t("title"),
      template: `%s | NEXUS PC`,
    },
    description: t("description"),

    alternates: {
      canonical: `/${locale}`,
      languages: {
        uk: `/uk`,
        en: `/en`,
        "x-default": `/en`,
      },
    },

    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: "NEXUS PC",
      locale: locale === locales.uk ? "uk_UA" : "en_US",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locales)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <Header />
            <MiniCart />
            {children}
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
