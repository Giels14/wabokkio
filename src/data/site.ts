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
export type Resort = { slug: string; name: string; place: L; country: L; tagline: L; tags: L[]; gradient: string; icon: string; dest?: DestKey };

// Algemene bestemmingsfoto's (src/assets/photos/destinations/<key>.jpg). Sfeerbeelden van de streek, NIET van het resort zelf.
export const destinationPhotos = {
  mallorca: { nl: 'Turquoise baai aan de rotskust van Mallorca', en: 'Turquoise cove on the rocky coast of Mallorca' },
  algarve: { nl: 'Strand tussen de kliffen in de Algarve', en: 'Cliff-lined beach in the Algarve' },
  'belek-turkije': { nl: 'Zandstrand in de regio Antalya', en: 'Sandy beach in the Antalya region' },
  'marokko-taghazout': { nl: 'Surfers bij Taghazout, Marokko', en: 'Surfers near Taghazout, Morocco' },
  veluwe: { nl: 'Bloeiende heide in Nederland', en: 'Heather in bloom in the Netherlands' },
} as const;
export type DestKey = keyof typeof destinationPhotos;

// Volgorde = volgorde op de site. Eerste drie zijn uitgelicht op de homepage.
export const resorts: Resort[] = [
  { slug: 'ikos-porto-petro', name: 'Ikos Porto Petro', place: { nl: 'Mallorca', en: 'Mallorca' }, country: { nl: 'Spanje', en: 'Spain' }, tagline: { nl: 'All-inclusive aan een rustige baai, met uitgebreide kinderclubs.', en: 'All-inclusive on a peaceful bay, with extensive kids’ clubs.' }, tags: [{ nl: 'All-inclusive', en: 'All-inclusive' }, { nl: 'Kinderclub', en: 'Kids’ club' }, { nl: 'Strand', en: 'Beach' }], gradient: 'linear-gradient(135deg,#2F6BFF 0%,#5FD3FF 100%)', icon: '🏖️', dest: 'mallorca' },
  { slug: 'martinhal-sagres', name: 'Martinhal Sagres', place: { nl: 'Algarve', en: 'Algarve' }, country: { nl: 'Portugal', en: 'Portugal' }, tagline: { nl: 'Gezinsresort aan de ruige westkust, met villa’s en babyclub.', en: 'A family resort on the rugged west coast, with villas and a baby club.' }, tags: [{ nl: 'Familievilla’s', en: 'Family villas' }, { nl: 'Babyclub', en: 'Baby club' }, { nl: 'Natuur', en: 'Nature' }], gradient: 'linear-gradient(135deg,#FF9A2E 0%,#FF3D7F 100%)', icon: '🌊', dest: 'algarve' },
  { slug: 'hof-van-saksen', name: 'Hof van Saksen', place: { nl: 'Drenthe', en: 'Drenthe' }, country: { nl: 'Nederland', en: 'Netherlands' }, tagline: { nl: 'Dichtbij huis: ruime huisjes, zwemparadijs en veel te doen voor kids.', en: 'Close to home: spacious cottages, a tropical swimming paradise and plenty for kids to do.' }, tags: [{ nl: 'Dichtbij', en: 'Close to home' }, { nl: 'Zwembad', en: 'Pool' }, { nl: 'Vakantiehuis', en: 'Holiday cottage' }], gradient: 'linear-gradient(135deg,#3CB371 0%,#2F6BFF 100%)', icon: '🌳', dest: 'veluwe' },
  { slug: 'ikos-olivia', name: 'Ikos Olivia', place: { nl: 'Halkidiki', en: 'Halkidiki' }, country: { nl: 'Griekenland', en: 'Greece' }, tagline: { nl: 'Infinite lifestyle tussen dennen en zee, met familiekamers.', en: 'Ikos’ Infinite Lifestyle between pine forest and sea, with family rooms.' }, tags: [{ nl: 'All-inclusive', en: 'All-inclusive' }, { nl: 'Kinderclub', en: 'Kids’ club' }], gradient: 'linear-gradient(135deg,#14204A 0%,#2F6BFF 100%)', icon: '🫒' },
  { slug: 'rixos-premium-belek', name: 'Rixos Premium Belek', place: { nl: 'Belek', en: 'Belek' }, country: { nl: 'Turkije', en: 'Turkey' }, tagline: { nl: 'Groot resort met waterpark en Rixy Kids Club.', en: 'A large resort with its own water park and the Rixy Kids Club.' }, tags: [{ nl: 'Waterpark', en: 'Water park' }, { nl: 'All-inclusive', en: 'All-inclusive' }], gradient: 'linear-gradient(135deg,#FF3D7F 0%,#7A5CFF 100%)', icon: '🎢', dest: 'belek-turkije' },
  { slug: 'maxx-royal-belek', name: 'Maxx Royal Golf Belek', place: { nl: 'Belek', en: 'Belek' }, country: { nl: 'Turkije', en: 'Turkey' }, tagline: { nl: 'Luxe villa’s en suites, met uitgebreide kinderprogramma’s.', en: 'Luxury villas and suites, with extensive children’s programmes.' }, tags: [{ nl: 'Luxe', en: 'Luxury' }, { nl: 'Villa’s', en: 'Villas' }], gradient: 'linear-gradient(135deg,#FF9A2E 0%,#FFD166 100%)', icon: '⛳', dest: 'belek-turkije' },
  { slug: 'grande-real-santa-eulalia', name: 'Grande Real Santa Eulália Resort & Spa', place: { nl: 'Albufeira, Algarve', en: 'Albufeira, Algarve' }, country: { nl: 'Portugal', en: 'Portugal' }, tagline: { nl: 'Direct aan het strand, met appartementen voor gezinnen.', en: 'Right on the beach, with family apartments.' }, tags: [{ nl: 'Strand', en: 'Beach' }, { nl: 'Appartementen', en: 'Apartments' }], gradient: 'linear-gradient(135deg,#5FD3FF 0%,#3CB371 100%)', icon: '🐚', dest: 'algarve' },
  { slug: 'fairmont-taghazout-bay', name: 'Fairmont Taghazout Bay', place: { nl: 'Taghazout', en: 'Taghazout' }, country: { nl: 'Marokko', en: 'Morocco' }, tagline: { nl: 'Zon in de winter, met familievilla’s aan de Atlantische kust.', en: 'Winter sun, with family villas on the Atlantic coast.' }, tags: [{ nl: 'Winterzon', en: 'Winter sun' }, { nl: 'Kids club', en: 'Kids’ club' }], gradient: 'linear-gradient(135deg,#FF9A2E 0%,#C2410C 100%)', icon: '🌞', dest: 'marokko-taghazout' },
  { slug: 'paradis-plage', name: 'Paradis Plage Surf Yoga & Spa', place: { nl: 'Taghazout', en: 'Taghazout' }, country: { nl: 'Marokko', en: 'Morocco' }, tagline: { nl: 'Surfen, yoga en een kinderclub aan een eindeloos strand.', en: 'Surfing, yoga and a kids’ club on a seemingly endless beach.' }, tags: [{ nl: 'Surf', en: 'Surf' }, { nl: 'Yoga', en: 'Yoga' }], gradient: 'linear-gradient(135deg,#2F6BFF 0%,#FF3D7F 100%)', icon: '🏄', dest: 'marokko-taghazout' },
];
