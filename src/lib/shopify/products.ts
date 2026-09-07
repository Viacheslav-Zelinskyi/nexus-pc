import { shopifyFetch } from "./client";

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      nodes {
        id
        handle
        title
        vendor

        featuredImage {
          url
          altText
          width
          height
        }

        variants(first: 1) {
          nodes {
            id
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  vendor: string | null;

  featuredImage: {
    url: string;
    altText: string | null;
    width: number;
    height: number;
  } | null;

  variants: {
    nodes: {
      id: string;
      price: {
        amount: string;
        currencyCode: string;
      };
    }[];
  };
}

interface ProductsResponse {
  products: {
    nodes: ShopifyProduct[];
  };
}

export async function getProducts(first = 4): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<ProductsResponse>(PRODUCTS_QUERY, { first });

  return data.products.nodes;
}
