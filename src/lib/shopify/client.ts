const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!SHOPIFY_STORE_DOMAIN) {
  throw new Error("Missing SHOPIFY_STORE_DOMAIN");
}

if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  throw new Error("Missing SHOPIFY_STOREFRONT_ACCESS_TOKEN");
}

const SHOPIFY_API_VERSION = "2026-07";

const endpoint =
  `https://${SHOPIFY_STORE_DOMAIN}` +
  `/api/${SHOPIFY_API_VERSION}/graphql.json`;

interface ShopifyResponse<T> {
  data: T;
  errors?: {
    message: string;
  }[];
}

export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Shopify-Storefront-Private-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',
    },
    body: JSON.stringify({
      query,
      variables,
    }),

    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    throw new Error(`Shopify API request failed: ${response.status}`);
  }

  const result = (await response.json()) as ShopifyResponse<T>;

  if (result.errors?.length) {
    throw new Error(result.errors.map((error) => error.message).join(", "));
  }

  return result.data;
}
