import raw from './hotels.json';
import type { Lang } from '../i18n';

export type Hotel = {
  slug: string;
  name: string;
  region: Record<Lang, string>;
  country: Record<Lang, string>;
  description: Record<Lang, string>;
  strengths: Record<Lang, string>;
  sourceUrl: string;
  /** Zelfde-origin pad, bijvoorbeeld /hotels/eagles-villas.jpg. Leeg = plaatshouder. */
  image: string;
  /** Verplichte bronvermelding als image is gezet. Zonder credit tonen we de plaatshouder. */
  imageCredit: string;
  gradient: string;
  icon: string;
};

// De achtergrondkleur komt uit gradients.css (.g-<slug>), omdat de CSP geen inline styles toelaat.
// Een nieuw hotel zonder die class valt terug op een lege achtergrond met het icoon.

export const hotels = raw as Hotel[];

export function hotelPhoto(hotel: Hotel) {
  const image = hotel.image.trim();
  const credit = hotel.imageCredit.trim();
  if (!image || !credit) return null;
  return { image, credit };
}
