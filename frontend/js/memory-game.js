document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("memoryGameGrid");
  const movesDisplay = document.getElementById("moves");
  const timerDisplay = document.getElementById("timer");
  const resetBtn = document.getElementById("resetGameBtn");
  const exitPageBtn = document.getElementById("exitPageBtn");
  const resultModal = document.getElementById("gameResultModal");
  const closeResultBtn = document.getElementById("closeResult");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const exitGameBtn = document.getElementById("exitGameBtn");
  const finalMovesSpan = document.getElementById("finalMoves");
  const finalTimeSpan = document.getElementById("finalTime");

  const bgMusic = new Audio("../assets/game-music.mp3");
  const flipSound = new Audio("../assets/flip.mp3");
  const winSound = new Audio("../assets/game-over.mp3");

  bgMusic.loop = true;
  bgMusic.volume = 0.8;
  flipSound.volume = 1.0;
  winSound.volume = 1.0;

  const enableAudio = () => {
    bgMusic.play().catch(() => {});
    document.removeEventListener("click", enableAudio);
  };
  document.addEventListener("click", enableAudio);

  const baseURL = "http://127.0.0.1:8000"; // ubah ke Railway kalau sudah deploy
  const token = localStorage.getItem("token");

  async function apiFetch(path, data) {
    try {
      const res = await fetch(baseURL + path, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
        body: new URLSearchParams(data),
      });
      return res;
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  const cardConcepts = [
    { name: "Pancasila" },
    { name: "Bintang" },
    { name: "Rantai" },
    { name: "Pohon Beringin" },
    { name: "Kepala Banteng" },
    { name: "Padi Kapas" },
    { name: "UUD 1945" },
    { name: "Bhinneka Tunggal Ika" },
  ];

  let cards = [];
  let hasFlipped = false;
  let lockBoard = false;
  let firstCard = null;
  let secondCard = null;
  let moves = 0;
  let pairsFound = 0;
  let timer = 0;
  let timerInterval = null;
  let gameStarted = false;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timer++;
      timerDisplay.textContent = `Time: ${timer}s`;
      saveProgress();
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function createBoard() {
    grid.innerHTML = "";
    cards = shuffle([...cardConcepts, ...cardConcepts]);
    hasFlipped = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    moves = 0;
    pairsFound = 0;
    timer = 0;
    gameStarted = false;
    movesDisplay.textContent = `Moves: ${moves}`;
    timerDisplay.textContent = `Time: ${timer}s`;

    cards.forEach(({ name }) => {
      const el = document.createElement("div");
      el.className = "memory-card";
      el.dataset.name = name;
      el.innerHTML = `
        <div class="front-face">${name}</div>
        <div class="back-face">PKWN</div>
      `;
      el.addEventListener("click", onCardClick);
      grid.appendChild(el);
    });

    if (bgMusic.paused) bgMusic.play().catch(() => {});
  }

  function onCardClick() {
    if (lockBoard) return;
    if (this === firstCard) return;
    if (!gameStarted) {
      gameStarted = true;
      startTimer();
    }

    flipSound.currentTime = 0;
    flipSound.play();
    this.classList.add("flip");

    if (!hasFlipped) {
      hasFlipped = true;
      firstCard = this;
      return;
    }

    secondCard = this;
    checkMatch();
  }

  function checkMatch() {
    moves++;
    movesDisplay.textContent = `Moves: ${moves}`;
    saveProgress();
    const match = firstCard.dataset.name === secondCard.dataset.name;
    if (match) disableCards();
    else unflipCards();
  }

  function disableCards() {
    firstCard.removeEventListener("click", onCardClick);
    secondCard.removeEventListener("click", onCardClick);
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    pairsFound++;
    saveProgress();
    resetTurn();
    if (pairsFound === cardConcepts.length) endGame();
  }

  function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove("flip");
      secondCard.classList.remove("flip");
      resetTurn();
    }, 800);
  }

  function resetTurn() {
    [hasFlipped, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
  }

  async function saveProgress() {
    if (!token) return;
    await apiFetch("/games/memory-progress", {
      moves: moves,
      time: timer,
      pairsFound: pairsFound,
      isCompleted: pairsFound === cardConcepts.length ? "true" : "false",
    });
  }

  async function endGame() {
    stopTimer();
    finalMovesSpan.textContent = moves;
    finalTimeSpan.textContent = `${timer}s`;
    resultModal.classList.remove("hidden");
    bgMusic.pause();
    bgMusic.currentTime = 0;
    winSound.currentTime = 0;
    winSound.play();

    if (!token) return;
    try {
      await apiFetch("/games/memory-complete", {
        moves: moves,
        time: timer,
        status: "completed",
      });

      const item = `Memory Game - Selesai dalam ${moves} moves (${timer}s)`;
      await apiFetch("/stats/gamification", { item });

      const score = Math.max(0, pairsFound * 100 - moves - Math.floor(timer / 2));
      await apiFetch("/games/highscore", { score });
    } catch (e) {
      console.error("Gagal menyimpan hasil:", e);
    }
  }

  resetBtn.addEventListener("click", () => {
    stopTimer();
    createBoard();
    bgMusic.currentTime = 0;
    bgMusic.play();
  });

  exitPageBtn.addEventListener("click", () => {
    bgMusic.pause();
    window.location.href = "games.html";
  });

  closeResultBtn.addEventListener("click", () => {
    resultModal.classList.add("hidden");
  });

  playAgainBtn.addEventListener("click", () => {
    resultModal.classList.add("hidden");
    createBoard();
    bgMusic.currentTime = 0;
    bgMusic.play();
  });

  exitGameBtn.addEventListener("click", () => {
    bgMusic.pause();
    window.location.href = "games.html";
  });

  createBoard();
});