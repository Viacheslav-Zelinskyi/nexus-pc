import { MetadataRoute } from "next";

import { locales as localesEnum } from "@/i18n/routing";
import { getProducts } from "@/lib/shopify/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const locales = Object.values(localesEnum);

  const products = await getProducts(250);

  const staticPages = ["", "/products", "/builder"];

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === "" ? "daily" : "weekly",
      priority: page === "" ? 1.0 : 0.9,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}${page}`])
        ),
      },
    }))
  );

  const productEntries: MetadataRoute.Sitemap = products.flatMap((product) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/product/${product.handle}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}/product/${product.handle}`])
        ),
      },
    }))
  );

  return [...staticEntries, ...productEntries];
}
