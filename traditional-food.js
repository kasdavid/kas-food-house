/* =========================================================
   KAS FOOD HOUSE
   TRADITIONAL FOOD PAGE
   File: js/traditional-food.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ==========================================
    // DOM ELEMENTS
    // ==========================================

    const productsContainer = document.getElementById("traditionalProducts");
    const searchInput = document.getElementById("traditionalSearch");
    const clearSearchBtn = document.getElementById("clearTraditionalSearch");
    const sortSelect = document.getElementById("traditionalSort");
    const resultCount = document.getElementById("traditionalResultCount");
    const emptyState = document.getElementById("traditionalEmpty");
    const resetBtn = document.getElementById("resetTraditionalFilters");

    const filterButtons = document.querySelectorAll(".traditional-filter");

    // Stop if this page does not contain the traditional food section.
    if (!productsContainer) return;

    // ==========================================
    // STATE
    // ==========================================

    let allProducts = [];
    let activeSubcategory = "all";
    let searchTerm = "";
    let sortType = "featured";

    // ==========================================
    // GET PRODUCT DATA
    // ==========================================

    function loadProducts() {
        if (
            window.KAS_FOOD_API &&
            typeof window.KAS_FOOD_API.getByCategory === "function"
        ) {
            allProducts = window.KAS_FOOD_API.getByCategory("traditional");
        } else if (Array.isArray(window.KAS_FOOD_PRODUCTS)) {
            allProducts = window.KAS_FOOD_PRODUCTS.filter(product =>
                String(product.category || "").toLowerCase() === "traditional"
            );
        } else {
            allProducts = [];
        }

        renderProducts();
    }

    // ==========================================
    // PRODUCT HELPERS
    // ==========================================

    function getProductName(product) {
        return product.name || product.title || "Traditional Meal";
    }

    function getProductDescription(product) {
        return product.description || product.details || "Enjoy a delicious traditional Zambian meal.";
    }

    function getProductImage(product) {
        return product.image || product.imageUrl || "https://images.unsplash.com/photo-1547592180-85f173990554?w=700";
    }

    function getProductPrice(product) {
        return Number(product.price) || 0;
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
    // SUBCATEGORY FILTERING
    // ==========================================

    function matchesSubcategory(product) {
        if (activeSubcategory === "all") return true;

        const name = getProductName(product).toLowerCase();
        const description = getProductDescription(product).toLowerCase();
        const searchText = `${name} ${description}`;

        switch (activeSubcategory) {
            case "nshima":
                return searchText.includes("nshima");

            case "meat":
                return (
                    searchText.includes("chicken") ||
                    searchText.includes("beef") ||
                    searchText.includes("meat")
                );

            case "vegetables":
                return (
                    searchText.includes("vegetable") ||
                    searchText.includes("ifisashi") ||
                    searchText.includes("beans") ||
                    searchText.includes("impwa")
                );

            case "fish":
                return (
                    searchText.includes("fish") ||
                    searchText.includes("kapenta")
                );

            default:
                return true;
        }
    }

    // ==========================================
    // SEARCH
    // ==========================================

    function matchesSearch(product) {
        if (!searchTerm) return true;

        const searchableText = [
            getProductName(product),
            getProductDescription(product),
            product.category || ""
        ].join(" ").toLowerCase();

        return searchableText.includes(searchTerm);
    }

    // ==========================================
    // SORTING
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
                    const featuredA = a.featured ? 1 : 0;
                    const featuredB = b.featured ? 1 : 0;
                    return featuredB - featuredA;
                });
        }
    }

    // ==========================================
    // PRODUCT CARD
    // ==========================================

    function createProductCard(product) {
        const card = document.createElement("article");

        card.className = "traditional-food-card";

        const productName = getProductName(product);
        const productDescription = getProductDescription(product);
        const productImage = getProductImage(product);
        const productPrice = getProductPrice(product);

        const imageWrapper = document.createElement("div");
        imageWrapper.className = "traditional-food-image";

        const image = document.createElement("img");
        image.src = productImage;
        image.alt = productName;
        image.loading = "lazy";

        image.addEventListener("error", () => {
            image.src = "https://images.unsplash.com/photo-1547592180-85f173990554?w=700";
        }, { once: true });

        imageWrapper.appendChild(image);

        if (product.badge || product.featured) {
            const badge = document.createElement("span");
            badge.className = "traditional-food-badge";
            badge.textContent = product.badge || "Popular";
            imageWrapper.appendChild(badge);
        }

        const content = document.createElement("div");
        content.className = "traditional-food-content";

        const title = document.createElement("h3");
        title.textContent = productName;

        const description = document.createElement("p");
        description.textContent = productDescription;

        const bottom = document.createElement("div");
        bottom.className = "traditional-food-bottom";

        const price = document.createElement("span");
        price.className = "traditional-food-price";
        price.textContent = formatPrice(productPrice);

        const addButton = document.createElement("button");
        addButton.className = "traditional-add-cart";
        addButton.type = "button";
        addButton.textContent = "Add to Cart";
        addButton.dataset.productId = product.id;
        addButton.setAttribute("aria-label", `Add ${productName} to cart`);

        addButton.addEventListener("click", () => {
            addToCart(product.id, addButton);
        });

        bottom.append(price, addButton);
        content.append(title, description, bottom);

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
            showMessage("Cart system is not available. Please refresh the page.", "error");
            return;
        }

        window.KAS_FOOD_CART.add(productId, 1);

        const originalText = button.textContent;

        button.textContent = "Added ✓";
        button.classList.add("added");

        showMessage("Traditional meal added to your cart!", "success");

        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove("added");
        }, 1500);
    }

    // ==========================================
    // MESSAGE
    // ==========================================

    function showMessage(message, type = "success") {
        let notification = document.getElementById("traditionalNotification");

        if (!notification) {
            notification = document.createElement("div");
            notification.id = "traditionalNotification";
            notification.className = "traditional-notification";

            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.className = `traditional-notification ${type} show`;

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
            return matchesSubcategory(product) && matchesSearch(product);
        });

        const sortedProducts = sortProducts(filteredProducts);

        productsContainer.innerHTML = "";

        if (resultCount) {
            resultCount.textContent =
                `${sortedProducts.length} ${sortedProducts.length === 1 ? "meal" : "meals"} found`;
        }

        if (sortedProducts.length === 0) {
            if (emptyState) emptyState.hidden = false;
            productsContainer.hidden = true;
            return;
        }

        if (emptyState) emptyState.hidden = true;

        productsContainer.hidden = false;

        const fragment = document.createDocumentFragment();

        sortedProducts.forEach(product => {
            fragment.appendChild(createProductCard(product));
        });

        productsContainer.appendChild(fragment);
    }

    // ==========================================
    // CATEGORY FILTER BUTTONS
    // ==========================================

    filterButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            filterButtons.forEach(item => {
                item.classList.remove("active");
                item.setAttribute("aria-pressed", "false");
            });

            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");

            // Prefer explicit subcategory attributes.
            // Fallback supports the existing button order.
            const fallbackCategories = [
                "all",
                "nshima",
                "meat",
                "vegetables",
                "fish"
            ];

            activeSubcategory =
                button.dataset.subcategory || fallbackCategories[index] || "all";

            renderProducts();
        });
    });

    // ==========================================
    // SEARCH INPUT
    // ==========================================

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            searchTerm = searchInput.value.trim().toLowerCase();
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
        activeSubcategory = "all";
        searchTerm = "";
        sortType = "featured";

        if (searchInput) searchInput.value = "";
        if (sortSelect) sortSelect.value = "featured";

        filterButtons.forEach((button, index) => {
            const isFirst = index === 0;

            button.classList.toggle("active", isFirst);
            button.setAttribute("aria-pressed", String(isFirst));
        });

        renderProducts();
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", resetFilters);
    }

    // ==========================================
    // FOOTER CATEGORY LINKS
    // ==========================================

    document.querySelectorAll("[data-category-link]").forEach(link => {
        link.addEventListener("click", () => {
            const category = link.dataset.categoryLink;

            if (!category) return;

            activeSubcategory = category;

            filterButtons.forEach(button => {
                const buttonCategory =
                    button.dataset.subcategory ||
                    (button.classList.contains("active") ? "all" : "");

                button.classList.toggle(
                    "active",
                    buttonCategory === category
                );
            });

            renderProducts();
        });
    });

    // ==========================================
    // INITIALIZE
    // ==========================================

    loadProducts();

    console.log("KAS FOOD HOUSE: Traditional Food page initialized.");
});