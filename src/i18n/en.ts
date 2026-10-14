// ⚠️ CONCEPT-VERTALING (DRAFT) – door Wabokkio zelf geschreven, wordt vervangen door de vertaling van de designer.
// Vervang de waarden hieronder; de sleutels moeten gelijk blijven aan src/i18n/nl.ts.
import type nl from './nl';
const en: typeof nl = {
  meta: { siteTitle: 'Wabokkio · Tailor-made family travel', description: 'Wabokkio finds the family room that truly fits your family. Personal advice from travelling parents, at travel agent rates.' },
  nav: { destinations: 'Destinations', about: 'About us', cta: 'Request a quote', switchLabel: 'Nederlands', switchAria: 'Naar de Nederlandse versie', skip: 'Skip to content', menu: 'Main menu', home: 'Wabokkio, go to home' },
  hero: { eyebrow: 'Tailor-made family travel', title: 'The family room that truly fits your family', lead: 'Tell us who is coming along and what you are looking for. We are travelling parents, and within 2 working days we send you a personal proposal at travel agent rates.', imageAlt: 'Family on holiday' },
  trust: { aria: 'Why Wabokkio', iata: 'Registered travel agent · IATA TIDS', quote: 'Quote within 2 working days', fee: 'No service fee', advice: 'Personal advice from travelling parents' },
  resorts: { title: 'Our favourite family resorts', lead: 'A selection of resorts we love to recommend. Prices depend on your dates and family, so we always make a tailor-made quote.', all: 'All destinations', ask: 'Request price', illustration: 'Illustration' },
  how: { title: 'How it works', steps: [
    ['Tell us who is coming', 'Destination, dates, rooms and the ages of the children. That is all we need.'],
    ['We do the research', 'We compare rooms, kids clubs and rates and pick what really suits you.'],
    ['You get a proposal', 'A personal quote with honest advice within 2 working days. No obligation.'],
    ['Enjoy', 'Happy with it? Then we book it for you. All you have to do is pack.'],
  ] },
  partners: 'Our partners',
  destinations: { title: 'Destinations', description: 'Family resorts recommended by Wabokkio in Spain, Portugal, Greece, Turkey, Morocco and the Netherlands.', lead: 'Resorts we know and love to recommend for families. Is your dream destination not listed? Just ask, we search beyond this list too.' },
  form: {
    title: 'Where would you like to go?', destination: 'Destination or resort', destinationPh: 'E.g. Mallorca or Ikos Porto Petro', arrival: 'Arrival', departure: 'Departure',
    rooms: 'Rooms and travellers', room: 'Room', adults: 'Adults', children: 'Children', addRoom: '+ Add room', removeRoom: 'Remove',
    childAge: 'Age child', choose: 'Choose', baby: '0 (baby)', years: 'years',
    kidsHint: 'For children we only ask their age on arrival, no names or dates of birth.',
    name: 'Name', email: 'Email', phone: 'Phone', optional: '(optional)', message: 'Message', messagePh: 'Wishes, budget, kids club, baby cot…',
    submit: 'Request a free quote', privacy: 'We only use your details for your quote.', privacyLink: 'Privacy policy',
    sending: 'Sending…', errDates: 'The departure date must be after the arrival date.', errGeneric: 'Something went wrong. Please try again or email travel@wabokkio.nl.', errNetwork: 'No connection. Please try again or email travel@wabokkio.nl.',
  },
  thanks: { title: 'Thank you for your request!', body: 'We have received your request and will send you a confirmation by email. You will hear from us within 2 working days.', back: 'Back to home' },
  notFound: { title: 'Oops, this page does not exist', back: 'Go to home' },
  pages: { about: 'About us', privacy: 'Privacy policy', terms: 'Terms and conditions' },
  footer: { tagline: 'Tailor-made family travel, by travelling parents.', kvk: 'Chamber of Commerce (KvK)', privacy: 'Privacy policy', terms: 'Terms and conditions' },
};
export default en;
