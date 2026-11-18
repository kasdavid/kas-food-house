/* =========================================
   KAS FOOD HOUSE
   CUSTOMER REGISTRATION SYSTEM
   Firebase Authentication + Firestore
========================================= */

import {
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


/* =========================================
   DOM ELEMENTS
========================================= */

const registerForm = document.getElementById("registerForm");

const registerName = document.getElementById("registerName");

const registerEmail = document.getElementById("registerEmail");

const registerPhone = document.getElementById("registerPhone");

const registerPassword = document.getElementById("registerPassword");

const confirmPassword = document.getElementById("confirmPassword");

const registerButton = document.getElementById("registerButton");

const googleRegisterBtn = document.getElementById("googleRegisterBtn");

const registerMessage = document.getElementById("registerMessage");


/* =========================================
   GOOGLE PROVIDER
========================================= */

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});


/* =========================================
   MESSAGE SYSTEM
========================================= */

function showMessage(message, type = "error") {

    if (!registerMessage) return;

    registerMessage.textContent = message;

    registerMessage.className = `auth-message ${type}`;

    registerMessage.style.display = "block";

    registerMessage.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}


function hideMessage() {

    if (!registerMessage) return;

    registerMessage.textContent = "";

    registerMessage.className = "auth-message";

    registerMessage.style.display = "none";

}


/* =========================================
   BUTTON LOADING SYSTEM
========================================= */

function setButtonLoading(button, loading, originalText) {

    if (!button) return;

    button.disabled = loading;

    if (loading) {

        button.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Please wait...
        `;

    } else {

        button.innerHTML = originalText;

    }

}


/* =========================================
   FIREBASE ERROR HANDLER
========================================= */

function getFirebaseError(error) {

    const errorMessages = {

        "auth/email-already-in-use":
            "This email is already registered. Please login instead.",

        "auth/invalid-email":
            "Please enter a valid email address.",

        "auth/weak-password":
            "Your password is too weak. Use at least 8 characters.",

        "auth/network-request-failed":
            "Network error. Please check your internet connection.",

        "auth/popup-closed-by-user":
            "Google registration was cancelled.",

        "auth/popup-blocked":
            "Your browser blocked the Google sign-in popup.",

        "auth/operation-not-allowed":
            "This registration method is not enabled in Firebase.",

        "auth/too-many-requests":
            "Too many attempts. Please try again later.",

        "auth/invalid-credential":
            "Your login details could not be verified."

    };

    return errorMessages[error.code] ||
        error.message ||
        "Something went wrong. Please try again.";

}


/* =========================================
   SAVE CUSTOMER TO FIRESTORE
========================================= */

async function saveCustomer(user, customerData = {}) {

    const userRef = doc(db, "users", user.uid);

    const existingUser = await getDoc(userRef);

    const existingData = existingUser.exists()
        ? existingUser.data()
        : {};

    const customerName =
        customerData.name ||
        user.displayName ||
        existingData.name ||
        "Customer";

    const customerEmail =
        user.email ||
        customerData.email ||
        "";

    const customerPhone =
        customerData.phone ||
        existingData.phone ||
        "";

    const profileData = {

        uid: user.uid,

        name: customerName,

        email: customerEmail,

        phone: customerPhone,

        accountType: existingData.accountType || "customer",

        updatedAt: serverTimestamp()

    };


    // Only set the creation date for a new profile.

    if (!existingUser.exists()) {

        profileData.createdAt = serverTimestamp();

    }


    await setDoc(userRef, profileData, {
        merge: true
    });

}


/* =========================================
   EMAIL REGISTRATION
========================================= */

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        hideMessage();


        const name = registerName.value.trim();

        const email = registerEmail.value.trim();

        const phone = registerPhone.value.trim();

        const password = registerPassword.value;

        const confirm = confirmPassword.value;


        /* VALIDATION */

        if (name.length < 2) {

            showMessage("Please enter your full name.");

            registerName.focus();

            return;

        }


        if (!email) {

            showMessage("Please enter your email address.");

            registerEmail.focus();

            return;

        }


        if (!phone) {

            showMessage("Please enter your phone number.");

            registerPhone.focus();

            return;

        }


        if (password.length < 8) {

            showMessage("Your password must contain at least 8 characters.");

            registerPassword.focus();

            return;

        }


        if (password !== confirm) {

            showMessage("Your passwords do not match.");

            confirmPassword.focus();

            return;

        }


        const terms = document.getElementById("termsAgreement");

        if (terms && !terms.checked) {

            showMessage("Please accept the Terms and Conditions.");

            return;

        }


        const originalButton = registerButton.innerHTML;

        setButtonLoading(registerButton, true, originalButton);


        try {

            /* CREATE FIREBASE ACCOUNT */

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user = userCredential.user;


            /* UPDATE FIREBASE PROFILE */

            await updateProfile(user, {

                displayName: name

            });


            /* SAVE CUSTOMER DETAILS */

            try {

                await saveCustomer(user, {

                    name: name,

                    email: email,

                    phone: phone

                });

            } catch (firestoreError) {

                console.error(
                    "Customer profile saving error:",
                    firestoreError
                );

                showMessage(
                    "Your account was created, but your profile could not be saved. Please contact support.",
                    "error"
                );

                setButtonLoading(
                    registerButton,
                    false,
                    originalButton
                );

                return;

            }


            /* SUCCESS */

            showMessage(
                "Account created successfully! Welcome to KAS FOOD HOUSE.",
                "success"
            );


            registerForm.reset();


            setTimeout(() => {

                window.location.href = "customer-dashboard.html";

            }, 1500);


        } catch (error) {

            console.error("Registration error:", error);

            showMessage(getFirebaseError(error));

            setButtonLoading(
                registerButton,
                false,
                originalButton
            );

        }

    });

}


/* =========================================
   GOOGLE REGISTRATION
========================================= */

if (googleRegisterBtn) {

    googleRegisterBtn.addEventListener("click", async function () {

        hideMessage();

        const originalButton = googleRegisterBtn.innerHTML;

        setButtonLoading(
            googleRegisterBtn,
            true,
            originalButton
        );


        try {

            /* GOOGLE SIGN IN */

            const result = await signInWithPopup(
                auth,
                googleProvider
            );


            const user = result.user;


            /* SAVE CUSTOMER PROFILE */

            await saveCustomer(user);


            /* SUCCESS */

            showMessage(
                "Google account connected successfully!",
                "success"
            );


            setTimeout(() => {

                window.location.href = "customer-dashboard.html";

            }, 1200);


        } catch (error) {

            console.error("Google registration error:", error);

            showMessage(getFirebaseError(error));

            setButtonLoading(
                googleRegisterBtn,
                false,
                originalButton
            );

        }

    });

}


/* =========================================
   CLEAR ERRORS WHEN USER TYPES
========================================= */

const formInputs = [

    registerName,

    registerEmail,

    registerPhone,

    registerPassword,

    confirmPassword

];


formInputs.forEach(input => {

    if (!input) return;

    input.addEventListener("input", hideMessage);

});


/* =========================================
   CHECK FIREBASE CONNECTION
========================================= */

if (!auth || !db) {

    console.error(
        "Firebase is not configured correctly. Check js/firebase.js"
    );

    showMessage(
        "Connection problem. Please check your Firebase configuration."
    );

}


console.log("KAS FOOD HOUSE registration system loaded successfully.");