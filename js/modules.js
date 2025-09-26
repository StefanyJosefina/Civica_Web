document.addEventListener("DOMContentLoaded", () => {
  const pdfButtons = document.querySelectorAll(".btnPdf");
  const quizButtons = document.querySelectorAll(".btnQuiz");

  let modulesUnlocked = JSON.parse(localStorage.getItem("modulesUnlocked")) || [];

  function saveProgress() {
    localStorage.setItem("modulesUnlocked", JSON.stringify(modulesUnlocked));
  }

  function showPopup(message) {
    alert(message);
  }

  quizButtons.forEach((btn) => {
    const moduleId = btn.dataset.module;
    if (modulesUnlocked.includes(moduleId)) {
      btn.disabled = false; 
    }
  });

  pdfButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const pdfPath = btn.dataset.pdf;
      const moduleCard = btn.closest(".module");
      const quizBtn = moduleCard.querySelector(".btnQuiz");
      const moduleId = quizBtn.dataset.module;

      if (pdfPath) {
        window.open(pdfPath, "_blank");
      }

      if (!modulesUnlocked.includes(moduleId)) {
        modulesUnlocked.push(moduleId);
        saveProgress();
      }
      quizBtn.disabled = false;
    });
  });

  quizButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (btn.disabled) {
        e.preventDefault();
        showPopup("⚠️ Baca modul terlebih dahulu sebelum mengerjakan quiz.");
      } else {
        const moduleId = btn.dataset.module;
        window.location.href = `quiz.html?module=${moduleId}`;
      }
    });
  });
});