let pokemonData = [];
let currentPage = 0;
const itemsPerPage = 20;

async function fetchDataJson(page = 0) {
  const container = document.getElementById("terms");
  container.innerHTML = '<div class="loading">Lade Pokémon...</div>';

  const offset = page * itemsPerPage;
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${itemsPerPage}`;

  try {
    const response = await fetch(url);
    const baseData = await response.json();

    const detailRequests = baseData.results.map((pokemon) =>
      fetch(pokemon.url).then((res) => res.json())
    );

    const details = await Promise.all(detailRequests);

    const pageData = details.map((pokemon) => ({
      id: pokemon.id,
      fullName: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
      imageUrl:
        pokemon.sprites.other["official-artwork"].front_default ||
        pokemon.sprites.front_default,
      types: pokemon.types,
      primaryType: pokemon.types[0].type.name,
    }));

    renderTerms(pageData);
    renderPaginationControls(baseData.next != null); 
  } catch (error) {
    container.innerHTML = `<div class="loading">Fehler beim Laden: ${error.message}</div>`;
  }
}

function getTypes(pokemon) {
  return pokemon.types
    .map((t) => {
      const typeName = t.type.name;
      const typeClass = `type-${typeName}`;
      return `<span class="pokemon-type ${typeClass}">${typeName}</span>`;
    })
    .join(" ");
}

function getTypeSymbol(typeName) {
  const symbols = {
    grass: "🌱",
    fire: "🔥",
    water: "💧",
    electric: "⚡",
    ice: "❄️",
    fighting: "🥊",
    poison: "☠️",
    ground: "⛰️",
    flying: "🕊️",
    psychic: "🔮",
    bug: "🐛",
    rock: "🪨",
    ghost: "👻",
    dark: "🌑",
    steel: "🛡️",
    fairy: "🧚",
    dragon: "🐉",
    normal: "⭐",
  };
  return symbols[typeName] || "❓";
}

function renderTerms(pageData) {
  const container = document.getElementById("terms");
  container.innerHTML = "";

  if (pageData.length === 0) {
    container.innerHTML = '<div class="loading">Keine Pokémon gefunden</div>';
    return;
  }

  pageData.forEach((character) => {
    const card = document.createElement("div");
    card.className = `character-card type-${character.primaryType}`;

    const typeSymbols = character.types
      .map((type) => {
        const typeName = type.type.name;
        return `
        <div class="type-symbol type-${typeName}">
          ${getTypeSymbol(typeName)}
        </div>
      `;
      })
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
    container.appendChild(card);
  });
}

function renderPaginationControls(hasNextPage) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  const controls = document.createElement("div");
  controls.className = "pagination-controls";

  const backBtn = document.createElement("button");
  backBtn.textContent = "⬅️ Zurück";
  backBtn.disabled = currentPage === 0;
  backBtn.onclick = () => {
    if (currentPage > 0) {
      currentPage--;
      fetchDataJson(currentPage);
    }
  };

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Weiter ➡️";
  nextBtn.disabled = !hasNextPage;
  nextBtn.onclick = () => {
    currentPage++;
    fetchDataJson(currentPage);
  };

  controls.appendChild(backBtn);
  controls.appendChild(nextBtn);
  paginationContainer.appendChild(controls);
}

fetchDataJson();
