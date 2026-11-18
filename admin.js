/* =========================================================
   KAS FOOD HOUSE - ADMIN DASHBOARD
   File: js/admin.js

   Requires:
   - js/firebase.js
   - Firebase Authentication
   - Cloud Firestore
   - Chart.js
========================================================= */

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    serverTimestamp,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   1. GLOBAL VARIABLES
========================================================= */

const ADMIN = {
    user: null,
    profile: null,
    orders: [],
    products: [],
    customers: [],
    messages: [],
    settings: {},
    chart: null
};

const ORDER_STATUSES = [
    "pending",
    "processing",
    "preparing",
    "ready",
    "out-for-delivery",
    "completed",
    "cancelled"
];

const CURRENCY = "K";


/* =========================================================
   2. DOM HELPERS
========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


function getElement(id) {
    return document.getElementById(id);
}


function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}


function formatMoney(amount) {
    const number = Number(amount) || 0;

    return `${CURRENCY}${number.toLocaleString("en-ZM", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}


function formatDate(value) {
    if (!value) return "Not available";

    let date;

    if (value.toDate) {
        date = value.toDate();
    } else {
        date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleDateString("en-ZM", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function formatDateTime(value) {
    if (!value) return "Not available";

    let date;

    if (value.toDate) {
        date = value.toDate();
    } else {
        date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString("en-ZM");
}


function showToast(message, type = "success") {
    const toast = getElement("adminToast");
    const toastMessage = getElement("adminToastMessage");

    if (!toast || !toastMessage) {
        console.log(message);
        return;
    }

    toastMessage.textContent = message;

    toast.classList.remove("show");

    const icon = toast.querySelector("i");

    if (icon) {
        icon.className = type === "error"
            ? "fas fa-exclamation-circle"
            : "fas fa-check-circle";
    }

    if (type === "error") {
        toast.style.borderLeftColor = "#ef4444";
    } else {
        toast.style.borderLeftColor = "#22c55e";
    }

    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}


function setButtonLoading(button, loading, text = "Please wait...") {
    if (!button) return;

    if (loading) {
        button.dataset.originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            ${escapeHTML(text)}
        `;
    } else {
        button.disabled = false;

        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
        }
    }
}


/* =========================================================
   3. ADMIN AUTHENTICATION
========================================================= */

function showAccessDenied() {
    document.body.innerHTML = `
        <div style="
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#101010;
            color:white;
            text-align:center;
            padding:25px;
            font-family:Arial,sans-serif;
        ">
            <div>
                <div style="
                    font-size:55px;
                    color:#ff5a1f;
                    margin-bottom:20px;
                ">
                    <i class="fas fa-lock"></i>
                </div>

                <h1>Access Denied</h1>

                <p style="color:#aaa;line-height:1.7;">
                    You do not have administrator permission
                    to access this dashboard.
                </p>

                <a href="login.html" style="
                    display:inline-block;
                    padding:13px 25px;
                    margin-top:15px;
                    background:#ff5a1f;
                    color:white;
                    text-decoration:none;
                    border-radius:8px;
                ">
                    Return to Login
                </a>
            </div>
        </div>
    `;
}


async function verifyAdmin(user) {
    try {
        const userRef = doc(db, "users", user.uid);

        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            return false;
        }

        const profile = userSnapshot.data();

        const role = String(
            profile.role || profile.accountType || ""
        ).toLowerCase();

        if (role !== "admin") {
            return false;
        }

        ADMIN.user = user;
        ADMIN.profile = profile;

        return true;

    } catch (error) {
        console.error("Admin verification error:", error);

        showToast(
            "Unable to verify administrator permissions.",
            "error"
        );

        return false;
    }
}


onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.replace("login.html");
        return;
    }

    const allowed = await verifyAdmin(user);

    if (!allowed) {
        showAccessDenied();
        return;
    }

    initializeAdminDashboard();

});


/* =========================================================
   4. INITIALIZE DASHBOARD
========================================================= */

async function initializeAdminDashboard() {

    updateAdminProfile();

    updateAdminDate();

    setupSidebar();

    setupModals();

    setupSearch();

    setupProductForm();

    setupSettingsForm();

    setupLogout();

    setupRefresh();

    await loadDashboardData();

    console.log("KAS FOOD HOUSE Admin Dashboard Ready");
}


function updateAdminProfile() {

    const profile = ADMIN.profile || {};

    const name =
        profile.name ||
        ADMIN.user.displayName ||
        "Administrator";

    const adminName = getElement("adminName");
    const headerName = getElement("adminHeaderName");
    const avatar = getElement("adminAvatar");

    if (adminName) {
        adminName.textContent = name;
    }

    if (headerName) {
        headerName.textContent = name;
    }

    if (avatar) {
        avatar.textContent = name.charAt(0).toUpperCase();
    }

}


function updateAdminDate() {

    const dateElement = getElement("adminDate");

    if (!dateElement) return;

    dateElement.textContent = new Date().toLocaleDateString(
        "en-ZM",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


/* =========================================================
   5. LOAD DASHBOARD DATA
========================================================= */

async function loadDashboardData() {

    try {

        await Promise.all([
            loadOrders(),
            loadProducts(),
            loadCustomers(),
            loadMessages(),
            loadSettings()
        ]);

        updateDashboardStatistics();

        renderRecentOrders();

        renderOrders();

        renderProducts();

        renderCustomers();

        renderDeliveryOrders();

        renderMessages();

        renderAnalytics();

    } catch (error) {

        console.error("Dashboard loading error:", error);

        showToast(
            "Some dashboard information could not be loaded.",
            "error"
        );

    }

}


/* =========================================================
   6. LOAD ORDERS
========================================================= */

async function loadOrders() {

    try {

        const ordersRef = collection(db, "orders");

        const snapshot = await getDocs(ordersRef);

        ADMIN.orders = snapshot.docs.map(document => ({
            id: document.id,
            ...document.data()
        }));

        ADMIN.orders.sort((a, b) => {
            return getTimestamp(b.createdAt) -
                   getTimestamp(a.createdAt);
        });

    } catch (error) {

        console.error("Orders loading error:", error);

        ADMIN.orders = [];

    }

}


function getTimestamp(value) {

    if (!value) return 0;

    if (value.toMillis) {
        return value.toMillis();
    }

    if (value.toDate) {
        return value.toDate().getTime();
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? 0
        : date.getTime();
}


/* =========================================================
   7. LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    try {

        const productsRef = collection(db, "products");

        const snapshot = await getDocs(productsRef);

        ADMIN.products = snapshot.docs.map(document => ({
            id: document.id,
            ...document.data()
        }));

    } catch (error) {

        console.error("Products loading error:", error);

        ADMIN.products = [];

    }

}


/* =========================================================
   8. LOAD CUSTOMERS
========================================================= */

async function loadCustomers() {

    try {

        const usersRef = collection(db, "users");

        const snapshot = await getDocs(usersRef);

        ADMIN.customers = snapshot.docs
            .map(document => ({
                id: document.id,
                ...document.data()
            }))
            .filter(user => {
                const role = String(
                    user.role || user.accountType || "customer"
                ).toLowerCase();

                return role === "customer";
            });

    } catch (error) {

        console.error("Customers loading error:", error);

        ADMIN.customers = [];

    }

}


/* =========================================================
   9. LOAD CUSTOMER MESSAGES
========================================================= */

async function loadMessages() {

    try {

        const messagesRef = collection(db, "messages");

        const snapshot = await getDocs(messagesRef);

        ADMIN.messages = snapshot.docs.map(document => ({
            id: document.id,
            ...document.data()
        }));

        ADMIN.messages.sort((a, b) => {
            return getTimestamp(b.createdAt) -
                   getTimestamp(a.createdAt);
        });

    } catch (error) {

        console.error("Messages loading error:", error);

        ADMIN.messages = [];

    }

}


/* =========================================================
   10. LOAD RESTAURANT SETTINGS
========================================================= */

async function loadSettings() {

    try {

        const settingsRef = doc(db, "settings", "restaurant");

        const snapshot = await getDoc(settingsRef);

        if (snapshot.exists()) {

            ADMIN.settings = snapshot.data();

        } else {

            ADMIN.settings = {};

        }

        populateSettingsForm();

    } catch (error) {

        console.error("Settings loading error:", error);

    }

}


function populateSettingsForm() {

    const settings = ADMIN.settings;

    const fields = [
        "restaurantName",
        "restaurantEmail",
        "restaurantPhone",
        "restaurantAddress",
        "deliveryFeeSetting",
        "restaurantStatus"
    ];

    fields.forEach(field => {

        const element = getElement(field);

        if (!element) return;

        if (settings[field] !== undefined) {
            element.value = settings[field];
        }

    });

}


/* =========================================================
   11. DASHBOARD STATISTICS
========================================================= */

function updateDashboardStatistics() {

    const totalOrders = ADMIN.orders.length;

    const pendingOrders = ADMIN.orders.filter(order => {
        return getOrderStatus(order) === "pending";
    }).length;

    const completedOrders = ADMIN.orders.filter(order => {
        return getOrderStatus(order) === "completed";
    }).length;

    const totalCustomers = ADMIN.customers.length;

    const totalProducts = ADMIN.products.length;

    const totalRevenue = ADMIN.orders
        .filter(order => getOrderStatus(order) === "completed")
        .reduce((total, order) => {
            return total + getOrderTotal(order);
        }, 0);

    setText("totalRevenue", formatMoney(totalRevenue));

    setText("totalOrders", totalOrders);

    setText("pendingOrders", pendingOrders);

    setText("totalCustomers", totalCustomers);

    setText("totalProducts", totalProducts);

    setText("completedOrders", completedOrders);

    setText(
        "sidebarOrderCount",
        pendingOrders
    );

    setText(
        "adminNotificationCount",
        pendingOrders
    );

    setText(
        "outForDeliveryCount",
        ADMIN.orders.filter(order => {
            return getOrderStatus(order) === "out-for-delivery";
        }).length
    );

    setText(
        "readyDeliveryCount",
        ADMIN.orders.filter(order => {
            return getOrderStatus(order) === "ready";
        }).length
    );

    setText(
        "deliveredCount",
        completedOrders
    );

    setText("analyticsRevenue", formatMoney(totalRevenue));

    setText("analyticsCompletedOrders", completedOrders);

    const average = completedOrders > 0
        ? totalRevenue / completedOrders
        : 0;

    setText("averageOrderValue", formatMoney(average));

}


function setText(id, value) {

    const element = getElement(id);

    if (element) {
        element.textContent = value;
    }

}


function getOrderStatus(order) {

    return String(order.status || "pending")
        .toLowerCase()
        .replace(/\s+/g, "-");

}


function getOrderTotal(order) {

    return Number(
        order.total ??
        order.totalAmount ??
        order.grandTotal ??
        order.subtotal ??
        0
    );

}


function getCustomerName(order) {

    return (
        order.customerName ||
        order.customer?.name ||
        order.name ||
        "Customer"
    );

}


function getCustomerPhone(order) {

    return (
        order.customerPhone ||
        order.customer?.phone ||
        order.phone ||
        "Not provided"
    );

}


/* =========================================================
   12. ORDER STATUS HTML
========================================================= */

function statusHTML(status) {

    const normalized = String(status || "pending")
        .toLowerCase()
        .replace(/\s+/g, "-");

    const label = normalized
        .replace(/-/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());

    const safeStatus = ORDER_STATUSES.includes(normalized)
        ? normalized
        : "pending";

    return `
        <span class="admin-status status-${safeStatus}">
            ${escapeHTML(label)}
        </span>
    `;

}


/* =========================================================
   13. RECENT ORDERS
========================================================= */

function renderRecentOrders() {

    const tbody = getElement("recentOrdersBody");

    if (!tbody) return;

    const orders = ADMIN.orders.slice(0, 5);

    if (!orders.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="admin-table-empty">
                    No orders available yet.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = orders.map(order => `

        <tr>

            <td>#${escapeHTML(order.id.slice(0, 8))}</td>

            <td>${escapeHTML(getCustomerName(order))}</td>

            <td>${formatMoney(getOrderTotal(order))}</td>

            <td>${statusHTML(getOrderStatus(order))}</td>

            <td>${formatDate(order.createdAt)}</td>

            <td>
                <button
                    class="admin-icon-btn"
                    data-order-view="${escapeHTML(order.id)}"
                    title="View order"
                >
                    <i class="fas fa-eye"></i>
                </button>
            </td>

        </tr>

    `).join("");

}


/* =========================================================
   14. ALL ORDERS
========================================================= */

function renderOrders() {

    const tbody = getElement("allOrdersBody");

    if (!tbody) return;

    const search = (
        getElement("orderSearch")?.value || ""
    ).toLowerCase();

    const statusFilter =
        getElement("orderStatusFilter")?.value || "all";

    let orders = [...ADMIN.orders];

    if (statusFilter !== "all") {

        orders = orders.filter(order => {
            return getOrderStatus(order) === statusFilter;
        });

    }

    if (search) {

        orders = orders.filter(order => {

            const searchable = [
                order.id,
                getCustomerName(order),
                getCustomerPhone(order),
                order.customerEmail
            ].join(" ").toLowerCase();

            return searchable.includes(search);

        });

    }

    if (!orders.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="admin-table-empty">
                    No matching orders found.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = orders.map(order => `

        <tr>

            <td>#${escapeHTML(order.id.slice(0, 8))}</td>

            <td>
                ${escapeHTML(getCustomerName(order))}
                <br>
                <small style="color:#999">
                    ${escapeHTML(getCustomerPhone(order))}
                </small>
            </td>

            <td>${formatMoney(getOrderTotal(order))}</td>

            <td>${escapeHTML(order.paymentMethod || "Not specified")}</td>

            <td>${statusHTML(getOrderStatus(order))}</td>

            <td>${formatDate(order.createdAt)}</td>

            <td>
                <div class="admin-action-buttons">

                    <button
                        class="admin-icon-btn"
                        data-order-view="${escapeHTML(order.id)}"
                        title="View order"
                    >
                        <i class="fas fa-eye"></i>
                    </button>

                    <button
                        class="admin-icon-btn"
                        data-order-status="${escapeHTML(order.id)}"
                        title="Update status"
                    >
                        <i class="fas fa-edit"></i>
                    </button>

                </div>
            </td>

        </tr>

    `).join("");

}


/* =========================================================
   15. VIEW ORDER DETAILS
========================================================= */

function viewOrder(orderId) {

    const order = ADMIN.orders.find(item => item.id === orderId);

    if (!order) {
        showToast("Order not found.", "error");
        return;
    }

    const content = getElement("orderDetailsContent");

    if (!content) return;

    const items = Array.isArray(order.items)
        ? order.items
        : [];

    const itemsHTML = items.map(item => {

        const name = item.name || item.title || "Food item";

        const quantity = Number(item.quantity || 1);

        const price = Number(item.price || 0);

        return `
            <div style="
                display:flex;
                justify-content:space-between;
                gap:15px;
                padding:12px 0;
                border-bottom:1px solid rgba(255,255,255,.08);
            ">

                <div>
                    <strong>${escapeHTML(name)}</strong>
                    <br>
                    <small style="color:#aaa">
                        Quantity: ${quantity}
                    </small>
                </div>

                <strong>${formatMoney(price * quantity)}</strong>

            </div>
        `;

    }).join("");

    content.innerHTML = `

        <div style="line-height:1.9">

            <h3>Order #${escapeHTML(order.id)}</h3>

            <p>
                <strong>Customer:</strong>
                ${escapeHTML(getCustomerName(order))}
            </p>

            <p>
                <strong>Phone:</strong>
                ${escapeHTML(getCustomerPhone(order))}
            </p>

            <p>
                <strong>Email:</strong>
                ${escapeHTML(order.customerEmail || "Not provided")}
            </p>

            <p>
                <strong>Order date:</strong>
                ${formatDateTime(order.createdAt)}
            </p>

            <p>
                <strong>Delivery method:</strong>
                ${escapeHTML(order.deliveryMethod || "Not specified")}
            </p>

            <p>
                <strong>Address:</strong>
                ${escapeHTML(
                    order.deliveryAddress ||
                    order.address ||
                    "Not provided"
                )}
            </p>

            <p>
                <strong>Payment:</strong>
                ${escapeHTML(order.paymentMethod || "Not specified")}
            </p>

            <p>
                <strong>Status:</strong>
                ${statusHTML(getOrderStatus(order))}
            </p>

            <h4 style="margin-top:20px">Ordered Items</h4>

            ${itemsHTML || "<p>No item details available.</p>"}

            <h3 style="color:#ffc857;margin-top:20px">
                Total: ${formatMoney(getOrderTotal(order))}
            </h3>

            <div style="margin-top:20px">

                <label for="orderStatusUpdate">
                    Update Order Status
                </label>

                <select
                    id="orderStatusUpdate"
                    class="admin-filter"
                    style="width:100%;margin-top:8px"
                >
                    ${ORDER_STATUSES.map(status => `
                        <option
                            value="${status}"
                            ${getOrderStatus(order) === status ? "selected" : ""}
                        >
                            ${status.replace(/-/g, " ")}
                        </option>
                    `).join("")}
                </select>

                <button
                    class="admin-btn admin-btn-primary"
                    id="saveOrderStatus"
                    style="margin-top:12px;width:100%"
                >
                    Save Order Status
                </button>

            </div>

        </div>

    `;

    openModal("orderModal");

    const saveButton = getElement("saveOrderStatus");

    saveButton?.addEventListener("click", async () => {

        const newStatus = getElement("orderStatusUpdate").value;

        await updateOrderStatus(orderId, newStatus);

        closeModal("orderModal");

    });

}


/* =========================================================
   16. UPDATE ORDER STATUS
========================================================= */

async function updateOrderStatus(orderId, newStatus) {

    if (!ORDER_STATUSES.includes(newStatus)) {
        showToast("Invalid order status.", "error");
        return;
    }

    try {

        await updateDoc(
            doc(db, "orders", orderId),
            {
                status: newStatus,
                updatedAt: serverTimestamp()
            }
        );

        showToast("Order status updated successfully.");

        await loadOrders();

        updateDashboardStatistics();

        renderRecentOrders();

        renderOrders();

        renderDeliveryOrders();

        renderAnalytics();

    } catch (error) {

        console.error("Order update error:", error);

        showToast(
            "Unable to update order. Check your permissions.",
            "error"
        );

    }

}


/* =========================================================
   17. UPDATE STATUS QUICK BUTTON
========================================================= */

async function quickUpdateOrder(orderId) {

    const order = ADMIN.orders.find(item => item.id === orderId);

    if (!order) return;

    const current = getOrderStatus(order);

    const next = ORDER_STATUSES[
        ORDER_STATUSES.indexOf(current) + 1
    ];

    if (!next) {

        showToast("This order has reached its final status.");

        return;

    }

    const confirmed = confirm(
        `Change order status to "${next.replace(/-/g, " ")}"?`
    );

    if (!confirmed) return;

    await updateOrderStatus(orderId, next);

}


/* =========================================================
   18. PRODUCTS DISPLAY
========================================================= */

function renderProducts() {

    const container = getElement("adminProductsGrid");

    if (!container) return;

    const search = (
        getElement("productSearch")?.value || ""
    ).toLowerCase();

    const category =
        getElement("productCategoryFilter")?.value || "all";

    let products = [...ADMIN.products];

    if (search) {

        products = products.filter(product => {

            const text = [
                product.name,
                product.title,
                product.description,
                product.category
            ].join(" ").toLowerCase();

            return text.includes(search);

        });

    }

    if (category !== "all") {

        products = products.filter(product => {
            return product.category === category;
        });

    }

    if (!products.length) {

        container.innerHTML = `
            <div style="
                padding:35px;
                text-align:center;
                color:#aaa;
                grid-column:1/-1;
            ">
                <i class="fas fa-utensils"
                   style="font-size:35px;margin-bottom:15px">
                </i>

                <h3>No Products Found</h3>

                <p>Add your first food product.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = products.map(product => {

        const name = product.name || product.title || "Food item";

        const image = product.image || product.imageUrl || "";

        const available = product.available !== false;

        return `

            <div class="admin-product-card">

                <img
                    class="admin-product-image"
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(name)}"
                    onerror="this.src='https://placehold.co/600x400/202020/ffffff?text=Food+Image'"
                >

                <div class="admin-product-content">

                    <h4>${escapeHTML(name)}</h4>

                    <p>
                        ${escapeHTML(product.description || "No description available")}
                    </p>

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:10px;
                    ">

                        <span class="admin-product-price">
                            ${formatMoney(product.price)}
                        </span>

                        ${available
                            ? '<span class="admin-status status-completed">Available</span>'
                            : '<span class="admin-status status-cancelled">Unavailable</span>'
                        }

                    </div>

                    <div class="admin-product-actions">

                        <button
                            class="admin-btn admin-btn-secondary"
                            data-product-edit="${escapeHTML(product.id)}"
                        >
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>

                        <button
                            class="admin-btn admin-btn-danger"
                            data-product-delete="${escapeHTML(product.id)}"
                        >
                            <i class="fas fa-trash"></i>
                        </button>

                    </div>

                </div>

            </div>

        `;

    }).join("");

}


/* =========================================================
   19. PRODUCT MODAL
========================================================= */

function setupProductForm() {

    const addButton = getElement("addProductBtn");

    const form = getElement("adminProductForm");

    addButton?.addEventListener("click", () => {

        form?.reset();

        setText("productModalTitle", "Add New Food Product");

        if (getElement("editProductId")) {
            getElement("editProductId").value = "";
        }

        openModal("productModal");

    });

    form?.addEventListener("submit", saveProduct);

}


function editProduct(productId) {

    const product = ADMIN.products.find(item => item.id === productId);

    if (!product) return;

    setText("productModalTitle", "Edit Food Product");

    getElement("editProductId").value = product.id;

    getElement("productName").value =
        product.name || product.title || "";

    getElement("productDescription").value =
        product.description || "";

    getElement("productPrice").value =
        product.price || 0;

    getElement("productCategory").value =
        product.category || "traditional";

    getElement("productImage").value =
        product.image || product.imageUrl || "";

    getElement("productAvailability").checked =
        product.available !== false;

    getElement("productFeatured").checked =
        product.featured === true;

    openModal("productModal");

}


/* =========================================================
   20. SAVE PRODUCT
========================================================= */

async function saveProduct(event) {

    event.preventDefault();

    const button = getElement("saveProductBtn");

    const productId = getElement("editProductId").value.trim();

    const name = getElement("productName").value.trim();

    const description =
        getElement("productDescription").value.trim();

    const price = Number(
        getElement("productPrice").value
    );

    const category =
        getElement("productCategory").value;

    const image =
        getElement("productImage").value.trim();

    const available =
        getElement("productAvailability").checked;

    const featured =
        getElement("productFeatured").checked;

    if (!name || !description || !category || !image) {

        showToast("Please complete all product fields.", "error");

        return;

    }

    if (!Number.isFinite(price) || price < 0) {

        showToast("Enter a valid product price.", "error");

        return;

    }

    const productData = {
        name,
        description,
        price,
        category,
        image,
        available,
        featured,
        updatedAt: serverTimestamp()
    };

    setButtonLoading(button, true, "Saving product...");

    try {

        if (productId) {

            await updateDoc(
                doc(db, "products", productId),
                productData
            );

            showToast("Product updated successfully.");

        } else {

            productData.createdAt = serverTimestamp();

            await addDoc(
                collection(db, "products"),
                productData
            );

            showToast("New product added successfully.");

        }

        closeModal("productModal");

        await loadProducts();

        renderProducts();

        updateDashboardStatistics();

    } catch (error) {

        console.error("Product saving error:", error);

        showToast(
            "Unable to save product. Check Firestore permissions.",
            "error"
        );

    } finally {

        setButtonLoading(button, false);

    }

}


/* =========================================================
   21. DELETE PRODUCT
========================================================= */

async function deleteProduct(productId) {

    const product = ADMIN.products.find(item => item.id === productId);

    if (!product) return;

    const confirmed = confirm(
        `Are you sure you want to delete "${product.name || product.title}"?`
    );

    if (!confirmed) return;

    try {

        await deleteDoc(
            doc(db, "products", productId)
        );

        showToast("Product deleted successfully.");

        await loadProducts();

        renderProducts();

        updateDashboardStatistics();

    } catch (error) {

        console.error("Product deletion error:", error);

        showToast(
            "Unable to delete product.",
            "error"
        );

    }

}


/* =========================================================
   22. CUSTOMERS
========================================================= */

function renderCustomers() {

    const tbody = getElement("customersTableBody");

    if (!tbody) return;

    const search = (
        getElement("customerSearch")?.value || ""
    ).toLowerCase();

    let customers = [...ADMIN.customers];

    if (search) {

        customers = customers.filter(customer => {

            const text = [
                customer.name,
                customer.email,
                customer.phone
            ].join(" ").toLowerCase();

            return text.includes(search);

        });

    }

    if (!customers.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="admin-table-empty">
                    No customers found.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = customers.map(customer => `

        <tr>

            <td>${escapeHTML(customer.name || "Customer")}</td>

            <td>${escapeHTML(customer.email || "Not provided")}</td>

            <td>${escapeHTML(customer.phone || "Not provided")}</td>

            <td>${formatDate(customer.createdAt)}</td>

            <td>
                <span class="admin-status status-completed">
                    Customer
                </span>
            </td>

        </tr>

    `).join("");

}


/* =========================================================
   23. DELIVERY ORDERS
========================================================= */

function renderDeliveryOrders() {

    const tbody = getElement("deliveryOrdersBody");

    if (!tbody) return;

    const orders = ADMIN.orders.filter(order => {

        const status = getOrderStatus(order);

        return [
            "ready",
            "out-for-delivery"
        ].includes(status);

    });

    if (!orders.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="admin-table-empty">
                    No active delivery orders.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = orders.map(order => `

        <tr>

            <td>#${escapeHTML(order.id.slice(0, 8))}</td>

            <td>${escapeHTML(getCustomerName(order))}</td>

            <td>${escapeHTML(getCustomerPhone(order))}</td>

            <td>
                ${escapeHTML(
                    order.deliveryAddress ||
                    order.address ||
                    "Address not provided"
                )}
            </td>

            <td>${statusHTML(getOrderStatus(order))}</td>

            <td>
                <button
                    class="admin-icon-btn"
                    data-order-view="${escapeHTML(order.id)}"
                >
                    <i class="fas fa-eye"></i>
                </button>
            </td>

        </tr>

    `).join("");

}


/* =========================================================
   24. CUSTOMER MESSAGES
========================================================= */

function renderMessages() {

    const tbody = getElement("messagesTableBody");

    if (!tbody) return;

    if (!ADMIN.messages.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="admin-table-empty">
                    No customer messages available.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = ADMIN.messages.map(message => `

        <tr>

            <td>${escapeHTML(message.name || "Customer")}</td>

            <td>${escapeHTML(message.email || "Not provided")}</td>

            <td>${escapeHTML(message.subject || "General enquiry")}</td>

            <td>${formatDate(message.createdAt)}</td>

            <td>
                <button
                    class="admin-icon-btn"
                    data-message-view="${escapeHTML(message.id)}"
                    title="Read message"
                >
                    <i class="fas fa-envelope-open"></i>
                </button>
            </td>

        </tr>

    `).join("");

}


function viewMessage(messageId) {

    const message = ADMIN.messages.find(item => item.id === messageId);

    if (!message) return;

    const content = getElement("orderDetailsContent");

    if (!content) return;

    content.innerHTML = `

        <h3>Customer Message</h3>

        <p><strong>Name:</strong> ${escapeHTML(message.name || "")}</p>

        <p><strong>Email:</strong> ${escapeHTML(message.email || "")}</p>

        <p><strong>Phone:</strong> ${escapeHTML(message.phone || "Not provided")}</p>

        <p><strong>Subject:</strong> ${escapeHTML(message.subject || "")}</p>

        <hr style="border-color:#333;margin:20px 0">

        <p style="line-height:1.8">
            ${escapeHTML(message.message || "")}
        </p>

        <a
            href="mailto:${encodeURIComponent(message.email || "")}"
            class="admin-btn admin-btn-primary"
            style="margin-top:20px"
        >
            <i class="fas fa-reply"></i>
            Reply by Email
        </a>

    `;

    openModal("orderModal");

}


/* =========================================================
   25. ANALYTICS
========================================================= */

function renderAnalytics() {

    const canvas = getElement("salesChart");

    if (!canvas || typeof Chart === "undefined") return;

    const completedOrders = ADMIN.orders.filter(order => {
        return getOrderStatus(order) === "completed";
    });

    const monthlyData = Array(12).fill(0);

    completedOrders.forEach(order => {

        const timestamp = getTimestamp(order.createdAt);

        if (!timestamp) return;

        const date = new Date(timestamp);

        if (date.getFullYear() === new Date().getFullYear()) {

            monthlyData[date.getMonth()] += getOrderTotal(order);

        }

    });

    if (ADMIN.chart) {
        ADMIN.chart.destroy();
    }

    ADMIN.chart = new Chart(canvas, {

        type: "line",

        data: {

            labels: [
                "Jan", "Feb", "Mar", "Apr",
                "May", "Jun", "Jul", "Aug",
                "Sep", "Oct", "Nov", "Dec"
            ],

            datasets: [{

                label: "Completed Sales (ZMW)",

                data: monthlyData,

                borderColor: "#ff5a1f",

                backgroundColor: "rgba(255,90,31,0.12)",

                borderWidth: 3,

                fill: true,

                tension: 0.4,

                pointRadius: 4,

                pointBackgroundColor: "#ffc857"

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    labels: {
                        color: "#ffffff"
                    }
                }

            },

            scales: {

                x: {
                    ticks: {
                        color: "#aaa"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.05)"
                    }
                },

                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#aaa"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.05)"
                    }
                }

            }

        }

    });

    renderTopProducts();

}


function renderTopProducts() {

    const container = getElement("topProductsList");

    if (!container) return;

    const productSales = {};

    ADMIN.orders
        .filter(order => getOrderStatus(order) === "completed")
        .forEach(order => {

            const items = Array.isArray(order.items)
                ? order.items
                : [];

            items.forEach(item => {

                const name = item.name || item.title || "Food item";

                productSales[name] =
                    (productSales[name] || 0) +
                    Number(item.quantity || 1);

            });

        });

    const sorted = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (!sorted.length) {

        container.innerHTML = `
            <p style="color:#aaa;font-size:12px">
                Sales information will appear here when completed orders are recorded.
            </p>
        `;

        return;
    }

    container.innerHTML = sorted.map(([name, quantity]) => `

        <div class="admin-top-product">

            <div class="admin-top-product-info">

                <div style="
                    width:42px;
                    height:42px;
                    display:grid;
                    place-items:center;
                    background:rgba(255,90,31,.12);
                    border-radius:9px;
                    color:#ff5a1f;
                ">
                    <i class="fas fa-utensils"></i>
                </div>

                <div>
                    <h4>${escapeHTML(name)}</h4>
                    <span>${quantity} sold</span>
                </div>

            </div>

            <strong>${quantity}</strong>

        </div>

    `).join("");

}


/* =========================================================
   26. RESTAURANT SETTINGS
========================================================= */

function setupSettingsForm() {

    const form = getElement("adminSettingsForm");

    if (!form) return;

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const button = form.querySelector('button[type="submit"]');

        const settings = {

            restaurantName:
                getElement("restaurantName")?.value.trim() || "",

            restaurantEmail:
                getElement("restaurantEmail")?.value.trim() || "",

            restaurantPhone:
                getElement("restaurantPhone")?.value.trim() || "",

            restaurantAddress:
                getElement("restaurantAddress")?.value.trim() || "",

            deliveryFeeSetting:
                Number(getElement("deliveryFeeSetting")?.value || 0),

            restaurantStatus:
                getElement("restaurantStatus")?.value || "open",

            updatedAt: serverTimestamp(),

            updatedBy: ADMIN.user.uid

        };

        setButtonLoading(button, true, "Saving settings...");

        try {

            await setDoc(
                doc(db, "settings", "restaurant"),
                settings,
                { merge: true }
            );

            ADMIN.settings = settings;

            showToast("Restaurant settings saved successfully.");

            const message = getElement("adminSettingsMessage");

            if (message) {
                message.textContent = "Settings saved successfully.";
                message.style.color = "#22c55e";
            }

        } catch (error) {

            console.error("Settings saving error:", error);

            showToast("Unable to save settings.", "error");

        } finally {

            setButtonLoading(button, false);

        }

    });

}


/* =========================================================
   27. SIDEBAR NAVIGATION
========================================================= */

function setupSidebar() {

    const sidebar = getElement("adminSidebar");

    const toggle = getElement("adminMenuToggle");

    const overlay = getElement("adminOverlay");

    const navItems = $$("[data-section]");

    navItems.forEach(button => {

        button.addEventListener("click", () => {

            const sectionName = button.dataset.section;

            showSection(sectionName);

            sidebar?.classList.remove("active");

            overlay?.classList.remove("active");

        });

    });

    toggle?.addEventListener("click", () => {

        sidebar?.classList.toggle("active");

        overlay?.classList.toggle("active");

    });

    overlay?.addEventListener("click", () => {

        sidebar?.classList.remove("active");

        overlay.classList.remove("active");

    });

    $$("[data-go-section]").forEach(button => {

        button.addEventListener("click", () => {

            showSection(button.dataset.goSection);

        });

    });

}


function showSection(sectionName) {

    const sections = {
        overview: "overviewSection",
        orders: "ordersSection",
        products: "productsSection",
        customers: "customersSection",
        delivery: "deliverySection",
        analytics: "analyticsSection",
        messages: "messagesSection",
        settings: "settingsSection"
    };

    Object.values(sections).forEach(id => {

        getElement(id)?.classList.remove("active");

    });

    const target = sections[sectionName];

    if (!target) return;

    getElement(target)?.classList.add("active");

    $$("[data-section]").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.section === sectionName
        );

    });

    const titles = {
        overview: ["Dashboard Overview", "Welcome to your restaurant dashboard."],
        orders: ["Manage Orders", "View and update customer orders."],
        products: ["Food Products", "Manage your restaurant menu."],
        customers: ["Customers", "View registered customers."],
        delivery: ["Delivery Management", "Manage ready and active deliveries."],
        analytics: ["Sales Analytics", "Monitor your restaurant performance."],
        messages: ["Customer Messages", "View customer enquiries."],
        settings: ["Restaurant Settings", "Manage restaurant information."]
    };

    const title = getElement("adminPageTitle");

    const subtitle = getElement("adminPageSubtitle");

    if (title) {
        title.textContent = titles[sectionName][0];
    }

    if (subtitle) {
        subtitle.textContent = titles[sectionName][1];
    }

    if (sectionName === "analytics") {
        renderAnalytics();
    }

}


/* =========================================================
   28. MODAL CONTROLS
========================================================= */

function setupModals() {

    getElement("closeProductModal")?.addEventListener("click", () => {
        closeModal("productModal");
    });

    getElement("cancelProductBtn")?.addEventListener("click", () => {
        closeModal("productModal");
    });

    getElement("closeOrderModal")?.addEventListener("click", () => {
        closeModal("orderModal");
    });

    $$(".admin-modal").forEach(modal => {

        modal.addEventListener("click", event => {

            if (event.target === modal) {
                modal.classList.remove("active");
            }

        });

    });

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            $$(".admin-modal.active").forEach(modal => {
                modal.classList.remove("active");
            });

        }

    });

}


function openModal(id) {

    getElement(id)?.classList.add("active");

}


function closeModal(id) {

    getElement(id)?.classList.remove("active");

}


/* =========================================================
   29. SEARCH AND FILTER EVENTS
========================================================= */

function setupSearch() {

    getElement("orderSearch")?.addEventListener(
        "input",
        renderOrders
    );

    getElement("orderStatusFilter")?.addEventListener(
        "change",
        renderOrders
    );

    getElement("productSearch")?.addEventListener(
        "input",
        renderProducts
    );

    getElement("productCategoryFilter")?.addEventListener(
        "change",
        renderProducts
    );

    getElement("customerSearch")?.addEventListener(
        "input",
        renderCustomers
    );

}


/* =========================================================
   30. REFRESH BUTTON
========================================================= */

function setupRefresh() {

    getElement("refreshOrdersBtn")?.addEventListener(
        "click",
        async () => {

            const button = getElement("refreshOrdersBtn");

            setButtonLoading(button, true, "Refreshing...");

            await loadDashboardData();

            setButtonLoading(button, false);

            showToast("Dashboard information refreshed.");

        }
    );

}


/* =========================================================
   31. LOGOUT
========================================================= */

function setupLogout() {

    getElement("adminLogout")?.addEventListener(
        "click",
        async () => {

            const confirmed = confirm(
                "Are you sure you want to log out?"
            );

            if (!confirmed) return;

            try {

                await signOut(auth);

                window.location.replace("login.html");

            } catch (error) {

                console.error("Logout error:", error);

                showToast("Unable to log out.", "error");

            }

        }
    );

}


/* =========================================================
   32. GLOBAL CLICK EVENTS
========================================================= */

document.addEventListener("click", event => {

    const viewButton = event.target.closest("[data-order-view]");

    if (viewButton) {

        viewOrder(viewButton.dataset.orderView);

        return;

    }

    const statusButton = event.target.closest("[data-order-status]");

    if (statusButton) {

        quickUpdateOrder(statusButton.dataset.orderStatus);

        return;

    }

    const editButton = event.target.closest("[data-product-edit]");

    if (editButton) {

        editProduct(editButton.dataset.productEdit);

        return;

    }

    const deleteButton = event.target.closest("[data-product-delete]");

    if (deleteButton) {

        deleteProduct(deleteButton.dataset.productDelete);

        return;

    }

    const messageButton = event.target.closest("[data-message-view]");

    if (messageButton) {

        viewMessage(messageButton.dataset.messageView);

        return;

    }

});


/* =========================================================
   33. FOOTER YEAR
========================================================= */

const adminYear = getElement("adminYear");

if (adminYear) {
    adminYear.textContent = new Date().getFullYear();
}


/* =========================================================
   END OF ADMIN.JS
========================================================= */