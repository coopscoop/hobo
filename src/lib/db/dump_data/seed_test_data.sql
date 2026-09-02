BEGIN;

INSERT INTO "Leagues" (id, league_name)
VALUES
  (2, 'Premier League');

INSERT INTO "Teams" (id, team_name)
VALUES
  (20, 'Toronto Blue Jays'),
  (21, 'New York Yankees'),
  (22, 'Boston Red Sox'),
  (23, 'Tampa Bay Rays'),
  (24, 'Baltimore Orioles'),
  (25, 'Chicago Cubs'),
  (26, 'Chicago White Sox'),
  (27, 'Cleveland Guardians'),
  (28, 'Detroit Tigers'),
  (29, 'Minnesota Twins'),
  (30, 'Houston Astros'),
  (31, 'Texas Rangers'),
  (32, 'Seattle Mariners'),
  (33, 'Los Angeles Angels'),
  (34, 'Los Angeles Dodgers'),
  (35, 'San Diego Padres'),
  (36, 'San Francisco Giants'),
  (37, 'New York Mets'),
  (38, 'Philadelphia Phillies');

-- Keep PostgreSQL's serial sequence ahead of the explicit IDs.
SELECT setval(
  pg_get_serial_sequence('"Teams"', 'id'),
  (SELECT MAX(id) FROM "Teams")
);

SELECT setval(
  pg_get_serial_sequence('"Leagues"', 'id'),
  (SELECT MAX(id) FROM "Leagues")
);

-- ============================================================
-- PLAYERS (40 fake players spread across teams)
-- ============================================================

INSERT INTO "Players" (first_name, last_name, current_team) VALUES
  ('James', 'Carter', 20),
  ('Mike', 'Sullivan', 20),
  ('Tom', 'Henderson', 20),
  ('Chris', 'Walsh', 21),
  ('Dave', 'Morrison', 21),
  ('Paul', 'Nguyen', 21),
  ('Steve', 'Kowalski', 22),
  ('Brian', 'Fitzpatrick', 22),
  ('Kevin', 'Drummond', 22),
  ('Gary', 'Lehmann', 23),
  ('Rick', 'Sandoval', 23),
  ('Dan', 'Okafor', 23),
  ('Mark', 'Petersen', 24),
  ('Jeff', 'Yamamoto', 24),
  ('Neil', 'Bouchard', 24),
  ('Scott', 'Mackenzie', 25),
  ('Brad', 'Visser', 25),
  ('Tony', 'Reyes', 25),
  ('Eric', 'Johansson', 26),
  ('Phil', 'Beaumont', 26),
  ('Rob', 'Tanaka', 26),
  ('Lou', 'Perreira', 27),
  ('Matt', 'Holloway', 27),
  ('Greg', 'Novak', 27),
  ('Ed', 'Flanagan', 28),
  ('Ray', 'Mbeki', 28),
  ('Tim', 'Gallagher', 28),
  ('Joe', 'Christodoulou', 29),
  ('Sam', 'Winters', 29),
  ('Frank', 'Osei', 29),
  ('Bill', 'Nakamura', 30),
  ('Ken', 'Abramowitz', 30),
  ('Al', 'Tremblay', 30),
  ('Don', 'Ferreira', 31),
  ('Hank', 'Svensson', 31),
  ('Norm', 'Patel', 31),
  ('Gus', 'Leblanc', 32),
  ('Vic', 'Antonescu', 32),
  ('Len', 'Okonkwo', 33),
  ('Walt', 'Dupuis', 33);

-- ============================================================
-- ROSTERS
-- ============================================================

INSERT INTO "Rosters" (team_id, player_id, active_period)
SELECT p.current_team, p.id, '[2025-01-01,2025-12-31]'::daterange
FROM "Players" p
WHERE p.id BETWEEN
  (SELECT MIN(id) FROM "Players")
  AND
  (SELECT MAX(id) FROM "Players");

-- ============================================================
-- UPCOMING GAMES
-- ============================================================

INSERT INTO "Games"
  (date, location, home_team_id, away_team_id, league_id, is_playoff, notes)
VALUES
  (current_date + 2, 'Mohawk 4',  20, 21, 2, false, NULL),
  (current_date + 2, 'Mohawk 5',  22, 23, 2, false, NULL),
  (current_date + 4, 'Albion 1',  24, 25, 2, false, NULL),
  (current_date + 4, 'Albion 2',  26, 27, 2, false, NULL),
  (current_date + 5, 'Mohawk 4',  28, 29, 2, false, NULL),
  (current_date + 5, 'Mohawk 5',  30, 31, 2, false, NULL),
  (current_date + 6, 'Chedoke 1', 32, 33, 2, false, NULL),
  (current_date + 7, 'Chedoke 2', 34, 35, 2, false, NULL),
  (current_date + 7, 'Mohawk 4',  36, 37, 2, false, NULL),
  (current_date + 9, 'Albion 1',  38, 20, 2, false, NULL);

-- ============================================================
-- RECENT GAMES
-- ============================================================

INSERT INTO "Games"
  (date, location, home_team_id, away_team_id, league_id, is_playoff, home_score, away_score)
VALUES
  (current_date - 2,  'Mohawk 4',  20, 35, 2, false, 8,  5),
  (current_date - 2,  'Mohawk 5',  21, 30, 2, false, 3,  7),
  (current_date - 4,  'Albion 1',  22, 38, 2, false, 6,  6),
  (current_date - 4,  'Albion 2',  24, 31, 2, false, 11, 4),
  (current_date - 7,  'Mohawk 4',  25, 29, 2, false, 5,  8),
  (current_date - 7,  'Mohawk 5',  26, 33, 2, false, 9,  2),
  (current_date - 9,  'Chedoke 1', 27, 32, 2, false, 4,  4),
  (current_date - 11, 'Chedoke 2', 28, 34, 2, false, 7, 10),
  (current_date - 14, 'Mohawk 4',  29, 36, 2, false, 6,  3),
  (current_date - 14, 'Mohawk 5',  30, 37, 2, false, 8,  8);

-- ============================================================
-- INNINGS
-- ============================================================

-- Blue Jays 8 vs Padres 5
WITH g AS (
  SELECT id FROM "Games"
  WHERE date = current_date - 2
    AND home_team_id = 20
    AND away_team_id = 35
)
INSERT INTO "Innings" (game_id, inning, home_runs, away_runs)
SELECT g.id, inning, home_runs, away_runs
FROM g, (VALUES
  (1, 2, 0),
  (2, 1, 2),
  (3, 0, 1),
  (4, 3, 0),
  (5, 0, 2),
  (6, 1, 0),
  (7, 1, 0)
) AS i(inning, home_runs, away_runs);

-- Yankees 3 vs Astros 7
WITH g AS (
  SELECT id FROM "Games"
  WHERE date = current_date - 2
    AND home_team_id = 21
    AND away_team_id = 30
)
INSERT INTO "Innings" (game_id, inning, home_runs, away_runs)
SELECT g.id, inning, home_runs, away_runs
FROM g, (VALUES
  (1, 0, 1),
  (2, 1, 2),
  (3, 0, 0),
  (4, 1, 1),
  (5, 0, 2),
  (6, 1, 1),
  (7, 0, 0)
) AS i(inning, home_runs, away_runs);

-- Orioles 11 vs Rangers 4
WITH g AS (
  SELECT id FROM "Games"
  WHERE date = current_date - 4
    AND home_team_id = 24
    AND away_team_id = 31
)
INSERT INTO "Innings" (game_id, inning, home_runs, away_runs)
SELECT g.id, inning, home_runs, away_runs
FROM g, (VALUES
  (1, 3, 1),
  (2, 2, 0),
  (3, 1, 1),
  (4, 2, 0),
  (5, 0, 2),
  (6, 2, 0),
  (7, 1, 0)
) AS i(inning, home_runs, away_runs);

-- ============================================================
-- BATTING
-- ============================================================

-- Blue Jays vs Padres
WITH g AS (
  SELECT id FROM "Games"
  WHERE date = current_date - 2
    AND home_team_id = 20
    AND away_team_id = 35
)
INSERT INTO "Batting"
  (game_id, player_id, at_bat, run, single_hit, double_hit,
   triple_hit, home_run, runs_batted_in, walk, strikeout,
   hit_by_pitch, stolen_base, sacrifice, roe)
SELECT g.id, p.id, ab, r, s, d, t, hr, rbi, bb, k, hbp, sb, sac, roe
FROM g,
(VALUES
  ('James', 'Carter',    4, 2, 2, 1, 0, 0, 2, 0, 1, 0, 1, 0, 0),
  ('Mike',  'Sullivan',  3, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0),
  ('Tom',   'Henderson', 4, 1, 1, 0, 0, 0, 1, 0, 2, 1, 0, 1, 0)
) AS v(fn, ln, ab, r, s, d, t, hr, rbi, bb, k, hbp, sb, sac, roe)
JOIN "Players" p
  ON p.first_name = v.fn
 AND p.last_name = v.ln;

WITH g AS (
  SELECT id FROM "Games"
  WHERE date = current_date - 2
    AND home_team_id = 20
    AND away_team_id = 35
)
INSERT INTO "Batting"
  (game_id, player_id, at_bat, run, single_hit, double_hit,
   triple_hit, home_run, runs_batted_in, walk, strikeout,
   hit_by_pitch, stolen_base, sacrifice, roe)
SELECT g.id, p.id, ab, r, s, d, t, hr, rbi, bb, k, hbp, sb, sac, roe
FROM g,
(VALUES
  ('Len',  'Okonkwo', 4, 1, 2, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0),
  ('Walt', 'Dupuis',  3, 2, 1, 1, 0, 0, 2, 1, 0, 0, 1, 0, 0),
  ('Gus',  'Leblanc', 4, 1, 0, 0, 0, 1, 2, 0, 1, 0, 0, 0, 1)
) AS v(fn, ln, ab, r, s, d, t, hr, rbi, bb, k, hbp, sb, sac, roe)
JOIN "Players" p
  ON p.first_name = v.fn
 AND p.last_name = v.ln;

-- Yankees vs Astros
WITH g AS (
  SELECT id FROM "Games"
  WHERE date = current_date - 2
    AND home_team_id = 21
    AND away_team_id = 30
)
INSERT INTO "Batting"
  (game_id, player_id, at_bat, run, single_hit, double_hit,
   triple_hit, home_run, runs_batted_in, walk, strikeout,
   hit_by_pitch, stolen_base, sacrifice, roe)
SELECT g.id, p.id, ab, r, s, d, t, hr, rbi, bb, k, hbp, sb, sac, roe
FROM g,
(VALUES
  ('Chris', 'Walsh',    3, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0),
  ('Dave',  'Morrison', 3, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0),
  ('Paul',  'Nguyen',   3, 1, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1)
) AS v(fn, ln, ab, r, s, d, t, hr, rbi, bb, k, hbp, sb, sac, roe)
JOIN "Players" p
  ON p.first_name = v.fn
 AND p.last_name = v.ln;

WITH g AS (
  SELECT id FROM "Games"
  WHERE date = current_date - 2
    AND home_team_id = 21
    AND away_team_id = 30
)
INSERT INTO "Batting"
  (game_id, player_id, at_bat, run, single_hit, double_hit,
   triple_hit, home_run, runs_batted_in, walk, strikeout,
   hit_by_pitch, stolen_base, sacrifice, roe)
SELECT g.id, p.id, ab, r, s, d, t, hr, rbi, bb, k, hbp, sb, sac, roe
FROM g,
(VALUES
  ('Bill', 'Nakamura',   3, 2, 2, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0),
  ('Ken',  'Abramowitz', 3, 3, 1, 1, 0, 1, 3, 0, 0, 0, 0, 0, 0),
  ('Al',   'Tremblay',   3, 2, 2, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0)
) AS v(fn, ln, ab, r, s, d, t, hr, rbi, bb, k, hbp, sb, sac, roe)
JOIN "Players" p
  ON p.first_name = v.fn
 AND p.last_name = v.ln;

-- Orioles vs Rangers
WITH g AS (
  SELECT id FROM "Games"
  WHERE date = current_date - 4
    AND home_team_id = 24
    AND away_team_id = 31
)
INSERT INTO "Batting"
  (game_id, player_id, at_bat, run, single_hit, double_hit,
   triple_hit, home_run, runs_batted_in, walk, strikeout,
   hit_by_pitch, stolen_base, sacrifice, roe)
SELECT g.id, p.id, ab, r, s, d, t, hr, rbi, bb, k, hbp, sb, sac, roe
FROM g,
(VALUES
  ('Mark', 'Petersen', 4, 3, 2, 1, 0, 1, 4, 1, 0, 0, 0, 0, 0),
  ('Jeff', 'Yamamoto', 4, 4, 3, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0),
  ('Neil', 'Bouchard', 4, 2, 1, 0, 1, 0, 3, 1, 1, 0, 0, 0, 0)
) AS v(fn, ln, ab, r, s, d, t, hr, rbi, bb, k, hbp, sb, sac, roe)
JOIN "Players" p
  ON p.first_name = v.fn
 AND p.last_name = v.ln;

WITH g AS (
  SELECT id FROM "Games"
  WHERE date = current_date - 4
    AND home_team_id = 24
    AND away_team_id = 31
)
INSERT INTO "Batting"
  (game_id, player_id, at_bat, run, single_hit, double_hit,
   triple_hit, home_run, runs_batted_in, walk, strikeout,
   hit_by_pitch, stolen_base, sacrifice, roe)
SELECT g.id, p.id, ab, r, s, d, t, hr, rbi, bb, k, hbp, sb, sac, roe
FROM g,
(VALUES
  ('Don',  'Ferreira',  4, 1, 1, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0),
  ('Hank', 'Svensson',  4, 1, 2, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1),
  ('Norm', 'Patel',     4, 2, 1, 1, 0, 0, 2, 1, 0, 1, 0, 0, 0)
) AS v(fn, ln, ab, r, s, d, t, hr, rbi, bb, k, hbp, sb, sac, roe)
JOIN "Players" p
  ON p.first_name = v.fn
 AND p.last_name = v.ln;

-- ============================================================
-- RESET ALL SERIAL SEQUENCES
-- Useful because teams/leagues use explicit IDs above.
-- ============================================================

SELECT setval(
  pg_get_serial_sequence('"Players"', 'id'),
  COALESCE((SELECT MAX(id) FROM "Players"), 1)
);

SELECT setval(
  pg_get_serial_sequence('"Rosters"', 'id'),
  COALESCE((SELECT MAX(id) FROM "Rosters"), 1)
);

SELECT setval(
  pg_get_serial_sequence('"Games"', 'id'),
  COALESCE((SELECT MAX(id) FROM "Games"), 1)
);

SELECT setval(
  pg_get_serial_sequence('"Innings"', 'id'),
  COALESCE((SELECT MAX(id) FROM "Innings"), 1)
);

SELECT setval(
  pg_get_serial_sequence('"Batting"', 'id'),
  COALESCE((SELECT MAX(id) FROM "Batting"), 1)
);

COMMIT;