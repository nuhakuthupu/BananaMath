import { initSounds, playClick, toggleSound, isSoundEnabled } from "./sound.js"; 

initSounds();

// Click sound
const toggleBtn = document.getElementById("soundToggle");
toggleBtn.addEventListener("click", () => {
    const enabled = toggleSound();
    toggleBtn.textContent = enabled ? "🔊 Sound ON" : "🔇 Sound OFF";
});
toggleBtn.textContent = isSoundEnabled() ? "🔊 Sound ON" : "🔇 Sound OFF";

document.querySelectorAll("button, a").forEach(el => {
    el.addEventListener("click", playClick);
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Logout toast
const toastData = JSON.parse(localStorage.getItem("toast"));
if (toastData) {
    Swal.fire({
        toast: true,
        position: "top",
        icon: toastData.icon,
        title: toastData.title,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
    });
    localStorage.removeItem("toast");
}


// Splash screen
document.addEventListener("DOMContentLoaded", () => {
    const animationContainer = document.getElementById("animation-container");
    const leftHalf = document.querySelector(".logo-half.left");
    const rightHalf = document.querySelector(".logo-half.right");
    const loginScreen = document.getElementById("login-screen");

    requestAnimationFrame(() => {
        leftHalf.classList.add("animate-left");
        rightHalf.classList.add("animate-right");
    });

    setTimeout(() => {
        animationContainer.style.display = "none";
        loginScreen.classList.remove("hidden");
        startFirebaseApp();
    }, 1200);
});


// Firebase
function startFirebaseApp() {
    const firebaseConfig = {
        apiKey: "AIzaSyBQ9Bkuo3T_e-e8hVk1d1ZlWU1BavNK_WI",
        authDomain: "banana-game-f6bde.firebaseapp.com",
        projectId: "banana-game-f6bde",
        storageBucket: "banana-game-f6bde.appspot.com",
        messagingSenderId: "648784611095",
        appId: "1:648784611095:web:af9e1fac76a96efb169952"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    const Toast = Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
    });

 
    // Authentication
    async function loginHandler() {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        if (!email || !password) return Toast.fire({ icon: "error", title: "Enter email & password" });

        try {
            await signInWithEmailAndPassword(auth, email, password);
            localStorage.setItem("toast", JSON.stringify({ icon: "success", title: "Login Successful!" }));   // To show toast in home.html
            window.location.href = "home.html";
        } catch (error) {
            Toast.fire({ icon: "error", title: error.message });
        }
    }

    async function registerHandler() {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        if (!email || !password) return Toast.fire({ icon: "error", title: "Enter email & password" });

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            localStorage.setItem("toast", JSON.stringify({ icon: "success", title: "Account Created! You are now logged in." }));
            window.location.href = "home.html";
        } catch (error) {
            Toast.fire({ icon: "error", title: error.message });
        }
    }

    async function googleLoginHandler() {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
             localStorage.setItem("toast", JSON.stringify({ icon: "success", title: "Google Login Successful!" }));
            window.location.href = "home.html";
        } catch (error) {
             Toast.fire({ icon: "error", title: error.message });
        }
    }


    // Button listeners
    document.getElementById("loginBtn").addEventListener("click", loginHandler);
    document.getElementById("registerBtn").addEventListener("click", registerHandler);
    document.getElementById("googleBtn").addEventListener("click", googleLoginHandler);

    // Auth state
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = "home.html";   // Automatically redirect if logged in
        }
    });
}
