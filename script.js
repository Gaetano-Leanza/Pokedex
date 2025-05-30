// Globale Variablen
let pokemonData = [];
let currentPage = 0;
let currentSearchPage = 0;
const itemsPerPage = 20;
let searchResultsData = [];
let hasNextSearchPage = false;
const resultsContainer = document.getElementById("search-results");
const searchInput = document.getElementById("pokemon-search");
let allPokemonBasic = [];

// Datenabfrage-Funktionen
async function fetchPokemonDetails(url) {
  const response = await fetch(url);
  return await response.json();
}

async function fetchPokemonList(offset, limit) {
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
  const response = await fetch(url);
  return await response.json();
}

async function fetchAllPokemonBasic() {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Fehler beim Laden aller Pokémon:", error);
    return [];
  }
}

// Rendering-Hilfsfunktionen
function createPokemonCard(character) {
  const card = document.createElement("div");
  card.className = `character-card type-${character.primaryType}`;

  const typeSymbols = character.types
    .map(type => `
      <div class="type-symbol type-${type.type.name}">
        ${getTypeSymbol(type.type.name)}
      </div>
    `)
    .join("");

  card.innerHTML = `
    <div class="card-header">
      <span class="pokemon-id">#${character.id}</span>
      ${character.fullName}
    </div>
    <div class="card-content">
      <div class="img-container">
        <img src="${character.imageUrl}" alt="${character.fullName}" />
      </div>
      <div class="pokemon-info">Typ: ${getTypes(character)}</div>
    </div>
    <div class="card-footer">
      <div class="type-symbols-container">
        ${typeSymbols}
      </div>
    </div>
  `;
  
  return card;
}

function renderPokemonList(container, pokemonList) {
  container.innerHTML = "";
  
  if (pokemonList.length === 0) {
    container.innerHTML = '<div class="loading">Keine Pokémon gefunden</div>';
    return;
  }

  pokemonList.forEach(character => {
    container.appendChild(createPokemonCard(character));
  });
}

// Typhilfsfunktionen
function getTypes(pokemon) {
  return pokemon.types
    .map(t => {
      const typeName = t.type.name;
      return `<span class="pokemon-type type-${typeName}">${typeName}</span>`;
    })
    .join(" ");
}

function getTypeSymbol(typeName) {
  const symbols = {
    grass: "🌱", fire: "🔥", water: "💧", electric: "⚡", ice: "❄️",
    fighting: "🥊", poison: "☠️", ground: "⛰️", flying: "🕊️",
    psychic: "🔮", bug: "🐛", rock: "🪨", ghost: "👻", dark: "🌑",
    steel: "🛡️", fairy: "🧚", dragon: "🐉", normal: "⭐"
  };
  return symbols[typeName] || "❓";
}

// Paginierungsfunktionen
function createPaginationButton(text, disabled, onClick) {
  const button = document.createElement("button");
  button.textContent = text;
  button.disabled = disabled;
  button.onclick = onClick;
  return button;
}

function renderPaginationControls(hasPrevious, hasNext, prevAction, nextAction) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  const controls = document.createElement("div");
  controls.className = "pagination-controls";

  const backBtn = createPaginationButton(
    "⬅️ Zurück", 
    !hasPrevious, 
    prevAction
  );

  const nextBtn = createPaginationButton(
    "Weiter ➡️", 
    !hasNext, 
    nextAction
  );

  controls.appendChild(backBtn);
  controls.appendChild(nextBtn);
  paginationContainer.appendChild(controls);
}

// Hauptfunktionen
async function fetchDataJson(page = 0) {
  const container = document.getElementById("terms");
  container.innerHTML = '<div class="loading">Lade Pokémon...</div>';

  try {
    const offset = page * itemsPerPage;
    const baseData = await fetchPokemonList(offset, itemsPerPage);
    
    const details = await Promise.all(
      baseData.results.map(pokemon => fetchPokemonDetails(pokemon.url))
    );

    const pageData = details.map(pokemon => ({
      id: pokemon.id,
      fullName: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
      imageUrl: pokemon.sprites.other["official-artwork"].front_default || 
               pokemon.sprites.front_default,
      types: pokemon.types,
      primaryType: pokemon.types[0].type.name
    }));

    renderPokemonList(container, pageData);
    renderPaginationControls(
      page > 0,
      baseData.next != null,
      () => {
        if (currentPage > 0) {
          currentPage--;
          fetchDataJson(currentPage);
        }
      },
      () => {
        currentPage++;
        fetchDataJson(currentPage);
      }
    );
  } catch (error) {
    container.innerHTML = `<div class="loading">Fehler beim Laden: ${error.message}</div>`;
  }
}

function renderSearchResultsPage(page) {
  const start = page * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = searchResultsData.slice(start, end);
  hasNextSearchPage = end < searchResultsData.length;

  renderPokemonList(resultsContainer, pageData);
  
  renderPaginationControls(
    page > 0,
    hasNextSearchPage,
    () => {
      if (currentSearchPage > 0) {
        currentSearchPage--;
        renderSearchResultsPage(currentSearchPage);
      }
    },
    () => {
      if (hasNextSearchPage) {
        currentSearchPage++;
        renderSearchResultsPage(currentSearchPage);
      }
    }
  );
}

// Suchfunktionen
async function handleSearch(query) {
  const termsContainer = document.getElementById("terms");
  const pagination = document.getElementById("pagination");

  if (!query) {
    resultsContainer.innerHTML = "";
    resultsContainer.style.display = "none";
    termsContainer.style.display = "grid";
    pagination.style.display = "block";
    currentSearchPage = 0;
    searchResultsData = [];
    return;
  }

  const filtered = allPokemonBasic.filter(p => p.name.startsWith(query));

  if (filtered.length === 0) {
    resultsContainer.innerHTML = '<div class="loading">Keine Pokémon gefunden</div>';
    resultsContainer.style.display = "grid";
    termsContainer.style.display = "none";
    pagination.style.display = "none";
    return;
  }

  try {
    const details = await Promise.all(
      filtered.map(p => fetchPokemonDetails(p.url))
    );

    searchResultsData = details.map(pokemon => ({
      id: pokemon.id,
      fullName: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
      imageUrl: pokemon.sprites.other["official-artwork"].front_default || 
               pokemon.sprites.front_default,
      types: pokemon.types,
      primaryType: pokemon.types[0].type.name
    }));

    currentSearchPage = 0;
    renderSearchResultsPage(currentSearchPage);
    resultsContainer.style.display = "grid";
    termsContainer.style.display = "none";
    pagination.style.display = "block";
  } catch (error) {
    resultsContainer.innerHTML = `<div class="loading">Fehler: ${error.message}</div>`;
    resultsContainer.style.display = "grid";
  }
}

// Initialisierung
async function init() {
  fetchDataJson();
  allPokemonBasic = await fetchAllPokemonBasic();
  searchInput.addEventListener("input", () => 
    handleSearch(searchInput.value.trim().toLowerCase()));
}

// Start der Anwendung
init();