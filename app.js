// Cache DOM elements for better performance
let vinInput, tpInput, orvInput;
let getInfoBtn, getTpInfoBtn, getOrvInfoBtn;
let searchSection, newSearch, errorEl;

// Serverless function endpoint - update this after deployment
// For Vercel: https://your-project.vercel.app/api/vehicle
// For Netlify: https://your-site.netlify.app/.netlify/functions/vehicle
// For Cloudflare Worker: https://your-worker.your-subdomain.workers.dev
// Leave empty string to use relative path (works with Vercel/Netlify if deployed together)
const PROXY_API_URL =
  "https://vincheck-5xp3lwugn-vaclavs-projects-47bb9be1.vercel.app/api/vehicle";

// Brand logo mapping - optimized lookup
const brandLogos = {
  "ALFA-ROMEO": "logos/alfa-romeo.svg",
  AUDI: "logos/audi.svg",
  BMW: "logos/bmw.svg",
  CHEVROLET: "logos/chevrolet.svg",
  CITROEN: "logos/citroen.svg",
  CUPRA: "logos/cupra.svg",
  DACIA: "logos/dacia.svg",
  FERRARI: "logos/ferrari.svg",
  FIAT: "logos/fiat.svg",
  FORD: "logos/ford.svg",
  HONDA: "logos/honda.svg",
  HYUNDAI: "logos/hyundai.svg",
  KIA: "logos/kia.svg",
  LANCIA: "logos/lancia.svg",
  "LAND-ROVER": "logos/land-rover.svg",
  MAZDA: "logos/mazda.svg",
  "MERCEDES-BENZ": "logos/mercedes-benz.svg",
  MITSUBISHI: "logos/mitsubishi.svg",
  OPEN: "logos/opel.svg",
  PEUGEOT: "logos/peugeot.svg",
  PORSCHE: "logos/porsche.svg",
  RENAULT: "logos/renault.svg",
  SAAB: "logos/saab.svg",
  SEAT: "logos/seat.svg",
  SKODA: "logos/skoda.svg",
  ŠKODA: "logos/skoda.svg",
  TOYOTA: "logos/toyota.svg",
  VOLKSWAGEN: "logos/volkswagen.svg",
  VOLVO: "logos/volvo.svg",
  VW: "logos/volkswagen.svg",
};

// Helper function to get data value by name
function getDataValue(data, name, defaultValue = "") {
  const item = data.find((item) => item.name === name);
  return item?.value || defaultValue;
}

// Optimized logo source getter
function getLogoSrc(brand) {
  return brandLogos[brand] || "logos/default_logo.svg";
}

// Sanitize and format string value for display
function formatValue(value) {
  if (typeof value !== "string") {
    value = String(value);
  }
  return value.replace(/\n/g, "<br>");
}

// Create vehicle info display
function createVehicleInfoDisplay(data, vinCode) {
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("row", "mt-5", "mb-5", "align-items-center");

  // Brand logo column
  const brand = getDataValue(data, "TovarniZnacka", "Neznámá značka");
  const brandLogoSrc = getLogoSrc(brand);
  const brandLogoCol = document.createElement("div");
  brandLogoCol.classList.add("col-md-3", "text-center");
  const brandLogo = document.createElement("img");
  brandLogo.src = brandLogoSrc;
  brandLogo.alt = `${brand} Logo`;
  brandLogo.loading = "lazy";
  brandLogo.decoding = "async";
  brandLogo.classList.add("img-fluid", "logo-img", "brand-logo");
  brandLogoCol.appendChild(brandLogo);
  infoDiv.appendChild(brandLogoCol);

  // Vehicle info column
  const vehicleInfoCol = document.createElement("div");
  vehicleInfoCol.classList.add("col-md-4");
  const vehicleInfo = document.createElement("div");
  vehicleInfo.classList.add("vehicle-info");
  const model = getDataValue(data, "Typ", "Neznámý model");
  const obchodniOznaceni = getDataValue(data, "ObchodniOznaceni", "");
  const firstRegistration = getDataValue(
    data,
    "DatumPrvniRegistrace",
    "Neznámé datum"
  );
  vehicleInfo.innerHTML = `
    <div><strong>Značka:</strong> ${brand}</div>
    <div><strong>Model:</strong> ${model}</div>
    <div><strong>Obchodní označení:</strong> ${obchodniOznaceni}</div>
    <div><strong>Datum první registrace:</strong> ${firstRegistration}</div>
    <div><strong>VIN:</strong> ${vinCode}</div>
  `;
  vehicleInfoCol.appendChild(vehicleInfo);
  infoDiv.appendChild(vehicleInfoCol);

  // Technical inspection column
  const techInspectionCol = document.createElement("div");
  techInspectionCol.classList.add("col-md-4");
  const techInspection = getDataValue(
    data,
    "PravidelnaTechnickaProhlidkaDo",
    "Neznámé datum"
  );
  const techInspectionDiv = document.createElement("div");

  // Parse and check tech inspection date
  const currentDate = new Date();
  let techInspectionDate = null;
  if (techInspection && techInspection !== "Neznámé datum") {
    const [day, month, year] = techInspection.split(".");
    if (day && month && year) {
      techInspectionDate = new Date(`${year}-${month}-${day}`);
    }
  }

  const isExpired =
    techInspectionDate && techInspectionDate.getTime() < currentDate.getTime();
  const color = isExpired ? "red" : "green";

  techInspectionDiv.innerHTML = `<strong>Pravidelná technická prohlídka do:</strong> <span style="color: ${color}">${techInspection}</span>`;
  techInspectionCol.appendChild(techInspectionDiv);

  // Insurance buttons
  const povButtonDiv = document.createElement("div");
  povButtonDiv.innerHTML = `
    <a href="https://online.pojisteni.cz/vozidla/srovnani?ap=AWYPy1" class="btn btn-outline-primary w-90 mt-1 mb-1" role="button">Sjednat povinné ručení 🔗</a>
    <a href="https://online.pojisteni.cz/vozidla/srovnani?ap=AWYPy1" class="btn btn-outline-primary w-90 mt-1 mb-1" role="button">Sjednat havarijní pojištění 🔗</a>
    <br>
    <a href="https://cz.cebia.com/?vin=${vinCode}" class="btn btn-outline-primary w-100 mt-1 mb-1" role="button">Zobrazit historii vozu 🔗</a>
  `;
  techInspectionCol.appendChild(povButtonDiv);
  infoDiv.appendChild(techInspectionCol);

  return infoDiv;
}

// Create detailed data table - optimized with DocumentFragment for better performance
function createDataTable(data) {
  const excludedFields = new Set([
    "TovarniZnacka",
    "Typ",
    "DatumPrvniRegistrace",
    "VIN",
    "PravidelnaTechnickaProhlidkaDo",
  ]);

  const table = document.createElement("table");
  table.className = "table mt-4";
  const tbody = document.createElement("tbody");

  for (const item of data) {
    if (
      !excludedFields.has(item.name) &&
      item.value !== "" &&
      item.value != null
    ) {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      const td = document.createElement("td");
      th.textContent = item.label;
      td.innerHTML = formatValue(item.value);
      tr.appendChild(th);
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
  }

  table.appendChild(tbody);
  return table;
}

// Main function to get vehicle info
function getVehicleInfo() {
  // Clear previous errors
  errorEl.innerHTML = "";

  // Get and sanitize input values
  const vin = vinInput.value.replace(/[^a-zA-Z0-9]/g, "");
  const tp = tpInput.value.replace(/[^a-zA-Z0-9]/g, "");
  const orv = orvInput.value.replace(/[^a-zA-Z0-9]/g, "");

  // Build proxy URL with query parameters
  let proxyUrl = `${PROXY_API_URL}?`;
  if (vin) {
    proxyUrl += `vin=${encodeURIComponent(vin)}`;
  } else if (tp) {
    proxyUrl += `tp=${encodeURIComponent(tp)}`;
  } else if (orv) {
    proxyUrl += `orv=${encodeURIComponent(orv)}`;
  } else {
    return;
  }

  // Disable buttons during fetch
  getInfoBtn.disabled = true;
  getTpInfoBtn.disabled = true;
  getOrvInfoBtn.disabled = true;

  fetch(proxyUrl, {
    cache: "no-cache",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const vinCode = getDataValue(data, "VIN", "Neznámý VIN");
      const vehicleInfoContainer = document.getElementById("vehicleInfo");

      // Clear previous results
      vehicleInfoContainer.innerHTML = "";

      // Create and append vehicle info display
      const infoDiv = createVehicleInfoDisplay(data, vinCode);
      vehicleInfoContainer.appendChild(infoDiv);

      // Create and append data table
      const table = createDataTable(data);
      vehicleInfoContainer.appendChild(table);

      // Show/hide sections
      searchSection.style.display = "none";
      newSearch.style.display = "flex";
    })
    .catch((error) => {
      console.error("Chyba při načítání dat:", error);
      errorEl.innerHTML =
        '<p class="text-danger">Chyba při načítání dat. Zadaný VIN/TP/ORV pravděpodobně neexistuje v Registru silničních vozidel.<br>Zkontrolujte kód a zkuste to znovu.</p>';
    })
    .finally(() => {
      // Re-enable buttons
      getInfoBtn.disabled = vinInput.value.trim().length !== 17;
      getTpInfoBtn.disabled =
        tpInput.value.trim().length < 6 || tpInput.value.trim().length > 10;
      getOrvInfoBtn.disabled =
        orvInput.value.trim().length < 5 || orvInput.value.trim().length > 9;
    });
}

// Hide vehicle info and reset form
function hideVehicleInfoContainer() {
  const vehicleInfo = document.getElementById("vehicleInfo");
  vehicleInfo.innerHTML = "";
  searchSection.style.display = "";
  newSearch.style.display = "none";
  vinInput.value = "";
  tpInput.value = "";
  orvInput.value = "";
  errorEl.innerHTML = "";
  getInfoBtn.disabled = true;
  getTpInfoBtn.disabled = true;
  getOrvInfoBtn.disabled = true;
}

// Input validation handlers
function setupInputHandlers() {
  vinInput.addEventListener("input", () => {
    getInfoBtn.disabled = vinInput.value.trim().length !== 17;
  });

  tpInput.addEventListener("input", () => {
    const length = tpInput.value.trim().length;
    getTpInfoBtn.disabled = length < 6 || length > 10;
  });

  orvInput.addEventListener("input", () => {
    const length = orvInput.value.trim().length;
    getOrvInfoBtn.disabled = length < 5 || length > 9;
  });

  // Enter key handlers
  vinInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !getInfoBtn.disabled) {
      event.preventDefault();
      getVehicleInfo();
    }
  });

  tpInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !getTpInfoBtn.disabled) {
      event.preventDefault();
      getVehicleInfo();
    }
  });

  orvInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !getOrvInfoBtn.disabled) {
      event.preventDefault();
      getVehicleInfo();
    }
  });
}

// Initialize DOM element references and handlers when DOM is ready
function initializeApp() {
  vinInput = document.getElementById("vinInput");
  tpInput = document.getElementById("tpInput");
  orvInput = document.getElementById("orvInput");
  getInfoBtn = document.getElementById("getInfoBtn");
  getTpInfoBtn = document.getElementById("getTpInfoBtn");
  getOrvInfoBtn = document.getElementById("getOrvInfoBtn");
  searchSection = document.getElementById("searchSection");
  newSearch = document.getElementById("newSearch");
  errorEl = document.getElementById("errorEl");
  setupInputHandlers();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}

// Expose functions to global scope for onclick handlers
window.getVehicleInfo = getVehicleInfo;
window.hideVehicleInfoContainer = hideVehicleInfoContainer;
