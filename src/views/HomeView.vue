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

// Primera llamada a la API
onMounted(fetchCountries)

const filtered = computed(() => {
    const term = search.value.trim().toLowerCase()
    if (!term) return countries.value
    return countries.value.filter(
        (c) =>
            getCountryNameInSpanish(c).toLowerCase().includes(term) ||
            (c.region ?? '').toLowerCase().includes(term)
    )
})
</script>

<template>
    <h1>Países del mundo</h1>

    <input v-model="search" class="search" type="text"
        placeholder="Buscar por nombre o región (ej. Mexico, Europe)..." />

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
        <div class="grid">
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
        </div>
    </template>
</template>

<style scoped>
.search {
    width: 100%;
    padding: .75rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-sizing: border-box;
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
}

.card:hover {
    transform: translateY(-3px);
}

.card img {
    width: 100%;
    height: 110px;
    object-fit: contain;
}

.card h3 {
    margin: .5rem 0 .25rem;
}

.card p {
    margin: 0;
    color: #777;
}
</style>
