import { getTranslations } from "next-intl/server";

import { Filters } from "@/components/product/filters";
import { ProductCard } from "@/components/product/product_card";
import { Toolbar } from "@/components/product/toolbar";
import { Pagination } from "@/components/ui/pagination";
import {
  type ShopifyProduct,
  getCollection,
  getProducts,
  getProductsByVendor,
  getVendor,
} from "@/lib/shopify/products";

import styles from "./products.module.scss";

export const revalidate = 3600;

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string; category?: string[] }>;
}) {
  const { category } = await params;
  const slug = category?.[0];

  const t = await getTranslations("plp");

  let title = t("defaultTitle");
  let description: string | null = null;
  let products: ShopifyProduct[];

  if (slug) {
    const collection = await getCollection(slug, 12);

    if (collection) {
      title = collection.title;
      description = collection.description || null;
      products = collection.products.nodes;
    } else {
      const vendor = await getVendor(slug);

      products = await getProductsByVendor(slug, 12);

      title = vendor?.name ?? slug;
      description = vendor?.description ?? null;
    }
  } else {
    products = await getProducts(12);
  }

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <span className={styles.eyebrow}>{t("eyebrow")}</span>
            <h1>{title}</h1>
            {description && <p className={styles.description}>{description}</p>}
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
                        product.variants.nodes[0]?.price.amount ?? 0
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
