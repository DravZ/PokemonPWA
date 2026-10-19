const API_URL = "https://pokeapi.co/api/v2/pokemon-species?limit=100000&offset=0";
const PAGE_SIZE = 24;
const pokemonList = document.querySelector("#pokemon-list");
const catalogStatus = document.querySelector("#catalog-status");
const searchInput = document.querySelector("#pokemon-search");
const loadMoreButton = document.querySelector("#load-more");

let allPokemon = [];
let filteredPokemon = [];
let visibleCount = PAGE_SIZE;

function formatName(name) {
    return name
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function getPokemonId(url) {
    const match = url.match(/\/pokemon-species\/(\d+)\/?$/);
    return match ? Number(match[1]) : null;
}

function createPokemonCard(pokemon) {
    const card = document.createElement("article");
    card.className = "pokemon-card";

    const image = document.createElement("img");
    image.className = "pokemon-image";
    image.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
    image.alt = formatName(pokemon.name);
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => image.classList.add("image-unavailable"), { once: true });

    const number = document.createElement("span");
    number.className = "pokemon-number";
    number.textContent = `N.º ${String(pokemon.id).padStart(4, "0")}`;

    const heading = document.createElement("h2");
    heading.className = "pokemon-name";
    heading.textContent = formatName(pokemon.name);

    const link = document.createElement("a");
    link.className = "card-link";
    link.href = `./detalle.html?id=${pokemon.id}`;
    link.setAttribute("aria-label", `Ver detalles de ${formatName(pokemon.name)}`);
    link.append(image, number, heading);
    card.append(link);
    return card;
}

function renderPokemon() {
    pokemonList.replaceChildren();

    const visiblePokemon = filteredPokemon.slice(0, visibleCount);
    pokemonList.append(...visiblePokemon.map(createPokemonCard));

    if (filteredPokemon.length === 0) {
        catalogStatus.textContent = "No se encontraron Pokémon con ese nombre.";
    } else {
        catalogStatus.textContent = `Mostrando ${visiblePokemon.length} de ${filteredPokemon.length} Pokémon, ordenados de la A a la Z.`;
    }

    loadMoreButton.hidden = visibleCount >= filteredPokemon.length;
}

function filterPokemon() {
    const query = searchInput.value.trim().toLocaleLowerCase("es");
    filteredPokemon = allPokemon.filter((pokemon) => pokemon.name.toLocaleLowerCase("es").includes(query));
    visibleCount = PAGE_SIZE;
}

async function loadPokemon() {
    catalogStatus.textContent = "Cargando Pokémon...";
    loadMoreButton.hidden = true;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`PokéAPI respondió con el estado ${response.status}.`);
        }

        const data = await response.json();
        if (!Array.isArray(data.results)) {
            throw new Error("La respuesta de PokéAPI no contiene la lista de Pokémon esperada.");
        }

        allPokemon = data.results
            .map((pokemon) => ({ ...pokemon, id: getPokemonId(pokemon.url) }))
            .filter((pokemon) => pokemon.id !== null)
            .sort((first, second) => first.name.localeCompare(second.name, "es", { sensitivity: "base" }));
        filterPokemon();
        renderPokemon();
    } catch (error) {
        console.error("No se pudo cargar la Pokédex:", error);
        catalogStatus.textContent = "No se pudieron cargar los Pokémon. Comprueba tu conexión e inténtalo de nuevo.";

        const retryButton = document.createElement("button");
        retryButton.className = "load-more";
        retryButton.type = "button";
        retryButton.textContent = "Reintentar";
        retryButton.addEventListener("click", loadPokemon, { once: true });
        pokemonList.replaceChildren(retryButton);
    }
}

function initializeCatalog() {
    if (!pokemonList || !catalogStatus || !searchInput || !loadMoreButton) {
        console.error("No se pudo iniciar la Pokédex: faltan elementos requeridos en el HTML.");
        return;
    }

    searchInput.addEventListener("input", () => {
        if (allPokemon.length === 0) {
            return;
        }

        filterPokemon();
        renderPokemon();
    });

    loadMoreButton.addEventListener("click", () => {
        visibleCount += PAGE_SIZE;
        renderPokemon();
    });

    loadPokemon();
}

initializeCatalog();

if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./serviceworker.js")
            .catch((error) => console.error("No se pudo registrar el service worker:", error));
    });
}
