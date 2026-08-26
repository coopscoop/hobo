-- Removes dummy players and every downstream row referencing them.
-- Order matters due to FKs: Batting/Substitutes -> Rosters -> Players.

DELETE FROM "Batting" WHERE player_id IN (SELECT id FROM "Players" WHERE first_name = 'Dummy');
DELETE FROM "Substitutes" WHERE player_id IN (SELECT id FROM "Players" WHERE first_name = 'Dummy');
DELETE FROM "Rosters" WHERE player_id IN (SELECT id FROM "Players" WHERE first_name = 'Dummy');
DELETE FROM "Players" WHERE first_name = 'Dummy';
