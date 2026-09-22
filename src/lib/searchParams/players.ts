import { createLoader, createParser, createSerializer, inferParserType, parseAsInteger, parseAsString } from 'nuqs/server'

const parseAsYearOrAll = createParser({
    parse(value) {
        if (value === 'all') return 'all' as const
        const n = Number(value)
        return Number.isInteger(n) ? n : null
    },
    serialize(value) {
        return String(value)
    },
}).withDefault(new Date().getFullYear())

export const playerSearchParsers = {
    year: parseAsYearOrAll,
    team: parseAsInteger,
    search: parseAsString,
}

export const loadPlayerFilters = createLoader(playerSearchParsers)
export const serializePlayerFilters = createSerializer(playerSearchParsers)
export type PlayerFilters = Partial<inferParserType<typeof playerSearchParsers>>
