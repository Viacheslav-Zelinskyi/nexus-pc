import { Pagination } from "@/components/ui/pagination";
import { ProductCard } from "@/components/product/product_card";
import { getProducts } from "@/lib/shopify/products";
import { Filters } from "@/components/product/filters";
import { Toolbar } from "@/components/product/toolbar";

import styles from "./products.module.scss";

export default async function ProductsPage() {
  const products = await getProducts(12);

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <span className={styles.eyebrow}>КАТАЛОГ</span>
            <h1>Компоненти для ПК</h1>
          </div>

          <div className={styles.layout}>
            <Filters />

            <div className={styles.content}>
              <Toolbar totalItems={products.length} />

              <div className={styles.grid}>
                {products.map((product) => (
                  <ProductCard
                    key={product.handle}
                    product={{
                      handle: product.handle,
                      name: product.title,
                      category: product.vendor ?? "Component",
                      price: Number(
                        product.variants.nodes[0]?.price.amount ?? 0,
                      ),
                      currency:
                        product.variants.nodes[0]?.price.currencyCode ?? "USD",
                      image:
                        product.featuredImage?.url ??
                        "/placeholder-product.png",
                      imageAlt: product.featuredImage?.altText ?? product.title,
                    }}
                  />
                ))}
              </div>

              <Pagination />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
