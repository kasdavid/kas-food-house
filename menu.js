/* =========================================================
   KAS FOOD HOUSE
   MAIN MENU JAVASCRIPT
   File: js/menu.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ==========================================
    // DOM ELEMENTS
    // ==========================================

    const productsContainer = document.getElementById("menuProducts");
    const searchInput = document.getElementById("menuSearch");
    const clearSearchBtn = document.getElementById("clearMenuSearch");
    const sortSelect = document.getElementById("menuSort");
    const resultCount = document.getElementById("menuResultCount");
    const noResults = document.getElementById("menuNoResults");
    const resetBtn = document.getElementById("resetMenuFilters");

    const categoryButtons = document.querySelectorAll(
        ".menu-category-btn, [data-category]"
    );

    if (!productsContainer) return;

    // ==========================================
    // STATE
    // ==========================================

    let allProducts = [];
    let activeCategory = "all";
    let searchTerm = "";
    let sortType = "featured";

    // ==========================================
    // LOAD PRODUCTS
    // ==========================================

    function loadProducts() {
        if (
            window.KAS_FOOD_API &&
            typeof window.KAS_FOOD_API.getAll === "function"
        ) {
            allProducts = window.KAS_FOOD_API.getAll();
        } else if (Array.isArray(window.KAS_FOOD_PRODUCTS)) {
            allProducts = window.KAS_FOOD_PRODUCTS;
        } else {
            allProducts = [];
        }

        renderProducts();
    }

    // ==========================================
    // PRODUCT HELPERS
    // ==========================================

    function getProductName(product) {
        return product.name || product.title || "Delicious Meal";
    }

    function getProductDescription(product) {
        return product.description ||
            product.details ||
            "Freshly prepared with quality ingredients.";
    }

    function getProductImage(product) {
        return product.image ||
            product.imageUrl ||
            "https://images.unsplash.com/photo-1547592180-85f173990554?w=700";
    }

    function getProductPrice(product) {
        return Number(product.price) || 0;
    }

    function getProductCategory(product) {
        return String(product.category || "").toLowerCase();
    }

    function formatPrice(price) {
        if (
            window.KAS_FOOD_API &&
            typeof window.KAS_FOOD_API.formatPrice === "function"
        ) {
            return window.KAS_FOOD_API.formatPrice(price);
        }

        return `K ${Number(price).toFixed(2)}`;
    }

    // ==========================================
    // SEARCH PRODUCTS
    // ==========================================

    function matchesSearch(product) {
        if (!searchTerm) return true;

        const searchableText = [
            getProductName(product),
            getProductDescription(product),
            getProductCategory(product)
        ].join(" ").toLowerCase();

        return searchableText.includes(searchTerm);
    }

    // ==========================================
    // CATEGORY FILTER
    // ==========================================

    function matchesCategory(product) {
        if (activeCategory === "all") return true;

        return getProductCategory(product) === activeCategory;
    }

    // ==========================================
    // SORT PRODUCTS
    // ==========================================

    function sortProducts(products) {
        const sorted = [...products];

        switch (sortType) {

            case "price-low":
                return sorted.sort(
                    (a, b) => getProductPrice(a) - getProductPrice(b)
                );

            case "price-high":
                return sorted.sort(
                    (a, b) => getProductPrice(b) - getProductPrice(a)
                );

            case "name":
                return sorted.sort((a, b) =>
                    getProductName(a).localeCompare(getProductName(b))
                );

            case "featured":
            default:
                return sorted.sort((a, b) => {
                    return Number(Boolean(b.featured)) -
                        Number(Boolean(a.featured));
                });
        }
    }

    // ==========================================
    // CATEGORY DISPLAY NAMES
    // ==========================================

    function categoryLabel(category) {
        const labels = {
            traditional: "Traditional Food",
            burgers: "Burgers",
            pizza: "Pizza",
            chicken: "Chicken",
            sides: "Sides",
            drinks: "Drinks"
        };

        return labels[category] || "Fresh Food";
    }

    // ==========================================
    // CREATE PRODUCT CARD
    // ==========================================

    function createProductCard(product) {

        const card = document.createElement("article");
        card.className = "menu-product-card";

        const name = getProductName(product);
        const description = getProductDescription(product);
        const imageUrl = getProductImage(product);
        const price = getProductPrice(product);
        const category = getProductCategory(product);

        // Image wrapper
        const imageWrapper = document.createElement("div");
        imageWrapper.className = "menu-product-image";

        const image = document.createElement("img");
        image.src = imageUrl;
        image.alt = name;
        image.loading = "lazy";

        image.addEventListener("error", () => {
            image.src =
                "https://images.unsplash.com/photo-1547592180-85f173990554?w=700";
        }, { once: true });

        imageWrapper.appendChild(image);

        // Badge
        if (product.badge || product.featured) {
            const badge = document.createElement("span");
            badge.className = "menu-product-badge";
            badge.textContent = product.badge || "Popular";
            imageWrapper.appendChild(badge);
        }

        // Content
        const content = document.createElement("div");
        content.className = "menu-product-content";

        const categoryText = document.createElement("div");
        categoryText.className = "menu-product-category";
        categoryText.textContent = categoryLabel(category);

        const title = document.createElement("h3");
        title.textContent = name;

        const details = document.createElement("p");
        details.textContent = description;

        // Bottom section
        const bottom = document.createElement("div");
        bottom.className = "menu-product-bottom";

        const priceElement = document.createElement("span");
        priceElement.className = "menu-product-price";
        priceElement.textContent = formatPrice(price);

        const addButton = document.createElement("button");
        addButton.className = "menu-add-cart";
        addButton.type = "button";
        addButton.textContent = "Add to Cart";
        addButton.dataset.productId = product.id;

        addButton.setAttribute(
            "aria-label",
            `Add ${name} to cart`
        );

        addButton.addEventListener("click", () => {
            addToCart(product.id, addButton);
        });

        bottom.append(priceElement, addButton);

        content.append(
            categoryText,
            title,
            details,
            bottom
        );

        card.append(imageWrapper, content);

        return card;
    }

    // ==========================================
    // ADD TO CART
    // ==========================================

    function addToCart(productId, button) {

        if (
            !window.KAS_FOOD_CART ||
            typeof window.KAS_FOOD_CART.add !== "function"
        ) {
            showNotification(
                "Cart system is unavailable. Please refresh the page.",
                "error"
            );
            return;
        }

        window.KAS_FOOD_CART.add(productId, 1);

        const originalText = button.textContent;

        button.textContent = "Added ✓";
        button.classList.add("added");

        showNotification(
            "Meal added to your shopping cart!",
            "success"
        );

        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove("added");
        }, 1500);
    }

    // ==========================================
    // NOTIFICATION
    // ==========================================

    function showNotification(message, type = "success") {

        let notification = document.getElementById("menuNotification");

        if (!notification) {
            notification = document.createElement("div");
            notification.id = "menuNotification";
            notification.className = "menu-notification";

            document.body.appendChild(notification);
        }

        notification.textContent = message;

        notification.className =
            `menu-notification ${type} show`;

        clearTimeout(notification.hideTimer);

        notification.hideTimer = setTimeout(() => {
            notification.classList.remove("show");
        }, 3000);
    }

    // ==========================================
    // RENDER PRODUCTS
    // ==========================================

    function renderProducts() {

        const filteredProducts = allProducts.filter(product => {
            return matchesCategory(product) &&
                matchesSearch(product);
        });

        const sortedProducts = sortProducts(filteredProducts);

        productsContainer.innerHTML = "";

        // Result count
        if (resultCount) {
            resultCount.textContent =
                `${sortedProducts.length} ${sortedProducts.length === 1 ? "meal" : "meals"} found`;
        }

        // Empty state
        if (sortedProducts.length === 0) {

            productsContainer.hidden = true;

            if (noResults) {
                noResults.hidden = false;
            }

            return;
        }

        productsContainer.hidden = false;

        if (noResults) {
            noResults.hidden = true;
        }

        const fragment = document.createDocumentFragment();

        sortedProducts.forEach(product => {
            fragment.appendChild(createProductCard(product));
        });

        productsContainer.appendChild(fragment);
    }

    // ==========================================
    // CATEGORY BUTTONS
    // ==========================================

    categoryButtons.forEach(button => {

        button.addEventListener("click", () => {

            const category = button.dataset.category;

            if (!category) return;

            activeCategory = category.toLowerCase();

            categoryButtons.forEach(item => {
                item.classList.remove("active");
                item.setAttribute("aria-pressed", "false");
            });

            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");

            renderProducts();
        });
    });

    // ==========================================
    // SEARCH INPUT
    // ==========================================

    if (searchInput) {

        searchInput.addEventListener("input", () => {

            searchTerm = searchInput.value
                .trim()
                .toLowerCase();

            renderProducts();
        });
    }

    // ==========================================
    // CLEAR SEARCH
    // ==========================================

    if (clearSearchBtn) {

        clearSearchBtn.addEventListener("click", () => {

            if (searchInput) {
                searchInput.value = "";
                searchInput.focus();
            }

            searchTerm = "";

            renderProducts();
        });
    }

    // ==========================================
    // SORT SELECT
    // ==========================================

    if (sortSelect) {

        sortSelect.addEventListener("change", () => {

            sortType = sortSelect.value;

            renderProducts();
        });
    }

    // ==========================================
    // RESET FILTERS
    // ==========================================

    function resetFilters() {

        activeCategory = "all";
        searchTerm = "";
        sortType = "featured";

        if (searchInput) {
            searchInput.value = "";
        }

        if (sortSelect) {
            sortSelect.value = "featured";
        }

        categoryButtons.forEach(button => {

            const isAll = button.dataset.category === "all";

            button.classList.toggle("active", isAll);

            button.setAttribute(
                "aria-pressed",
                String(isAll)
            );
        });

        renderProducts();
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", resetFilters);
    }

    // ==========================================
    // INITIALIZE MENU
    // ==========================================

    loadProducts();

    console.log("KAS FOOD HOUSE: Menu page loaded successfully.");

});