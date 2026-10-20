const BASE_URL = 'https://api.restcountries.com/countries/v5'
const API_KEY = import.meta.env.VITE_RESTCOUNTRIES_KEY

const LIST_FIELDS = 'names.common,codes.alpha_3,flag.url_svg,flag.description,region'
const DETAIL_FIELDS = 'names.common,names.official,capitals,region,subregion,population,timezones,flag.url_svg,flag.description'

const CACHE_KEY = 'countries-list-v2'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // los términos permiten hasta 3 días

async function request(path) {
    if (!API_KEY)
        throw new Error('Falta RESTCOUNTRIES_KEY (revisa tu archivo .env.local)')

    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
    })
    if (!res.ok) {
        let detail = ''
        try {
            detail = (await res.json())?.errors?.[0]?.message ?? ''
        } catch {
            // Respuesta sin JSON
        }
        throw new Error(`HTTP ${res.status}${detail ? `: ${detail}` : ''}`)
    }
    return (await res.json()).data
}

function readCache() {
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
        if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS)
            return cached.countries
    } catch {
        // Cache corrupta o no disponible
    }
    return null
}

function writeCache(countries) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(
            {
                savedAt: Date.now(),
                countries,
            }
        ))
    } catch {
        // Almacenamiento lleno o bloqueado
    }
}

function hasCode(c) {
    return Boolean(c.codes && c.codes.alpha_3)    
}

export async function getAllCountries() {
    const cached = readCache()
    if (cached) return cached

    const limit = 100 // máximo del plan gratuito (paginación)
    const all = []
    let offset = 0
    while (true) {
        const data = await request(
            `?limit=${limit}&offset=${offset}&response_fields=${LIST_FIELDS}`
        )
        all.push(...data.objects)
        if (!data.meta.more) break
        offset += limit
    }

    const valid = all.filter(hasCode)
    if (valid.length < all.length) {
        console.warn(
            'Omitidos por no tener codes.alpha_3:',
            all.filter((c) => !hasCode(c)).map((c) => c.names.common)
        )
    }

    writeCache(valid) // la API ya los devuelve ordenados por names.common
    return valid
}

export async function getCountryByCode(alpha_3) {
    const date = await request(
        `/codes.alpha_3/${encodeURIComponent(alpha_3)}?response_fields=${DETAIL_FIELDS}`
    )
    return data.objects?.[0] ?? null
}
