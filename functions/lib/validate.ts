export type Enquiry = {
  destination: string;
  arrival: string;
  departure: string;
  adults: number;
  childAges: number[];
  name: string;
  email: string;
  phone: string;
  budget: string;
  message: string;
};

const MAX_ADULTS = 8;
const MAX_KIDS = 8;
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const clean = (v: unknown, max: number) =>
  (typeof v === 'string' ? v : '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);

const int = (v: unknown) => (typeof v === 'string' && /^\d{1,2}$/.test(v) ? parseInt(v, 10) : NaN);

function isRealDate(s: string) {
  if (!DATE_RE.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function parseEnquiry(fd: FormData, en: boolean, today: string): { data?: Enquiry; error?: string } {
  const destination = clean(fd.get('bestemming'), 200);
  const arrival = clean(fd.get('aankomst'), 10);
  const departure = clean(fd.get('vertrek'), 10);
  const name = clean(fd.get('naam'), 120);
  const email = clean(fd.get('email'), 200).toLowerCase();
  const phone = clean(fd.get('telefoon'), 40);
  const message = clean(fd.get('opmerkingen'), 3000);
  const budget = clean(fd.get('budget'), 80);
  const consent = clean(fd.get('toestemming'), 10);

  if (!destination) return { error: en ? 'Please enter a hotel or destination.' : 'Vul een hotel of bestemming in.' };
  if (!isRealDate(arrival) || !isRealDate(departure))
    return { error: en ? 'Please enter valid arrival and departure dates.' : 'Vul geldige aankomst- en vertrekdata in.' };
  if (arrival < today) return { error: en ? 'The arrival date is in the past.' : 'De aankomstdatum ligt in het verleden.' };
  if (departure <= arrival) return { error: en ? 'The departure date must be after the arrival date.' : 'De vertrekdatum moet na de aankomstdatum liggen.' };

  const adults = int(fd.get('volwassenen'));
  const kids = int(fd.get('kinderen'));
  if (!(adults >= 1 && adults <= MAX_ADULTS)) return { error: en ? 'Please enter the number of adults.' : 'Vul het aantal volwassenen in.' };
  if (!(kids >= 0 && kids <= MAX_KIDS)) return { error: en ? 'Please enter the number of children.' : 'Vul het aantal kinderen in.' };

  const childAges: number[] = [];
  for (let c = 1; c <= kids; c++) {
    const age = int(fd.get(`kind-${c}-leeftijd`));
    if (!(age >= 0 && age <= 17)) return { error: en ? `Please enter the age of child ${c}.` : `Vul de leeftijd van kind ${c} in.` };
    childAges.push(age);
  }

  if (!name) return { error: en ? 'Please enter your name.' : 'Vul je naam in.' };
  if (!EMAIL_RE.test(email)) return { error: en ? 'Please enter a valid email address.' : 'Vul een geldig e-mailadres in.' };
  if (phone && !/^[+()\d\s-]{6,40}$/.test(phone)) return { error: en ? 'The phone number does not look right.' : 'Het telefoonnummer lijkt niet te kloppen.' };
  if (consent !== 'ja') return { error: en ? 'Please agree to the privacy policy.' : 'Vink aan dat je akkoord gaat met de privacyverklaring.' };

  return { data: { destination, arrival, departure, adults, childAges, name, email, phone, budget, message } };
}

const nlDate = (d: string) =>
  new Date(d + 'T12:00:00Z').toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' });

export function notificationText(data: Enquiry, ref: string, formLang: 'nl' | 'en') {
  const kids = data.childAges.length
    ? `${data.childAges.length} (leeftijd ${data.childAges.join(', ')})`
    : '0';
  return [
    `Nieuwe aanvraag via wabokkio.nl (ref ${ref})`,
    `Taal: ${formLang === 'en' ? 'Engels' : 'Nederlands'}`,
    '',
    `Naam: ${data.name}`,
    `E-mail: ${data.email}`,
    `Telefoon: ${data.phone || '-'}`,
    `Hotel of bestemming: ${data.destination}`,
    `Aankomst: ${nlDate(data.arrival)}`,
    `Vertrek: ${nlDate(data.departure)}`,
    `Volwassenen: ${data.adults}`,
    `Kinderen: ${kids}`,
    `Budget: ${data.budget || '-'}`,
    `Opmerkingen: ${data.message || '-'}`,
    'Toestemming privacyverklaring: ja',
    '',
  ].join('\n');
}
