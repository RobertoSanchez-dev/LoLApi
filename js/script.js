import Champion from "./Champion.js";

const champions = [];
const showChampsButton = document.getElementById("showChamps");
const toggleInfoButton = document.getElementById("toggleInfo");
const championPoolContainer = document.querySelector("#championPool");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

const modalElement = document.getElementById("championModal");
modalElement.addEventListener("hidden.bs.modal", function () {
  const modalContent = document.getElementById("championModalContent");
  modalContent.innerHTML = "";
});

let isInfoVisible = false;
let champsAreVisible = false;
toggleInfoButton.disabled = true;
let debounceTimer = null;

const getChampionPool = async () => {
  try {
    if (champions.length > 0) return;
    const response = await fetch("https://ddragon.leagueoflegends.com/cdn/14.23.1/data/en_US/champion.json");
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

const showChamps = () => {
  championPoolContainer.innerHTML = "";
  const row = document.createElement("div");
  row.className = "row row-cols-1 row-cols-sm-2 row-cols-md-6 row-cols-lg-6 g-6 mb-4";

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

toggleInfoButton.addEventListener("click", () => {
  const cardBodies = document.querySelectorAll(".card-body");
  isInfoVisible = !isInfoVisible;

  cardBodies.forEach((body) => {
    body.classList.toggle("d-none", !isInfoVisible);
  });
});

showChampsButton.addEventListener("click", async () => {
  await getChampionPool();
  showChamps();
});

const filterChampions = (query) => {
  const results = champions.filter((champ) =>
    champ.name.toLowerCase().includes(query.toLowerCase())
  );
  showSearchResults(results);
};

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

const showChampionModal = (champ) => {
  const modalContent = document.getElementById("championModalContent");
  modalContent.innerHTML = `
    <img src="https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${champ.image.full}" class="img-fluid mb-3" alt="${champ.name}">
    <h5>${champ.name}</h5>
    <p><strong>Título:</strong> ${champ.title}</p>
    <p><strong>Historia:</strong> ${champ.lore}</p>
    <button id="showMoreInfo" class="btn btn-outline-dark">Mostrar estadísticas</button>
  `;

  const showMoreInfoButton = document.getElementById("showMoreInfo");

  showMoreInfoButton.addEventListener("click", () => {
    modalContent.innerHTML = `
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
      <button id="hideMoreInfo" class="btn btn-outline-dark mt-3">Ocultar estadísticas</button>
    `;

    const hideMoreInfoButton = document.getElementById("hideMoreInfo");
    hideMoreInfoButton.addEventListener("click", () => {
      showChampionModal(champ);
    });
  });

  const myModal = new bootstrap.Modal(document.getElementById("championModal"));
  myModal.show();
};

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

const updateChampionCards = () => {
  const selectedTags = Array.from(document.querySelectorAll(".tag-checkbox:checked")).map((checkbox) => checkbox.value);

  const filteredChampions = champions.filter((champ) =>
    selectedTags.length === 0 || champ.tag.some((tag) => selectedTags.includes(tag))
  );

  championPoolContainer.innerHTML = "";
  const row = document.createElement("div");
  row.className = "row row-cols-1 row-cols-sm-2 row-cols-md-6 row-cols-lg-6 g-6 mb-3";

  filteredChampions.forEach((champ) => {
    const col = document.createElement("div");
    col.className = "col";
    const card = document.createElement("div");
    card.className = "card h-100 text-center";
    card.innerHTML = `
      <img src="https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${champ.image.full}" class="card-img-top" alt="${champ.name}">
      <div class="card-body bg-dark text-light">
        <h5 class="card-title">${champ.name}</h5>
        <p class="card-text">${champ.title}</p>
        <p class="card-text">${champ.lore}</p>
        <button id="hideMoreInfo" class="btn btn-outline-light" >Ver más</button>
      </div>
    `;
    col.appendChild(card);
    row.appendChild(col);
  });

  championPoolContainer.appendChild(row);

  const viewMoreButtons = row.querySelectorAll(".btn-outline-light");
  viewMoreButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const championId = event.target.getAttribute("data-champion-id");
      const selectedChampion = champions.find((champ) => champ.id == championId);
      showChampionModal(selectedChampion);
    });
  });
};

const tagCheckboxes = document.querySelectorAll(".tag-checkbox");
tagCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", updateChampionCards);
});

updateChampionCards();
