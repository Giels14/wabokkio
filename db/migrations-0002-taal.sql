-- Migratie: taal van de aanvraag (nl/en). Eenmalig uitvoeren op bestaande databases.
ALTER TABLE aanvragen ADD COLUMN taal TEXT NOT NULL DEFAULT 'nl';
