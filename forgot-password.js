/* =========================================
   KAS FOOD HOUSE
   FORGOT PASSWORD SYSTEM
   Firebase Authentication
========================================= */

import {
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { auth } from "./firebase.js";


/* =========================================
   DOM ELEMENTS
========================================= */

const forgotPasswordForm = document.getElementById("forgotPasswordForm");

const forgotEmail = document.getElementById("forgotEmail");

const resetPasswordButton = document.getElementById("resetPasswordButton");

const forgotMessage = document.getElementById("forgotMessage");


/* =========================================
   DISPLAY MESSAGE
========================================= */

function showMessage(message, type = "success") {

    if (!forgotMessage) return;

    forgotMessage.textContent = message;

    forgotMessage.className = `auth-message ${type}`;

    forgotMessage.style.display = "block";

}


/* =========================================
   CLEAR MESSAGE
========================================= */

function clearMessage() {

    if (!forgotMessage) return;

    forgotMessage.textContent = "";

    forgotMessage.className = "auth-message";

    forgotMessage.style.display = "none";

}


/* =========================================
   BUTTON LOADING
========================================= */

function setLoading(isLoading) {

    if (!resetPasswordButton) return;

    resetPasswordButton.disabled = isLoading;

    if (isLoading) {

        resetPasswordButton.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Sending Reset Link...
        `;

    } else {

        resetPasswordButton.innerHTML = `
            <i class="fas fa-paper-plane"></i>
            Send Reset Link
        `;

    }

}


/* =========================================
   VALIDATE EMAIL
========================================= */

function isValidEmail(email) {

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);

}


/* =========================================
   FIREBASE ERROR HANDLING
========================================= */

function getErrorMessage(error) {

    switch (error.code) {

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Check your internet connection.";

        case "auth/unauthorized-continue-uri":
            return "Password reset is not configured correctly. Contact support.";

        case "auth/invalid-continue-uri":
            return "The password reset link configuration is invalid.";

        default:
            return "We could not process your request. Please try again.";
    }

}


/* =========================================
   SEND PASSWORD RESET EMAIL
========================================= */

if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        clearMessage();

        const email = forgotEmail.value.trim();

        // Check empty email

        if (!email) {

            showMessage(
                "Please enter your email address.",
                "error"
            );

            forgotEmail.focus();

            return;

        }

        // Validate email format

        if (!isValidEmail(email)) {

            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            forgotEmail.focus();

            return;

        }

        setLoading(true);

        try {

            // Send Firebase password reset email

            await sendPasswordResetEmail(auth, email);

            showMessage(
                "If an account exists for this email, a password reset link will be sent. Please check your inbox and spam folder.",
                "success"
            );

            forgotPasswordForm.reset();

        } catch (error) {

            console.error("Password Reset Error:", error);

            showMessage(
                getErrorMessage(error),
                "error"
            );

        } finally {

            setLoading(false);

        }

    });

}


/* =========================================
   CLEAR MESSAGE WHEN TYPING
========================================= */

if (forgotEmail) {

    forgotEmail.addEventListener("input", clearMessage);

}


/* =========================================
   INITIALIZE PAGE
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("KAS FOOD HOUSE Forgot Password System Ready.");

});