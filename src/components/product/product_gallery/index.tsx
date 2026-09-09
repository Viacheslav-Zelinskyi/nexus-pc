"use client";

import { useState } from "react";

import Image from "next/image";

import styles from "./product_gallery.module.scss";

interface GalleryImage {
  url: string;
  altText: string | null;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productTitle: string;
}

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const gallery =
    images.length > 0
      ? images
      : [{ url: "/placeholder-product.png", altText: productTitle }];

  const active = gallery[activeIndex];

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage}>
        <Image
          key={active.url}
          src={active.url}
          alt={active.altText ?? productTitle}
          fill
          sizes="(max-width: 900px) 100vw, 60vw"
          priority
        />
      </div>

      {gallery.length > 1 && (
        <div className={styles.thumbs} role="tablist" aria-label={productTitle}>
          {gallery.map((image, index) => (
            <button
              key={image.url}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              className={
                index === activeIndex
                  ? `${styles.thumb} ${styles.activeThumb}`
                  : styles.thumb
              }
              onClick={() => setActiveIndex(index)}
            >
              <Image
                src={image.url}
                alt={image.altText ?? `${productTitle} ${index + 1}`}
                fill
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
