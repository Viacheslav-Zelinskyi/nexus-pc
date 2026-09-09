"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { useCart } from "@/context/CartContext";
import { Link } from "@/i18n/navigation";

import styles from "./cart_page.module.scss";

export default function CartPage() {
  const t = useTranslations("cart");
  const { cart, removeItem, updateQuantity } = useCart();

  const lines = cart?.lines || [];
  const subtotal = cart?.subtotalPrice;
  const totalQuantity = cart?.totalQuantity || 0;

  if (lines.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyPage}>
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <h1>{t("emptyTitle")}</h1>
          <p>{t("emptyDescription")}</p>
          <Link href="/products" className={styles.emptyCta}>
            {t("emptyCta")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label={t("breadcrumbLabel")}>
        <Link href="/">{t("breadcrumbHome")}</Link>
        <span>/</span>
        <span className={styles.current}>{t("breadcrumbCart")}</span>
      </nav>

      <div className={styles.titleRow}>
        <h1>{t("pageTitle")}</h1>
        <span className={styles.itemsCount}>
          {t("itemsCount", { count: totalQuantity })}
        </span>
      </div>

      <div className={styles.layout}>
        <div className={styles.items}>
          {lines.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              {item.image?.url && (
                <Image
                  src={item.image.url}
                  alt={item.image.altText || item.title}
                  width={120}
                  height={120}
                  className={styles.itemImage}
                />
              )}

              <div className={styles.itemInfo}>
                <div className={styles.itemDetails}>
                  <Link
                    href={`/product/${item.handle}`}
                    className={styles.itemTitle}
                  >
                    {item.title}
                  </Link>
                  {item.variantTitle && (
                    <div className={styles.itemVariant}>
                      {item.variantTitle}
                    </div>
                  )}
                </div>

                <div className={styles.controls}>
                  <div className={styles.qtyBox}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label={t("decreaseQuantity")}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label={t("increaseQuantity")}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.id)}
                  >
                    {t("remove")}
                  </button>
                </div>
              </div>

              <div className={styles.itemPrice}>
                {item.price.amount} {item.price.currencyCode}
              </div>
            </div>
          ))}

          <Link href="/products" className={styles.continueLink}>
            &larr; {t("continueShopping")}
          </Link>
        </div>

        <aside className={styles.summary}>
          <h2>{t("orderSummary")}</h2>

          <div className={styles.summaryRow}>
            <span>{t("subtotal")}</span>
            <span>
              {subtotal?.amount} {subtotal?.currencyCode}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span>{t("shipping")}</span>
            <span className={styles.muted}>{t("shippingCalculated")}</span>
          </div>

          <div className={`${styles.summaryRow} ${styles.total}`}>
            <span>{t("total")}</span>
            <span>
              {subtotal?.amount} {subtotal?.currencyCode}
            </span>
          </div>

          {cart?.checkoutUrl && (
            <a href={cart.checkoutUrl} className={styles.checkoutBtn}>
              {t("checkout")}
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
