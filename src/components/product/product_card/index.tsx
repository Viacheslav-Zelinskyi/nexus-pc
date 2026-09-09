import Image from "next/image";
import Link from "next/link";

import styles from "./product_card.module.scss";

export type ProductCardProduct = {
  handle: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  image: string;
  imageAlt?: string;
  badge?: string;
};

interface ProductCardProps {
  product: ProductCardProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <Link href={`/product/${product.handle}`} className={styles.imageWrapper}>
        {product.badge && <span className={styles.badge}>{product.badge}</span>}

        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className={styles.image}
        />
      </Link>

      <div className={styles.content}>
        <Link
          href={`/products/${product.category}`}
          className={styles.category}
        >
          {product.category}
        </Link>

        <Link href={`/product/${product.handle}`} className={styles.name}>
          {product.name}
        </Link>

        <div className={styles.footer}>
          <span className={styles.price}>
            ${product.price.toLocaleString()}
          </span>

          <Link
            href={`/product/${product.handle}`}
            type="button"
            aria-label={`Add ${product.name} to cart`}
            className={styles.addButton}
          >
            +
          </Link>
        </div>
      </div>
    </article>
  );
}
