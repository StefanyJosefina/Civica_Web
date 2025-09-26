document.addEventListener("DOMContentLoaded", () => {
  const quizTitle = document.getElementById("quizTitle")
  const questionContainer = document.getElementById("questionContainer")
  const submitQuizButton = document.getElementById("submitQuiz")
  const quizResultDiv = document.getElementById("quizResult")

  let currentQuiz = []
  let currentQuestionIndex = 0
  let score = 0

  // Ambil moduleId dari query string
  const urlParams = new URLSearchParams(window.location.search)
  const moduleId = urlParams.get("module")

  // Daftar modul
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

  // 🔥 Quiz data lengkap 1–9
  const quizData = {
    1: [
      { type: "true-false", question: "Pancasila adalah dasar negara Indonesia.", answer: true },
      { type: "drag-drop", question: "Hubungkan sila dengan lambangnya:",
        items: [
          { text: "Ketuhanan Yang Maha Esa", target: "Bintang" },
          { text: "Kemanusiaan yang Adil dan Beradab", target: "Rantai" },
        ],
        options: ["Bintang", "Rantai", "Pohon Beringin"] }
    ],
    2: [
      { type: "true-false", question: "Pancasila bersifat terbuka dan dinamis.", answer: true },
      { type: "drag-drop", question: "Hubungkan konsep dengan maknanya:",
        items: [
          { text: "Ideologi", target: "Sistem nilai" },
          { text: "Filsafat", target: "Hakikat realitas" },
        ],
        options: ["Sistem nilai", "Hakikat realitas", "Landasan hukum"] }
    ],
    3: [
      { type: "true-false", question: "Identitas nasional hanya ditentukan oleh budaya lokal.", answer: false },
      { type: "drag-drop", question: "Hubungkan identitas dengan contohnya:",
        items: [
          { text: "Bahasa Indonesia", target: "Identitas Nasional" },
          { text: "Batik", target: "Budaya Nasional" },
        ],
        options: ["Identitas Nasional", "Budaya Nasional", "Suku Bangsa"] }
    ],
    4: [
      { type: "true-false", question: "Demokrasi Pancasila menekankan musyawarah mufakat.", answer: true },
      { type: "drag-drop", question: "Hubungkan sila dengan prinsip demokrasi:",
        items: [
          { text: "Kerakyatan", target: "Musyawarah" },
          { text: "Keadilan Sosial", target: "Kesejahteraan bersama" },
        ],
        options: ["Musyawarah", "Kesejahteraan bersama", "Individualisme"] }
    ],
    5: [
      { type: "true-false", question: "Negara hukum berarti semua tindakan pemerintah harus berdasarkan hukum.", answer: true },
      { type: "drag-drop", question: "Hubungkan norma dengan contohnya:",
        items: [
          { text: "Norma Hukum", target: "Undang-Undang" },
          { text: "Norma Agama", target: "Kitab Suci" },
        ],
        options: ["Undang-Undang", "Kitab Suci", "Tradisi"] }
    ],
    6: [
      { type: "true-false", question: "Demokrasi berkeadaban hanya berorientasi pada hak, tanpa kewajiban.", answer: false },
      { type: "drag-drop", question: "Hubungkan konsep demokrasi dengan cirinya:",
        items: [
          { text: "Kebebasan", target: "Hak berpendapat" },
          { text: "Keberadaban", target: "Menghargai perbedaan" },
        ],
        options: ["Hak berpendapat", "Menghargai perbedaan", "Otoritarianisme"] }
    ],
    7: [
      { type: "true-false", question: "Setiap warga negara hanya memiliki hak, tanpa kewajiban.", answer: false },
      { type: "drag-drop", question: "Hubungkan hak/kewajiban dengan contohnya:",
        items: [
          { text: "Hak Pendidikan", target: "Sekolah" },
          { text: "Kewajiban Membayar Pajak", target: "Pajak" },
        ],
        options: ["Sekolah", "Pajak", "Liburan"] }
    ],
    8: [
      { type: "true-false", question: "Kepentingan nasional hanya terkait dengan urusan dalam negeri.", answer: false },
      { type: "drag-drop", question: "Hubungkan kepentingan nasional dengan contohnya:",
        items: [
          { text: "Pertahanan", target: "Militer" },
          { text: "Ekonomi", target: "Perdagangan" },
        ],
        options: ["Militer", "Perdagangan", "Olahraga"] }
    ],
    9: [
      { type: "true-false", question: "Negara wajib melindungi hak asasi manusia.", answer: true },
      { type: "drag-drop", question: "Hubungkan HAM dengan contohnya:",
        items: [
          { text: "Hak Hidup", target: "Kebebasan hidup" },
          { text: "Hak Pendidikan", target: "Sekolah" },
        ],
        options: ["Kebebasan hidup", "Sekolah", "Main game"] }
    ]
  }

  if (moduleId && quizData[moduleId]) {
    startQuiz(moduleId)
  } else {
    questionContainer.innerHTML = "<p>Modul tidak valid.</p>"
  }

  function startQuiz(moduleId) {
    currentQuiz = [...quizData[moduleId]]
    currentQuestionIndex = 0
    score = 0

    quizTitle.textContent = `Quiz: ${modules.find((m) => m.id == moduleId).title}`
    submitQuizButton.style.display = "block"
    quizResultDiv.style.display = "none"

    displayQuestion()
  }

  function displayQuestion() {
    if (currentQuestionIndex < currentQuiz.length) {
      const q = currentQuiz[currentQuestionIndex]
      questionContainer.innerHTML = `<p>${currentQuestionIndex + 1}. ${q.question}</p>`

      if (q.type === "true-false") {
        questionContainer.innerHTML += `
          <label><input type="radio" name="answer" value="true"> Benar</label><br>
          <label><input type="radio" name="answer" value="false"> Salah</label>
        `
      } else if (q.type === "drag-drop") {
        const dragDropArea = document.createElement("div")
        dragDropArea.classList.add("drag-drop-area")

        const draggableItems = document.createElement("div")
        draggableItems.classList.add("draggable-items")
        q.options.forEach(opt => {
          const div = document.createElement("div")
          div.classList.add("draggable-item")
          div.textContent = opt
          div.draggable = true
          div.dataset.value = opt
          draggableItems.appendChild(div)
        })

        const dropTargets = document.createElement("div")
        dropTargets.classList.add("drop-targets")
        q.items.forEach(it => {
          const target = document.createElement("div")
          target.classList.add("drop-target")
          target.textContent = it.text
          target.dataset.target = it.target
          dropTargets.appendChild(target)
        })

        dragDropArea.appendChild(draggableItems)
        dragDropArea.appendChild(dropTargets)
        questionContainer.appendChild(dragDropArea)

        // drag & drop event
        let dragged = null
        draggableItems.querySelectorAll(".draggable-item").forEach(item => {
          item.addEventListener("dragstart", e => { dragged = e.target })
        })
        dropTargets.querySelectorAll(".drop-target").forEach(target => {
          target.addEventListener("dragover", e => e.preventDefault())
          target.addEventListener("drop", e => {
            e.preventDefault()
            if (dragged) {
              target.textContent = `${target.dataset.target} ← ${dragged.textContent}`
              target.dataset.droppedValue = dragged.dataset.value
              dragged.remove()
              dragged = null
            }
          })
        })
      }

      submitQuizButton.textContent =
        currentQuestionIndex === currentQuiz.length - 1 ? "Selesai" : "Next"
    } else {
      showResult()
    }
  }

  submitQuizButton.addEventListener("click", () => {
    checkAnswer()
    currentQuestionIndex++
    if (currentQuestionIndex < currentQuiz.length) {
      displayQuestion()
    } else {
      showResult()
    }
  })

  function checkAnswer() {
    const q = currentQuiz[currentQuestionIndex]
    let correct = false

    if (q.type === "true-false") {
      const selected = document.querySelector('input[name="answer"]:checked')
      if (selected) correct = (selected.value === "true") === q.answer
    } else if (q.type === "drag-drop") {
      let right = 0
      questionContainer.querySelectorAll(".drop-target").forEach(target => {
        if (target.dataset.droppedValue === target.dataset.target) right++
      })
      correct = right === q.items.length
    }

    if (correct) {
      score++
      alert("Jawaban benar!")
    } else {
      alert("Jawaban salah!")
    }
  }

  function showResult() {
    const finalScore = (score / currentQuiz.length) * 100
    quizResultDiv.style.display = "block"
    quizResultDiv.innerHTML = `
      <h3>Quiz Selesai!</h3>
      <p>Skor Anda: ${score} dari ${currentQuiz.length}</p>
      <p>Persentase: ${finalScore.toFixed(2)}%</p>
    `
    setTimeout(() => { window.location.href = "modules.html" }, 3000)
  }
})