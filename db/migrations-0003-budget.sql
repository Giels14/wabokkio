-- Budget als eigen kolom. De function valt terug op de oude insert als deze kolom nog ontbreekt.
ALTER TABLE aanvragen ADD COLUMN budget TEXT;
