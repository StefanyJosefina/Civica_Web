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
  let firstCard = null, secondCard = null;
  let moves = 0;
  let pairsFound = 0;

  let timer = 0;
  let timerInterval = null;

  function shuffle(arr){
    for(let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startTimer(){
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timer++;
      timerDisplay.textContent = `Time: ${timer}s`;
    }, 1000);
  }

  function stopTimer(){
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function createBoard(){
    grid.innerHTML = "";
    cards = shuffle([...cardConcepts, ...cardConcepts]);
    hasFlipped = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    moves = 0;
    pairsFound = 0;
    timer = 0;
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

    startTimer();
  }

  function onCardClick(){
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add("flip");

    if (!hasFlipped){
      hasFlipped = true;
      firstCard = this;
      return;
    }

    secondCard = this;
    checkMatch();
  }

  function checkMatch(){
    moves++;
    movesDisplay.textContent = `Moves: ${moves}`;

    const match = firstCard.dataset.name === secondCard.dataset.name;
    if (match) {
      disableCards();
    } else {
      unflipCards();
    }
  }

  function disableCards(){
    firstCard.removeEventListener("click", onCardClick);
    secondCard.removeEventListener("click", onCardClick);
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    pairsFound++;
    resetTurn();

    if (pairsFound === cardConcepts.length){
      endGame();
    }
  }

  function unflipCards(){
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove("flip");
      secondCard.classList.remove("flip");
      resetTurn();
    }, 850);
  }

  function resetTurn(){
    [hasFlipped, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
  }

  function endGame(){
    stopTimer();
    finalMovesSpan.textContent = moves;
    finalTimeSpan.textContent = `${timer}s`;
    resultModal.classList.remove("hidden");
  }

  resetBtn.addEventListener("click", createBoard);

  exitPageBtn.addEventListener("click", () => {
    window.location.href = "games.html";
  });

  closeResultBtn.addEventListener("click", () => {
    resultModal.classList.add("hidden");
  });

  playAgainBtn.addEventListener("click", () => {
    resultModal.classList.add("hidden");
    createBoard();
  });

  exitGameBtn.addEventListener("click", () => {
    window.location.href = "games.html";
  });

  createBoard();
});