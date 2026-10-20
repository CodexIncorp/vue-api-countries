# Explorador de países

Aplicación web de práctica construida con **Vue 3 + Vue Router** que consume la API de [REST Countries](https://restcountries.com) (v5) para listar países, filtrarlos por nombre o región y consultar el detalle de cada uno.

Sitio publicado: `https://codexincorp.github.io/vue-api-countries/`

---

## Tabla de contenido

1. [Objetivos de aprendizaje](#objetivos-de-aprendizaje)
2. [Funcionalidades](#funcionalidades)
3. [Stack](#stack)
4. [Puesta en marcha](#puesta-en-marcha)
5. [Estructura del proyecto](#estructura-del-proyecto)
6. [Reglas del proyecto](#reglas-del-proyecto)
7. [Uso de la API REST Countries](#uso-de-la-api-rest-countries)
8. [Flujo de trabajo con Git](#flujo-de-trabajo-con-git)
9. [Despliegue en GitHub Pages](#despliegue-en-github-pages)
10. [Solución de problemas](#solución-de-problemas)
11. [Mejoras futuras](#mejoras-futuras)
12. [Créditos](#créditos)

---

## Objetivos de aprendizaje

- Peticiones asíncronas con `fetch()`.
- Estructuras de control de Vue: `v-if`, `v-else-if`, `v-for`.
- Enlace de datos: `v-model` y `v-bind` (`:`).
- Estado reactivo con `ref()` y `computed()`.
- Navegación con Vue Router (hash mode, rutas con parámetros, carga diferida).
- Flujo de trabajo con ramas, Pull Requests y despliegue automático con GitHub Actions.

## Funcionalidades

- Lista de países con bandera, nombre y región.
- Buscador por nombre o región (filtrado en memoria, sin peticiones extra).
- Indicador de carga, mensaje de error con botón *Reintentar* y mensaje de "sin resultados".
- Vista de detalle (`/#/pais/:code`): nombre oficial, capital, región, población, zonas horarias.
- Caché local de la lista de países (24 h) para ahorrar cuota de la API.

## Stack

| Herramienta | Uso |
|---|---|
| Vue 3 (`<script setup>`) | Interfaz |
| Vue Router 4 (hash mode) | Navegación |
| Vite | Servidor de desarrollo y build |
| REST Countries API v5 | Fuente de datos |
| GitHub Actions + GitHub Pages | Despliegue |

## Puesta en marcha

**Requisitos:** Node.js (versión LTS reciente; el proyecto se ha usado con Node 24), npm y una API key de REST Countries.

```bash
# 1. Clonar e instalar
git clone https://github.com/CodexIncorp/vue-api-countries.git
cd vue-api-countries
npm install

# 2. Configurar la API key (ver sección siguiente)

# 3. Desarrollo
npm run dev

# 4. Build de producción y prueba local del build
npm run build
npm run preview
```

### Variables de entorno

Crea un archivo **`.env.local`** en la raíz (está ignorado por git, **nunca lo subas**):

```
VITE_RESTCOUNTRIES_KEY=rc_live_xxxxxxxxxxxxxxxx
```

- El prefijo `VITE_` es obligatorio: Vite solo expone al navegador las variables que lo llevan.
- Reinicia `npm run dev` después de crear o cambiar el archivo.
- `.env.example` (sin valor real) documenta la variable y sí puede estar en el repositorio.

## Estructura del proyecto

```
├── .github/workflows/deploy.yml   # Build y publicación en GitHub Pages
├── src/
│   ├── api/countries.js           # Único punto de acceso a la API (fetch, key, caché)
│   ├── router/index.js            # Rutas (hash mode, CountryView con lazy load)
│   ├── views/
│   │   ├── HomeView.vue           # Lista, búsqueda y estados
│   │   └── CountryView.vue        # Detalle de un país
│   ├── App.vue                    # Layout, cabecera y atribución
│   └── main.js
├── .env.local                     # Key local (NO se versiona)
├── .env.example
└── vite.config.js                 # `base` = nombre exacto del repo
```

## Reglas del proyecto

### Código

1. **Todas las peticiones usan `fetch()`** y viven en `src/api/countries.js`. Las vistas no llaman a la API directamente.
2. **La primera llamada de cada vista se ejecuta dentro de `onMounted()`.**
3. **Estado reactivo con `ref()`** (recomendación oficial de Vue para el caso general); `computed()` para datos derivados, como la lista filtrada.
4. **Siempre `try...catch...finally`** al consumir la API:
   - `fetch()` no lanza error con respuestas HTTP 4xx/5xx, así que se revisa `res.ok` y se lanza un `Error` manualmente.
   - `finally` apaga el indicador de carga.
   - El usuario ve un mensaje claro si algo falla.
5. **`v-for` siempre con `:key` único y estable** (en la lista: `codes.alpha_3`).
6. **Estados de la vista con `v-if` / `v-else-if` / `v-else`**, en este orden: carga → error → sin resultados → contenido.
7. **Los campos pueden faltar**: usar encadenamiento opcional (`?.`) y valores por defecto (`??`) con datos de la API. Sin espacios dentro de los operadores (`?.`, `??`).
8. **Filtrar en cliente, no en cada tecla:** el buscador usa `computed` sobre la lista ya descargada.
9. **Router en hash mode** (`createWebHashHistory`) porque GitHub Pages no soporta rutas del lado del cliente.
10. **`CountryView` se carga de forma diferida** (`() => import(...)`); `HomeView` es estática.

### Seguridad

- La API key **no se sube al repositorio**: va en `.env.local` y, en producción, en un *secret* de GitHub.
- Aun así, **la key termina visible en el JavaScript publicado** (toda variable `VITE_*` se incrusta al compilar). Por eso:
  - Registrar en la key los orígenes permitidos (`localhost`, `TU-USUARIO.github.io`).
  - Entender que quien extraiga la key puede consumir la cuota; si pasa, **revocar y crear otra**.
  - No compartir capturas donde se vea la key completa (ejemplos de `curl`, panel de claves).

## Uso de la API REST Countries

- **Base URL:** `https://api.restcountries.com/countries/v5`
- **Autenticación:** cabecera `Authorization: Bearer <KEY>` (la v1–v4 está deprecada y ya no se usa).
- **Respuesta:** los datos vienen en `data.objects` y la paginación en `data.meta` (`more`, `total`, etc.).

### Límites y términos (plan gratuito)

| Concepto | Regla |
|---|---|
| Cuota | 1,000 peticiones al mes (blanda, con avisos por correo; al excederla, bloqueo hasta el siguiente ciclo) |
| Página máxima | `limit=100` (hay ~249 países → 3 peticiones para la lista completa) |
| Ritmo | Más de 20 peticiones por 10 s devuelve `429` |
| Uso | Prototipos, evaluación y proyectos no comerciales |
| Caché | Permitido hasta **3 días**; este proyecto usa **24 h** |
| Datos | **No** guardar un volcado completo del dataset ni redistribuirlo (no subir JSON de países al repo) |
| Atribución | Obligatoria: mencionar "REST Countries" con enlace a restcountries.com (está en el pie de página) |

### Decisiones de diseño derivadas

- `response_fields` pide solo los campos necesarios en cada vista (respuestas más ligeras).
- La lista se descarga paginada en bucle mientras `meta.more` sea `true` y se guarda en `localStorage` con marca de tiempo.
- **Si cambias los campos de `LIST_FIELDS`, sube la versión de `CACHE_KEY`** (p. ej. `countries-list-v3`), o los visitantes seguirán viendo datos viejos hasta que caduque el caché.
- Se omiten 4 entidades que la API devuelve con `codes.alpha_3` vacío (Abkhazia, Northern Cyprus, Somaliland, South Ossetia): sin código no se puede construir su ruta de detalle y además sus banderas llegan vacías.

## Flujo de trabajo con Git

La rama principal es **`master`**. No se trabaja directamente sobre ella.

```bash
git switch master && git pull          # partir siempre de master actualizada
git switch -c feature/nombre-corto     # una rama por mejora

# ...cambios y commits pequeños...
git add .
git commit -m "feat: descripción breve"
git push origin feature/nombre-corto
```

Después: abrir **Pull Request** hacia `master`, revisar *Files changed* y hacer **Merge**. Para limpiar:

```bash
git switch master && git pull
git branch -d feature/nombre-corto
git push origin --delete feature/nombre-corto
```

**Antes de cada commit:** `git status` y comprobar que `.env.local` no aparece.

### Convención de commits

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de un error |
| `refactor:` | Cambio interno sin alterar el comportamiento |
| `style:` | Estilos / formato, sin cambio de lógica |
| `docs:` | Documentación |
| `chore:` | Configuración, dependencias, workflow |

## Despliegue en GitHub Pages

El sitio se publica automáticamente con GitHub Actions cada vez que hay un push a `master` (incluido el merge de un PR). Subir una rama de trabajo **no** publica nada.

**Configuración única en GitHub:**

1. *Settings → Pages → Build and deployment → Source:* **GitHub Actions**.
2. *Settings → Secrets and variables → Actions → New repository secret:* `RESTCOUNTRIES_KEY` con el valor de la key.
3. En `vite.config.js`, `base: '/NOMBRE-DEL-REPO/'` (con `/` al inicio y al final, idéntico al nombre del repo).
4. En el panel de REST Countries, la key debe permitir los orígenes `localhost` y `codexincorp.github.io`.

El workflow pasa el secret al build así:

```yaml
- run: npm run build
  env:
    VITE_RESTCOUNTRIES_KEY: ${{ secrets.RESTCOUNTRIES_KEY }}
```

Si rotas la key, actualiza el secret y relanza el workflow (*Actions → Run workflow*), porque la key se incrusta al compilar. Tras un despliegue, usa `Ctrl+Shift+R` para saltarte archivos en caché.

## Solución de problemas

| Síntoma | Causa probable |
|---|---|
| Pantalla en blanco en producción | `base` mal escrito en `vite.config.js` |
| "Falta VITE_RESTCOUNTRIES_KEY" | No existe `.env.local`, no se reinició `npm run dev`, o el nombre del secret no coincide con `deploy.yml` |
| Error `401` | Key faltante, mal copiada, revocada o expirada |
| Error de CORS en la consola | Falta el hostname (`localhost` o `usuario.github.io`) en los orígenes permitidos de la key |
| Error `403` | Cuota mensual agotada (cuenta bloqueada hasta el siguiente ciclo) |
| Error `429` | Demasiadas peticiones en poco tiempo |
| `Missing required param "code"` | Un país llegó con `codes.alpha_3` vacío; filtrarlo antes de dibujar las tarjetas |
| La lista no refleja un cambio de campos | El caché de 24 h sigue vigente: subir la versión de `CACHE_KEY` o borrar la entrada en Local Storage |
| `data is not defined` (u otro `ReferenceError`) | Nombre de variable mal escrito: revisar el archivo y línea que indica la consola |
| Error `Se esperaba ':'` (ts 1005) en `?.` o `??` | Espacio dentro del operador (`? .`, `? ?`) |
| `Failed to fetch dynamically imported module` | Se desplegó una versión nueva con la página abierta: recargar |

## Mejoras futuras

### Apariencia y UI

- [ ] Diseño más moderno: sistema de diseño con variables CSS (colores, espaciado, tipografía) en lugar de estilos sueltos.
- [ ] Modo oscuro (`prefers-color-scheme` + interruptor manual guardado en `localStorage`).
- [ ] Esqueletos de carga (*skeleton loaders*) en lugar del texto "Cargando...".
- [ ] Transiciones entre vistas y animación al filtrar (`<Transition>` / `<TransitionGroup>`).
- [ ] Diseño responsive afinado para móvil y revisión de accesibilidad (foco, contraste, `aria-live` para el contador de resultados).
- [ ] Tarjetas para las entidades sin código ISO (sin enlace y con marcador de bandera).

### Funcionalidades

- [ ] `<select>` con `v-model` para filtrar por región.
- [ ] Ordenar por nombre o población (añadir `population` a los campos de la lista).
- [ ] Idiomas en el detalle (`languages[].name`).
- [ ] Países vecinos en el detalle (`borders`) como enlaces; requiere `watch` sobre `props.code`, porque el componente se reutiliza al cambiar de ruta.
- [ ] Favoritos guardados en `localStorage`.
- [ ] Página 404 para rutas inexistentes y para códigos de país no válidos.
- [ ] Paginación o *scroll* infinito / virtualizado para la lista.
- [ ] Textos traducibles (`vue-i18n`) y nombres de países en el idioma del usuario.

### Optimización del uso de la API

- [ ] **Compartir los datos entre vistas:** extraer un *composable* (`useCountries.js`) o un store (Pinia) para que el detalle reutilice la lista ya descargada y evite una petición extra.
- [ ] **Caché por país** para las consultas de detalle (con expiración ≤ 3 días).
- [ ] *Stale-while-revalidate*: mostrar primero el caché y actualizar en segundo plano.
- [ ] Reducir aún más los campos pedidos con `response_fields` / `response_fields_omit`.
- [ ] Búsqueda en el servidor (`?q=`) con *debounce*, solo si algún día la lista deja de cargarse completa (hoy el filtrado local es más barato).
- [ ] Mostrar un aviso amistoso cuando la API responda `403` o `429`.
- [ ] Usar el CDN gratuito de banderas (`flags.restcountries.com`) con tamaños adecuados para miniaturas.

### Calidad e ingeniería

- [ ] ESLint + Prettier con *hooks* de pre-commit.
- [ ] Pruebas unitarias con Vitest y Vue Test Utils (filtro, estados de carga y error).
- [ ] Migrar a TypeScript.
- [ ] Workflow de CI que ejecute lint y pruebas en cada Pull Request.
- [ ] Proteger `master` (exigir PR y CI en verde).
- [ ] Mover las llamadas a la API a un pequeño servidor intermedio (p. ej. una función *serverless*) si se quiere mantener la key fuera del navegador.

## Créditos

- Datos: [REST Countries](https://restcountries.com).
- Construido con [Vue](https://vuejs.org), [Vue Router](https://router.vuejs.org) y [Vite](https://vite.dev).