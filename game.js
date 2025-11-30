import { saveScore } from "./score.js";

const Toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true
});

let bgMusic;
let level = 1;
let globalTime = 100;
let timerText, levelText, resultText;
let currentSolution = null;
let isGameOver = false;
let puzzleImg;
let timerContainer, timerCircle;
let timerRunning = true;

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    dom: { createContainer: true },
    scene: { preload, create, update },
    transparent: true
};

let game = new Phaser.Game(config);

async function saveScoreToFirebase(timeUsed) {
    try {
        await saveScore(Number(timeUsed));
        window.location.href = "leaderboard.html";
    } catch (err) {
        console.error("Save failed", err);
        Toast.fire({ icon: "error", title: "Failed to save score!" });
    }
}

// Show win/end dialog
async function showEndDialog({ title = '', text = '', icon = 'info', timeUsed = null }) {
    isGameOver = true;
    timerRunning = false;

    if (bgMusic && bgMusic.isPlaying) bgMusic.stop();

    const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,   // Exit to Home
        showDenyButton: true,     // Leaderboard
        confirmButtonText: 'Replay',
        denyButtonText: 'Leaderboard',
        cancelButtonText: 'Exit to Home',
        background: 'rgba(255, 255, 255, 0.95)',
        customClass: {
            popup: 'swal-popup-custom',
            confirmButton: 'swal-replay-btn',
            denyButton: 'swal-leaderboard-btn',
            cancelButton: 'swal-exit-btn',
            actions: 'swal-actions-row'
        },
        buttonsStyling: false
    });

    if (result.isConfirmed) {
        resetGame(game.scene.scenes[0]);
        return;
    }

    if (result.isDenied) {
        if (timeUsed !== null) await saveScoreToFirebase(timeUsed);
        else window.location.href = "leaderboard.html";
        return;
    }

    window.location.href = "home.html";
}

// Show win toast
function showWinToast(timeUsed) {
    showEndDialog({
        title: `🎉 You Wonnn!!!`,
        text: `Time: ${timeUsed}s — What do you want to do next?`,
        icon: 'success',
        timeUsed
    });
}

// Phaser

// Preload assets
function preload() {
    this.load.image('background', 'assets/banana_bg.jpg');
    this.load.image('levelBadge', 'assets/level_bg.png');
    this.load.image('timerBg', 'assets/timer_bg.png');

    this.load.audio('bgMusic', 'assets/bg_music.mp3');
    this.load.audio('clickSound', 'assets/click.mp3');
    this.load.audio('winSound', 'assets/win.mp3');
    this.load.audio('loseSound', 'assets/lose.mp3');
}

function create() {
    const scene = this;

    // Background
    this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background')
        .setDisplaySize(window.innerWidth, window.innerHeight);

    // Level badge
    const badge = this.add.image(190, 60, 'levelBadge').setScale(0.6);
    levelText = this.add.text(badge.x + 45, badge.y + 10, `LEVEL: ${level}`, {
        fontSize: '42px',
        color: '#FFD700',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 6,
        fontFamily: 'Comic Sans MS'
    }).setOrigin(0.5);

    // Timer container
    timerContainer = this.add.container(window.innerWidth - 150, 100);
    const timerWhiteBg = this.add.circle(0, 20, 80, 0xFFFFFF);
    const timerBgImg = this.add.image(0, 20, 'timerBg').setScale(0.55);
    timerCircle = this.add.graphics();
    timerCircle.x = 5;
    timerCircle.y = 20;
    timerText = this.add.text(5, 20, globalTime, {
        fontSize: '60px',
        color: '#ff0000',
        fontStyle: 'bold',
        align: 'center',
        fontFamily: 'Arial'
    }).setOrigin(0.5);
    timerContainer.add([timerWhiteBg, timerBgImg, timerCircle, timerText]);

    // Result text
    resultText = this.add.text(window.innerWidth / 2, window.innerHeight - 140, '', {
        fontSize: '28px',
        color: '#FFF',
        stroke: '#000',
        strokeThickness: 4
    }).setOrigin(0.5);

    // Bg music
    bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.4 });
    bgMusic.play();

    // Keypad & level
    createKeypad(scene);
    startLevel(scene, level);
    drawTimerCircle();
}

function update(time, delta) {
    if (!isGameOver && timerRunning && globalTime > 0) {
        globalTime -= delta / 1000;
        drawTimerCircle();
        timerText.setText(Math.floor(globalTime));

        if (globalTime <= 0) {
            Toast.fire({ icon: 'error', title: "⏳ Time's up!" });
            showEndDialog({
                title: "⏳ Time's up!",
                text: "You ran out of time. Try again or view leaderboard.",
                icon: 'error'
            });
        }
    }
}

function drawTimerCircle() {
    const progress = Math.max(globalTime / 100, 0);
    const angle = Phaser.Math.DegToRad(360 * progress);
    timerCircle.clear();

    let color = 0x008F00;
    if (progress < 0.5) color = 0xffff00;
    if (progress < 0.25) color = 0xff0000;

    timerCircle.lineStyle(10, color, 1);
    timerCircle.beginPath();
    timerCircle.arc(0, 0, 55, -Math.PI / 2, angle - Math.PI / 2, false);
    timerCircle.strokePath();
}

function startLevel(scene, lvl) {
    level = lvl;
    levelText.setText("LEVEL: " + level);
    resultText.setText('');

    if (puzzleImg) puzzleImg.destroy();

    const url = `https://marcconrad.com/uob/banana/api.php?out=json&v=${Date.now()}`;
    fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`)
        .then(r => r.text())
        .then(data => {
            const p = JSON.parse(data);
            currentSolution = Number(p.solution);

            const img = document.createElement("img");
            img.src = p.question;
            img.style.width = "500px";
            img.style.height = "500px";
            img.onload = () => {
                puzzleImg = scene.add.dom(window.innerWidth / 2, window.innerHeight / 2 - 60, img).setAlpha(0);
                scene.tweens.add({ targets: puzzleImg, alpha: 1, duration: 400 });
            };
        })
        .catch(() => resultText.setText("⚠️ Load Failed"));

    drawTimerCircle();
}

function createKeypad(scene) {
    const container = document.createElement("div");
    container.classList.add("keypad-container");

    for (let i = 0; i <= 9; i++) {
        const btn = document.createElement("div");
        btn.classList.add("keypad-number");
        btn.textContent = i;
        btn.onclick = () => handleAnswer(scene, i);
        container.appendChild(btn);
    }

    document.body.appendChild(container);
}

function handleAnswer(scene, num) {
    scene.sound.play('clickSound');

    if (Number(num) === currentSolution) {
        if (level >= 5) {
            const used = Number((100 - globalTime).toFixed(2));
            scene.sound.play('winSound');
            showWinToast(used);
        } else setTimeout(() => startLevel(scene, level + 1), 400);
    } else {
        scene.sound.play('loseSound');
        Toast.fire({ icon: 'error', title: 'Wrong answer!' });
        showEndDialog({
            title: 'Wrong answer!',
            text: 'That answer is incorrect. What would you like to do next?',
            icon: 'error'
        });
    }
}

function resetGame(scene) {
    globalTime = 100;
    level = 1;
    isGameOver = false;
    timerRunning = true;
    startLevel(scene, level);

    if (bgMusic) bgMusic.play();
}

window.addEventListener("resize", () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});