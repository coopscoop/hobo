import { createLoader, createParser, createSerializer, inferParserType } from 'nuqs/server'

const parseAsYearOrAll = createParser({
    parse(value) {
        if (value === 'all') return 'all' as const
        const n = Number(value)
        return Number.isInteger(n) ? n : null
    },
    serialize(value) {
        return String(value)
    },
}).withDefault('all')

export const teamSearchParsers = {
    year: parseAsYearOrAll,
}

export const loadTeamFilters = createLoader(teamSearchParsers)
export const serializeTeamFilters = createSerializer(teamSearchParsers)
export type TeamFilters = Partial<inferParserType<typeof teamSearchParsers>>
