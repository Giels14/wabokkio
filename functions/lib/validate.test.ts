import assert from 'node:assert/strict';
import { test } from 'node:test';
import { notificationText, parseEnquiry } from './validate.ts';

const today = '2026-11-13';

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

const valid: Record<string, string> = {
  bestemming: 'Eagles Palace',
  aankomst: '2026-12-01',
  vertrek: '2026-12-08',
  volwassenen: '2',
  kinderen: '1',
  'kind-1-leeftijd': '3',
  naam: 'Jan de Vries',
  email: 'Jan@Example.com',
  telefoon: '',
  budget: '',
  opmerkingen: 'Een kinderbedje, als dat kan.',
  toestemming: 'ja',
};

test('accepts a request without phone or budget', () => {
  const result = parseEnquiry(form(valid), false, today);
  assert.equal(result.error, undefined);
  assert.ok(result.data);
  assert.equal(result.data.destination, 'Eagles Palace');
  assert.equal(result.data.email, 'jan@example.com');
  assert.equal(result.data.adults, 2);
  assert.deepEqual(result.data.childAges, [3]);
  assert.equal(result.data.phone, '');
  assert.equal(result.data.budget, '');
  assert.equal(result.data.message, 'Een kinderbedje, als dat kan.');
});

test('accepts zero children', () => {
  const result = parseEnquiry(form({ ...valid, kinderen: '0' }), false, today);
  assert.equal(result.error, undefined);
  assert.deepEqual(result.data?.childAges, []);
});

test('rejects a missing hotel or destination', () => {
  const result = parseEnquiry(form({ ...valid, bestemming: '   ' }), false, today);
  assert.equal(result.error, 'Vul een hotel of bestemming in.');
});

test('rejects an invalid date', () => {
  const result = parseEnquiry(form({ ...valid, aankomst: '2026-02-31' }), false, today);
  assert.equal(result.error, 'Vul geldige aankomst- en vertrekdata in.');
});

test('rejects an arrival date in the past', () => {
  const result = parseEnquiry(form({ ...valid, aankomst: '2026-11-01', vertrek: '2026-11-08' }), false, today);
  assert.equal(result.error, 'De aankomstdatum ligt in het verleden.');
});

test('rejects a departure on or before arrival', () => {
  const result = parseEnquiry(form({ ...valid, vertrek: '2026-12-01' }), true, today);
  assert.equal(result.error, 'The departure date must be after the arrival date.');
});

test('rejects a missing child age', () => {
  const fields = { ...valid, kinderen: '2', 'kind-2-leeftijd': '' };
  const result = parseEnquiry(form(fields), false, today);
  assert.equal(result.error, 'Vul de leeftijd van kind 2 in.');
});

test('rejects an age above 17', () => {
  const result = parseEnquiry(form({ ...valid, 'kind-1-leeftijd': '18' }), false, today);
  assert.equal(result.error, 'Vul de leeftijd van kind 1 in.');
});

test('rejects zero adults', () => {
  const result = parseEnquiry(form({ ...valid, volwassenen: '0' }), false, today);
  assert.equal(result.error, 'Vul het aantal volwassenen in.');
});

test('rejects a missing name and a bad email', () => {
  assert.equal(parseEnquiry(form({ ...valid, naam: '' }), false, today).error, 'Vul je naam in.');
  assert.equal(parseEnquiry(form({ ...valid, email: 'geen-mail' }), false, today).error, 'Vul een geldig e-mailadres in.');
});

test('phone is optional and a short number is rejected', () => {
  assert.equal(parseEnquiry(form({ ...valid, telefoon: '+31 6 43779858' }), false, today).error, undefined);
  assert.equal(parseEnquiry(form({ ...valid, telefoon: '123' }), false, today).error, 'Het telefoonnummer lijkt niet te kloppen.');
});

test('budget is optional and trimmed', () => {
  const result = parseEnquiry(form({ ...valid, budget: '  rond 4000 euro  ' }), false, today);
  assert.equal(result.data?.budget, 'rond 4000 euro');
});

test('consent is required', () => {
  assert.equal(parseEnquiry(form({ ...valid, toestemming: '' }), false, today).error, 'Vink aan dat je akkoord gaat met de privacyverklaring.');
  assert.equal(parseEnquiry(form({ ...valid, toestemming: 'nee' }), true, today).error, 'Please agree to the privacy policy.');
});

test('the notification lists every field in Dutch', () => {
  const result = parseEnquiry(form({ ...valid, budget: '4000 euro', telefoon: '0612345678' }), true, today);
  assert.ok(result.data);
  const text = notificationText(result.data, 'AB12CD34', 'en');
  assert.match(text, /Nieuwe aanvraag via wabokkio.nl \(ref AB12CD34\)/);
  assert.match(text, /Taal: Engels/);
  assert.match(text, /Naam: Jan de Vries/);
  assert.match(text, /E-mail: jan@example.com/);
  assert.match(text, /Telefoon: 0612345678/);
  assert.match(text, /Hotel of bestemming: Eagles Palace/);
  assert.match(text, /Aankomst: /);
  assert.match(text, /Vertrek: /);
  assert.match(text, /Volwassenen: 2/);
  assert.match(text, /Kinderen: 1 \(leeftijd 3\)/);
  assert.match(text, /Budget: 4000 euro/);
  assert.match(text, /Opmerkingen: Een kinderbedje, als dat kan\./);
  assert.match(text, /Toestemming privacyverklaring: ja/);
  assert.doesNotMatch(text, /—/);
});
