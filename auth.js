/* =========================================
   KAS FOOD HOUSE - AUTHENTICATION
   File: js/auth.js
========================================= */

import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


/* =========================================
   ELEMENTS
========================================= */

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("loginEmail");

const passwordInput = document.getElementById("loginPassword");

const rememberMe = document.getElementById("rememberMe");

const loginButton = document.getElementById("loginButton");

const googleLoginBtn = document.getElementById("googleLoginBtn");

const loginMessage = document.getElementById("loginMessage");


/* =========================================
   SHOW MESSAGE
========================================= */

function showAuthMessage(message, type = "error") {

    if (!loginMessage) return;

    loginMessage.textContent = message;

    loginMessage.className = "auth-message " + type;

    loginMessage.style.display = "block";

}


/* =========================================
   HIDE MESSAGE
========================================= */

function hideAuthMessage() {

    if (!loginMessage) return;

    loginMessage.textContent = "";

    loginMessage.className = "auth-message";

    loginMessage.style.display = "none";

}


/* =========================================
   BUTTON LOADING
========================================= */

function setButtonLoading(button, loading, originalText) {

    if (!button) return;

    button.disabled = loading;

    if (loading) {

        button.dataset.originalText = button.innerHTML;

        button.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Please wait...
        `;

    } else {

        button.innerHTML =
            button.dataset.originalText || originalText;

    }

}


/* =========================================
   FIREBASE ERROR HANDLING
========================================= */

function getFirebaseErrorMessage(error) {

    switch (error.code) {

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/user-not-found":
            return "No account was found with this email.";

        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Incorrect email or password.";

        case "auth/user-disabled":
            return "This account has been disabled.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Check your internet connection.";

        case "auth/popup-closed-by-user":
            return "Google login was cancelled.";

        case "auth/popup-blocked":
            return "Your browser blocked the Google login popup.";

        case "auth/unauthorized-domain":
            return "This website domain is not authorized in Firebase.";

        default:
            console.error("Firebase authentication error:", error);

            return "Login failed. Please try again.";

    }

}


/* =========================================
   EMAIL AND PASSWORD LOGIN
========================================= */

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        hideAuthMessage();

        const email = emailInput.value.trim();

        const password = passwordInput.value;

        if (!email || !password) {

            showAuthMessage("Please enter your email and password.");

            return;

        }

        if (!emailInput.checkValidity()) {

            showAuthMessage("Please enter a valid email address.");

            return;

        }

        setButtonLoading(
            loginButton,
            true,
            "Login"
        );

        try {

            // Choose whether to remember the login.

            const persistence = rememberMe && rememberMe.checked
                ? browserLocalPersistence
                : browserSessionPersistence;

            await setPersistence(auth, persistence);

            // Sign in with Firebase.

            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            console.log("Successfully logged in:", user.uid);

            showAuthMessage(
                "Login successful! Redirecting...",
                "success"
            );

            // Redirect after successful login.

            setTimeout(() => {

                window.location.href = "customer-dashboard.html";

            }, 1200);

        } catch (error) {

            showAuthMessage(getFirebaseErrorMessage(error));

            setButtonLoading(
                loginButton,
                false,
                "Login"
            );

        }

    });

}


/* =========================================
   GOOGLE LOGIN
========================================= */

if (googleLoginBtn) {

    googleLoginBtn.addEventListener("click", async function () {

        hideAuthMessage();

        setButtonLoading(
            googleLoginBtn,
            true,
            "Continue with Google"
        );

        try {

            const provider = new GoogleAuthProvider();

            provider.setCustomParameters({
                prompt: "select_account"
            });

            const result = await signInWithPopup(
                auth,
                provider
            );

            console.log(
                "Google login successful:",
                result.user.uid
            );

            showAuthMessage(
                "Google login successful! Redirecting...",
                "success"
            );

            setTimeout(() => {

                window.location.href = "customer-dashboard.html";

            }, 1200);

        } catch (error) {

            showAuthMessage(getFirebaseErrorMessage(error));

            setButtonLoading(
                googleLoginBtn,
                false,
                "Continue with Google"
            );

        }

    });

}


/* =========================================
   PASSWORD VISIBILITY
========================================= */

const togglePassword = document.getElementById("togglePassword");

if (togglePassword && passwordInput) {

    togglePassword.addEventListener("click", function () {

        const isPassword =
            passwordInput.type === "password";

        passwordInput.type = isPassword
            ? "text"
            : "password";

        const icon = togglePassword.querySelector("i");

        if (icon) {

            icon.classList.toggle("fa-eye", !isPassword);

            icon.classList.toggle("fa-eye-slash", isPassword);

        }

    });

}


/* =========================================
   CLEAR MESSAGE WHEN TYPING
========================================= */

[emailInput, passwordInput].forEach(input => {

    if (!input) return;

    input.addEventListener("input", hideAuthMessage);

});


/* =========================================
   INITIALIZATION
========================================= */

console.log("KAS FOOD HOUSE authentication loaded.");