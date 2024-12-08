import Champion from "./Champion.js";

// Variables globales y elementos del DOM
const champions = [];
const showChampsButton = document.getElementById("showChamps");
const toggleInfoButton = document.getElementById("toggleInfo");
const championPoolContainer = document.querySelector("#championPool");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const tagCheckboxes = document.querySelectorAll(".tag-checkbox");
const modalElement = document.getElementById("championModal");
let isInfoVisible = false;
let champsAreVisible = false;
let debounceTimer = null;


// Configuración del modal
modalElement.addEventListener("hidden.bs.modal", function () {
  const modalContent = document.getElementById("championModalContent");
  modalContent.innerHTML = "";
});

// Función para obtener el pool de campeones
const getChampionPool = async () => {
  try {
    if (champions.length > 0) return;
    const response = await fetch(
      "https://ddragon.leagueoflegends.com/cdn/14.23.1/data/en_US/champion.json"
    );
    const result = await response.json();
    const championData = result.data;

    for (const champKey in championData) {
      if (championData.hasOwnProperty(champKey)) {
        const champInfo = championData[champKey];
        champions.push(new Champion(champInfo));
      }
    }
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};

// Función para mostrar el pool de campeones
const showChamps = () => {
  championPoolContainer.innerHTML = "";
  const row = document.createElement("div");
  row.className =
    "row row-cols-1 row-cols-sm-2 row-cols-md-6 row-cols-lg-6 g-6 mb-4";

  champions.forEach((champ) => {

    const col = document.createElement("div");
    col.className = "col mb-2";
    const card = document.createElement("div");
    card.className = "card h-100 text-center";
    card.innerHTML = `
      <img src="https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${champ.image.full}" class="card-img-top" alt="${champ.name}">
      <div class="card-body bg-dark text-light d-none">
        <h5 class="card-title">${champ.name}</h5>
        <p class="card-text">${champ.title}</p>
        <p class="card-text">${champ.lore}</p>
      </div>
    `;
    col.appendChild(card);
    row.appendChild(col);
  });

  championPoolContainer.appendChild(row);
  championPoolContainer.style.visibility = "visible";
  champsAreVisible = true;
  toggleInfoButton.disabled = false;
};

// Mostrar u ocultar información adicional
const toggleCardInfo = () => {
  const cardBodies = document.querySelectorAll(".card-body");
  isInfoVisible = !isInfoVisible;

  cardBodies.forEach((body) => {
    body.classList.toggle("d-none", !isInfoVisible);
  });
};

// Filtrar campeones por búsqueda
const filterChampions = (query) => {
  const results = champions.filter((champ) =>
    champ.name.toLowerCase().includes(query.toLowerCase())
  );
  showSearchResults(results);
};

// Mostrar resultados de búsqueda
const showSearchResults = (results) => {
  searchResults.innerHTML = "";
  if (results.length > 0) {
    results.forEach((champ) => {
      const resultItem = document.createElement("a");
      resultItem.className = "dropdown-item";
      resultItem.href = "#";
      resultItem.textContent = champ.name;
      resultItem.addEventListener("click", () => {
        showChampionModal(champ);
        searchResults.style.display = "none";
      });
      searchResults.appendChild(resultItem);
    });
    searchResults.style.display = "block";
  } else {
    searchResults.style.display = "none";
  }
};

// Mostrar modal con detalles del campeón
const showChampionModal = (champ) => {
  const modalContent = document.getElementById("championModalContent");
  modalContent.innerHTML = `
    <img src="https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${champ.image.full}" class="img-fluid mb-3" alt="${champ.name}">
    <h5>${champ.name}</h5>
    <p><strong>Título:</strong> ${champ.title}</p>
    <p><strong>Historia:</strong> ${champ.lore}</p>
    <h6 class="mt-3">Estadísticas Base:</h6>
    <ul>
      <li>Vida: ${champ.stats.hp}</li>
      <li>Mana: ${champ.stats.mp}</li>
      <li>Daño de ataque: ${champ.stats.attackdamage}</li>
      <li>Velocidad de ataque: ${champ.stats.attackspeed}</li>
      <li>Velocidad de movimiento: ${champ.stats.movespeed}</li>
    </ul>
  `;

  const myModal = new bootstrap.Modal(document.getElementById("championModal"));
  myModal.show();
};

const renderChampionCards = (championsToRender) => {
  championPoolContainer.innerHTML = ""; // Limpiar el contenedor actual
  const row = document.createElement("div");
  row.className =
    "row row-cols-1 row-cols-sm-2 row-cols-md-6 row-cols-lg-6 g-6 mb-4";

  championsToRender.forEach((champ) => {
    const col = document.createElement("div");
    col.className = "col mb-2";
    const card = document.createElement("div");
    card.className = "card h-100 text-center";
    card.innerHTML = `
      <img src="https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${champ.image.full}" class="card-img-top" alt="${champ.name}">
      <div class="card-body bg-dark text-light">
        <h5 class="card-title">${champ.name}</h5>
        <p class="card-text">${champ.title}</p>
        <p class="card-text">${champ.lore}</p>
      </div>
    `;
    col.appendChild(card);
    row.appendChild(col);
  });

  championPoolContainer.appendChild(row);
};

document.querySelectorAll(".tag-checkbox").forEach((checkbox) => {
  checkbox.addEventListener("change", updateChampionCards);
});

function updateChampionCards() {
  const selectedTags = Array.from(document.querySelectorAll(".tag-checkbox:checked"))
    .map((checkbox) => checkbox.value);

  const filteredChampions = champions.filter((champion) =>
    selectedTags.every((tag) => champion.tags.includes(tag))
  );

  renderChampionCards(filteredChampions);
}

// Event listeners
toggleInfoButton.addEventListener("click", toggleCardInfo);

showChampsButton.addEventListener("click", async () => {
  await getChampionPool();
  showChamps();
});

searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const query = searchInput.value;

  if (query) {
    debounceTimer = setTimeout(() => {
      filterChampions(query);
    }, 1000);
  } else {
    searchResults.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Añadir evento a los checkboxes
  document.querySelectorAll(".tag-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", updateChampionCards);
  });

  // Mostrar los campeones al cargar la página
  updateChampionCards();
});
