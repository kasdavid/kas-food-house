/* =====================================================
   KAS FOOD HOUSE
   ADVANCED SHOPPING CART SYSTEM
===================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* ================================================
       1. CART SETTINGS
    ================================================ */

    const CART_KEY = "kasFoodCart";

    let cart = loadCart();


    /* ================================================
       2. LOAD CART FROM LOCAL STORAGE
    ================================================ */

    function loadCart() {

        try {

            const savedCart = localStorage.getItem(CART_KEY);

            if (!savedCart) return [];

            const parsedCart = JSON.parse(savedCart);

            return Array.isArray(parsedCart) ? parsedCart : [];

        } catch (error) {

            console.error("Cart loading error:", error);

            return [];

        }

    }


    /* ================================================
       3. SAVE CART
    ================================================ */

    function saveCart() {

        try {

            localStorage.setItem(CART_KEY, JSON.stringify(cart));

            updateCartCounter();

            renderCart();

            window.dispatchEvent(
                new CustomEvent("foodCartUpdated")
            );

        } catch (error) {

            console.error("Unable to save cart:", error);

            showCartMessage(
                "Unable to save your cart. Please check your browser storage.",
                "error"
            );

        }

    }


    /* ================================================
       4. GET PRODUCT INFORMATION
    ================================================ */

    function getProduct(productId) {

        if (!window.KAS_FOOD_API) {

            console.error("Products database is not loaded.");

            return null;

        }

        return window.KAS_FOOD_API.getById(productId);

    }


    /* ================================================
       5. ADD PRODUCT TO CART
    ================================================ */

    function addToCart(productId, quantity = 1) {

        const product = getProduct(productId);

        if (!product) {

            showCartMessage("Product not found.", "error");

            return false;

        }

        if (!product.available) {

            showCartMessage("This food is currently unavailable.", "error");

            return false;

        }

        quantity = Number(quantity);

        if (!Number.isInteger(quantity) || quantity < 1) {

            quantity = 1;

        }

        const existingItem = cart.find(item =>
            item.id === product.id
        );

        if (existingItem) {

            existingItem.quantity += quantity;

        } else {

            cart.push({

                id: product.id,

                name: product.name,

                price: Number(product.price),

                image: product.image,

                quantity: quantity

            });

        }

        saveCart();

        showCartMessage(
            product.name + " added to your shopping bag!",
            "success"
        );

        return true;

    }


    /* ================================================
       6. REMOVE PRODUCT FROM CART
    ================================================ */

    function removeFromCart(productId) {

        const previousLength = cart.length;

        cart = cart.filter(item =>
            item.id !== productId
        );

        if (cart.length === previousLength) return false;

        saveCart();

        showCartMessage(
            "Product removed from your cart.",
            "success"
        );

        return true;

    }


    /* ================================================
       7. UPDATE PRODUCT QUANTITY
    ================================================ */

    function updateQuantity(productId, quantity) {

        quantity = Number(quantity);

        if (!Number.isInteger(quantity) || quantity < 1) {

            removeFromCart(productId);

            return;

        }

        const item = cart.find(item =>
            item.id === productId
        );

        if (!item) return;

        item.quantity = quantity;

        saveCart();

    }


    /* ================================================
       8. INCREASE QUANTITY
    ================================================ */

    function increaseQuantity(productId) {

        const item = cart.find(item =>
            item.id === productId
        );

        if (!item) return;

        item.quantity++;

        saveCart();

    }


    /* ================================================
       9. DECREASE QUANTITY
    ================================================ */

    function decreaseQuantity(productId) {

        const item = cart.find(item =>
            item.id === productId
        );

        if (!item) return;

        item.quantity--;

        if (item.quantity < 1) {

            removeFromCart(productId);

            return;

        }

        saveCart();

    }


    /* ================================================
       10. CLEAR CART
    ================================================ */

    function clearCart() {

        cart = [];

        saveCart();

        showCartMessage(
            "Your shopping cart has been cleared.",
            "success"
        );

    }


    /* ================================================
       11. GET CART TOTAL
    ================================================ */

    function getSubtotal() {

        return cart.reduce((total, item) => {

            return total + (
                Number(item.price) * Number(item.quantity)
            );

        }, 0);

    }


    /* ================================================
       12. GET TOTAL ITEMS
    ================================================ */

    function getTotalItems() {

        return cart.reduce((total, item) => {

            return total + Number(item.quantity);

        }, 0);

    }


    /* ================================================
       13. FORMAT KWACHA
    ================================================ */

    function formatPrice(price) {

        return "K" + Number(price).toFixed(2);

    }


    /* ================================================
       14. UPDATE NAVIGATION CART COUNTER
    ================================================ */

    function updateCartCounter() {

        const counter = document.getElementById("cartCount");

        if (!counter) return;

        counter.textContent = getTotalItems();

        counter.setAttribute(
            "aria-label",
            getTotalItems() + " items in cart"
        );

    }


    /* ================================================
       15. DISPLAY CART MESSAGE
    ================================================ */

    function showCartMessage(message, type = "success") {

        let notification = document.getElementById("cartNotification");

        if (!notification) {

            notification = document.createElement("div");

            notification.id = "cartNotification";

            notification.className = "cart-notification";

            notification.setAttribute("role", "status");

            document.body.appendChild(notification);

        }

        notification.textContent = message;

        notification.className =
            "cart-notification " + type + " show";

        clearTimeout(notification.hideTimer);

        notification.hideTimer = setTimeout(() => {

            notification.classList.remove("show");

        }, 3000);

    }


    /* ================================================
       16. RENDER SHOPPING CART
    ================================================ */

    function renderCart() {

        const cartContainer = document.getElementById("cartItems");

        if (!cartContainer) return;

        const emptyMessage = document.getElementById("cartEmpty");

        const subtotalElement = document.getElementById("cartSubtotal");

        const totalElement = document.getElementById("cartTotal");

        const itemCountElement = document.getElementById("cartItemCount");

        const cartContent = document.getElementById("cartContent");

        if (cart.length === 0) {

            cartContainer.innerHTML = "";

            if (emptyMessage) {

                emptyMessage.style.display = "block";

            }

            if (cartContent) {

                cartContent.style.display = "none";

            }

            if (subtotalElement) {

                subtotalElement.textContent = formatPrice(0);

            }

            if (totalElement) {

                totalElement.textContent = formatPrice(0);

            }

            if (itemCountElement) {

                itemCountElement.textContent = "0";

            }

            return;

        }

        if (emptyMessage) {

            emptyMessage.style.display = "none";

        }

        if (cartContent) {

            cartContent.style.display = "block";

        }

        cartContainer.innerHTML = cart.map(item => {

            const itemTotal = item.price * item.quantity;

            return `

                <div class="cart-item" data-id="${escapeHTML(item.id)}">

                    <div class="cart-item-image">

                        <img
                            src="${escapeHTML(item.image)}"
                            alt="${escapeHTML(item.name)}"
                        >

                    </div>

                    <div class="cart-item-details">

                        <h3>${escapeHTML(item.name)}</h3>

                        <p>${formatPrice(item.price)}</p>

                        <div class="cart-quantity">

                            <button
                                type="button"
                                data-cart-action="decrease"
                                data-id="${escapeHTML(item.id)}"
                                aria-label="Decrease quantity"
                            >−</button>

                            <span>${item.quantity}</span>

                            <button
                                type="button"
                                data-cart-action="increase"
                                data-id="${escapeHTML(item.id)}"
                                aria-label="Increase quantity"
                            >+</button>

                        </div>

                    </div>

                    <div class="cart-item-total">

                        <strong>${formatPrice(itemTotal)}</strong>

                        <button
                            type="button"
                            class="remove-cart-item"
                            data-cart-action="remove"
                            data-id="${escapeHTML(item.id)}"
                        >
                            Remove
                        </button>

                    </div>

                </div>

            `;

        }).join("");

        if (subtotalElement) {

            subtotalElement.textContent = formatPrice(getSubtotal());

        }

        if (totalElement) {

            totalElement.textContent = formatPrice(getSubtotal());

        }

        if (itemCountElement) {

            itemCountElement.textContent = getTotalItems();

        }

    }


    /* ================================================
       17. ESCAPE HTML
    ================================================ */

    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, character => {

            const entities = {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            };

            return entities[character];

        });

    }


    /* ================================================
       18. CART BUTTON ACTIONS
    ================================================ */

    document.addEventListener("click", event => {

        const button = event.target.closest("[data-cart-action]");

        if (!button) return;

        const productId = button.dataset.id;

        const action = button.dataset.cartAction;

        if (action === "increase") {

            increaseQuantity(productId);

        }

        if (action === "decrease") {

            decreaseQuantity(productId);

        }

        if (action === "remove") {

            removeFromCart(productId);

        }

    });


    /* ================================================
       19. ADD TO CART BUTTONS
    ================================================ */

    document.addEventListener("click", event => {

        const button = event.target.closest("[data-add-to-cart]");

        if (!button) return;

        event.preventDefault();

        const productId = button.dataset.productId;

        const quantity = button.dataset.quantity || 1;

        if (!productId) {

            showCartMessage(
                "Product ID is missing from this button.",
                "error"
            );

            return;

        }

        addToCart(productId, quantity);

    });


    /* ================================================
       20. EXTERNAL CART STORAGE CHANGES
    ================================================ */

    window.addEventListener("storage", event => {

        if (event.key === CART_KEY) {

            cart = loadCart();

            updateCartCounter();

            renderCart();

        }

    });


    /* ================================================
       21. PUBLIC CART API
    ================================================ */

    window.KAS_FOOD_CART = {

        add: addToCart,

        remove: removeFromCart,

        update: updateQuantity,

        increase: increaseQuantity,

        decrease: decreaseQuantity,

        clear: clearCart,

        getItems: () => [...cart],

        getSubtotal: getSubtotal,

        getTotalItems: getTotalItems,

        updateCounter: updateCartCounter,

        render: renderCart,

        formatPrice: formatPrice

    };


    /* ================================================
       22. INITIALIZE CART
    ================================================ */

    updateCartCounter();

    renderCart();

    console.log("KAS FOOD HOUSE shopping cart initialized.");

});