export interface SnackFlavor {
  id: string;
  slug: string;
  name: string;
  image: string;
  accentColor: string;
  ratingPageUrl: string;
}

export interface SnackProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
  accentColor: string;
  flavors: SnackFlavor[];
}

const pendingFlavor = (productSlug: string, accentColor: string): SnackFlavor => ({
  id: `${productSlug}-flavor-pending`,
  slug: 'flavor-pending',
  name: 'Flavor details pending',
  image: 'PLACEHOLDER — flavor image pending',
  accentColor,
  ratingPageUrl: `/rate/${productSlug}/flavor-pending`,
});

export const products: SnackProduct[] = [
  {
    id: 'loots-corn',
    slug: 'loots-corn',
    name: 'LOOTS Corn',
    category: 'Product family — details pending',
    description: 'Product description placeholder — details to be supplied.',
    image: 'PLACEHOLDER — product image pending',
    accentColor: '#35e6dc',
    flavors: [pendingFlavor('loots-corn', '#35e6dc')],
  },
  {
    id: 'loots-sunflower',
    slug: 'loots-sunflower',
    name: 'LOOTS Sunflower',
    category: 'Product family — details pending',
    description: 'Product description placeholder — details to be supplied.',
    image: 'PLACEHOLDER — product image pending',
    accentColor: '#ffbf4b',
    flavors: [pendingFlavor('loots-sunflower', '#ffbf4b')],
  },
  {
    id: 'trigger',
    slug: 'trigger',
    name: 'TRIGGER',
    category: 'Product family — details pending',
    description: 'Product description placeholder — details to be supplied.',
    image: 'PLACEHOLDER — product image pending',
    accentColor: '#ff5b7f',
    flavors: [pendingFlavor('trigger', '#ff5b7f')],
  },
  {
    id: 'x-stix',
    slug: 'x-stix',
    name: 'X-STIX',
    category: 'Product family — details pending',
    description: 'Product description placeholder — details to be supplied.',
    image: 'PLACEHOLDER — product image pending',
    accentColor: '#a980ff',
    flavors: [pendingFlavor('x-stix', '#a980ff')],
  },
  {
    id: 'pop-g',
    slug: 'pop-g',
    name: 'POP-G',
    category: 'Product family — details pending',
    description: 'Product description placeholder — details to be supplied.',
    image: 'PLACEHOLDER — product image pending',
    accentColor: '#62dc7a',
    flavors: [pendingFlavor('pop-g', '#62dc7a')],
  },
];

export function findProduct(productSlug: string | undefined): SnackProduct | undefined {
  return products.find((product) => product.slug === productSlug);
}

export function findFlavor(
  product: SnackProduct | undefined,
  flavorSlug: string | undefined,
): SnackFlavor | undefined {
  return product?.flavors.find((flavor) => flavor.slug === flavorSlug);
}