/* =====================================================
   KAS FOOD HOUSE
   MAIN APPLICATION JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ================================================
       1. MOBILE NAVIGATION
    ================================================ */

    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    if (menuToggle && navMenu) {

        menuToggle.addEventListener("click", () => {

            const isOpen = navMenu.classList.toggle("active");

            menuToggle.classList.toggle("active", isOpen);

            menuToggle.setAttribute("aria-expanded", isOpen);

            document.body.classList.toggle("menu-open", isOpen);

        });

        // Close menu after clicking a navigation link
        navMenu.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                navMenu.classList.remove("active");
                menuToggle.classList.remove("active");

                menuToggle.setAttribute("aria-expanded", "false");

                document.body.classList.remove("menu-open");

            });

        });

        // Close menu when clicking outside
        document.addEventListener("click", event => {

            const clickedInsideMenu = navMenu.contains(event.target);
            const clickedToggle = menuToggle.contains(event.target);

            if (!clickedInsideMenu && !clickedToggle) {

                navMenu.classList.remove("active");
                menuToggle.classList.remove("active");

                menuToggle.setAttribute("aria-expanded", "false");

                document.body.classList.remove("menu-open");

            }

        });

        // Close menu using Escape key
        document.addEventListener("keydown", event => {

            if (event.key === "Escape") {

                navMenu.classList.remove("active");
                menuToggle.classList.remove("active");

                menuToggle.setAttribute("aria-expanded", "false");

                document.body.classList.remove("menu-open");

            }

        });

    }


    /* ================================================
       2. LOADING SCREEN
    ================================================ */

    const loader = document.getElementById("loader");

    function hideLoader() {

        if (!loader) return;

        loader.classList.add("loaded");

        setTimeout(() => {

            loader.style.display = "none";

        }, 700);

    }

    if (document.readyState === "complete") {

        hideLoader();

    } else {

        window.addEventListener("load", hideLoader, { once: true });

        // Fallback in case some external image takes too long
        setTimeout(hideLoader, 5000);

    }


    /* ================================================
       3. SHOPPING CART COUNTER
    ================================================ */

    const cartCount = document.getElementById("cartCount");

    const CART_STORAGE_KEY = "kasFoodCart";

    function getCartItems() {

        try {

            const savedCart = localStorage.getItem(CART_STORAGE_KEY);

            if (!savedCart) return [];

            const cart = JSON.parse(savedCart);

            return Array.isArray(cart) ? cart : [];

        } catch (error) {

            console.error("Unable to read shopping cart:", error);

            return [];

        }

    }

    function updateCartCounter() {

        if (!cartCount) return;

        const cart = getCartItems();

        const totalItems = cart.reduce((total, item) => {

            const quantity = Number(item.quantity) || 1;

            return total + quantity;

        }, 0);

        cartCount.textContent = totalItems;

        cartCount.style.display = totalItems > 0 ? "flex" : "";

        cartCount.setAttribute("aria-label", `${totalItems} items in cart`);

    }

    // Make cart counter available to other JavaScript files
    window.updateFoodCartCounter = updateCartCounter;

    updateCartCounter();

    // Update counter when another script changes the cart
    window.addEventListener("storage", updateCartCounter);

    window.addEventListener("foodCartUpdated", updateCartCounter);


    /* ================================================
       4. BACK TO TOP BUTTON
    ================================================ */

    const backToTop = document.getElementById("backToTop");

    if (backToTop) {

        function toggleBackToTop() {

            if (window.scrollY > 400) {

                backToTop.classList.add("visible");

            } else {

                backToTop.classList.remove("visible");

            }

        }

        window.addEventListener("scroll", toggleBackToTop);

        toggleBackToTop();

        backToTop.addEventListener("click", event => {

            event.preventDefault();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }


    /* ================================================
       5. CURRENT YEAR
    ================================================ */

    const currentYear = document.getElementById("currentYear");

    if (currentYear) {

        currentYear.textContent = new Date().getFullYear();

    }


    /* ================================================
       6. NEWSLETTER FORM
    ================================================ */

    const newsletterForm = document.getElementById("newsletterForm");
    const newsletterEmail = document.getElementById("newsletterEmail");

    if (newsletterForm && newsletterEmail) {

        let newsletterMessage = newsletterForm.querySelector(".newsletter-message");

        if (!newsletterMessage) {

            newsletterMessage = document.createElement("p");

            newsletterMessage.className = "newsletter-message";

            newsletterMessage.setAttribute("role", "status");

            newsletterForm.appendChild(newsletterMessage);

        }

        newsletterForm.addEventListener("submit", event => {

            event.preventDefault();

            const email = newsletterEmail.value.trim();

            if (!email) {

                newsletterMessage.textContent = "Please enter your email address.";

                newsletterMessage.classList.add("error");

                return;

            }

            if (!newsletterEmail.checkValidity()) {

                newsletterMessage.textContent = "Please enter a valid email address.";

                newsletterMessage.classList.add("error");

                return;

            }

            /*
             * This is a front-end demonstration only.
             * Connect Firebase or a newsletter service
             * later to save subscribers permanently.
             */

            newsletterMessage.textContent =
                "Thank you! Newsletter registration is ready to be connected.";

            newsletterMessage.classList.remove("error");
            newsletterMessage.classList.add("success");

            newsletterForm.reset();

        });

    }


    /* ================================================
       7. ACTIVE NAVIGATION LINK
    ================================================ */

    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".nav-menu a").forEach(link => {

        const linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {

            link.classList.add("active");

        }

    });


    /* ================================================
       8. IMAGE LOADING FALLBACK
    ================================================ */

    document.querySelectorAll("img").forEach(img => {

        img.addEventListener("error", () => {

            img.classList.add("image-error");

        });

    });


    /* ================================================
       9. GLOBAL WEBSITE HELPERS
    ================================================ */

    window.KAS_FOOD_HOUSE = {

        updateCartCounter,

        getCartItems,

        currency: "ZMW",

        formatPrice(price) {

            return new Intl.NumberFormat("en-ZM", {

                style: "currency",

                currency: "ZMW",

                minimumFractionDigits: 2

            }).format(Number(price) || 0);

        }

    };


    /* ================================================
       10. WEBSITE READY
    ================================================ */

    console.log(
        "%c KAS FOOD HOUSE ",
        "background:#ff5a1f;color:white;font-size:18px;font-weight:bold;padding:10px;"
    );

    console.log("Website application initialized successfully.");

});