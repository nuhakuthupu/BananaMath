let bgMusic = null;
let clickSound = null;
let soundEnabled = true;

export function initSounds() {
    clickSound = new Audio("assets/click.mp3");
    clickSound.volume = 0.7;
    clickSound.load();
}

export function playClick() {
    if (!soundEnabled || !clickSound) return;
    const sound = clickSound.cloneNode();
    sound.play().catch(() => {});
}

export function initBgMusic() {
    if (!bgMusic) {
        bgMusic = new Audio("assets/bg_music.mp3");
        bgMusic.loop = true;
        bgMusic.volume = 0.4;
        bgMusic.load();
    }
}

export function enableBackgroundMusic() {
    if (!bgMusic || !soundEnabled) return;
    bgMusic.play().catch(() => {});
}

export function stopBackgroundMusic() {
    if (bgMusic) bgMusic.pause();
}

export function toggleSound() {
    soundEnabled = !soundEnabled;
    return soundEnabled;
}

export function isSoundEnabled() {
    return soundEnabled;
}

export function playWin() {
    if (!soundEnabled) return;
    const s = new Audio("assets/win.mp3");
    s.play().catch(() => {});
}

export function playLose() {
    if (!soundEnabled) return;
    const s = new Audio("assets/lose.mp3");
    s.play().catch(() => {});
}
