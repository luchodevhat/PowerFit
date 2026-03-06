const productGrid = document.getElementById("productGrid");
const noResults = document.getElementById("noResults");
const filterBtns = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("searchInput");

let allProducts = [];
let currentFilter = "all";
let currentSearch = "";

// Cargar productos desde la API
async function loadProducts() {
    try {
        const response = await fetch("http://localhost:3000/api/products");
        const products = await response.json();

        allProducts = products;
        renderProducts();
    } catch (error) {
        console.error("Error loading products", error);
        productGrid.innerHTML = `<p style="color:#fff; text-align:center; grid-column: 1/-1;">Error al cargar los productos. Verifica que el servidor esté corriendo.</p>`;
    }
}

// Renderizar productos aplicando filtro y búsqueda
function renderProducts() {
    productGrid.innerHTML = "";
    let visibleCount = 0;

    allProducts.forEach(product => {
        // Los campos del schema vienen en MAYÚSCULAS
        const name = product.NAME || product.name || "";
        const description = product.DESCRIPTION || product.description || "";
        const price = product.PRICE || product.price || 0;
        const imageUrl = product.IMAGE_URL || product.image_url || "";
        const category = product.CATEGORY || product.category || "";

        const matchFilter = currentFilter === "all" || category.toLowerCase() === currentFilter;
        const matchSearch = name.toLowerCase().includes(currentSearch);

        if (!matchFilter || !matchSearch) return;

        visibleCount++;

        const card = document.createElement("article");
        card.classList.add("product-card");
        card.setAttribute("data-category", category);
        card.setAttribute("data-name", name.toLowerCase());

        card.innerHTML = `
            <div class="product-img-wrapper">
                <img src="${imageUrl}" alt="${name}">
            </div>

            <div class="product-info">
                <span class="product-category-label">
                    ${category}
                </span>

                <h3>${name}</h3>

                <p class="product-desc">
                    ${description}
                </p>

                <div class="product-footer">
                    <span class="product-price">
                        $ ${price}
                    </span>
                </div>
            </div>
        `;

        // Animación de entrada
        card.animate([
            { opacity: 0, transform: "translateY(10px)" },
            { opacity: 1, transform: "translateY(0)" }
        ], { duration: 300, easing: "ease-out" });

        productGrid.appendChild(card);
    });

    // Mostrar/ocultar mensaje de no resultados
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? "block" : "none";
    }
}

// Evento Filtros
filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.getAttribute("data-filter");
        renderProducts();
    });
});

// Evento Búsqueda
searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.toLowerCase().trim();
    renderProducts();
});

// Iniciar carga de productos
loadProducts();