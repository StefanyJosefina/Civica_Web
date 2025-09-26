document.addEventListener("DOMContentLoaded", () => {
  const wheelCanvas = document.getElementById("wheelCanvas");
  const spinButton = document.getElementById("spinButton");
  const ctx = wheelCanvas.getContext("2d");

  const questionArea = document.getElementById("questionArea");
  const closeQuestion = document.getElementById("closeQuestion");
  const questionWrap = document.getElementById("questionWrap");
  const optionsContainer = document.getElementById("optionsContainer");
  const submitAnswer = document.getElementById("submitAnswer");
  const timerBar = document.querySelector("#timerBar > div");
  const timerText = document.getElementById("timerText");
  const currentScoreSpan = document.getElementById("currentScore");
  const highScoreSpan = document.getElementById("highScore");

  const segments = [
    { text: "10", color: "#FFD700", points: 10 },
    { text: "20", color: "#FF6347", points: 20 },
    { text: "30", color: "#87CEEB", points: 30 },
    { text: "40", color: "#ADFF2F", points: 40 },
    { text: "50", color: "#DA70D6", points: 50 },
  ];

  const questions = {
    10: [
      { q: "Apa ibu kota Indonesia?", a: "Jakarta", o: ["Jakarta", "Bandung", "Surabaya", "Yogyakarta"] },
    ],
    20: [
      { q: "Apa lambang sila pertama Pancasila?", a: "Bintang", o: ["Bintang", "Rantai", "Pohon Beringin", "Kepala Banteng"] },
    ],
    30: [
      { q: "Kapan Indonesia merdeka?", a: "17 Agustus 1945", o: ["17 Agustus 1945", "28 Oktober 1928", "1 Juni 1945", "10 November 1945"] },
    ],
    40: [
      { q: "Siapa pencipta lagu Indonesia Raya?", a: "W.R. Supratman", o: ["W.R. Supratman", "Ismail Marzuki", "C. Simanjuntak", "H. Mutahar"] },
    ],
    50: [
      { q: "Siapa Bapak Proklamator Indonesia?", a: "Soekarno", o: ["Soekarno", "Mohammad Hatta", "Soeharto", "Joko Widodo"] },
    ],
  };

  let spinning = false;
  let currentScore = 0;
  let highScore = 0;
  let selectedAnswer = null;
  let correctAnswer = null;
  let timerInterval;

  function drawWheel() {
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = centerX - 5;
    const arc = (2 * Math.PI) / segments.length;

    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

    segments.forEach((seg, i) => {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = seg.color;
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.fill();
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#000";
      ctx.font = "bold 18px Arial";
      ctx.fillText(seg.text, radius - 10, 10);
      ctx.restore();
    });
  }

  function spin() {
    if (spinning) return;
    spinning = true;
    spinButton.disabled = true;

    const spinTime = 3000 + Math.random() * 2000;
    const startAngle = 0;
    const endAngle = startAngle + 1440 + Math.random() * 360;

    let start = null;
    function animate(t) {
      if (!start) start = t;
      const progress = (t - start) / spinTime;
      if (progress < 1) {
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentAngle = startAngle + (endAngle - startAngle) * eased;
        wheelCanvas.style.transform = `rotate(${currentAngle}deg)`;
        requestAnimationFrame(animate);
      } else {
        const finalAngle = endAngle % 360;
        wheelCanvas.style.transform = `rotate(${finalAngle}deg)`;
        spinning = false;
        spinButton.disabled = false;
        showQuestion(finalAngle);
      }
    }
    requestAnimationFrame(animate);
  }

  function showQuestion(angle) {
    const arcSize = 360 / segments.length;
    const normalized = (360 - angle + 90) % 360;
    const index = Math.floor(normalized / arcSize);
    const points = segments[index].points;

    const qObj = questions[points][0];
    correctAnswer = qObj.a;
    selectedAnswer = null;

    questionWrap.textContent = qObj.q;
    optionsContainer.innerHTML = "";
    qObj.o.forEach(opt => {
      const div = document.createElement("div");
      div.textContent = opt;
      div.className = "option";
      div.onclick = () => {
        selectedAnswer = opt;
        document.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
        div.classList.add("selected");
      };
      optionsContainer.appendChild(div);
    });

    questionArea.classList.remove("hidden");
    startTimer();
  }

  function startTimer() {
    let timeLeft = 10;
    timerText.textContent = timeLeft + "s";
    timerBar.style.width = "100%";
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      timerText.textContent = timeLeft + "s";
      timerBar.style.width = (timeLeft * 10) + "%";
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  submitAnswer.addEventListener("click", () => {
    clearInterval(timerInterval);
    if (selectedAnswer === correctAnswer) {
      currentScore += 10;
      currentScoreSpan.textContent = currentScore;
      if (currentScore > highScore) {
        highScore = currentScore;
        highScoreSpan.textContent = highScore;
      }
      questionArea.classList.add("hidden");
    } else {
      gameOver();
    }
  });

  function gameOver() {
    alert("Game Over! Skor Anda: " + currentScore);
    currentScore = 0;
    currentScoreSpan.textContent = currentScore;
    questionArea.classList.add("hidden");
  }

  closeQuestion.addEventListener("click", () => {
    questionArea.classList.add("hidden");
    clearInterval(timerInterval);
  });

  spinButton.addEventListener("click", spin);
  drawWheel();
});