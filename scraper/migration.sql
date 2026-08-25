-- =============================================================================
-- Migration: leaguelineup CSV data → hobo baseball DB
-- =============================================================================
-- Expected CSV files (copy these to the same directory before running,
-- or update the paths in each \copy command below):
--
--   players.csv     — player_id, last_name, first_name, number, division, team
--   game_ids.csv    — game_id, date, status, visitors, home, location,
--                     division_id, division_name
--   game_metadata.csv — game_id, status, innings_played, exclude_from_standings,
--                       home_score, away_score, headline, summary
--   innings.csv     — game_id, inning, home_runs, away_runs
--   batting.csv     — game_id, player_id, team_type, at_bat, run, single,
--                     double, triple, home_run, runs_batted_in, walk,
--                     strikeout, hit_by_pitch, stolen_base, sacrifice, roe
--
-- Run with: psql -U <user> -d <database> -f migration.sql
-- =============================================================================

BEGIN;

-- =============================================================================
-- Schema changes
-- =============================================================================

-- Batting: add hit type and roe columns that the scraper collects
ALTER TABLE public.batting
    ADD COLUMN IF NOT EXISTS single_hit  integer,
    ADD COLUMN IF NOT EXISTS double_hit  integer,
    ADD COLUMN IF NOT EXISTS triple_hit  integer,
    ADD COLUMN IF NOT EXISTS home_run    integer,
    ADD COLUMN IF NOT EXISTS roe         integer;

-- Games: add nullable final scores
-- Null means no direct score was recorded; derive from innings sum instead.
ALTER TABLE public.games
    ADD COLUMN IF NOT EXISTS home_score integer,
    ADD COLUMN IF NOT EXISTS away_score integer;


-- =============================================================================
-- Temp tables — leaguelineup raw data, dropped at end of migration
-- =============================================================================

CREATE TEMP TABLE tmp_players (
    ll_player_id  integer,
    last_name     text,
    first_name    text,
    number        text,
    division      text,
    team          text
);

CREATE TEMP TABLE tmp_game_ids (
    ll_game_id    integer,
    date          text,
    status        text,
    visitors      text,
    home          text,
    location      text,
    division_id   integer,
    division_name text
);

CREATE TEMP TABLE tmp_game_metadata (
    ll_game_id              integer,
    status                  text,
    innings_played          integer,
    exclude_from_standings  text,      -- "True"/"False" string from Python
    home_score              text,      -- nullable, comes in as empty string
    away_score              text,
    headline                text,
    summary                 text
);

CREATE TEMP TABLE tmp_innings (
    ll_game_id  integer,
    inning      integer,
    home_runs   integer,
    away_runs   integer
);

CREATE TEMP TABLE tmp_batting (
    ll_game_id      integer,
    ll_player_id    integer,
    team_type       text,
    at_bat          integer,
    run             integer,
    single_hit      integer,
    double_hit      integer,
    triple_hit      integer,
    home_run        integer,
    runs_batted_in  integer,
    walk            integer,
    strikeout       integer,
    hit_by_pitch    integer,
    stolen_base     integer,
    sacrifice       integer,
    roe             integer
);


-- =============================================================================
-- Load CSVs into temp tables
-- =============================================================================

\copy tmp_players       FROM 'players.csv'       WITH (FORMAT csv, HEADER true);
\copy tmp_game_ids      FROM 'game_ids.csv'       WITH (FORMAT csv, HEADER true);
\copy tmp_game_metadata FROM 'game_metadata.csv'  WITH (FORMAT csv, HEADER true, QUOTE '"', ESCAPE '"');
\copy tmp_innings       FROM 'innings.csv'        WITH (FORMAT csv, HEADER true);
\copy tmp_batting       FROM 'batting.csv'        WITH (FORMAT csv, HEADER true);


-- =============================================================================
-- League
-- =============================================================================

INSERT INTO public.leagues (league_name)
VALUES ('Hamilton Oldtimers Baseball')
ON CONFLICT DO NOTHING;


-- =============================================================================
-- Teams
-- =============================================================================
-- Collect all unique team names from both the home and visitor columns,
-- then insert any that don't already exist.

INSERT INTO public.teams (team_name)
SELECT DISTINCT team_name
FROM (
    SELECT home     AS team_name FROM tmp_game_ids
    UNION
    SELECT visitors AS team_name FROM tmp_game_ids
) all_teams
WHERE team_name IS NOT NULL
  AND team_name <> ''
ON CONFLICT DO NOTHING;


-- =============================================================================
-- Players
-- =============================================================================
-- Deduplicate on first_name + last_name — a player appearing across multiple
-- seasons will have multiple rows in the CSV, we only insert once.

INSERT INTO public.players (first_name, last_name)
SELECT DISTINCT first_name, last_name
FROM tmp_players
WHERE first_name IS NOT NULL
  AND last_name  IS NOT NULL
ON CONFLICT DO NOTHING;


-- =============================================================================
-- Rosters
-- =============================================================================
-- Derive year from division_name (e.g. "2024 Regular Season" → 2024).
-- active_period is set to the full calendar year for that season.
-- A player appearing on multiple teams across multiple seasons gets one
-- roster row per (player, team, year) combination.

INSERT INTO public.rosters (player_id, team_id, active_period)
SELECT DISTINCT
    pl.id                                              AS player_id,
    t.id                                               AS team_id,
    daterange(
        make_date((regexp_match(tp.division, '\d{4}'))[1]::integer, 1, 1),
        make_date((regexp_match(tp.division, '\d{4}'))[1]::integer, 12, 31),
        '[]'
    )                                                  AS active_period
FROM tmp_players tp
JOIN public.players pl
    ON pl.first_name = tp.first_name
   AND pl.last_name  = tp.last_name
JOIN public.teams t
    ON t.team_name = tp.team
WHERE tp.team     IS NOT NULL
  AND tp.division IS NOT NULL
  AND (regexp_match(tp.division, '\d{4}'))[1] IS NOT NULL
ON CONFLICT DO NOTHING;


-- =============================================================================
-- Games
-- =============================================================================
-- is_playoff derived from division_name containing "Playoff".
-- home_score/away_score taken directly from metadata (nullable).
-- notes = headline + summary collapsed; whichever are present get used.

INSERT INTO public.games (
    date,
    location,
    home_team_id,
    away_team_id,
    league_id,
    is_playoff,
    home_score,
    away_score,
    notes
)
SELECT
    to_date(gi.date, 'MM/DD/YYYY'),
    gi.location,
    ht.id                                              AS home_team_id,
    at.id                                              AS away_team_id,
    (SELECT id FROM public.leagues
     WHERE league_name = 'Hamilton Oldtimers Baseball') AS league_id,
    gi.division_name ILIKE '%playoff%'                 AS is_playoff,
    NULLIF(gm.home_score, '')::integer                 AS home_score,
    NULLIF(gm.away_score, '')::integer                 AS away_score,
    -- collapse headline and summary into notes, separator if both present
    NULLIF(TRIM(
        COALESCE(NULLIF(TRIM(gm.headline), ''), '') ||
        CASE
            WHEN NULLIF(TRIM(gm.headline), '') IS NOT NULL
             AND NULLIF(TRIM(gm.summary),  '') IS NOT NULL
            THEN ' — '
            ELSE ''
        END ||
        COALESCE(NULLIF(TRIM(gm.summary), ''), '')
    ), '')                                             AS notes
FROM tmp_game_ids gi
JOIN tmp_game_metadata gm
    ON gm.ll_game_id = gi.ll_game_id
JOIN public.teams ht
    ON ht.team_name = gi.home
JOIN public.teams at
    ON at.team_name = gi.visitors
ON CONFLICT DO NOTHING;


-- =============================================================================
-- Game ID bridge
-- =============================================================================
-- Maps leaguelineup game IDs to our serial game IDs for use by innings
-- and batting inserts below. Matched on date + home team + away team
-- since that combination is unique per game.

CREATE TEMP TABLE tmp_game_id_map AS
SELECT
    gi.ll_game_id,
    g.id AS game_id
FROM tmp_game_ids gi
JOIN public.teams ht ON ht.team_name = gi.home
JOIN public.teams at ON at.team_name = gi.visitors
JOIN public.games g
    ON g.date         = to_date(gi.date, 'MM/DD/YYYY')
   AND g.home_team_id = ht.id
   AND g.away_team_id = at.id;


-- =============================================================================
-- Innings
-- =============================================================================

INSERT INTO public.innings (game_id, inning, home_runs, away_runs)
SELECT
    gm.game_id,
    ti.inning,
    ti.home_runs,
    ti.away_runs
FROM tmp_innings ti
JOIN tmp_game_id_map gm ON gm.ll_game_id = ti.ll_game_id;


-- =============================================================================
-- Player ID bridge
-- =============================================================================
-- Maps leaguelineup player IDs to our serial player IDs.
-- Deduplication is on first_name + last_name so multiple CSV rows for the
-- same player collapse to one mapping. Where a leaguelineup ID maps to
-- multiple names (shouldn't happen) or a name maps to multiple leaguelineup
-- IDs (can happen if same person has different IDs across seasons), we take
-- the first our-side ID we find — the batting data will still be correct,
-- only the source ID differs.

CREATE TEMP TABLE tmp_player_id_map AS
SELECT DISTINCT ON (tp.ll_player_id)
    tp.ll_player_id,
    pl.id AS player_id
FROM tmp_players tp
JOIN public.players pl
    ON pl.first_name = tp.first_name
   AND pl.last_name  = tp.last_name
ORDER BY tp.ll_player_id, pl.id;


-- =============================================================================
-- Batting
-- =============================================================================

INSERT INTO public.batting (
    game_id,
    player_id,
    at_bat,
    run,
    single_hit,
    double_hit,
    triple_hit,
    home_run,
    runs_batted_in,
    walk,
    strikeout,
    hit_by_pitch,
    stolen_base,
    sacrifice,
    roe
)
SELECT
    gm.game_id,
    pm.player_id,
    NULLIF(tb.at_bat,         0),
    NULLIF(tb.run,            0),
    NULLIF(tb.single_hit,     0),
    NULLIF(tb.double_hit,     0),
    NULLIF(tb.triple_hit,     0),
    NULLIF(tb.home_run,       0),
    NULLIF(tb.runs_batted_in, 0),
    NULLIF(tb.walk,           0),
    NULLIF(tb.strikeout,      0),
    NULLIF(tb.hit_by_pitch,   0),
    NULLIF(tb.stolen_base,    0),
    NULLIF(tb.sacrifice,      0),
    NULLIF(tb.roe,            0)
FROM tmp_batting tb
JOIN tmp_game_id_map   gm ON gm.ll_game_id   = tb.ll_game_id
JOIN tmp_player_id_map pm ON pm.ll_player_id = tb.ll_player_id;


-- =============================================================================
-- Cleanup
-- =============================================================================
-- Temp tables are session-scoped and will drop automatically on disconnect,
-- but being explicit here keeps things tidy if run in a long session.

DROP TABLE IF EXISTS tmp_players;
DROP TABLE IF EXISTS tmp_game_ids;
DROP TABLE IF EXISTS tmp_game_metadata;
DROP TABLE IF EXISTS tmp_innings;
DROP TABLE IF EXISTS tmp_batting;
DROP TABLE IF EXISTS tmp_game_id_map;
DROP TABLE IF EXISTS tmp_player_id_map;


-- =============================================================================
-- Sanity checks
-- =============================================================================
-- Run these after COMMIT to verify counts look reasonable.
-- Uncomment as needed.

-- SELECT COUNT(*) AS teams    FROM public.teams;
-- SELECT COUNT(*) AS players  FROM public.players;
-- SELECT COUNT(*) AS games    FROM public.games;
-- SELECT COUNT(*) AS innings  FROM public.innings;
-- SELECT COUNT(*) AS batting  FROM public.batting;
-- SELECT COUNT(*) AS rosters  FROM public.rosters;

-- Games with no innings and no direct score (fully untracked):
-- SELECT COUNT(*) FROM public.games
-- WHERE home_score IS NULL AND away_score IS NULL
--   AND id NOT IN (SELECT DISTINCT game_id FROM public.innings);

-- Batting rows that couldn't be linked to a player (should be 0):
-- SELECT COUNT(*) FROM tmp_batting tb
-- LEFT JOIN tmp_player_id_map pm ON pm.ll_player_id = tb.ll_player_id
-- WHERE pm.player_id IS NULL;


COMMIT;
