"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { useCart } from "@/context/CartContext";
import { Link } from "@/i18n/navigation";

import styles from "./mini_cart.module.scss";

export function MiniCart() {
  const t = useTranslations("cart");
  const { cart, isOpen, closeCart, removeItem, updateQuantity } = useCart();

  const lines = cart?.lines || [];
  const subtotal = cart?.subtotalPrice;
  const totalQuantity = cart?.totalQuantity || 0;

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.open : ""}`}
        onClick={closeCart}
      />

      <aside className={`${styles.drawer} ${isOpen ? styles.open : ""}`}>
        <div className={styles.header}>
          <h2>{t("title", { count: totalQuantity })}</h2>
          <button
            className={styles.closeBtn}
            onClick={closeCart}
            aria-label={t("close")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {lines.length === 0 ? (
            <div className={styles.emptyState}>{t("empty")}</div>
          ) : (
            lines.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                {item.image?.url && (
                  <Image
                    src={item.image.url}
                    alt={item.image.altText || item.title}
                    width={70}
                    height={70}
                    className={styles.itemImage}
                  />
                )}
                <div className={styles.itemInfo}>
                  {/* Text block: title, variant, price */}
                  <div className={styles.itemDetails}>
                    <Link
                      href={`/product/${item.handle}`}
                      className={styles.itemTitle}
                      onClick={closeCart}
                    >
                      {item.title}
                    </Link>
                    {item.variantTitle && (
                      <div className={styles.itemVariant}>
                        {item.variantTitle}
                      </div>
                    )}
                    <div className={styles.itemPrice}>
                      {item.price.amount} {item.price.currencyCode}
                    </div>
                  </div>

                  <div className={styles.controls}>
                    <div className={styles.qtyBox}>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        aria-label={t("decreaseQuantity")}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
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
              </div>
            ))
          )}
        </div>

        {lines.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotal}>
              <span>{t("subtotal")}</span>
              <span className={styles.price}>
                {subtotal?.amount} {subtotal?.currencyCode}
              </span>
            </div>

            <div className={styles.actions}>
              <Link
                href="/cart"
                className={styles.viewCartBtn}
                onClick={closeCart}
              >
                {t("viewCart")}
              </Link>

              {cart?.checkoutUrl && (
                <a href={cart.checkoutUrl} className={styles.checkoutBtn}>
                  {t("checkout")}
                </a>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
