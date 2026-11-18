/* =====================================================
   KAS FOOD HOUSE
   FOOD PRODUCTS DATABASE
===================================================== */

"use strict";


/* =====================================================
   1. PRODUCT DATABASE
===================================================== */

const KAS_FOOD_PRODUCTS = [

    /* ================================================
       TRADITIONAL ZAMBIAN FOOD
    ================================================ */

    {
        id: "food001",
        name: "Nshima with Village Chicken",
        category: "traditional",
        price: 85,
        description: "Traditional Zambian nshima served with delicious village chicken and vegetables.",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
        badge: "Traditional Favourite",
        featured: true,
        popular: true,
        available: true
    },

    {
        id: "food002",
        name: "Nshima with Ifisashi",
        category: "traditional",
        price: 55,
        description: "Freshly prepared nshima served with traditional groundnut vegetable sauce.",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554",
        badge: "Local Favourite",
        featured: true,
        popular: true,
        available: true
    },

    {
        id: "food003",
        name: "Nshima with Beef Stew",
        category: "traditional",
        price: 75,
        description: "Soft nshima served with tender beef cooked in a rich traditional tomato sauce.",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947",
        badge: "Popular",
        featured: true,
        popular: true,
        available: true
    },

    {
        id: "food004",
        name: "Nshima with Kapenta",
        category: "traditional",
        price: 65,
        description: "Authentic Zambian kapenta served with nshima and fresh vegetables.",
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2",
        badge: "Traditional",
        featured: false,
        popular: true,
        available: true
    },

    {
        id: "food005",
        name: "Nshima with Roasted Fish",
        category: "traditional",
        price: 95,
        description: "Fresh roasted fish served with nshima and a selection of vegetables.",
        image: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9",
        badge: "Chef's Choice",
        featured: true,
        popular: false,
        available: true
    },

    {
        id: "food006",
        name: "Nshima with Beans",
        category: "traditional",
        price: 50,
        description: "Fresh nshima served with slowly cooked beans and vegetables.",
        image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4",
        badge: "Affordable",
        featured: false,
        popular: false,
        available: true
    },

    {
        id: "food007",
        name: "Chikanda",
        category: "traditional",
        price: 40,
        description: "Traditional Zambian chikanda prepared with authentic local ingredients.",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554",
        badge: "Local Special",
        featured: false,
        popular: false,
        available: true
    },

    {
        id: "food008",
        name: "Nshima with Impwa",
        category: "traditional",
        price: 55,
        description: "Traditional nshima served with freshly prepared impwa.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
        badge: "Traditional",
        featured: false,
        popular: false,
        available: true
    },


    /* ================================================
       BURGERS
    ================================================ */

    {
        id: "food009",
        name: "Classic Beef Burger",
        category: "burgers",
        price: 75,
        description: "Juicy beef patty with fresh lettuce, tomatoes, cheese and special sauce.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
        badge: "Best Seller",
        featured: true,
        popular: true,
        available: true
    },

    {
        id: "food010",
        name: "Double Cheese Burger",
        category: "burgers",
        price: 110,
        description: "Double beef patties with melted cheese and our signature burger sauce.",
        image: "https://images.unsplash.com/photo-1553979459-d2229ba7433a",
        badge: "Premium",
        featured: true,
        popular: true,
        available: true
    },

    {
        id: "food011",
        name: "Chicken Burger",
        category: "burgers",
        price: 80,
        description: "Crispy chicken fillet with lettuce, tomatoes and creamy mayonnaise.",
        image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086",
        badge: "Popular",
        featured: false,
        popular: true,
        available: true
    },


    /* ================================================
       PIZZA
    ================================================ */

    {
        id: "food012",
        name: "Chicken Pizza",
        category: "pizza",
        price: 130,
        description: "Delicious pizza topped with chicken, mozzarella cheese and fresh vegetables.",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
        badge: "Popular",
        featured: true,
        popular: true,
        available: true
    },

    {
        id: "food013",
        name: "Beef Pizza",
        category: "pizza",
        price: 145,
        description: "Tasty beef pizza with mozzarella cheese and our special tomato sauce.",
        image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47",
        badge: "Special",
        featured: true,
        popular: false,
        available: true
    },

    {
        id: "food014",
        name: "Vegetable Pizza",
        category: "pizza",
        price: 110,
        description: "Fresh vegetables, cheese and delicious homemade pizza sauce.",
        image: "https://images.unsplash.com/photo-1579751626657-72bc17010498",
        badge: "Vegetarian",
        featured: false,
        popular: false,
        available: true
    },


    /* ================================================
       CHICKEN
    ================================================ */

    {
        id: "food015",
        name: "Crispy Fried Chicken",
        category: "chicken",
        price: 65,
        description: "Golden crispy chicken prepared with our special seasoning.",
        image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec",
        badge: "Best Seller",
        featured: true,
        popular: true,
        available: true
    },

    {
        id: "food016",
        name: "Grilled Chicken",
        category: "chicken",
        price: 90,
        description: "Tender grilled chicken with delicious herbs and special seasoning.",
        image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435",
        badge: "Chef's Choice",
        featured: false,
        popular: true,
        available: true
    },

    {
        id: "food017",
        name: "Chicken Wings",
        category: "chicken",
        price: 70,
        description: "Crispy chicken wings coated in a delicious special sauce.",
        image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2",
        badge: "Popular",
        featured: false,
        popular: true,
        available: true
    },


    /* ================================================
       CHIPS & SIDES
    ================================================ */

    {
        id: "food018",
        name: "Classic Chips",
        category: "sides",
        price: 35,
        description: "Freshly prepared golden crispy potato chips.",
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
        badge: "Affordable",
        featured: false,
        popular: true,
        available: true
    },

    {
        id: "food019",
        name: "Chips and Chicken",
        category: "sides",
        price: 85,
        description: "Golden chips served with delicious crispy chicken.",
        image: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb",
        badge: "Popular",
        featured: true,
        popular: true,
        available: true
    },

    {
        id: "food020",
        name: "Chicken Sandwich",
        category: "sides",
        price: 60,
        description: "Fresh sandwich filled with chicken, lettuce and special mayonnaise.",
        image: "https://images.unsplash.com/photo-1521390188846-e2a3a97453a0",
        badge: "Fresh",
        featured: false,
        popular: false,
        available: true
    },


    /* ================================================
       DRINKS
    ================================================ */

    {
        id: "food021",
        name: "Fresh Fruit Juice",
        category: "drinks",
        price: 25,
        description: "Refreshing fruit juice prepared for a delicious experience.",
        image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba",
        badge: "Fresh",
        featured: false,
        popular: true,
        available: true
    },

    {
        id: "food022",
        name: "Milkshake",
        category: "drinks",
        price: 45,
        description: "Creamy milkshake available in delicious flavours.",
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699",
        badge: "Sweet Treat",
        featured: true,
        popular: false,
        available: true
    },

    {
        id: "food023",
        name: "Soft Drink",
        category: "drinks",
        price: 20,
        description: "Chilled refreshing soft drink.",
        image: "https://images.unsplash.com/photo-1544145945-f90425340c7e",
        badge: "Cold",
        featured: false,
        popular: false,
        available: true
    }

];


/* =====================================================
   2. PRODUCT CATEGORIES
===================================================== */

const KAS_FOOD_CATEGORIES = [

    {
        id: "all",
        name: "All Food",
        icon: "fa-utensils"
    },

    {
        id: "traditional",
        name: "Zambian Food",
        icon: "fa-bowl-food"
    },

    {
        id: "burgers",
        name: "Burgers",
        icon: "fa-burger"
    },

    {
        id: "pizza",
        name: "Pizza",
        icon: "fa-pizza-slice"
    },

    {
        id: "chicken",
        name: "Chicken",
        icon: "fa-drumstick-bite"
    },

    {
        id: "sides",
        name: "Chips & Sides",
        icon: "fa-french-fries"
    },

    {
        id: "drinks",
        name: "Drinks",
        icon: "fa-glass-water"
    }

];


/* =====================================================
   3. GET ALL PRODUCTS
===================================================== */

function getAllFoodProducts() {

    return KAS_FOOD_PRODUCTS;

}


/* =====================================================
   4. GET PRODUCT BY ID
===================================================== */

function getFoodProductById(productId) {

    return KAS_FOOD_PRODUCTS.find(product =>
        product.id === String(productId)
    ) || null;

}


/* =====================================================
   5. FILTER PRODUCTS BY CATEGORY
===================================================== */

function getFoodProductsByCategory(category) {

    if (!category || category === "all") {

        return KAS_FOOD_PRODUCTS;

    }

    return KAS_FOOD_PRODUCTS.filter(product =>
        product.category === category
    );

}


/* =====================================================
   6. GET FEATURED PRODUCTS
===================================================== */

function getFeaturedFoodProducts() {

    return KAS_FOOD_PRODUCTS.filter(product =>
        product.featured && product.available
    );

}


/* =====================================================
   7. GET POPULAR PRODUCTS
===================================================== */

function getPopularFoodProducts() {

    return KAS_FOOD_PRODUCTS.filter(product =>
        product.popular && product.available
    );

}


/* =====================================================
   8. SEARCH PRODUCTS
===================================================== */

function searchFoodProducts(searchTerm) {

    const search = String(searchTerm || "")
        .trim()
        .toLowerCase();

    if (!search) {

        return KAS_FOOD_PRODUCTS;

    }

    return KAS_FOOD_PRODUCTS.filter(product => {

        return (
            product.name.toLowerCase().includes(search) ||

            product.description.toLowerCase().includes(search) ||

            product.category.toLowerCase().includes(search)
        );

    });

}


/* =====================================================
   9. GET AVAILABLE PRODUCTS
===================================================== */

function getAvailableFoodProducts() {

    return KAS_FOOD_PRODUCTS.filter(product =>
        product.available
    );

}


/* =====================================================
   10. FORMAT ZAMBIAN KWACHA
===================================================== */

function formatFoodPrice(price) {

    return "K" + Number(price).toFixed(2);

}


/* =====================================================
   11. GLOBAL PRODUCT DATABASE
===================================================== */

window.KAS_FOOD_PRODUCTS = KAS_FOOD_PRODUCTS;

window.KAS_FOOD_CATEGORIES = KAS_FOOD_CATEGORIES;

window.KAS_FOOD_API = {

    getAll: getAllFoodProducts,

    getById: getFoodProductById,

    getByCategory: getFoodProductsByCategory,

    getFeatured: getFeaturedFoodProducts,

    getPopular: getPopularFoodProducts,

    search: searchFoodProducts,

    getAvailable: getAvailableFoodProducts,

    formatPrice: formatFoodPrice

};


/* =====================================================
   12. INITIALIZATION
===================================================== */

console.log("KAS FOOD HOUSE product database loaded.");

console.log(
    "Total food products:",
    KAS_FOOD_PRODUCTS.length
);