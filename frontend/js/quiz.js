document.addEventListener("DOMContentLoaded", async () => {
  const quizTitle = document.getElementById("quizTitle")
  const questionContainer = document.getElementById("questionContainer")
  const submitQuizButton = document.getElementById("submitQuiz")
  const quizResultDiv = document.getElementById("quizResult")

  let currentQuiz = []
  let currentQuestionIndex = 0
  let score = 0
  let userAnswers = []

  const urlParams = new URLSearchParams(window.location.search)
  const moduleId = parseInt(urlParams.get("module"))

  const modules = [
    { id: 1, title: "Filsafat Pancasila" },
    { id: 2, title: "Pancasila sebagai Filsafat dan Ideologi Negara" },
    { id: 3, title: "Identitas dan Integrasi Nasional" },
    { id: 4, title: "Demokrasi Pancasila" },
    { id: 5, title: "Nilai & Norma dalam Kerangka Negara Hukum" },
    { id: 6, title: "Demokrasi Berkeadaban" },
    { id: 7, title: "Hak dan Kewajiban Warga Negara" },
    { id: 8, title: "Kepentingan Nasional" },
    { id: 9, title: "Hak & Kewajiban Negara serta HAM" },
  ]

  const quizData = {
    1: [
      { type: "true-false", question: "Pancasila adalah dasar negara Indonesia.", answer: true },
      { type: "multiple-choice", question: "Berapa jumlah sila dalam Pancasila?", 
        options: ["3", "4", "5", "6"], answer: "5" },
      { type: "true-false", question: "Pancasila pertama kali dirumuskan oleh Ir. Soekarno pada 1 Juni 1945.", answer: true },
      { type: "multiple-choice", question: "Sila pertama Pancasila adalah?", 
        options: ["Kemanusiaan yang Adil dan Beradab", "Ketuhanan Yang Maha Esa", "Persatuan Indonesia", "Keadilan Sosial"], 
        answer: "Ketuhanan Yang Maha Esa" }
    ],
    2: [
      { type: "true-false", question: "Pancasila bersifat terbuka dan dinamis.", answer: true },
      { type: "multiple-choice", question: "Pancasila sebagai ideologi negara berfungsi sebagai?", 
        options: ["Sistem nilai", "Landasan operasional", "Pedoman hidup", "Semua benar"], 
        answer: "Semua benar" },
      { type: "true-false", question: "Pancasila sebagai filsafat berarti membahas tentang hakikat realitas.", answer: true },
      { type: "multiple-choice", question: "Yang bukan karakteristik Pancasila sebagai ideologi terbuka adalah?", 
        options: ["Dinamis", "Kaku dan tertutup", "Reformatif", "Antisipasif"], 
        answer: "Kaku dan tertutup" }
    ],
    3: [
      { type: "true-false", question: "Identitas nasional hanya ditentukan oleh budaya lokal.", answer: false },
      { type: "multiple-choice", question: "Bahasa Indonesia sebagai bahasa nasional merupakan bagian dari?", 
        options: ["Identitas nasional", "Identitas daerah", "Identitas internasional", "Identitas lokal"], 
        answer: "Identitas nasional" },
      { type: "true-false", question: "Integrasi nasional adalah upaya menyatukan berbagai perbedaan dalam masyarakat.", answer: true },
      { type: "multiple-choice", question: "Faktor yang dapat menghambat integrasi nasional adalah?", 
        options: ["Bhinneka Tunggal Ika", "Sikap primordialisme", "Gotong royong", "Musyawarah"], 
        answer: "Sikap primordialisme" }
    ],
    4: [
      { type: "true-false", question: "Demokrasi Pancasila menekankan musyawarah mufakat.", answer: true },
      { type: "multiple-choice", question: "Prinsip utama Demokrasi Pancasila adalah?", 
        options: ["Voting mayoritas", "Musyawarah untuk mufakat", "Keputusan sepihak", "Otokrasi"], 
        answer: "Musyawarah untuk mufakat" },
      { type: "true-false", question: "Demokrasi Pancasila mengutamakan kepentingan individu di atas kepentingan bersama.", answer: false },
      { type: "multiple-choice", question: "Sila keberapa yang menjadi dasar Demokrasi Pancasila?", 
        options: ["Sila ke-1", "Sila ke-2", "Sila ke-4", "Sila ke-5"], 
        answer: "Sila ke-4" }
    ],
    5: [
      { type: "true-false", question: "Negara hukum berarti semua tindakan pemerintah harus berdasarkan hukum.", answer: true },
      { type: "multiple-choice", question: "Indonesia sebagai negara hukum tertuang dalam UUD 1945 Pasal?", 
        options: ["Pasal 1 ayat (2)", "Pasal 1 ayat (3)", "Pasal 2 ayat (1)", "Pasal 3 ayat (1)"], 
        answer: "Pasal 1 ayat (3)" },
      { type: "true-false", question: "Norma hukum memiliki sanksi yang tegas dan memaksa.", answer: true },
      { type: "multiple-choice", question: "Hierarki norma hukum tertinggi di Indonesia adalah?", 
        options: ["UU", "UUD 1945", "Peraturan Presiden", "Peraturan Daerah"], 
        answer: "UUD 1945" }
    ],
    6: [
      { type: "true-false", question: "Demokrasi berkeadaban hanya berorientasi pada hak, tanpa kewajiban.", answer: false },
      { type: "multiple-choice", question: "Demokrasi berkeadaban menekankan pada?", 
        options: ["Kebebasan tanpa batas", "Hak dan kewajiban seimbang", "Individualisme", "Anarkisme"], 
        answer: "Hak dan kewajiban seimbang" },
      { type: "true-false", question: "Menghargai perbedaan pendapat adalah ciri demokrasi berkeadaban.", answer: true },
      { type: "multiple-choice", question: "Yang bukan nilai dalam demokrasi berkeadaban adalah?", 
        options: ["Toleransi", "Menghormati", "Diskriminasi", "Dialog"], 
        answer: "Diskriminasi" }
    ],
    7: [
      { type: "true-false", question: "Setiap warga negara hanya memiliki hak, tanpa kewajiban.", answer: false },
      { type: "multiple-choice", question: "Hak mendapat pendidikan tercantum dalam UUD 1945 Pasal?", 
        options: ["Pasal 28", "Pasal 29", "Pasal 30", "Pasal 31"], 
        answer: "Pasal 31" },
      { type: "true-false", question: "Membayar pajak adalah kewajiban warga negara.", answer: true },
      { type: "multiple-choice", question: "Yang bukan kewajiban warga negara adalah?", 
        options: ["Membela negara", "Menaati hukum", "Membayar pajak", "Mendapat pekerjaan"], 
        answer: "Mendapat pekerjaan" }
    ],
    8: [
      { type: "true-false", question: "Kepentingan nasional hanya terkait dengan urusan dalam negeri.", answer: false },
      { type: "multiple-choice", question: "Kepentingan nasional Indonesia mencakup?", 
        options: ["Pertahanan", "Ekonomi", "Politik luar negeri", "Semua benar"], 
        answer: "Semua benar" },
      { type: "true-false", question: "Menjaga kedaulatan negara adalah bagian dari kepentingan nasional.", answer: true },
      { type: "multiple-choice", question: "Wawasan Nusantara adalah konsep kepentingan nasional dalam bidang?", 
        options: ["Ekonomi", "Geopolitik", "Budaya", "Sosial"], 
        answer: "Geopolitik" }
    ],
    9: [
      { type: "true-false", question: "Negara wajib melindungi hak asasi manusia.", answer: true },
      { type: "multiple-choice", question: "HAM di Indonesia diatur dalam UUD 1945 Bab?", 
        options: ["Bab X", "Bab XA", "Bab XI", "Bab XII"], 
        answer: "Bab XA" },
      { type: "true-false", question: "Hak hidup adalah hak asasi yang tidak dapat dikurangi dalam keadaan apapun.", answer: true },
      { type: "multiple-choice", question: "Komisi Nasional Hak Asasi Manusia disingkat?", 
        options: ["KOMNAS", "KOMNASHAM", "Komnas HAM", "KNA"], 
        answer: "Komnas HAM" }
    ]
  }

  if (moduleId && quizData[moduleId]) {
    startQuiz(moduleId)
  } else {
    questionContainer.innerHTML = "<p>Modul tidak valid.</p>"
    submitQuizButton.style.display = "none"
  }

  function startQuiz(moduleId) {
    currentQuiz = [...quizData[moduleId]]
    currentQuestionIndex = 0
    score = 0
    userAnswers = []

    const moduleInfo = modules.find((m) => m.id === moduleId)
    quizTitle.textContent = `Quiz: ${moduleInfo.title}`
    submitQuizButton.style.display = "block"
    quizResultDiv.style.display = "none"

    displayQuestion()
  }

  function displayQuestion() {
    if (currentQuestionIndex < currentQuiz.length) {
      const q = currentQuiz[currentQuestionIndex]
      questionContainer.innerHTML = `
        <div class="question-header">
          <span class="question-number">Pertanyaan ${currentQuestionIndex + 1} dari ${currentQuiz.length}</span>
          <h3 class="question-text">${q.question}</h3>
        </div>
      `

      if (q.type === "true-false") {
        const optionsDiv = document.createElement("div")
        optionsDiv.className = "options-container"
        optionsDiv.innerHTML = `
          <label class="option-label">
            <input type="radio" name="answer" value="true">
            <span>Benar</span>
          </label>
          <label class="option-label">
            <input type="radio" name="answer" value="false">
            <span>Salah</span>
          </label>
        `
        questionContainer.appendChild(optionsDiv)
      } else if (q.type === "multiple-choice") {
        const optionsDiv = document.createElement("div")
        optionsDiv.className = "options-container"
        q.options.forEach(opt => {
          const label = document.createElement("label")
          label.className = "option-label"
          label.innerHTML = `
            <input type="radio" name="answer" value="${opt}">
            <span>${opt}</span>
          `
          optionsDiv.appendChild(label)
        })
        questionContainer.appendChild(optionsDiv)
      }

      submitQuizButton.textContent = currentQuestionIndex === currentQuiz.length - 1 ? "Selesai Quiz" : "Soal Berikutnya"
    } else {
      showResult()
    }
  }

  submitQuizButton.addEventListener("click", () => {
    const answer = checkAnswer()
    if (answer !== null) {
      userAnswers.push(answer)
      currentQuestionIndex++
      displayQuestion()
    } else {
      showNotification("Silakan pilih jawaban terlebih dahulu!", "error")
    }
  })

  function checkAnswer() {
    const q = currentQuiz[currentQuestionIndex]
    let correct = false
    let selectedAnswer = null

    if (q.type === "true-false" || q.type === "multiple-choice") {
      const selected = document.querySelector('input[name="answer"]:checked')
      if (!selected) return null
      
      selectedAnswer = selected.value
      
      if (q.type === "true-false") {
        correct = (selected.value === "true") === q.answer
      } else {
        correct = selected.value === q.answer
      }
    }

    if (correct) {
      score++
      showNotification("✓ Jawaban Benar!", "success")
    } else {
      showNotification("✗ Jawaban Salah. Jawaban yang benar: " + q.answer, "error")
    }

    return { question: q.question, userAnswer: selectedAnswer, correctAnswer: q.answer, isCorrect: correct }
  }

  async function showResult() {
  const finalScore = (score / currentQuiz.length) * 100;
  const moduleInfo = modules.find((m) => m.id === moduleId);

  quizResultDiv.style.display = "block";
  quizResultDiv.innerHTML = `
    <div class="result-container">
      <h3>Quiz Selesai!</h3>
      <div class="score-display">
        <p class="score-number">${score}/${currentQuiz.length}</p>
        <p class="score-percentage">${finalScore.toFixed(0)}%</p>
      </div>
      <p class="result-message">
        ${finalScore >= 70
          ? "✓ Selamat! Anda lulus quiz ini."
          : "✗ Anda belum lulus. Coba lagi untuk hasil lebih baik."}
      </p>
      <p class="saving-message">Menyimpan hasil...</p>
    </div>
  `;

  submitQuizButton.style.display = "none";
  questionContainer.style.display = "none";

  try {
    const progressData = sessionStorage.getItem("civica_module_progress");
    let moduleProgress = progressData ? JSON.parse(progressData) : {};

    if (!moduleProgress[moduleId]) {
      moduleProgress[moduleId] = {};
    }

    moduleProgress[moduleId].quizCompleted = true;
    moduleProgress[moduleId].quizScore = finalScore.toFixed(0);
    sessionStorage.setItem(
      "civica_module_progress",
      JSON.stringify(moduleProgress)
    );

    await syncQuizResultToServer(finalScore);

    showNotification("Hasil quiz berhasil disimpan!", "success");
    quizResultDiv.querySelector(".saving-message").innerHTML =
      "Hasil berhasil disimpan!";

    setTimeout(() => {
      window.location.href = "modules.html";
    }, 3000);
  } catch (error) {
    console.error("Error saving quiz result:", error);
    showNotification("Terjadi kesalahan saat menyimpan hasil.", "error");

    setTimeout(() => {
      window.location.href = "modules.html";
    }, 3000);
  }
}

async function syncQuizResultToServer(score) {
  try {
    const res = await apiFetch("/stats");
    const stats = await res.json();

    const progressData = sessionStorage.getItem("civica_module_progress");
    let moduleProgress = progressData ? JSON.parse(progressData) : {};
    const quizScores = Object.values(moduleProgress)
      .filter((m) => m.quizCompleted)
      .map((m) => Number(m.quizScore));

    const avgQuizScore = quizScores.length
      ? (quizScores.reduce((a, b) => a + b, 0) / quizScores.length).toFixed(1)
      : score;

    await apiFetch("/stats", {
      method: "PUT",
      body: new URLSearchParams({
        avgQuizScore: avgQuizScore,
      }),
    });

    console.log(
      `Skor quiz dikirim ke server: ${score}% (rata-rata ${avgQuizScore}%)`
    );
  } catch (error) {
    console.error("Gagal mengirim hasil quiz ke server:", error);
  }
}

  function showNotification(message, type) {
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      background: ${type === 'success' ? '#4caf50' : '#f44336'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease'
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }
})

const style = document.createElement('style')
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  .question-header {
    margin-bottom: 25px;
  }

  .question-number {
    display: inline-block;
    background: #e63900;
    color: white;
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 15px;
  }

  .question-text {
    font-size: 1.3rem;
    color: #2c3e50;
    line-height: 1.6;
    margin-top: 10px;
  }

  .options-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
  }

  .option-label {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .option-label:hover {
    border-color: #e63900;
    background: #fff5f0;
    transform: translateX(5px);
  }

  .option-label input[type="radio"] {
    margin-right: 12px;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  .option-label span {
    font-size: 1.05rem;
    color: #2c3e50;
  }

  .result-container {
    text-align: center;
    padding: 30px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }

  .result-container h3 {
    font-size: 2rem;
    color: #2c3e50;
    margin-bottom: 20px;
  }

  .score-display {
    margin: 30px 0;
  }

  .score-number {
    font-size: 3rem;
    font-weight: bold;
    color: #e63900;
    margin-bottom: 10px;
  }

  .score-percentage {
    font-size: 1.5rem;
    color: #7f8c8d;
  }

  .result-message {
    font-size: 1.2rem;
    color: #2c3e50;
    margin: 20px 0;
  }

  .saving-message {
    font-size: 1rem;
    color: #7f8c8d;
    margin-top: 15px;
  }
`
document.head.appendChild(style)