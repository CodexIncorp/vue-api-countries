<script setup>
import { ref, onMounted } from 'vue'
import { getCountryByCode } from '../api/countries'

const props = defineProps({ code: String })

const country = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
    try {
        const data = await getCountryByCode(props.code)
        if (!data) throw new Error('País no encontrado')
        country.value = data
    } catch (e) {
        error.value = `No se pudo cargar el país. (${e.message})`
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <RouterLink to="/">← Volver</RouterLink>

    <p v-if="loading">Cargando...</p>
    <p v-else-if="error" style="color:#c0392b">{{ error }}</p>

    <article v-else-if="country" class="detail">
        <img :src="country.flag.url_svg" :alt="country.flag.description || `Bandera de ${country.names.common}`" />
        <div>
            <h1>{{ country.names.common }}</h1>
            <p><strong>Nombre oficial:</strong> {{ country.names.official }}</p>
            <p>
                <strong>Capital:</strong>
                {{country.capitals?.map((c) => c.name).join(', ') || 'N/D'}}
            </p>
            <p><strong>Región:</strong> {{ country.region }} ({{ country.subregion }})</p>
            <p>
                <strong>Población:</strong>
                {{ country.population?.toLocaleString('es-MX') ?? 'N/D' }}
            </p>
            <p v-if="country.timezones?.length">
                <strong>Zonas horarias:</strong>
                <span v-for="tz in country.timezones" :key="tz" class="tag">{{ tz }}</span>
            </p>
        </div>
    </article>
</template>

<style scoped>
.detail {
    display: flex;
    gap: 2rem;
    margin-top: 1.5rem;
    flex-wrap: wrap;
}

.detail img {
    width: 320px;
    max-width: 100%;
    align-self: flex-start;
}

.tag {
    background: #dfe6e9;
    padding: 2px 8px;
    border-radius: 12px;
    margin-right: 6px;
}
</style>
