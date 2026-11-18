/* =========================================
   KAS FOOD HOUSE
   GPS DELIVERY LOCATION SYSTEM
========================================= */


/* =========================================
   CONFIGURATION
========================================= */

const GPS_CONFIG = {
    storageKey: "kasFoodDeliveryLocation",
    checkoutPage: "checkout.html",
    maximumAge: 0,
    timeout: 15000,
    enableHighAccuracy: true
};


/* =========================================
   DOM ELEMENTS
========================================= */

const getGPSLocation = document.getElementById("getGPSLocation");

const copyGPSLocation = document.getElementById("copyGPSLocation");

const saveGPSLocation = document.getElementById("saveGPSLocation");

const gpsLatitude = document.getElementById("gpsLatitude");

const gpsLongitude = document.getElementById("gpsLongitude");

const gpsAccuracy = document.getElementById("gpsAccuracy");

const gpsStatus = document.getElementById("gpsStatus");

const gpsMap = document.getElementById("gpsMap");

const gpsMapPlaceholder = document.getElementById("gpsMapPlaceholder");

const openGoogleMaps = document.getElementById("openGoogleMaps");

const gpsDeliveryAddress = document.getElementById("gpsDeliveryAddress");

const gpsError = document.getElementById("gpsError");

const gpsErrorText = document.getElementById("gpsErrorText");

const gpsNotification = document.getElementById("gpsNotification");

const gpsNotificationText = document.getElementById("gpsNotificationText");

const gpsYear = document.getElementById("gpsYear");


/* =========================================
   CURRENT LOCATION
========================================= */

let currentGPSLocation = null;

let notificationTimer = null;


/* =========================================
   FOOTER YEAR
========================================= */

if (gpsYear) {
    gpsYear.textContent = new Date().getFullYear();
}


/* =========================================
   NOTIFICATION
========================================= */

function showGPSNotification(message) {

    if (!gpsNotification || !gpsNotificationText) return;

    gpsNotificationText.textContent = message;

    gpsNotification.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(() => {

        gpsNotification.classList.remove("show");

    }, 3500);

}


/* =========================================
   STATUS MESSAGE
========================================= */

function updateGPSStatus(message, type = "info") {

    if (!gpsStatus) return;

    const icons = {
        info: "fa-circle-info",
        success: "fa-circle-check",
        error: "fa-circle-exclamation",
        loading: "fa-spinner fa-spin"
    };

    gpsStatus.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;

}


/* =========================================
   ERROR MESSAGE
========================================= */

function showGPSError(message) {

    if (!gpsError || !gpsErrorText) return;

    gpsErrorText.textContent = message;

    gpsError.hidden = false;

}


function hideGPSError() {

    if (!gpsError) return;

    gpsError.hidden = true;

}


/* =========================================
   BUTTON LOADING
========================================= */

function setGPSLoading(isLoading) {

    if (!getGPSLocation) return;

    getGPSLocation.disabled = isLoading;

    if (isLoading) {

        getGPSLocation.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Finding Your Location...
        `;

    } else {

        getGPSLocation.innerHTML = `
            <i class="fas fa-location-arrow"></i>
            Use My Current Location
        `;

    }

}


/* =========================================
   GET CURRENT GPS LOCATION
========================================= */

function getCurrentGPSLocation() {

    hideGPSError();

    if (!navigator.geolocation) {

        showGPSError(
            "Your browser does not support GPS location. Please use a modern browser."
        );

        updateGPSStatus(
            "GPS is not supported by this browser.",
            "error"
        );

        return;

    }

    setGPSLoading(true);

    updateGPSStatus(
        "Requesting your current location...",
        "loading"
    );

    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude = position.coords.latitude;

            const longitude = position.coords.longitude;

            const accuracy = position.coords.accuracy;

            currentGPSLocation = {
                latitude,
                longitude,
                accuracy,
                timestamp: new Date().toISOString()
            };

            displayGPSLocation();

            setGPSLoading(false);

            updateGPSStatus(
                "Your current location has been detected successfully.",
                "success"
            );

            if (copyGPSLocation) {
                copyGPSLocation.disabled = false;
            }

            if (saveGPSLocation) {
                saveGPSLocation.disabled = false;
            }

            showGPSNotification(
                "Your GPS location was detected successfully!"
            );

        },

        function (error) {

            setGPSLoading(false);

            let message = "";

            switch (error.code) {

                case error.PERMISSION_DENIED:

                    message =
                        "Location permission was denied. Allow location access in your browser settings.";

                    break;

                case error.POSITION_UNAVAILABLE:

                    message =
                        "Your current location is unavailable. Check your device GPS settings.";

                    break;

                case error.TIMEOUT:

                    message =
                        "Location request timed out. Please try again.";

                    break;

                default:

                    message =
                        "Something went wrong while detecting your location.";

            }

            updateGPSStatus(message, "error");

            showGPSError(message);

        },

        GPS_CONFIG

    );

}


/* =========================================
   DISPLAY GPS INFORMATION
========================================= */

function displayGPSLocation() {

    if (!currentGPSLocation) return;

    const latitude = currentGPSLocation.latitude;

    const longitude = currentGPSLocation.longitude;

    const accuracy = currentGPSLocation.accuracy;

    if (gpsLatitude) {

        gpsLatitude.textContent = latitude.toFixed(6);

    }

    if (gpsLongitude) {

        gpsLongitude.textContent = longitude.toFixed(6);

    }

    if (gpsAccuracy) {

        gpsAccuracy.textContent =
            `Approximately ${Math.round(accuracy)} metres`;

    }

    displayGoogleMap(latitude, longitude);

}


/* =========================================
   GOOGLE MAP DISPLAY
========================================= */

function displayGoogleMap(latitude, longitude) {

    if (!gpsMap) return;

    const mapURL =
        `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`;

    gpsMap.src = mapURL;

    gpsMap.hidden = false;

    if (gpsMapPlaceholder) {

        gpsMapPlaceholder.hidden = true;

    }

    if (openGoogleMaps) {

        openGoogleMaps.href =
            `https://www.google.com/maps?q=${latitude},${longitude}`;

        openGoogleMaps.hidden = false;

    }

}


/* =========================================
   COPY GPS COORDINATES
========================================= */

async function copyGPSCoordinates() {

    if (!currentGPSLocation) {

        showGPSError("Please detect your location first.");

        return;

    }

    const coordinates =
        `${currentGPSLocation.latitude}, ${currentGPSLocation.longitude}`;

    try {

        if (navigator.clipboard && window.isSecureContext) {

            await navigator.clipboard.writeText(coordinates);

        } else {

            const temporaryInput = document.createElement("textarea");

            temporaryInput.value = coordinates;

            temporaryInput.style.position = "fixed";
            temporaryInput.style.opacity = "0";

            document.body.appendChild(temporaryInput);

            temporaryInput.select();

            const copied = document.execCommand("copy");

            temporaryInput.remove();

            if (!copied) {
                throw new Error("Copy failed.");
            }

        }

        showGPSNotification("GPS coordinates copied successfully!");

    } catch (error) {

        console.error("Copy Error:", error);

        showGPSError(
            "Unable to copy coordinates. Please copy them manually."
        );

    }

}


/* =========================================
   SAVE GPS LOCATION
========================================= */

function saveGPSLocationToStorage() {

    hideGPSError();

    if (!currentGPSLocation) {

        showGPSError(
            "Please detect your GPS location before saving."
        );

        return;

    }

    const address = gpsDeliveryAddress
        ? gpsDeliveryAddress.value.trim()
        : "";

    const deliveryLocation = {

        latitude: currentGPSLocation.latitude,

        longitude: currentGPSLocation.longitude,

        accuracy: currentGPSLocation.accuracy,

        additionalAddress: address,

        savedAt: new Date().toISOString()

    };

    try {

        localStorage.setItem(
            GPS_CONFIG.storageKey,
            JSON.stringify(deliveryLocation)
        );

        showGPSNotification(
            "Delivery location saved successfully!"
        );

        updateGPSStatus(
            "Your delivery location has been saved.",
            "success"
        );

        // Return to checkout after saving.

        setTimeout(() => {

            window.location.href = GPS_CONFIG.checkoutPage;

        }, 1000);

    } catch (error) {

        console.error("GPS Save Error:", error);

        showGPSError(
            "Unable to save your location. Check your browser storage settings."
        );

    }

}


/* =========================================
   LOAD PREVIOUSLY SAVED LOCATION
========================================= */

function loadSavedGPSLocation() {

    try {

        const savedLocation = localStorage.getItem(
            GPS_CONFIG.storageKey
        );

        if (!savedLocation) return;

        const location = JSON.parse(savedLocation);

        if (
            typeof location.latitude !== "number" ||
            typeof location.longitude !== "number" ||
            !Number.isFinite(location.latitude) ||
            !Number.isFinite(location.longitude) ||
            Math.abs(location.latitude) > 90 ||
            Math.abs(location.longitude) > 180
        ) {

            return;

        }

        currentGPSLocation = location;

        displayGPSLocation();

        if (gpsDeliveryAddress) {

            gpsDeliveryAddress.value =
                location.additionalAddress || "";

        }

        if (copyGPSLocation) {
            copyGPSLocation.disabled = false;
        }

        if (saveGPSLocation) {
            saveGPSLocation.disabled = false;
        }

        updateGPSStatus(
            "Your previously saved delivery location has been loaded.",
            "success"
        );

    } catch (error) {

        console.error("Loading Saved GPS Error:", error);

    }

}


/* =========================================
   EVENT LISTENERS
========================================= */

if (getGPSLocation) {

    getGPSLocation.addEventListener(
        "click",
        getCurrentGPSLocation
    );

}


if (copyGPSLocation) {

    copyGPSLocation.addEventListener(
        "click",
        copyGPSCoordinates
    );

}


if (saveGPSLocation) {

    saveGPSLocation.addEventListener(
        "click",
        saveGPSLocationToStorage
    );

}


/* =========================================
   INITIALIZE GPS PAGE
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadSavedGPSLocation();

    console.log(
        "KAS FOOD HOUSE GPS Delivery System Initialized."
    );

});