export const getTaxjarProductCacheKey = (productId: string): string =>
  `taxjar:product:${productId}`;
