/* =====================================================
   KAS FOOD HOUSE
   ADVANCED WEBSITE ANIMATIONS
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ================================================
       1. REDUCED MOTION SUPPORT
    ================================================ */

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
        document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale")
            .forEach(element => element.classList.add("active"));

        return;
    }


    /* ================================================
       2. SCROLL REVEAL ANIMATIONS
    ================================================ */

    const revealElements = document.querySelectorAll(
        ".section-heading, .category-card, .food-card, " +
        ".popular-card, .about-image, .about-content, " +
        ".promo-content, .promo-image, .newsletter-container"
    );

    revealElements.forEach(element => {
        element.classList.add("reveal");
    });

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver((entries, observer) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("active");

                    observer.unobserve(entry.target);

                }

            });

        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px"
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });

    } else {

        revealElements.forEach(element => {
            element.classList.add("active");
        });

    }


    /* ================================================
       3. STAGGERED FOOD CARD ANIMATIONS
    ================================================ */

    const cardGroups = document.querySelectorAll(
        ".categories-grid, .food-grid, .popular-grid"
    );

    cardGroups.forEach(group => {

        const cards = group.querySelectorAll(
            ".category-card, .food-card, .popular-card"
        );

        cards.forEach((card, index) => {

            card.style.transitionDelay = `${(index % 4) * 100}ms`;

        });

    });


    /* ================================================
       4. HERO SECTION PARALLAX
    ================================================ */

    const heroImage = document.querySelector(".hero-image img");

    if (heroImage && window.matchMedia("(hover: hover)").matches) {

        let ticking = false;

        window.addEventListener("scroll", () => {

            if (ticking) return;

            ticking = true;

            requestAnimationFrame(() => {

                const scrollPosition = window.scrollY;

                if (scrollPosition < window.innerHeight) {

                    heroImage.style.transform =
                        `translateY(${scrollPosition * 0.08}px)`;

                }

                ticking = false;

            });

        }, { passive: true });

    }


    /* ================================================
       5. FOOD CARD HOVER EFFECT
    ================================================ */

    const foodCards = document.querySelectorAll(
        ".food-card, .category-card, .popular-card"
    );

    if (window.matchMedia("(hover: hover)").matches) {

        foodCards.forEach(card => {

            card.addEventListener("mouseenter", () => {

                card.classList.add("card-hover");

            });

            card.addEventListener("mouseleave", () => {

                card.classList.remove("card-hover");

            });

        });

    }


    /* ================================================
       6. ANIMATED NUMBER COUNTERS
    ================================================ */

    const counters = document.querySelectorAll("[data-count]");

    function animateCounter(counter) {

        const target = Number(counter.dataset.count);

        if (!Number.isFinite(target)) return;

        const duration = 1800;

        const startTime = performance.now();

        function updateCounter(currentTime) {

            const progress = Math.min(
                (currentTime - startTime) / duration,
                1
            );

            const easedProgress = 1 - Math.pow(1 - progress, 3);

            const currentValue = Math.floor(
                target * easedProgress
            );

            counter.textContent = currentValue.toLocaleString();

            if (progress < 1) {

                requestAnimationFrame(updateCounter);

            } else {

                counter.textContent = target.toLocaleString();

            }

        }

        requestAnimationFrame(updateCounter);

    }

    if ("IntersectionObserver" in window) {

        const counterObserver = new IntersectionObserver((entries, observer) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    animateCounter(entry.target);

                    observer.unobserve(entry.target);

                }

            });

        }, {
            threshold: 0.5
        });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });

    }


    /* ================================================
       7. BUTTON RIPPLE EFFECT
    ================================================ */

    document.querySelectorAll(".btn-primary, .btn-secondary").forEach(button => {

        button.addEventListener("click", event => {

            const ripple = document.createElement("span");

            const rect = button.getBoundingClientRect();

            const size = Math.max(rect.width, rect.height);

            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;

            ripple.className = "button-ripple";

            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            button.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 650);

        });

    });


    /* ================================================
       8. NAVBAR SCROLL EFFECT
    ================================================ */

    const navbar = document.querySelector(".navbar");

    if (navbar) {

        function updateNavbar() {

            navbar.classList.toggle(
                "scrolled",
                window.scrollY > 50
            );

        }

        window.addEventListener("scroll", updateNavbar, {
            passive: true
        });

        updateNavbar();

    }


    /* ================================================
       9. ANIMATED BACKGROUND WORDS
    ================================================ */

    const backgroundWords = document.querySelectorAll(
        ".background-word, .floating-word"
    );

    backgroundWords.forEach((word, index) => {

        word.style.animationDelay = `${index * 1.5}s`;

    });


    /* ================================================
       10. IMAGE REVEAL EFFECT
    ================================================ */

    const images = document.querySelectorAll(
        ".food-card img, .category-card img, .popular-card img"
    );

    images.forEach(image => {

        image.addEventListener("load", () => {

            image.classList.add("image-loaded");

        });

        if (image.complete && image.naturalWidth > 0) {

            image.classList.add("image-loaded");

        }

    });


    /* ================================================
       11. BACKGROUND MOUSE MOVEMENT
    ================================================ */

    const hero = document.querySelector(".hero");

    if (hero && window.matchMedia("(hover: hover)").matches) {

        hero.addEventListener("mousemove", event => {

            const rect = hero.getBoundingClientRect();

            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            hero.style.setProperty("--mouse-x", `${x * 20}px`);
            hero.style.setProperty("--mouse-y", `${y * 20}px`);

        });

        hero.addEventListener("mouseleave", () => {

            hero.style.setProperty("--mouse-x", "0px");
            hero.style.setProperty("--mouse-y", "0px");

        });

    }


    /* ================================================
       12. PAGE CONTENT READY
    ================================================ */

    document.body.classList.add("animations-ready");

    console.log("KAS FOOD HOUSE animations initialized.");

});