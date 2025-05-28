let pokemonData = [];

async function fetchDataJson() {
  const container = document.getElementById('terms');
  container.innerHTML = '<div class="loading">Lade Pokémon...</div>';
  
  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=50");
    const baseData = await response.json();
    
    const detailRequests = baseData.results.map(pokemon => 
      fetch(pokemon.url).then(res => res.json())
    );
    
    const details = await Promise.all(detailRequests);
    
    // Transformiere Daten in benötigtes Format mit ID
    pokemonData = details.map((pokemon, index) => ({
      id: index + 1,
      fullName: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
      imageUrl: pokemon.sprites.other['official-artwork'].front_default || 
                pokemon.sprites.front_default,
      types: pokemon.types
    }));
    
    renderTerms();
  } catch (error) {
    container.innerHTML = `<div class="loading">Fehler beim Laden: ${error.message}</div>`;
  }
}

function getTypes(pokemon) {
  return pokemon.types.map(t => t.type.name).join(', ');
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
    card.className = 'character-card';
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
      <div class="card-footer">Pokémon #${character.id}</div>
    `;
    container.appendChild(card);
  });
}

// Initialer Aufruf
fetchDataJson();