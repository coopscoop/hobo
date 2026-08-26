import {
    pgTable, pgEnum, serial, varchar, text, date, customType,
    integer, boolean, alias, unique, time, jsonb
} from 'drizzle-orm/pg-core';

// ---- Enums ----

export const announcementTypeEnum = pgEnum('announcement_type', ['news', 'event', 'update']);

// ---- CustomType - daterange ----

const daterange = customType<{ data: string }>({
    dataType() {
        return 'daterange';
    },
})

// ---- Tables ----

export const announcements = pgTable('Announcements', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    date: date('date').notNull().defaultNow(),
    content: text('content'),
    type: announcementTypeEnum('type').notNull().default('news'),
    pinned: boolean('pinned').notNull().default(false),
});

export const leagues = pgTable('Leagues', {
    id: serial('id').primaryKey(),
    leagueName: varchar('league_name', { length: 32 }).notNull(),
});

export const teams = pgTable('Teams', {
    id: serial('id').primaryKey(),
    teamName: varchar('team_name', { length: 32 }).notNull(),
});

export const players = pgTable('Players', {
    id: serial('id').primaryKey(),
    firstName: varchar('first_name', { length: 64 }),
    lastName: varchar('last_name', { length: 64 }),
    currentTeam: integer('current_team').references(() => teams.id),
});

export const rosters = pgTable('Rosters', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id),
    playerId: integer('player_id').notNull().references(() => players.id),
    activePeriod: daterange('active_period').notNull(),
});

export const games = pgTable('Games', {
    id: serial('id').primaryKey(),
    date: date('date').notNull().defaultNow(),
    location: text('location').notNull(), // DEPRECIATED USE ID - TODO: MIGRATE ALL GAMES OVER TO ID OVER TEXT LOCATION
    fieldId: integer('field_id').notNull().references(() => fields.id).default(1),
    homeTeamId: integer('home_team_id').notNull().references(() => teams.id),
    awayTeamId: integer('away_team_id').notNull().references(() => teams.id),
    leagueId: integer('league_id').notNull().references(() => leagues.id),
    isPlayoff: boolean('is_playoff').notNull().default(false),
    notes: text('notes'),
    homeScore: integer('home_score'),
    awayScore: integer('away_score'),
    time: time('start_time').notNull().default('09:00:00'),
});

export const innings = pgTable('Innings', {
    id: serial('id').primaryKey(),
    gameId: integer('game_id').notNull().references(() => games.id),
    inning: integer('inning').notNull(),
    homeRuns: integer('home_runs').notNull().default(0),
    awayRuns: integer('away_runs').notNull().default(0),
}, (t) => ({
    uniqueGameInning: unique().on(t.gameId, t.inning),
}));

export const batting = pgTable('Batting', {
    id: serial('id').primaryKey(),
    gameId: integer('game_id').notNull().references(() => games.id),
    playerId: integer('player_id').notNull().references(() => players.id),
    atBat: integer('at_bat').default(0),
    run: integer('run').default(0),
    walk: integer('walk').default(0),
    strikeout: integer('strikeout').default(0),
    secondBase: integer('second_base').default(0),
    hitByPitch: integer('hit_by_pitch').default(0),
    stolenBase: integer('stolen_base').default(0),
    runsBattedIn: integer('runs_batted_in').default(0),
    sacrifice: integer('sacrifice').default(0),
    singleHit: integer('single_hit').default(0),
    doubleHit: integer('double_hit').default(0),
    tripleHit: integer('triple_hit').default(0),
    homeRun: integer('home_run').default(0),
    roe: integer('roe').default(0),
    perInning: jsonb('per_inning'),
});

export const pitching = pgTable('Pitching', {
    id: serial('id').primaryKey(),
    gameId: integer('game_id').notNull().references(() => games.id),
    playerId: integer('player_id').notNull().references(() => players.id),
    inningsPitched: integer('innings_pitched'),
});

export const substitutes = pgTable('Substitutes', {
    id: serial('id').primaryKey(),
    gameId: integer('game_id').notNull().references(() => games.id),
    playerId: integer('player_id').notNull().references(() => players.id),
    fromTeamId: integer('from_team_id').references(() => teams.id),
    newTeamId: integer('new_team_id').notNull().references(() => teams.id),
});

export const executives = pgTable('Executives', {
    id: serial('id').primaryKey(),
    firstName: varchar('first_name', { length: 64 }),
    lastName: varchar('last_name', { length: 64 }),
    position: varchar('position', { length: 32 }),
    year: integer('year').notNull(),
});

export const pages = pgTable("PageContent", {
    id: serial("id").primaryKey(),
    pageName: varchar("page_name", { length: 255 }).notNull().unique(),
    content: text("content").notNull().default(""),
});

export const fields = pgTable('Fields', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    address: varchar('address'),
});

// ---- Aliases (for self-referencing joins on games) ----

export const homeTeam = alias(teams, 'home_team');
export const awayTeam = alias(teams, 'away_team');

