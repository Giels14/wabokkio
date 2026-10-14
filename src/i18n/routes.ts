export type Lang = 'nl' | 'en';
export const langs: Lang[] = ['nl', 'en'];

// Paginasleutel -> pad per taal. Eén plek voor URL's, taalwisselaar en hreflang.
export const routes = {
  home: { nl: '/', en: '/en/' },
  destinations: { nl: '/bestemmingen/', en: '/en/destinations/' },
  about: { nl: '/over-ons/', en: '/en/about/' },
  privacy: { nl: '/privacyverklaring/', en: '/en/privacy/' },
  terms: { nl: '/algemene-voorwaarden/', en: '/en/terms/' },
  thanks: { nl: '/bedankt/', en: '/en/thank-you/' },
  notFound: { nl: '/404', en: '/en/404' },
} as const;
export type PageKey = keyof typeof routes;
export const r = (key: PageKey, lang: Lang) => routes[key][lang];
