/* =========================================
   KAS FOOD HOUSE
   CUSTOMER DASHBOARD
   File: js/customer-dashboard.js
========================================= */

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================
   ELEMENTS
========================================= */

const loader = document.getElementById("loader");

const logoutButton = document.getElementById("logoutButton");

const profileForm = document.getElementById("profileForm");

const saveProfileBtn = document.getElementById("saveProfileBtn");

const profileMessage = document.getElementById("profileMessage");

const dashboardNotification =
    document.getElementById("dashboardNotification");

const dashboardNotificationText =
    document.getElementById("dashboardNotificationText");


/* =========================================
   DASHBOARD STATE
========================================= */

let currentUser = null;

let customerProfile = {};

let customerOrders = [];

let activeOrderFilter = "all";


/* =========================================
   HELPERS
========================================= */

function hideLoader() {

    if (loader) {
        loader.style.display = "none";
    }

}


function escapeHTML(value = "") {

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


function formatPrice(amount) {

    return new Intl.NumberFormat("en-ZM", {
        style: "currency",
        currency: "ZMW",
        minimumFractionDigits: 2
    }).format(Number(amount) || 0);

}


function formatDate(dateValue) {

    if (!dateValue) return "Date unavailable";

    let date;

    if (dateValue.toDate) {
        date = dateValue.toDate();
    } else if (typeof dateValue === "string" ||
               typeof dateValue === "number") {
        date = new Date(dateValue);
    } else if (dateValue.seconds) {
        date = new Date(dateValue.seconds * 1000);
    }

    if (!date || isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleDateString("en-ZM", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

}


function showNotification(message) {

    if (!dashboardNotification) return;

    if (dashboardNotificationText) {
        dashboardNotificationText.textContent = message;
    }

    dashboardNotification.classList.add("show");

    clearTimeout(window.dashboardNotificationTimer);

    window.dashboardNotificationTimer = setTimeout(() => {

        dashboardNotification.classList.remove("show");

    }, 3500);

}


function showProfileMessage(message, type = "error") {

    if (!profileMessage) return;

    profileMessage.textContent = message;

    profileMessage.className = "auth-message " + type;

}


function hideProfileMessage() {

    if (!profileMessage) return;

    profileMessage.textContent = "";

    profileMessage.className = "auth-message";

}


/* =========================================
   CUSTOMER NAME
========================================= */

function getCustomerName() {

    return (
        customerProfile.name ||
        currentUser?.displayName ||
        currentUser?.email?.split("@")[0] ||
        "Customer"
    );

}


function updateCustomerName() {

    const name = getCustomerName();

    const elements = [
        "sidebarCustomerName",
        "headerCustomerName",
        "welcomeCustomerName",
        "profileDisplayName"
    ];

    elements.forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = name;
        }

    });

}


/* =========================================
   CUSTOMER AVATAR
========================================= */

function updateCustomerAvatar() {

    const name = getCustomerName();

    const initial = name.charAt(0).toUpperCase();

    const avatarElements = [
        "sidebarAvatar",
        "headerAvatar",
        "profileAvatar"
    ];

    avatarElements.forEach(id => {

        const element = document.getElementById(id);

        if (!element) return;

        element.textContent = initial;

    });

}


/* =========================================
   LOAD CUSTOMER PROFILE
========================================= */

async function loadCustomerProfile() {

    try {

        const userRef = doc(db, "users", currentUser.uid);

        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {

            customerProfile = userSnapshot.data();

        } else {

            customerProfile = {};

        }

        // Fill missing name using Firebase Authentication.

        if (!customerProfile.name && currentUser.displayName) {

            customerProfile.name = currentUser.displayName;

        }

        updateCustomerName();

        updateCustomerAvatar();

        // Profile form fields.

        const profileName = document.getElementById("profileName");

        const profileEmail = document.getElementById("profileEmail");

        const profilePhone = document.getElementById("profilePhone");

        const profileAddress = document.getElementById("profileAddress");

        if (profileName) {
            profileName.value = customerProfile.name || "";
        }

        if (profileEmail) {
            profileEmail.value = currentUser.email || "";
        }

        if (profilePhone) {
            profilePhone.value = customerProfile.phone || "";
        }

        if (profileAddress) {
            profileAddress.value = customerProfile.address || "";
        }

        // Account information.

        const emailStatus =
            document.getElementById("emailVerificationStatus");

        if (emailStatus) {

            emailStatus.textContent = currentUser.emailVerified
                ? "Verified"
                : "Not verified";

            emailStatus.style.color = currentUser.emailVerified
                ? "#27c77b"
                : "#ffc857";

        }

        const memberSince = document.getElementById("memberSince");

        if (memberSince) {

            memberSince.textContent = formatDate(
                currentUser.metadata.creationTime
            );

        }

    } catch (error) {

        console.error("Profile loading error:", error);

        showNotification("Could not load your profile.");

    }

}


/* =========================================
   SAVE CUSTOMER PROFILE
========================================= */

if (profileForm) {

    profileForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        hideProfileMessage();

        const name =
            document.getElementById("profileName").value.trim();

        const phone =
            document.getElementById("profilePhone").value.trim();

        const address =
            document.getElementById("profileAddress").value.trim();

        if (!name) {

            showProfileMessage("Please enter your full name.");

            return;

        }

        if (!phone) {

            showProfileMessage("Please enter your phone number.");

            return;

        }

        if (!currentUser) {

            showProfileMessage("Please log in again.");

            return;

        }

        saveProfileBtn.disabled = true;

        saveProfileBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Saving...
        `;

        try {

            const updatedProfile = {
                name,
                phone,
                address,
                email: currentUser.email,
                uid: currentUser.uid,
                accountType: "customer",
                updatedAt: new Date()
            };

            // Save profile in Firestore.

            await setDoc(
                doc(db, "users", currentUser.uid),
                updatedProfile,
                { merge: true }
            );

            // Update Firebase Authentication display name.

            await updateProfile(currentUser, {
                displayName: name
            });

            customerProfile = {
                ...customerProfile,
                ...updatedProfile
            };

            updateCustomerName();

            updateCustomerAvatar();

            showProfileMessage(
                "Your profile has been updated successfully!",
                "success"
            );

            showNotification("Profile updated successfully!");

        } catch (error) {

            console.error("Profile update error:", error);

            showProfileMessage(
                "Could not update your profile. Please try again."
            );

        } finally {

            saveProfileBtn.disabled = false;

            saveProfileBtn.innerHTML = `
                <i class="fas fa-save"></i>
                Save Changes
            `;

        }

    });

}


/* =========================================
   LOAD CUSTOMER ORDERS
========================================= */

async function loadCustomerOrders() {

    try {

        const ordersRef = collection(db, "orders");

        const ordersQuery = query(
            ordersRef,
            where("userId", "==", currentUser.uid)
        );

        const snapshot = await getDocs(ordersQuery);

        customerOrders = snapshot.docs.map(document => ({

            id: document.id,

            ...document.data()

        }));

        // Newest orders first.

        customerOrders.sort((a, b) => {

            const dateA = getOrderDate(a);

            const dateB = getOrderDate(b);

            return dateB - dateA;

        });

        renderOrderStatistics();

        renderRecentOrders();

        renderAllOrders();

        updateOrdersCount();

    } catch (error) {

        console.error("Order loading error:", error);

        customerOrders = [];

        renderOrderStatistics();

        renderRecentOrders();

        renderAllOrders();

        showNotification(
            "Orders could not be loaded. Check your Firestore rules."
        );

    }

}


/* =========================================
   ORDER DATE
========================================= */

function getOrderDate(order) {

    const value =
        order.createdAt ||
        order.orderDate ||
        order.date;

    if (!value) return 0;

    if (value.toDate) {
        return value.toDate().getTime();
    }

    if (value.seconds) {
        return value.seconds * 1000;
    }

    const date = new Date(value).getTime();

    return isNaN(date) ? 0 : date;

}


/* =========================================
   ORDER STATUS
========================================= */

function getOrderStatus(order) {

    const status = String(
        order.status || "pending"
    ).toLowerCase();

    if (
        status.includes("complete") ||
        status.includes("delivered")
    ) {
        return "completed";
    }

    if (
        status.includes("cancel")
    ) {
        return "cancelled";
    }

    if (
        status.includes("prepar")
    ) {
        return "preparing";
    }

    return "pending";

}


function getStatusLabel(status) {

    const labels = {
        pending: "Pending",
        completed: "Completed",
        cancelled: "Cancelled",
        preparing: "Preparing"
    };

    return labels[status] || status;

}


/* =========================================
   ORDER TOTAL
========================================= */

function getOrderTotal(order) {

    return Number(
        order.total ??
        order.grandTotal ??
        order.subtotal ??
        0
    );

}


/* =========================================
   ORDER ITEMS COUNT
========================================= */

function getOrderItemsCount(order) {

    if (Array.isArray(order.items)) {

        return order.items.reduce((total, item) => {

            return total + Number(item.quantity || 1);

        }, 0);

    }

    return Number(order.itemCount || 0);

}


/* =========================================
   ORDER STATISTICS
========================================= */

function renderOrderStatistics() {

    const total = customerOrders.length;

    const pending = customerOrders.filter(order => {

        return getOrderStatus(order) === "pending" ||
               getOrderStatus(order) === "preparing";

    }).length;

    const completed = customerOrders.filter(order => {

        return getOrderStatus(order) === "completed";

    }).length;

    const spent = customerOrders.reduce((sum, order) => {

        if (getOrderStatus(order) !== "cancelled") {

            return sum + getOrderTotal(order);

        }

        return sum;

    }, 0);

    document.getElementById("totalOrders").textContent = total;

    document.getElementById("pendingOrders").textContent = pending;

    document.getElementById("completedOrders").textContent = completed;

    document.getElementById("totalSpent").textContent =
        formatPrice(spent);

}


/* =========================================
   ORDER COUNT
========================================= */

function updateOrdersCount() {

    const element = document.getElementById("ordersCount");

    if (element) {

        element.textContent = customerOrders.length;

    }

}


/* =========================================
   ORDER TABLE ROW
========================================= */

function createOrderRow(order, showAction = false) {

    const status = getOrderStatus(order);

    const reference = escapeHTML(
        order.orderReference || order.id
    );

    const date = formatDate(
        order.createdAt ||
        order.orderDate ||
        order.date
    );

    const items = getOrderItemsCount(order);

    const total = formatPrice(getOrderTotal(order));

    const action = showAction
        ? `
            <td>
                <button
                    class="order-view-btn"
                    data-order-id="${escapeHTML(order.id)}"
                    type="button">
                    View
                </button>
            </td>
        `
        : "";

    return `
        <tr>

            <td>
                <strong>${reference}</strong>
            </td>

            <td>${date}</td>

            <td>${items} item(s)</td>

            <td>${total}</td>

            <td>
                <span class="order-status ${status}">
                    ${getStatusLabel(status)}
                </span>
            </td>

            ${action}

        </tr>
    `;

}


/* =========================================
   RECENT ORDERS
========================================= */

function renderRecentOrders() {

    const container =
        document.getElementById("recentOrdersBody");

    if (!container) return;

    const recentOrders = customerOrders.slice(0, 5);

    if (recentOrders.length === 0) {

        container.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty">

                    <i class="fas fa-receipt"></i>

                    <p>No orders yet.</p>

                    <a href="menu.html">
                        Place your first order
                    </a>

                </td>
            </tr>
        `;

        return;

    }

    container.innerHTML = recentOrders.map(order => {

        return createOrderRow(order);

    }).join("");

}


/* =========================================
   ALL ORDERS
========================================= */

function renderAllOrders() {

    const container =
        document.getElementById("allOrdersBody");

    if (!container) return;

    let filteredOrders = [...customerOrders];

    if (activeOrderFilter !== "all") {

        filteredOrders = filteredOrders.filter(order => {

            return getOrderStatus(order) === activeOrderFilter;

        });

    }

    if (filteredOrders.length === 0) {

        container.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty">

                    <i class="fas fa-shopping-bag"></i>

                    <p>No orders found.</p>

                    <a href="menu.html">
                        Browse our menu
                    </a>

                </td>
            </tr>
        `;

        return;

    }

    container.innerHTML = filteredOrders.map(order => {

        return createOrderRow(order, true);

    }).join("");

}


/* =========================================
   ORDER FILTERS
========================================= */

document.querySelectorAll("[data-order-filter]").forEach(button => {

    button.addEventListener("click", function () {

        document.querySelectorAll("[data-order-filter]").forEach(btn => {

            btn.classList.remove("active");

        });

        this.classList.add("active");

        activeOrderFilter = this.dataset.orderFilter;

        renderAllOrders();

    });

});


/* =========================================
   ORDER VIEW BUTTON
========================================= */

document.addEventListener("click", function (event) {

    const button = event.target.closest("[data-order-id]");

    if (!button) return;

    const order = customerOrders.find(item => {

        return item.id === button.dataset.orderId;

    });

    if (!order) return;

    const reference =
        order.orderReference || order.id;

    const status = getStatusLabel(getOrderStatus(order));

    const total = formatPrice(getOrderTotal(order));

    const items = Array.isArray(order.items)
        ? order.items.map(item => {

            return `${item.name || item.title || "Food"} x ${item.quantity || 1}`;

        }).join("\n")
        : "Order items unavailable";

    alert(
        `ORDER DETAILS\n\n` +
        `Order: ${reference}\n` +
        `Status: ${status}\n` +
        `Total: ${total}\n\n` +
        `ITEMS:\n${items}`
    );

});


/* =========================================
   DASHBOARD TAB NAVIGATION
========================================= */

function openDashboardTab(tabId) {

    const targetTab = document.getElementById(tabId);

    if (!targetTab) return;

    document.querySelectorAll(".dashboard-tab").forEach(tab => {

        tab.classList.remove("active");

    });

    targetTab.classList.add("active");

    document.querySelectorAll("[data-dashboard-tab]").forEach(link => {

        link.classList.toggle(
            "active",
            link.dataset.dashboardTab === tabId
        );

    });

    // Update page heading.

    const heading = document.querySelector(
        ".dashboard-header-left h2"
    );

    const headings = {
        overview: "My Dashboard",
        orders: "My Orders",
        profile: "My Profile"
    };

    if (heading) {

        heading.textContent = headings[tabId] || "My Dashboard";

    }

    // Close mobile sidebar.

    closeSidebar();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


document.querySelectorAll("[data-dashboard-tab]").forEach(element => {

    element.addEventListener("click", function (event) {

        event.preventDefault();

        openDashboardTab(this.dataset.dashboardTab);

    });

});


/* =========================================
   MOBILE SIDEBAR
========================================= */

const dashboardSidebar =
    document.getElementById("dashboardSidebar");

const sidebarToggle =
    document.getElementById("sidebarToggle");

const sidebarClose =
    document.getElementById("sidebarClose");

const dashboardOverlay =
    document.getElementById("dashboardOverlay");


function openSidebar() {

    if (!dashboardSidebar) return;

    dashboardSidebar.classList.add("open");

    dashboardOverlay?.classList.add("show");

    document.body.style.overflow = "hidden";

}


function closeSidebar() {

    dashboardSidebar?.classList.remove("open");

    dashboardOverlay?.classList.remove("show");

    document.body.style.overflow = "";

}


sidebarToggle?.addEventListener("click", openSidebar);

sidebarClose?.addEventListener("click", closeSidebar);

dashboardOverlay?.addEventListener("click", closeSidebar);

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closeSidebar();

    }

});


/* =========================================
   SHOPPING CART COUNTER
========================================= */

function updateDashboardCart() {

    let totalItems = 0;

    try {

        const cart = JSON.parse(
            localStorage.getItem("kasFoodCart") || "[]"
        );

        totalItems = cart.reduce((sum, item) => {

            return sum + Number(item.quantity || 1);

        }, 0);

    } catch (error) {

        console.error("Cart reading error:", error);

    }

    const cartElements = [
        "dashboardCartCount",
        "headerCartCount"
    ];

    cartElements.forEach(id => {

        const element = document.getElementById(id);

        if (element) {

            element.textContent = totalItems;

        }

    });

}


updateDashboardCart();

window.addEventListener("storage", updateDashboardCart);

window.addEventListener("foodCartUpdated", updateDashboardCart);


/* =========================================
   LOGOUT
========================================= */

if (logoutButton) {

    logoutButton.addEventListener("click", async function () {

        const confirmLogout = confirm(
            "Are you sure you want to log out?"
        );

        if (!confirmLogout) return;

        logoutButton.disabled = true;

        logoutButton.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>Logging out...</span>
        `;

        try {

            await signOut(auth);

            window.location.href = "login.html";

        } catch (error) {

            console.error("Logout error:", error);

            showNotification("Logout failed. Please try again.");

            logoutButton.disabled = false;

            logoutButton.innerHTML = `
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            `;

        }

    });

}


/* =========================================
   AUTHENTICATION PROTECTION
========================================= */

onAuthStateChanged(auth, async function (user) {

    if (!user) {

        window.location.replace("login.html");

        return;

    }

    currentUser = user;

    try {

        // Load customer information.

        await loadCustomerProfile();

        // Load customer orders.

        await loadCustomerOrders();

        // Update shopping cart.

        updateDashboardCart();

        // Update date.

        const dateElement =
            document.getElementById("dashboardDate");

        if (dateElement) {

            dateElement.textContent =
                new Date().toLocaleDateString("en-ZM", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }).toUpperCase();

        }

        // Footer year.

        const yearElement =
            document.getElementById("currentYear");

        if (yearElement) {

            yearElement.textContent = new Date().getFullYear();

        }

        hideLoader();

        console.log(
            "KAS FOOD HOUSE customer dashboard ready:",
            user.uid
        );

    } catch (error) {

        console.error("Dashboard initialization error:", error);

        hideLoader();

        showNotification("Some dashboard information could not load.");

    }

});