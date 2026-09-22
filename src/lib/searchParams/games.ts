// lib/searchParams/games.ts
import {
    createLoader, createParser, createSerializer, inferParserType,
    parseAsArrayOf, parseAsBoolean, parseAsInteger, parseAsString, parseAsStringEnum,
} from 'nuqs/server'

const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s)

const parseAsDateOrAll = createParser({
    parse(value) {
        if (value === 'all') return 'all' as const
        return isIsoDate(value) ? value : null
    },
    serialize(value) {
        return String(value)
    },
})

export const gameSearchParsers = {
    from: parseAsString,
    to: parseAsDateOrAll,
    season: parseAsStringEnum(['all', 'regular', 'playoffs']).withDefault('regular'),
    teams: parseAsArrayOf(parseAsInteger),
    field: parseAsInteger,
}

export const loadGameFilters = createLoader(gameSearchParsers)
export const serializeGameFilters = createSerializer(gameSearchParsers)
export type GameFilters = Partial<inferParserType<typeof gameSearchParsers>>
