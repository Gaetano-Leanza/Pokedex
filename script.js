let pokemonData = [];

async function fetchDataJson() {
  const container = document.getElementById("terms");
  container.innerHTML = '<div class="loading">Lade Pokémon...</div>';

  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=50");
    const baseData = await response.json();

    const detailRequests = baseData.results.map((pokemon) =>
      fetch(pokemon.url).then((res) => res.json())
    );

    const details = await Promise.all(detailRequests);

    pokemonData = details.map((pokemon, index) => ({
      id: pokemon.id,
      fullName: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
      imageUrl:
        pokemon.sprites.other["official-artwork"].front_default ||
        pokemon.sprites.front_default,
      types: pokemon.types,
      primaryType: pokemon.types[0].type.name,
    }));

    renderTerms();
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
    grass: '🌱',
    fire: '🔥',
    water: '💧',
    electric: '⚡',
    ice: '❄️',
    fighting: '🥊',
    poison: '☠️',
    ground: '⛰️',
    flying: '🕊️',
    psychic: '🔮',
    bug: '🐛',
    rock: '🪨',
    ghost: '👻',
    dark: '🌑',
    steel: '🛡️',
    fairy: '🧚',
    dragon: '🐉',
    normal: '⭐'
  };
  return symbols[typeName] || '❓';
}



function renderTerms() {
  const container = document.getElementById("terms");
  container.innerHTML = "";
  
  if (pokemonData.length === 0) {
    container.innerHTML = '<div class="loading">Keine Pokémon gefunden</div>';
    return;
  }
  
  pokemonData.forEach(character => {
    const card = document.createElement('div');
    card.className = `character-card type-${character.primaryType}`;
    
    const typeSymbols = character.types.map(type => {
      const typeName = type.type.name;
      return `
        <div class="type-symbol type-${typeName}">
          ${getTypeSymbol(typeName)}
        </div>
      `;
    }).join('');
    
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

fetchDataJson();
