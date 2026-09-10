import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product/product_card";
import { ProductGallery } from "@/components/product/product_gallery";
import { ProductInfo } from "@/components/product/product_info";
import { Link } from "@/i18n/navigation";
import {
  type ShopifyProductDetail,
  getProduct,
  getProducts,
} from "@/lib/shopify/products";

import styles from "./product.module.scss";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getProducts(20);
  const locales = ["uk", "en"];

  return products.flatMap((product) =>
    locales.map((locale) => ({
      locale,
      handle: product.handle,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}): Promise<Metadata> {
  const { locale, handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const title = product.title;
  const description =
    product.descriptionHtml
      ?.replace(/<[^>]*>/g, "")
      .slice(0, 160)
      .trim() || undefined;

  const image = product.featuredImage?.url;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/product/${handle}`,
      languages: {
        uk: `/uk/product/${handle}`,
        en: `/en/product/${handle}`,
        "x-default": `/en/product/${handle}`,
      },
    },
    openGraph: {
      title,
      description,
      images: image
        ? [{ url: image, alt: product.featuredImage?.altText || title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const { handle } = await params;

  const t = await getTranslations("pdp");

  const product: ShopifyProductDetail | null = await getProduct(handle);

  if (!product) {
    notFound();
  }

  const firstVariant = product.variants.nodes[0];
  const price = Number(firstVariant?.price.amount ?? 0);
  const currency = firstVariant?.price.currencyCode ?? "USD";
  const inStock = product.variants.nodes.some((v) => v.availableForSale);

  const related = (await getProducts(8)).filter(
    (p) => p.handle !== product.handle
  );

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
        <div className={styles.container}>
          <nav className={styles.breadcrumbs} aria-label={t("breadcrumbLabel")}>
            <Link href="/products">{t("breadcrumbHome")}</Link>
            <span className={styles.breadcrumbSep}>/</span>
            <Link href={`/products/${product.vendor}`}>
              {product.vendor ?? t("breadcrumbCatalog")}
            </Link>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbCurrent}>{product.title}</span>
          </nav>

          <div className={styles.layout}>
            <ProductGallery
              images={product.images.nodes}
              productTitle={product.title}
            />

            <ProductInfo
              product={{
                handle: product.handle,
                title: product.title,
                vendor: product.vendor ?? "",
                price,
                currency,
                inStock,
                descriptionHtml: product.descriptionHtml,
                options: product.options,
                variants: product.variants.nodes,
              }}
            />
          </div>

          {related.length > 0 && (
            <section className={styles.related}>
              <h2 className={styles.relatedTitle}>{t("relatedTitle")}</h2>

              <div className={styles.relatedGrid}>
                {related.slice(0, 4).map((p) => (
                  <ProductCard
                    key={p.handle}
                    product={{
                      handle: p.handle,
                      name: p.title,
                      category: p.vendor ?? "Component",
                      price: Number(p.variants.nodes[0]?.price.amount ?? 0),
                      currency:
                        p.variants.nodes[0]?.price.currencyCode ?? "USD",
                      image: p.featuredImage?.url ?? "/placeholder-product.png",
                      imageAlt: p.featuredImage?.altText ?? p.title,
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
