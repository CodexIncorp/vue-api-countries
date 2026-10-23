<script setup>
import { ref, watch } from 'vue'
import { getCountryByCode } from '../api/countries'
import {
    getCountryFlagUrl,
    getCountryNameInSpanish,
    getLocalTerritoryBySlug,
} from '../utils/countries'

const props = defineProps({ code: String, slug: String })

const country = ref(null)
const loading = ref(true)
const error = ref('')

watch(() => [props.code, props.slug], async () => {
    country.value = null
    error.value = ''
    loading.value = true

    try {
        const data = props.slug
            ? getLocalTerritoryBySlug(props.slug)
            : await getCountryByCode(props.code)
        if (!data) throw new Error('País no encontrado')
        country.value = data
    } catch (e) {
        error.value = `No se pudo cargar el país. (${e.message})`
    } finally {
        loading.value = false
    }
}, { immediate: true })
</script>

<template>
    <RouterLink to="/" class="back-btn">← Volver</RouterLink>

    <p v-if="loading" class="status-msg">Cargando...</p>
    <p v-else-if="error" class="status-msg error">{{ error }}</p>

    <article v-else-if="country" class="detail">
        <img :src="getCountryFlagUrl(country)"
            :alt="country.flag.description || `Bandera de ${getCountryNameInSpanish(country)}`" />
        <div class="info-container">
            <h1>{{ getCountryNameInSpanish(country) }}</h1>
            <p class="info-box"><strong>Nombre oficial:</strong> {{ country.names.official }}</p>
            <p class="info-box">
                <strong>Capital:</strong>
                {{country.capitals?.map((c) => c.name).join(', ') || 'N/D'}}
            </p>
            <p class="info-box"><strong>Región:</strong> {{ country.region }} ({{ country.subregion }})</p>
            <p v-if="country.population" class="info-box">
                <strong>Población:</strong>
                {{ country.population.toLocaleString('es-MX') }}
            </p>
            <p v-if="country.timezones?.length" class="info-box">
                <strong>Zonas horarias:</strong>
                <span v-for="tz in country.timezones" :key="tz" class="tag">
                    {{ tz }}
                </span>
            </p>
            <p v-if="country.languages?.length" class="info-box">
                <strong>Idiomas:</strong>
                <span v-for="lang in country.languages" :key="lang.iso639_3" class="tag">
                    {{ lang.name }}
                </span>
            </p>
            <p v-if="country.politicalStatus" class="info-box">
                <strong>Situación política:</strong> {{ country.politicalStatus }}
            </p>
        </div>
    </article>
</template>

<style scoped>
.back-btn {
    display: inline-block;
    padding: 0.6rem 1.2rem;
    margin-bottom: 1.5rem;
    background-color: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
    transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.back-btn:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
}

.status-msg {
    margin: 1rem 0;
    color: #555;
}

.error {
    color: #c0392b;
}

.detail {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    align-items: flex-start;
}

.detail img {
    width: 320px;
    max-width: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border: 1px solid #eee;
}

.info-container {
    flex: 1;
    min-width: 280px;
}

.info-container h1 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #2c3e50;
}

.info-box {
    background: white;
    padding: 1rem;
    margin-bottom: 0.75rem;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
    border: 1px solid #f5f5f5;
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.info-box:hover {
    transform: translateX(8px);
    box-shadow: 0 6px 15px rgba(52, 152, 219, 0.15);
    border-color: rgba(52, 152, 219, 0.4);
}

.info-box strong {
    color: #2c3e50;
    margin-right: 0.25rem;
}

.tag {
    background: #dfe6e9;
    color: #2d3436;
    padding: 4px 10px;
    border-radius: 16px;
    margin-right: 6px;
    font-size: 0.9rem;
    display: inline-block;
    margin-top: 4px;
    transition: background-color 0.2s ease;
}

.info-box:hover .tag {
    background: #74b9ff;
    color: white;
}
</style>