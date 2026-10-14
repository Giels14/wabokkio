export const company = {
  name: 'Wabokkio B.V.',
  kvk: '58114262',
  street: 'Groot Emiclaer 157',
  zip: '3822 TL',
  city: 'Amersfoort',
  iata: '96223061',
  email: 'travel@wabokkio.nl',
  phone: '+31 6 43779858',
  phoneHref: '+31643779858',
};

type L = { nl: string; en: string };
export type Resort = { slug: string; name: string; place: L; country: L; tagline: L; tags: L[]; gradient: string; icon: string };
// Engelse teksten (en) zijn CONCEPT, te vervangen door de vertaling van de designer.

// Volgorde = volgorde op de site. Eerste drie zijn uitgelicht op de homepage.
export const resorts: Resort[] = [
  { slug: 'ikos-porto-petro', name: 'Ikos Porto Petro', place: { nl: 'Mallorca', en: 'Mallorca' }, country: { nl: 'Spanje', en: 'Spain' }, tagline: { nl: 'All-inclusive aan een rustige baai, met uitgebreide kinderclubs.', en: 'All-inclusive on a quiet bay, with extensive kids clubs.' }, tags: [{ nl: 'All-inclusive', en: 'All-inclusive' }, { nl: 'Kinderclub', en: 'Kids club' }, { nl: 'Strand', en: 'Beach' }], gradient: 'linear-gradient(135deg,#2F6BFF 0%,#5FD3FF 100%)', icon: '🏖️' },
  { slug: 'martinhal-sagres', name: 'Martinhal Sagres', place: { nl: 'Algarve', en: 'Algarve' }, country: { nl: 'Portugal', en: 'Portugal' }, tagline: { nl: 'Gezinsresort aan de ruige westkust, met villa’s en babyclub.', en: 'Family resort on the rugged west coast, with villas and a baby club.' }, tags: [{ nl: 'Familievilla’s', en: 'Family villas' }, { nl: 'Babyclub', en: 'Baby club' }, { nl: 'Natuur', en: 'Nature' }], gradient: 'linear-gradient(135deg,#FF9A2E 0%,#FF3D7F 100%)', icon: '🌊' },
  { slug: 'hof-van-saksen', name: 'Hof van Saksen', place: { nl: 'Drenthe', en: 'Drenthe' }, country: { nl: 'Nederland', en: 'Netherlands' }, tagline: { nl: 'Dichtbij huis: ruime huisjes, zwemparadijs en veel te doen voor kids.', en: 'Close to home: spacious cottages, a pool paradise and lots to do for kids.' }, tags: [{ nl: 'Dichtbij', en: 'Close to home' }, { nl: 'Zwembad', en: 'Pool' }, { nl: 'Vakantiehuis', en: 'Holiday home' }], gradient: 'linear-gradient(135deg,#3CB371 0%,#2F6BFF 100%)', icon: '🌳' },
  { slug: 'ikos-olivia', name: 'Ikos Olivia', place: { nl: 'Halkidiki', en: 'Halkidiki' }, country: { nl: 'Griekenland', en: 'Greece' }, tagline: { nl: 'Infinite lifestyle tussen dennen en zee, met familiekamers.', en: 'Infinite lifestyle between pine trees and sea, with family rooms.' }, tags: [{ nl: 'All-inclusive', en: 'All-inclusive' }, { nl: 'Kinderclub', en: 'Kids club' }], gradient: 'linear-gradient(135deg,#14204A 0%,#2F6BFF 100%)', icon: '🫒' },
  { slug: 'rixos-premium-belek', name: 'Rixos Premium Belek', place: { nl: 'Belek', en: 'Belek' }, country: { nl: 'Turkije', en: 'Turkey' }, tagline: { nl: 'Groot resort met waterpark en Rixy Kids Club.', en: 'Large resort with a water park and Rixy Kids Club.' }, tags: [{ nl: 'Waterpark', en: 'Water park' }, { nl: 'All-inclusive', en: 'All-inclusive' }], gradient: 'linear-gradient(135deg,#FF3D7F 0%,#7A5CFF 100%)', icon: '🎢' },
  { slug: 'maxx-royal-belek', name: 'Maxx Royal Golf Belek', place: { nl: 'Belek', en: 'Belek' }, country: { nl: 'Turkije', en: 'Turkey' }, tagline: { nl: 'Luxe villa’s en suites, met uitgebreide kinderprogramma’s.', en: 'Luxury villas and suites, with extensive kids programmes.' }, tags: [{ nl: 'Luxe', en: 'Luxury' }, { nl: 'Villa’s', en: 'Villas' }], gradient: 'linear-gradient(135deg,#FF9A2E 0%,#FFD166 100%)', icon: '⛳' },
  { slug: 'grande-real-santa-eulalia', name: 'Grande Real Santa Eulália Resort & Spa', place: { nl: 'Albufeira, Algarve', en: 'Albufeira, Algarve' }, country: { nl: 'Portugal', en: 'Portugal' }, tagline: { nl: 'Direct aan het strand, met appartementen voor gezinnen.', en: 'Right on the beach, with apartments for families.' }, tags: [{ nl: 'Strand', en: 'Beach' }, { nl: 'Appartementen', en: 'Apartments' }], gradient: 'linear-gradient(135deg,#5FD3FF 0%,#3CB371 100%)', icon: '🐚' },
  { slug: 'fairmont-taghazout-bay', name: 'Fairmont Taghazout Bay', place: { nl: 'Taghazout', en: 'Taghazout' }, country: { nl: 'Marokko', en: 'Morocco' }, tagline: { nl: 'Zon in de winter, met familievilla’s aan de Atlantische kust.', en: 'Winter sun, with family villas on the Atlantic coast.' }, tags: [{ nl: 'Winterzon', en: 'Winter sun' }, { nl: 'Kids club', en: 'Kids club' }], gradient: 'linear-gradient(135deg,#FF9A2E 0%,#C2410C 100%)', icon: '🌞' },
  { slug: 'paradis-plage', name: 'Paradis Plage Surf Yoga & Spa', place: { nl: 'Taghazout', en: 'Taghazout' }, country: { nl: 'Marokko', en: 'Morocco' }, tagline: { nl: 'Surfen, yoga en een kinderclub aan een eindeloos strand.', en: 'Surfing, yoga and a kids club on an endless beach.' }, tags: [{ nl: 'Surf', en: 'Surf' }, { nl: 'Yoga', en: 'Yoga' }], gradient: 'linear-gradient(135deg,#2F6BFF 0%,#FF3D7F 100%)', icon: '🏄' },
];
