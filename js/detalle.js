const API_BASE_URL = "https://pokeapi.co/api/v2/pokemon/";
const container = document.querySelector("#pokemon-detail");
const typeNames = {
    bug: "Bicho",
    dark: "Siniestro",
    dragon: "Dragón",
    electric: "Eléctrico",
    fairy: "Hada",
    fighting: "Lucha",
    fire: "Fuego",
    flying: "Volador",
    ghost: "Fantasma",
    grass: "Planta",
    ground: "Tierra",
    ice: "Hielo",
    normal: "Normal",
    poison: "Veneno",
    psychic: "Psíquico",
    rock: "Roca",
    steel: "Acero",
    water: "Agua"
};
const statNames = {
    hp: "PS",
    attack: "Ataque",
    defense: "Defensa",
    "special-attack": "Ataque especial",
    "special-defense": "Defensa especial",
    speed: "Velocidad"
};

function formatName(name) {
    return name
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function createStat(stat) {
    const item = document.createElement("li");
    item.className = "stat-item";

    const label = document.createElement("span");
    label.textContent = statNames[stat.stat.name] || formatName(stat.stat.name);

    const value = document.createElement("strong");
    value.textContent = stat.base_stat;

    const meter = document.createElement("span");
    meter.className = "stat-meter";
    meter.setAttribute("aria-hidden", "true");
    const fill = document.createElement("span");
    fill.style.width = `${Math.min(stat.base_stat, 100)}%`;
    meter.append(fill);

    item.append(label, value, meter);
    return item;
}

function renderPokemon(pokemon) {
    const article = document.createElement("article");
    article.className = "pokemon-detail";

    const visual = document.createElement("div");
    visual.className = "detail-visual";

    const image = document.createElement("img");
    image.className = "detail-image";
    const imageUrl = pokemon.sprites.other?.["official-artwork"]?.front_default || pokemon.sprites.front_default;
    image.alt = formatName(pokemon.name);
    if (imageUrl) {
        image.src = imageUrl;
    } else {
        image.classList.add("image-unavailable");
    }
    image.addEventListener("error", () => image.classList.add("image-unavailable"), { once: true });

    const number = document.createElement("span");
    number.className = "pokemon-number";
    number.textContent = `N.º ${String(pokemon.id).padStart(4, "0")}`;
    visual.append(image, number);

    const content = document.createElement("div");
    content.className = "detail-content";

    const heading = document.createElement("h1");
    heading.textContent = formatName(pokemon.name);

    const types = document.createElement("ul");
    types.className = "type-list";
    pokemon.types.forEach(({ type }) => {
        const typeItem = document.createElement("li");
        typeItem.className = `type-chip type-${type.name}`;
        typeItem.textContent = typeNames[type.name] || formatName(type.name);
        types.append(typeItem);
    });

    const measurements = document.createElement("p");
    measurements.className = "measurements";
    measurements.textContent = `Altura: ${(pokemon.height / 10).toFixed(1)} m · Peso: ${(pokemon.weight / 10).toFixed(1)} kg`;

    const statsHeading = document.createElement("h2");
    statsHeading.className = "stats-heading";
    statsHeading.textContent = "Estadísticas base";

    const stats = document.createElement("ul");
    stats.className = "stats-list";
    stats.append(...pokemon.stats.map(createStat));

    content.append(heading, types, measurements, statsHeading, stats);
    article.append(visual, content);
    container.replaceChildren(article);
    document.title = `${formatName(pokemon.name)} | Pokédex`;
}

async function loadPokemon() {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id || !/^\d+$/.test(id) || Number(id) < 1) {
        showError("No se indicó un Pokémon válido.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${id}/`);
        if (!response.ok) {
            if (response.status === 404) {
                showError("No se encontró ese Pokémon.");
                return;
            }
            throw new Error(`PokéAPI respondió con el estado ${response.status}.`);
        }

        const pokemon = await response.json();
        renderPokemon(pokemon);
    } catch (error) {
        console.error("No se pudo cargar el detalle del Pokémon:", error);
        showError("No se pudo cargar este Pokémon. Comprueba tu conexión e inténtalo de nuevo.");
    }
}

function showError(message) {
    const error = document.createElement("p");
    error.className = "catalog-status error-message";
    error.textContent = message;
    container.replaceChildren(error);
}

loadPokemon();
