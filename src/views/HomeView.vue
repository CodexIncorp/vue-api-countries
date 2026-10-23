<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getAllCountries } from '../api/countries'
import {
    getCountryFlagUrl,
    getCountryNameInSpanish,
    getLocalTerritory,
} from '../utils/countries'

const countries = ref([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const sortBy = ref('name_asc')
const selectedRegion = ref('')
const defaultFlagUrl = `${import.meta.env.BASE_URL}default-flag.svg`

function useDefaultFlag(event) {
    if (event.target.getAttribute('src') !== defaultFlagUrl)
        event.target.src = defaultFlagUrl
}

async function fetchCountries() {
    loading.value = true
    error.value = ''
    try {
        countries.value = await getAllCountries()
    } catch (e) {
        error.value = `No se pudieron cargar los países. (${e.message})`
    } finally {
        loading.value = false
    }
}

onMounted(fetchCountries)

const filtered = computed(() => {
    const term = search.value.trim().toLowerCase()
    let result = countries.value

    if (selectedRegion.value) {
        result = result.filter((c) => c.region === selectedRegion.value)
    }

    if (term) {
        result = result.filter(
            (c) =>
                getCountryNameInSpanish(c).toLowerCase().includes(term) ||
                (c.region ?? '').toLowerCase().includes(term)
        )
    }

    return result.slice().sort((a, b) => {
        const nameA = getCountryNameInSpanish(a)
        const nameB = getCountryNameInSpanish(b)

        if (sortBy.value === 'name_asc') return nameA.localeCompare(nameB)
        if (sortBy.value === 'name_desc') return nameB.localeCompare(nameA)
        
        return 0
    })
})
</script>

<template>
    <h1>Países del mundo</h1>

    <div class="controls">
        <input v-model="search" class="search" type="text"
            placeholder="Buscar por nombre o región (ej. Mexico, Europe)..." />
        
        <select v-model="selectedRegion" class="sort-select">
            <option value="">Todos los continentes</option>
            <option value="Africa">África</option>
            <option value="Americas">América</option>
            <option value="Antarctic">Antártida</option>
            <option value="Asia">Asia</option>
            <option value="Europe">Europa</option>
            <option value="Oceania">Oceanía</option>
        </select>

        <select v-model="sortBy" class="sort-select">
            <option value="name_asc">Nombre (A - Z)</option>
            <option value="name_desc">Nombre (Z - A)</option>
        </select>
    </div>

    <p v-if="loading" class="info">Cargando países...</p>

    <div v-else-if="error" class="info error">
        <p>{{ error }}</p>
        <button @click="fetchCountries">Reintentar</button>
    </div>

    <p v-else-if="filtered.length === 0" class="info">
        No se encontraron resultados para “{{ search }}”.
    </p>

    <template v-else>
        <p class="info">{{ filtered.length }} resultado(s)</p>
        <TransitionGroup name="list" tag="div" class="grid">
            <component v-for="(c, index) in filtered"
                :key="c.codes?.alpha_3 || c.names.common || index"
                :is="c.codes?.alpha_3 || getLocalTerritory(c) ? RouterLink : 'article'"
                v-bind="c.codes?.alpha_3
                    ? { to: { name: 'country', params: { code: c.codes.alpha_3 } } }
                    : getLocalTerritory(c)
                        ? { to: { name: 'territory', params: { slug: getLocalTerritory(c).slug } } }
                    : {}"
                class="card">
                <img :src="getCountryFlagUrl(c)"
                    :alt="c.flag?.description || `Bandera de ${getCountryNameInSpanish(c)}`"
                    @error="useDefaultFlag" />
                <h3>{{ getCountryNameInSpanish(c) }}</h3>
                <p>{{ c.region || 'Región no disponible' }}</p>
            </component>
        </TransitionGroup>
    </template>
</template>

<style scoped>
.controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.search {
    flex: 1;
    padding: .75rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.search:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.sort-select {
    padding: .75rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: white;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.sort-select:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.info {
    margin: 1rem 0;
    color: #555;
}

.error {
    color: #c0392b;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
}

.card {
    background: white;
    border-radius: 10px;
    padding: 1rem;
    text-decoration: none;
    color: inherit;
    box-shadow: 0 1px 4px rgba(0, 0, 0, .1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.card img {
    width: 100%;
    height: 110px;
    object-fit: contain;
    border: 1px solid #eee;
    border-radius: 4px;
}

.card h3 {
    margin: .5rem 0 .25rem;
}

.card p {
    margin: 0;
    color: #777;
}

.list-move,
.list-enter-active,
.list-leave-active {
    transition: all 0.4s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

.list-leave-active {
    position: absolute;
}

@media (max-width: 600px) {
    .controls {
        flex-direction: column;
    }
}
</style>