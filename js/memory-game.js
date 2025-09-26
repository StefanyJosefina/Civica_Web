document.addEventListener("DOMContentLoaded", () => {
  const memoryGameGrid = document.getElementById("memoryGameGrid")
  const movesDisplay = document.getElementById("moves")
  const timerDisplay = document.getElementById("timer")
  const resetGameBtn = document.getElementById("resetGameBtn")
  const gameResultDiv = document.getElementById("gameResult")
  const finalMovesSpan = document.getElementById("finalMoves")
  const finalTimeSpan = document.getElementById("finalTime")

  const cardConcepts = [
    { name: "Pancasila", image: "/placeholder.svg?key=5ulkg" },
    { name: "Bintang", image: "/placeholder.svg?key=ikzrv" },
    { name: "Rantai", image: "/placeholder.svg?key=jldst" },
    { name: "Pohon Beringin", image: "/placeholder.svg?key=xfrnn" },
    { name: "Kepala Banteng", image: "/placeholder.svg?key=ej8ex" },
    { name: "Padi Kapas", image: "/placeholder.svg?key=lwxvc" },
    { name: "UUD 1945", image: "/placeholder.svg?key=wwn19" },
    { name: "Bhinneka Tunggal Ika", image: "/placeholder.svg?key=8i72q" },
  ]

  let cards = []
  let hasFlippedCard = false
  let lockBoard = false
  let firstCard, secondCard
  let moves = 0
  let matchedPairs = 0
  let timer = 0
  let timerInterval

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  function createBoard() {
    memoryGameGrid.innerHTML = ""
    cards = shuffle([...cardConcepts, ...cardConcepts]) 
    matchedPairs = 0
    moves = 0
    movesDisplay.textContent = `Moves: ${moves}`
    timer = 0
    timerDisplay.textContent = `Time: ${timer}s`
    clearInterval(timerInterval)
    gameResultDiv.style.display = "none"

    cards.forEach((card, index) => {
      const cardElement = document.createElement("div")
      cardElement.classList.add("memory-card")
      cardElement.dataset.name = card.name
      cardElement.innerHTML = `
                <div class="front-face">${card.name}</div>
                <div class="back-face">PKWN</div>
            `
      cardElement.addEventListener("click", flipCard)
      memoryGameGrid.appendChild(cardElement)
    })

    startTimer()
  }

  function flipCard() {
    if (lockBoard) return
    if (this === firstCard) return

    this.classList.add("flip")

    if (!hasFlippedCard) {
      hasFlippedCard = true
      firstCard = this
      return
    }

    secondCard = this
    checkForMatch()
  }

  function checkForMatch() {
    moves++
    movesDisplay.textContent = `Moves: ${moves}`
    const isMatch = firstCard.dataset.name === secondCard.dataset.name

    isMatch ? disableCards() : unflipCards()
  }

  function disableCards() {
    firstCard.removeEventListener("click", flipCard)
    secondCard.removeEventListener("click", flipCard)
    firstCard.classList.add("matched")
    secondCard.classList.add("matched")
    matchedPairs++
    resetBoard()

    if (matchedPairs === cardConcepts.length) {
      endGame()
    }
  }

  function unflipCards() {
    lockBoard = true
    setTimeout(() => {
      firstCard.classList.remove("flip")
      secondCard.classList.remove("flip")
      resetBoard()
    }, 1000)
  }

  function resetBoard() {
    ;[hasFlippedCard, lockBoard] = [false, false]
    ;[firstCard, secondCard] = [null, null]
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      timer++
      timerDisplay.textContent = `Time: ${timer}s`
    }, 1000)
  }

  function endGame() {
    clearInterval(timerInterval)
    gameResultDiv.style.display = "block"
    finalMovesSpan.textContent = moves
    finalTimeSpan.textContent = `${timer}s`

    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    if (currentUser) {
      currentUser.progress.gamesPlayed = (currentUser.progress.gamesPlayed || 0) + 1
      if (currentUser.progress.highestGameScore === "N/A" || moves < currentUser.progress.highestGameScore) {
        currentUser.progress.highestGameScore = moves
      }
      if (moves <= 20 && !currentUser.progress.gamificationCollection.includes("Piala Memori Juara")) {
        currentUser.progress.gamificationCollection.push("Piala Memori Juara")
        alert("Selamat! Anda mendapatkan Piala Memori Juara!")
      }
      localStorage.setItem("currentUser", JSON.stringify(currentUser))
      updateAllUsers(currentUser)
    }
  }

  resetGameBtn.addEventListener("click", createBoard)

  function updateAllUsers(updatedUser) {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const userIndex = users.findIndex((u) => u.email === updatedUser.email)
    if (userIndex > -1) {
      users[userIndex] = updatedUser
      localStorage.setItem("users", JSON.stringify(users))
    }
  }

  createBoard() 
})
