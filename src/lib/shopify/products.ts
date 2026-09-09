import { shopifyFetch } from "./client";

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
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

const COLLECTION_QUERY = `
  query GetCollection($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
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
  }
`;

const VENDOR_QUERY = `
  query GetVendor($handle: String!) {
    metaobject(handle: {
      type: "vendor"
      handle: $handle
    }) {
      handle
      fields {
        key
        value
      }
    }
  }
`;

const PRODUCT_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      vendor
      descriptionHtml

      featuredImage {
        url
        altText
        width
        height
      }

      images(first: 8) {
        nodes {
          url
          altText
          width
          height
        }
      }

      options {
        name
        values
      }

      variants(first: 50) {
        nodes {
          id
          availableForSale
          price {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
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
};

export type ShopifyProductImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ShopifyProductOption = {
  name: string;
  values: string[];
};

export type ShopifyProductVariant = {
  id: string;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
  selectedOptions: {
    name: string;
    value: string;
  }[];
};

export type ShopifyProductDetail = Omit<ShopifyProduct, "variants"> & {
  descriptionHtml: string;
  images: {
    nodes: ShopifyProductImage[];
  };
  options: ShopifyProductOption[];
  variants: {
    nodes: ShopifyProductVariant[];
  };
};

export type ShopifyVendor = {
  handle: string;
  name: string;
  description: string;
};

type ShopifyVendorMetaobject = {
  handle: string;
  fields: {
    key: string;
    value: string;
  }[];
};

interface VendorResponse {
  metaobject: ShopifyVendorMetaobject | null;
}

export type ShopifyCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  products: {
    nodes: ShopifyProduct[];
  };
};

interface ProductsResponse {
  products: {
    nodes: ShopifyProduct[];
  };
}

interface CollectionResponse {
  collection: ShopifyCollection | null;
}

interface ProductResponse {
  product: ShopifyProductDetail | null;
}

export async function getProducts(
  first = 4,
  query?: string
): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<ProductsResponse>(PRODUCTS_QUERY, {
    first,
    query,
  });

  return data.products.nodes;
}

export async function getProductsByVendor(
  vendor: string,
  first = 12
): Promise<ShopifyProduct[]> {
  return getProducts(first, `vendor:'${vendor}'`);
}

export async function getCollection(
  handle: string,
  first = 12
): Promise<ShopifyCollection | null> {
  const data = await shopifyFetch<CollectionResponse>(COLLECTION_QUERY, {
    handle,
    first,
  });

  return data.collection;
}

export async function getProduct(
  handle: string
): Promise<ShopifyProductDetail | null> {
  const data = await shopifyFetch<ProductResponse>(PRODUCT_QUERY, {
    handle,
  });

  return data.product;
}

export async function getVendor(handle: string): Promise<ShopifyVendor | null> {
  const data = await shopifyFetch<VendorResponse>(VENDOR_QUERY, {
    handle,
  });

  const metaobject = data.metaobject;

  if (!metaobject) {
    return null;
  }

  const fields = Object.fromEntries(
    metaobject.fields.map((field) => [field.key, field.value])
  );

  return {
    handle: metaobject.handle,
    name: fields.name ?? handle,
    description: fields.description ?? "",
  };
}
