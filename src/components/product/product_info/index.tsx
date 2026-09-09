"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "next-intl";

import { useCart } from "@/context/CartContext";

import { AccordionItem } from "./accordion_item";
import styles from "./product_info.module.scss";

interface VariantOption {
  name: string;
  value: string;
}

interface Variant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  selectedOptions: VariantOption[];
  image?: {
    url: string;
    altText?: string;
  };
  product?: {
    handle: string;
  };
}

interface Option {
  name: string;
  values: string[];
}

interface ProductInfoProps {
  product: {
    handle: string;
    title: string;
    vendor: string;
    price: number;
    currency: string;
    inStock: boolean;
    descriptionHtml: string;
    options: Option[];
    variants: Variant[];
  };
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { addItem } = useCart();
  const t = useTranslations("pdp");

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const option of product.options) {
      initial[option.name] = option.values[0];
    }
    return initial;
  });

  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const activeVariant = useMemo(() => {
    return product.variants.find((variant) =>
      variant.selectedOptions.every((opt) => selected[opt.name] === opt.value)
    );
  }, [product.variants, selected]);

  const price = activeVariant
    ? Number(activeVariant.price.amount)
    : product.price;
  const currency = activeVariant?.price.currencyCode ?? product.currency;
  const available = activeVariant?.availableForSale ?? product.inStock;

  const showOptions = product.options.length > 0 && product.variants.length > 1;

  const formattedPrice = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(price);

  function handleAddToCart() {
    if (!available || !activeVariant) return;

    addItem({
      variantId: activeVariant.id,
      title: product.title,
      variantTitle: activeVariant.title,
      handle: activeVariant.product?.handle ?? product.handle,
      price: activeVariant.price,
      image: activeVariant.image,
      quantity,
    });

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <div className={styles.info}>
      {product.vendor && (
        <span className={styles.eyebrow}>{product.vendor}</span>
      )}

      <h1 className={styles.title}>{product.title}</h1>

      <div className={styles.price}>{formattedPrice}</div>

      <span
        className={
          available
            ? `${styles.availability} ${styles.inStock}`
            : `${styles.availability} ${styles.outOfStock}`
        }
      >
        {available ? t("availabilityInStock") : t("availabilityOutOfStock")}
      </span>

      {showOptions &&
        product.options.map((option) => (
          <div key={option.name} className={styles.optionGroup}>
            <h3>{option.name}</h3>
            <div className={styles.optionValues}>
              {option.values.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={
                    selected[option.name] === value
                      ? `${styles.optionBtn} ${styles.activeOption}`
                      : styles.optionBtn
                  }
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, [option.name]: value }))
                  }
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}

      <div className={styles.purchaseRow}>
        <div className={styles.quantity}>
          <button
            type="button"
            aria-label={t("decreaseQuantity")}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span>{quantity}</span>
          <button
            type="button"
            aria-label={t("increaseQuantity")}
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>

        <button
          type="button"
          className={styles.addToCart}
          disabled={!available}
          onClick={handleAddToCart}
        >
          {!available
            ? t("outOfStock")
            : justAdded
              ? t("added")
              : t("addToCart")}
        </button>
      </div>

      <div className={styles.accordion}>
        <AccordionItem title={t("descriptionTitle")} defaultOpen>
          <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
        </AccordionItem>

        <AccordionItem title={t("shippingTitle")}>
          <p>{t("shippingText")}</p>
        </AccordionItem>
      </div>
    </div>
  );
}
