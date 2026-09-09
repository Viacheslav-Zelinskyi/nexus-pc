import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { ProductCard } from "@/components/product/product_card";
import { getProducts } from "@/lib/shopify/products";

import styles from "./featured_products.module.scss";

export async function FeaturedProducts() {
  const t = await getTranslations("home.featuredProducts");

  const products = await getProducts(4);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>{t("eyebrow")}</span>

            <h2>{t("title")}</h2>
          </div>

          <Link href="/products">{t("viewAll")}</Link>
        </div>

        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.handle}
              product={{
                handle: product.handle,
                name: product.title,
                category: product.vendor ?? "Component",
                price: Number(product.variants.nodes[0]?.price.amount ?? 0),
                currency:
                  product.variants.nodes[0]?.price.currencyCode ?? "USD",
                image: product.featuredImage?.url ?? "/placeholder-product.png",
                imageAlt: product.featuredImage?.altText ?? product.title,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
