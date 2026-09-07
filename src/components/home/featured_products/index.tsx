import Link from "next/link";
import { ProductCard } from "@/components/product/product_card";

import styles from "./featured_products.module.scss";
import { getProducts } from "@/lib/shopify/products";

export async function FeaturedProducts() {
  const products = await getProducts(4);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>NEXUS SELECTED</span>

            <h2>Featured components</h2>
          </div>

          <Link href="/products">View all →</Link>
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
