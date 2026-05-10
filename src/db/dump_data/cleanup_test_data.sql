BEGIN;

-- Remove batting for test games (cascades aren't enough since we match by player name)
DELETE FROM batting
WHERE player_id IN (
  SELECT id FROM players WHERE last_name IN (
    'Carter','Sullivan','Henderson','Walsh','Morrison','Nguyen',
    'Kowalski','Fitzpatrick','Drummond','Lehmann','Sandoval','Okafor',
    'Petersen','Yamamoto','Bouchard','Mackenzie','Visser','Reyes',
    'Johansson','Beaumont','Tanaka','Perreira','Holloway','Novak',
    'Flanagan','Mbeki','Gallagher','Christodoulou','Winters','Osei',
    'Nakamura','Abramowitz','Tremblay','Ferreira','Svensson','Patel',
    'Leblanc','Antonescu','Okonkwo','Dupuis'
  )
);

-- Remove rosters for test players
DELETE FROM rosters
WHERE player_id IN (
  SELECT id FROM players WHERE last_name IN (
    'Carter','Sullivan','Henderson','Walsh','Morrison','Nguyen',
    'Kowalski','Fitzpatrick','Drummond','Lehmann','Sandoval','Okafor',
    'Petersen','Yamamoto','Bouchard','Mackenzie','Visser','Reyes',
    'Johansson','Beaumont','Tanaka','Perreira','Holloway','Novak',
    'Flanagan','Mbeki','Gallagher','Christodoulou','Winters','Osei',
    'Nakamura','Abramowitz','Tremblay','Ferreira','Svensson','Patel',
    'Leblanc','Antonescu','Okonkwo','Dupuis'
  )
);

-- Remove test players
DELETE FROM players WHERE last_name IN (
  'Carter','Sullivan','Henderson','Walsh','Morrison','Nguyen',
  'Kowalski','Fitzpatrick','Drummond','Lehmann','Sandoval','Okafor',
  'Petersen','Yamamoto','Bouchard','Mackenzie','Visser','Reyes',
  'Johansson','Beaumont','Tanaka','Perreira','Holloway','Novak',
  'Flanagan','Mbeki','Gallagher','Christodoulou','Winters','Osei',
  'Nakamura','Abramowitz','Tremblay','Ferreira','Svensson','Patel',
  'Leblanc','Antonescu','Okonkwo','Dupuis'
);

-- Remove test games (innings + substitutes cascade automatically)
-- Upcoming games (no scores)
DELETE FROM games
WHERE home_score IS NULL
AND date >= current_date
AND league_id = 2
AND home_team_id IN (20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38);

-- Recent test games (identified by being within 30 days and matching our inserted combos)
DELETE FROM games
WHERE date >= current_date - 14
AND date < current_date
AND league_id = 2
AND (home_team_id, away_team_id) IN (
  (20, 35), (21, 30), (22, 38), (24, 31),
  (25, 29), (26, 33), (27, 32), (28, 34),
  (29, 36), (30, 37)
);

COMMIT;
