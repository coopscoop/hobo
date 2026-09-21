import {
    createLoader, createSerializer, inferParserType,
    parseAsArrayOf, parseAsBoolean, parseAsInteger, parseAsString,
} from 'nuqs/server'

export const gameSearchParsers = {
    from: parseAsString,                       // 'YYYY-MM-DD'
    to: parseAsString,                         // 'YYYY-MM-DD', defaults to today server-side
    playoff: parseAsBoolean,                   // absent = both, true = playoffs only, false = regular season only
    teams: parseAsArrayOf(parseAsInteger),     // 1 or 2 team ids
    field: parseAsInteger,
    // status: parseAsInteger,                 // once the statuses table exists
}

export const loadGameFilters = createLoader(gameSearchParsers)          // for the API route
export const serializeGameFilters = createSerializer(gameSearchParsers) // for the service
export type GameFilters = Partial<inferParserType<typeof gameSearchParsers>>
