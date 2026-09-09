"use server";

import { shopifyFetch } from "@/lib/shopify/client";

export interface CartItem {
  id: string;
  variantId: string;
  title: string;
  variantTitle: string;
  handle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  quantity: number;
  image?: {
    url: string;
    altText?: string;
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotalPrice: {
    amount: string;
    currencyCode: string;
  };
  lines: CartItem[];
}

interface ShopifyMoneyV2 {
  amount: string;
  currencyCode: string;
}

interface ShopifyImage {
  url: string;
  altText?: string | null;
}

interface ShopifyProduct {
  title: string;
  handle: string;
}

interface ShopifyProductVariant {
  id: string;
  title: string;
  price: ShopifyMoneyV2;
  product: ShopifyProduct;
  image?: ShopifyImage | null;
}

interface ShopifyCartLineNode {
  id: string;
  quantity: number;
  cost: {
    totalAmount: ShopifyMoneyV2;
  };
  merchandise: ShopifyProductVariant;
}

interface ShopifyCartLineEdge {
  node: ShopifyCartLineNode;
}

interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoneyV2;
  };
  lines: {
    edges: ShopifyCartLineEdge[];
  };
}

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              product {
                title
                handle
              }
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

function formatCart(shopifyCart: ShopifyCart): Cart {
  return {
    id: shopifyCart.id,
    checkoutUrl: shopifyCart.checkoutUrl,
    totalQuantity: shopifyCart.totalQuantity,
    subtotalPrice: shopifyCart.cost.subtotalAmount,
    lines: shopifyCart.lines.edges.map(({ node }: ShopifyCartLineEdge) => ({
      id: node.id,
      variantId: node.merchandise.id,
      title: node.merchandise.product.title,
      variantTitle:
        node.merchandise.title !== "Default Title"
          ? node.merchandise.title
          : "",
      handle: node.merchandise.product.handle,
      price: node.merchandise.price,
      quantity: node.quantity,
      image: node.merchandise.image
        ? {
            url: node.merchandise.image.url,
            altText: node.merchandise.image.altText ?? undefined,
          }
        : undefined,
    })),
  };
}

export async function getCartAction(cartId: string): Promise<Cart | null> {
  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        ...CartFields
      }
    }
    ${CART_FRAGMENT}
  `;

  try {
    const res = await shopifyFetch<{ cart: ShopifyCart | null }>(query, {
      cartId,
    });
    return res.cart ? formatCart(res.cart) : null;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
}

export async function createCartAction(
  variantId: string,
  quantity: number = 1
): Promise<Cart> {
  const query = `
    mutation createCart($lineItems: [CartLineInput!]) {
      cartCreate(input: { lines: $lineItems }) {
        cart {
          ...CartFields
        }
      }
    }
    ${CART_FRAGMENT}
  `;

  const res = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>(query, {
    lineItems: [{ merchandiseId: variantId, quantity }],
  });

  return formatCart(res.cartCreate.cart);
}

export async function addToCartAction(
  cartId: string,
  variantId: string,
  quantity: number = 1
): Promise<Cart> {
  const query = `
    mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFields
        }
      }
    }
    ${CART_FRAGMENT}
  `;

  const res = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart } }>(
    query,
    {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    }
  );

  return formatCart(res.cartLinesAdd.cart);
}

export async function removeFromCartAction(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const query = `
    mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ...CartFields
        }
      }
    }
    ${CART_FRAGMENT}
  `;

  const res = await shopifyFetch<{
    cartLinesRemove: { cart: ShopifyCart };
  }>(query, {
    cartId,
    lineIds,
  });

  return formatCart(res.cartLinesRemove.cart);
}

export async function updateCartQuantityAction(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<Cart> {
  const query = `
    mutation updateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFields
        }
      }
    }
    ${CART_FRAGMENT}
  `;

  const res = await shopifyFetch<{
    cartLinesUpdate: { cart: ShopifyCart };
  }>(query, {
    cartId,
    lines,
  });

  return formatCart(res.cartLinesUpdate.cart);
}
