import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const SESSION_TIMEOUT = 2 * 60* 1000;

let sessionTimer;

function resetSessionTimer() {
    clearTimeout(sessionTimer);
    sessionTimer = setTimeout(logoutUser, SESSION_TIMEOUT);
}

async function logoutUser() {
    try {
        await signOut(auth);         
    } catch (e) {
        console.log("Error signing out:", e);
    }

    localStorage.removeItem("loggedUser");
    window.location.href = "index.html";
}

["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(event => {
    document.addEventListener(event, resetSessionTimer);
});

resetSessionTimer();
