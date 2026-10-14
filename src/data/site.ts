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

export type Resort = { slug: string; name: string; place: string; country: string; tagline: string; tags: string[]; gradient: string; icon: string };

// Volgorde = volgorde op de site. Eerste drie zijn uitgelicht op de homepage.
export const resorts: Resort[] = [
  { slug: 'ikos-porto-petro', name: 'Ikos Porto Petro', place: 'Mallorca', country: 'Spanje', tagline: 'All-inclusive aan een rustige baai, met uitgebreide kinderclubs.', tags: ['All-inclusive', 'Kinderclub', 'Strand'], gradient: 'linear-gradient(135deg,#2F6BFF 0%,#5FD3FF 100%)', icon: '🏖️' },
  { slug: 'martinhal-sagres', name: 'Martinhal Sagres', place: 'Algarve', country: 'Portugal', tagline: 'Gezinsresort aan de ruige westkust, met villa’s en babyclub.', tags: ['Familievilla’s', 'Babyclub', 'Natuur'], gradient: 'linear-gradient(135deg,#FF9A2E 0%,#FF3D7F 100%)', icon: '🌊' },
  { slug: 'hof-van-saksen', name: 'Hof van Saksen', place: 'Drenthe', country: 'Nederland', tagline: 'Dichtbij huis: ruime huisjes, zwemparadijs en veel te doen voor kids.', tags: ['Dichtbij', 'Zwembad', 'Vakantiehuis'], gradient: 'linear-gradient(135deg,#3CB371 0%,#2F6BFF 100%)', icon: '🌳' },
  { slug: 'ikos-olivia', name: 'Ikos Olivia', place: 'Halkidiki', country: 'Griekenland', tagline: 'Infinite lifestyle tussen dennen en zee, met familiekamers.', tags: ['All-inclusive', 'Kinderclub'], gradient: 'linear-gradient(135deg,#14204A 0%,#2F6BFF 100%)', icon: '🫒' },
  { slug: 'rixos-premium-belek', name: 'Rixos Premium Belek', place: 'Belek', country: 'Turkije', tagline: 'Groot resort met waterpark en Rixy Kids Club.', tags: ['Waterpark', 'All-inclusive'], gradient: 'linear-gradient(135deg,#FF3D7F 0%,#7A5CFF 100%)', icon: '🎢' },
  { slug: 'maxx-royal-belek', name: 'Maxx Royal Golf Belek', place: 'Belek', country: 'Turkije', tagline: 'Luxe villa’s en suites, met uitgebreide kinderprogramma’s.', tags: ['Luxe', 'Villa’s'], gradient: 'linear-gradient(135deg,#FF9A2E 0%,#FFD166 100%)', icon: '⛳' },
  { slug: 'grande-real-santa-eulalia', name: 'Grande Real Santa Eulália Resort & Spa', place: 'Albufeira, Algarve', country: 'Portugal', tagline: 'Direct aan het strand, met appartementen voor gezinnen.', tags: ['Strand', 'Appartementen'], gradient: 'linear-gradient(135deg,#5FD3FF 0%,#3CB371 100%)', icon: '🐚' },
  { slug: 'fairmont-taghazout-bay', name: 'Fairmont Taghazout Bay', place: 'Taghazout', country: 'Marokko', tagline: 'Zon in de winter, met familievilla’s aan de Atlantische kust.', tags: ['Winterzon', 'Kids club'], gradient: 'linear-gradient(135deg,#FF9A2E 0%,#C2410C 100%)', icon: '🌞' },
  { slug: 'paradis-plage', name: 'Paradis Plage Surf Yoga & Spa', place: 'Taghazout', country: 'Marokko', tagline: 'Surfen, yoga en een kinderclub aan een eindeloos strand.', tags: ['Surf', 'Yoga'], gradient: 'linear-gradient(135deg,#2F6BFF 0%,#FF3D7F 100%)', icon: '🏄' },
];
