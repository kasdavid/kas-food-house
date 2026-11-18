/* =====================================================
   KAS FOOD HOUSE - CHECKOUT SYSTEM
   File: js/checkout.js
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    // ==========================================
    // ELEMENTS
    // ==========================================

    const checkoutForm = document.getElementById("checkoutForm");

    const customerName = document.getElementById("customerName");
    const customerPhone = document.getElementById("customerPhone");
    const customerEmail = document.getElementById("customerEmail");

    const deliveryAddressSection = document.getElementById("deliveryAddressSection");
    const deliveryAddress = document.getElementById("deliveryAddress");
    const deliveryTown = document.getElementById("deliveryTown");
    const deliveryArea = document.getElementById("deliveryArea");

    const collectionMessage = document.getElementById("collectionMessage");

    const getLocationBtn = document.getElementById("getLocationBtn");
    const locationStatus = document.getElementById("locationStatus");

    const latitudeInput = document.getElementById("latitude");
    const longitudeInput = document.getElementById("longitude");

    const mobileMoneyInfo = document.getElementById("mobileMoneyInfo");

    const checkoutOrderItems = document.getElementById("checkoutOrderItems");
    const checkoutItemCount = document.getElementById("checkoutItemCount");

    const checkoutSubtotal = document.getElementById("checkoutSubtotal");
    const checkoutDeliveryFee = document.getElementById("checkoutDeliveryFee");
    const checkoutTotal = document.getElementById("checkoutTotal");

    const checkoutError = document.getElementById("checkoutError");
    const placeOrderBtn = document.getElementById("placeOrderBtn");

    // ==========================================
    // SETTINGS
    // ==========================================

    const CURRENCY = "K";

    // Delivery fee is not configured yet.
    // Update this when your delivery prices are confirmed.
    const DELIVERY_FEE = 0;

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================

    function formatPrice(amount) {
        return CURRENCY + Number(amount || 0).toFixed(2);
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => {
            const characters = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return characters[character];
        });
    }

    function showError(message) {
        if (!checkoutError) return;

        checkoutError.textContent = message;
        checkoutError.style.display = "block";

        checkoutError.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    function hideError() {
        if (!checkoutError) return;

        checkoutError.textContent = "";
        checkoutError.style.display = "none";
    }

    // ==========================================
    // CART FUNCTIONS
    // ==========================================

    function getCart() {
        if (!window.KAS_FOOD_CART) {
            return [];
        }

        return window.KAS_FOOD_CART.getItems();
    }

    function getProductDetails(item) {

        const productId =
            item.productId ||
            item.id ||
            (item.product && item.product.id);

        let product = item.product || null;

        if (!product && window.KAS_FOOD_API) {
            product = window.KAS_FOOD_API.getById(productId);
        }

        if (!product) {
            return null;
        }

        return {
            ...product,
            quantity: Number(item.quantity || 1)
        };
    }

    function getSubtotal() {

        if (window.KAS_FOOD_CART) {
            return Number(window.KAS_FOOD_CART.getSubtotal() || 0);
        }

        return 0;
    }

    function getTotalItems() {

        if (window.KAS_FOOD_CART) {
            return Number(window.KAS_FOOD_CART.getTotalItems() || 0);
        }

        return 0;
    }

    // ==========================================
    // RENDER ORDER SUMMARY
    // ==========================================

    function renderCheckoutSummary() {

        if (!checkoutOrderItems) return;

        const cart = getCart();

        const validItems = cart
            .map(getProductDetails)
            .filter(Boolean);

        if (validItems.length === 0) {

            checkoutOrderItems.innerHTML = `
                <div class="checkout-empty">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Your shopping bag is empty.</p>
                    <a href="menu.html">Explore our menu</a>
                </div>
            `;

            if (checkoutItemCount) {
                checkoutItemCount.textContent = "0";
            }

            if (checkoutSubtotal) {
                checkoutSubtotal.textContent = formatPrice(0);
            }

            if (checkoutDeliveryFee) {
                checkoutDeliveryFee.textContent = "To be confirmed";
            }

            if (checkoutTotal) {
                checkoutTotal.textContent = formatPrice(0);
            }

            if (placeOrderBtn) {
                placeOrderBtn.disabled = true;
                placeOrderBtn.textContent = "Your Cart Is Empty";
            }

            return;
        }

        checkoutOrderItems.innerHTML = validItems.map(item => {

            const image = item.image || "images/food-placeholder.jpg";

            const itemPrice = Number(item.price || 0);
            const quantity = Number(item.quantity || 1);

            return `
                <div class="checkout-product">

                    <div class="checkout-product-image">
                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(item.name)}"
                            onerror="this.src='images/food-placeholder.jpg'"
                        >
                    </div>

                    <div class="checkout-product-details">

                        <h4>${escapeHTML(item.name)}</h4>

                        <span>Quantity: ${quantity}</span>

                    </div>

                    <div class="checkout-product-price">
                        ${formatPrice(itemPrice * quantity)}
                    </div>

                </div>
            `;

        }).join("");

        const subtotal = getSubtotal();

        const deliveryMethod = getSelectedDeliveryMethod();

        const deliveryFee = deliveryMethod === "delivery"
            ? DELIVERY_FEE
            : 0;

        const total = subtotal + deliveryFee;

        if (checkoutItemCount) {
            checkoutItemCount.textContent = getTotalItems();
        }

        if (checkoutSubtotal) {
            checkoutSubtotal.textContent = formatPrice(subtotal);
        }

        if (checkoutDeliveryFee) {

            checkoutDeliveryFee.textContent =
                deliveryMethod === "delivery"
                    ? "To be confirmed"
                    : formatPrice(0);
        }

        if (checkoutTotal) {

            checkoutTotal.textContent =
                deliveryMethod === "delivery"
                    ? formatPrice(subtotal) + " + delivery"
                    : formatPrice(total);
        }

        if (placeOrderBtn) {
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = `
                <i class="fas fa-check-circle"></i>
                Prepare My Order
            `;
        }
    }

    // ==========================================
    // DELIVERY / COLLECTION
    // ==========================================

    function getSelectedDeliveryMethod() {

        const selected = document.querySelector(
            'input[name="deliveryMethod"]:checked'
        );

        return selected ? selected.value : "delivery";
    }

    function updateDeliveryMethod() {

        const method = getSelectedDeliveryMethod();

        const isDelivery = method === "delivery";

        if (deliveryAddressSection) {
            deliveryAddressSection.style.display =
                isDelivery ? "block" : "none";
        }

        if (collectionMessage) {
            collectionMessage.style.display =
                isDelivery ? "none" : "block";
        }

        if (deliveryAddress) {
            deliveryAddress.required = isDelivery;
        }

        if (deliveryTown) {
            deliveryTown.required = isDelivery;
        }

        if (!isDelivery) {

            if (latitudeInput) latitudeInput.value = "";
            if (longitudeInput) longitudeInput.value = "";

            if (locationStatus) {
                locationStatus.textContent =
                    "GPS location is not needed for collection.";
            }
        }

        renderCheckoutSummary();
    }

    document.querySelectorAll(
        'input[name="deliveryMethod"]'
    ).forEach(radio => {

        radio.addEventListener("change", updateDeliveryMethod);

    });

    // ==========================================
    // PAYMENT METHOD
    // ==========================================

    function updatePaymentMethod() {

        const selected = document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

        const method = selected ? selected.value : "cash";

        if (mobileMoneyInfo) {
            mobileMoneyInfo.style.display =
                method === "mobile_money" ? "block" : "none";
        }
    }

    document.querySelectorAll(
        'input[name="paymentMethod"]'
    ).forEach(radio => {

        radio.addEventListener("change", updatePaymentMethod);

    });

    // ==========================================
    // GPS LOCATION
    // ==========================================

    if (getLocationBtn) {

        getLocationBtn.addEventListener("click", () => {

            if (!navigator.geolocation) {

                if (locationStatus) {
                    locationStatus.textContent =
                        "Your browser does not support GPS location.";
                }

                return;
            }

            getLocationBtn.disabled = true;

            getLocationBtn.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                Getting Location...
            `;

            if (locationStatus) {
                locationStatus.textContent =
                    "Please allow location access in your browser.";
            }

            navigator.geolocation.getCurrentPosition(

                position => {

                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    if (latitudeInput) {
                        latitudeInput.value = latitude;
                    }

                    if (longitudeInput) {
                        longitudeInput.value = longitude;
                    }

                    if (locationStatus) {
                        locationStatus.textContent =
                            "GPS location captured successfully!";
                    }

                    getLocationBtn.innerHTML = `
                        <i class="fas fa-check-circle"></i>
                        Location Captured
                    `;

                    getLocationBtn.disabled = false;

                },

                error => {

                    let message = "Unable to get your location.";

                    if (error.code === error.PERMISSION_DENIED) {
                        message =
                            "Location permission denied. Please allow GPS access.";
                    }

                    if (error.code === error.POSITION_UNAVAILABLE) {
                        message =
                            "Your current location is unavailable.";
                    }

                    if (error.code === error.TIMEOUT) {
                        message =
                            "Location request timed out. Please try again.";
                    }

                    if (locationStatus) {
                        locationStatus.textContent = message;
                    }

                    getLocationBtn.disabled = false;

                    getLocationBtn.innerHTML = `
                        <i class="fas fa-location-crosshairs"></i>
                        Get My Location
                    `;

                },

                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }

            );

        });

    }

    // ==========================================
    // VALIDATE CUSTOMER DETAILS
    // ==========================================

    function validateCheckout() {

        const name = customerName?.value.trim() || "";
        const phone = customerPhone?.value.trim() || "";

        if (!name) {
            showError("Please enter your full name.");
            customerName?.focus();
            return false;
        }

        if (!/^[0-9]{9}$/.test(phone)) {
            showError(
                "Please enter a valid 9-digit Zambian phone number."
            );

            customerPhone?.focus();
            return false;
        }

        const deliveryMethod = getSelectedDeliveryMethod();

        if (deliveryMethod === "delivery") {

            if (!deliveryAddress?.value.trim()) {
                showError("Please enter your delivery address.");
                deliveryAddress?.focus();
                return false;
            }

            if (!deliveryTown?.value.trim()) {
                showError("Please enter your town or city.");
                deliveryTown?.focus();
                return false;
            }

        }

        const terms = document.getElementById("termsAgreement");

        if (terms && !terms.checked) {
            showError("Please accept the terms before continuing.");
            terms.focus();
            return false;
        }

        if (getTotalItems() === 0) {
            showError("Your shopping bag is empty. Add food before checkout.");
            return false;
        }

        return true;
    }

    // ==========================================
    // CREATE ORDER INFORMATION
    // ==========================================

    function createOrderData() {

        const cart = getCart();

        const items = cart
            .map(item => {

                const product = getProductDetails(item);

                if (!product) return null;

                return {
                    productId: product.id,
                    name: product.name,
                    price: Number(product.price || 0),
                    quantity: Number(product.quantity || 1),
                    image: product.image || ""
                };

            })
            .filter(Boolean);

        const deliveryMethod = getSelectedDeliveryMethod();

        const selectedPayment = document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

        const subtotal = getSubtotal();

        return {

            orderReference:
                "KFH-" + Date.now().toString().slice(-8),

            customer: {

                name: customerName.value.trim(),

                phone: "+260" + customerPhone.value.trim(),

                email: customerEmail?.value.trim() || ""

            },

            delivery: {

                method: deliveryMethod,

                address: deliveryMethod === "delivery"
                    ? deliveryAddress.value.trim()
                    : "",

                town: deliveryMethod === "delivery"
                    ? deliveryTown.value.trim()
                    : "",

                area: deliveryMethod === "delivery"
                    ? deliveryArea?.value.trim() || ""
                    : "",

                latitude: latitudeInput?.value || null,

                longitude: longitudeInput?.value || null

            },

            payment: {

                method: selectedPayment
                    ? selectedPayment.value
                    : "cash"

            },

            instructions:
                document.getElementById("orderInstructions")?.value.trim() || "",

            items: items,

            subtotal: subtotal,

            deliveryFee: deliveryMethod === "delivery"
                ? null
                : 0,

            total: subtotal,

            deliveryFeeStatus: deliveryMethod === "delivery"
                ? "Pending confirmation"
                : "Not applicable",

            status: "Prepared - Not Submitted",

            createdAt: new Date().toISOString()

        };

    }

    // ==========================================
    // PREPARE ORDER
    // ==========================================

    function prepareOrder(order) {

        /*
         * FRONTEND DEMO ONLY
         *
         * This prepares the order information.
         * It does not send the order to the restaurant.
         *
         * Firebase or a secure backend connection
         * is required for real order submission.
         */

        const successMessage = document.createElement("div");

        successMessage.className = "checkout-success";

        successMessage.innerHTML = `

            <div class="checkout-success-icon">
                <i class="fas fa-check"></i>
            </div>

            <h2>Order Details Ready!</h2>

            <p>
                Your checkout information has been validated.
            </p>

            <div class="checkout-reference">
                <span>Order Reference</span>
                <strong>${escapeHTML(order.orderReference)}</strong>
            </div>

            <p class="checkout-demo-notice">
                This is a demonstration only. Your order has not
                been sent to KAS FOOD HOUSE yet.
            </p>

            <a href="menu.html" class="btn-primary">
                Continue Shopping
            </a>

        `;

        checkoutForm.style.display = "none";

        checkoutForm.parentElement.appendChild(successMessage);

        successMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        console.log("Prepared KAS FOOD HOUSE order:", order);

    }

    // ==========================================
    // SUBMIT CHECKOUT
    // ==========================================

    if (checkoutForm) {

        checkoutForm.addEventListener("submit", event => {

            event.preventDefault();

            hideError();

            if (!validateCheckout()) {
                return;
            }

            const order = createOrderData();

            if (placeOrderBtn) {

                placeOrderBtn.disabled = true;

                placeOrderBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin"></i>
                    Preparing Order...
                `;

            }

            setTimeout(() => {

                prepareOrder(order);

            }, 700);

        });

    }

    // ==========================================
    // CART UPDATES
    // ==========================================

    window.addEventListener("foodCartUpdated", () => {

        renderCheckoutSummary();

    });

    window.addEventListener("storage", event => {

        if (event.key === "kasFoodCart") {
            renderCheckoutSummary();
        }

    });

    // ==========================================
    // INITIALISE CHECKOUT
    // ==========================================

    updateDeliveryMethod();

    updatePaymentMethod();

    renderCheckoutSummary();

});