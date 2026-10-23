const SPANISH_NAMES_WITHOUT_CODES = {
    Abkhazia: 'Abjasia',
    'Northern Cyprus': 'Chipre del Norte',
    Somaliland: 'Somalilandia',
    'South Ossetia': 'Osetia del Sur',
}

const LOCAL_FLAGS_WITHOUT_CODES = {
    Abkhazia: `${import.meta.env.BASE_URL}flags/abkhazia.svg`,
    'Northern Cyprus': `${import.meta.env.BASE_URL}flags/northern-cyprus.svg`,
    Somaliland: `${import.meta.env.BASE_URL}flags/somaliland.svg`,
    'South Ossetia': `${import.meta.env.BASE_URL}flags/south-ossetia.svg`,
}

const LOCAL_TERRITORIES = {
    Abkhazia: {
        slug: 'abjasia',
        officialName: 'República de Abjasia',
        capital: 'Sujumi',
        region: 'Asia',
        subregion: 'Cáucaso',
        timezones: ['UTC+03:00'],
        languages: ['Abjasio', 'Ruso'],
        politicalStatus: 'Territorio de facto; Georgia lo considera parte de su territorio y su independencia tiene reconocimiento internacional limitado.',
    },
    'Northern Cyprus': {
        slug: 'chipre-del-norte',
        officialName: 'República Turca del Norte de Chipre',
        capital: 'Nicosia del Norte',
        region: 'Europa',
        subregion: 'Mediterráneo oriental',
        timezones: ['UTC+03:00'],
        languages: ['Turco'],
        politicalStatus: 'Territorio autodeclarado reconocido como Estado únicamente por Turquía; la República de Chipre lo considera parte de su territorio.',
    },
    Somaliland: {
        slug: 'somalilandia',
        officialName: 'República de Somalilandia',
        capital: 'Hargeisa',
        region: 'África',
        subregion: 'Cuerno de África',
        timezones: ['UTC+03:00'],
        languages: ['Somalí', 'Árabe'],
        politicalStatus: 'Declaró su independencia de Somalia en 1991; no cuenta con reconocimiento internacional generalizado.',
    },
    'South Ossetia': {
        slug: 'osetia-del-sur',
        officialName: 'República de Osetia del Sur–Estado de Alania',
        capital: 'Tskhinvali',
        region: 'Asia',
        subregion: 'Cáucaso',
        timezones: ['UTC+03:00'],
        languages: ['Ossetio', 'Ruso'],
        politicalStatus: 'Territorio de facto; Georgia lo considera parte de su territorio y su independencia tiene reconocimiento internacional limitado.',
    },
}

const spanishRegionNames = new Intl.DisplayNames(['es'], { type: 'region' })

export function getCountryNameInSpanish(country) {
    const commonName = country.names.common
    const alpha2 = country.codes?.alpha_2

    return SPANISH_NAMES_WITHOUT_CODES[commonName]
        ?? (alpha2 ? spanishRegionNames.of(alpha2) : undefined)
        ?? commonName
}

export function getCountryFlagUrl(country) {
    return LOCAL_FLAGS_WITHOUT_CODES[country.names.common]
        ?? country.flag?.url_svg
        ?? `${import.meta.env.BASE_URL}default-flag.svg`
}

export function getLocalTerritory(country) {
    return LOCAL_TERRITORIES[country.names.common] ?? null
}

export function getLocalTerritoryBySlug(slug) {
    const entry = Object.entries(LOCAL_TERRITORIES)
        .find(([, territory]) => territory.slug === slug)

    if (!entry) return null

    const [commonName, territory] = entry
    return {
        names: {
            common: commonName,
            official: territory.officialName,
        },
        capitals: [{ name: territory.capital }],
        region: territory.region,
        subregion: territory.subregion,
        timezones: territory.timezones,
        languages: territory.languages.map((name) => ({ name })),
        flag: { url_svg: LOCAL_FLAGS_WITHOUT_CODES[commonName] },
        politicalStatus: territory.politicalStatus,
    }
}
