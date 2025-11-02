const modules = [
  { id: 1, title: "Filsafat Pancasila", pdf: "../assets/2. Filsafat Pancasila.pptx.pdf" },
  { id: 2, title: "Pancasila sebagai Filsafat dan Ideologi Negara", pdf: "../assets/3. Pancasila sebagai Filsafat dan Ideologi Negara.pptx.pdf" },
  { id: 3, title: "Identitas dan Integrasi Nasional", pdf: "../assets/4. Identitas dan Integrasi Nasional.pptx.pdf" },
  { id: 4, title: "Demokrasi Pancasila", pdf: "../assets/5. Demokrasi Pancasila.pdf" },
  { id: 5, title: "Nilai & Norma dalam Kerangka Negara Hukum", pdf: "../assets/5. Nilai & Norma dalam Kerangka Negara Hukum.pptx.pdf" },
  { id: 6, title: "Demokrasi Berkeadaban", pdf: "../assets/6.1. Demokrasi-Berkeadaban.pptx.pdf" },
  { id: 7, title: "Hak dan Kewajiban Warganegara", pdf: "../assets/6.2.Hak dan Kewajiban Warganegara .pptx.pdf" },
  { id: 8, title: "Kepentingan Nasional", pdf: "../assets/7.1.Kepentingan Nasional.pptx.pdf" },
  { id: 9, title: "Hak dan Kewajiban Negara dan Warga Negara serta Hak Asasi Manusia", pdf: "../assets/7.2.Hak dan Kewajiban Negara dan Warga Negara serta Hak Asasi Manusia .pptx.pdf" }
];

const API_BASE_URL = "https://civicaweb-production.up.railway.app";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

let moduleProgress = {};

function loadProgress() {
  try {
    const saved = sessionStorage.getItem('civica_module_progress');
    if (saved) {
      moduleProgress = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load progress:', e);
    moduleProgress = {};
  }
}

function saveProgress() {
  try {
    sessionStorage.setItem('civica_module_progress', JSON.stringify(moduleProgress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

function initializeProgress() {
  modules.forEach(module => {
    if (!moduleProgress[module.id]) {
      moduleProgress[module.id] = {
        read: false,
        quizCompleted: false,
        quizScore: 0
      };
    }
  });
  saveProgress();
}

function isModuleUnlocked(moduleId) {
  if (moduleId === 1) return true;
  
  const prevModule = moduleProgress[moduleId - 1];
  return prevModule && prevModule.read;
}

function isQuizUnlocked(moduleId) {
  const currentModule = moduleProgress[moduleId];
  return currentModule && currentModule.read;
}

function renderModules() {
  const container = document.getElementById('modulesContainer');
  container.innerHTML = '';

  modules.forEach(module => {
    const isUnlocked = isModuleUnlocked(module.id);
    const quizUnlocked = isQuizUnlocked(module.id);
    const progress = moduleProgress[module.id] || {};

    const moduleCard = document.createElement('div');
    moduleCard.className = 'module-card';
    
    let statusBadges = '';
    if (progress.read) {
      statusBadges += '<span class="status-badge completed">✓ Sudah Dibaca</span>';
    }
    if (progress.quizCompleted) {
      statusBadges += `<span class="status-badge completed">✓ Quiz: ${progress.quizScore}%</span>`;
    }
    if (!isUnlocked) {
      statusBadges += '<span class="status-badge locked">🔒 Terkunci</span>';
    }

    moduleCard.innerHTML = `
      <div class="module-header">
        <span class="module-number">Modul ${module.id}</span>
        <h2>${module.title}</h2>
        <div class="module-status">
          ${statusBadges}
        </div>
      </div>
      <div class="module-actions">
        <button class="btn btn-read" 
                data-module-id="${module.id}" 
                data-pdf="${module.pdf}"
                ${!isUnlocked ? 'disabled' : ''}>
          📖 Baca Modul
        </button>
        <button class="btn btn-quiz" 
                data-module-id="${module.id}"
                ${!quizUnlocked ? 'disabled' : ''}>
          ${quizUnlocked ? '📝 Mulai Quiz' : '🔒 Quiz'}
        </button>
      </div>
    `;

    container.appendChild(moduleCard);
  });

  document.querySelectorAll('.btn-read').forEach(btn => {
    btn.addEventListener('click', handleReadModule);
  });

  document.querySelectorAll('.btn-quiz').forEach(btn => {
    btn.addEventListener('click', handleStartQuiz);
  });
}

function handleReadModule(e) {
  const moduleId = parseInt(e.currentTarget.dataset.moduleId);
  const pdfPath = e.currentTarget.dataset.pdf;

  if (!isModuleUnlocked(moduleId)) {
    showPopup('Modul ini masih terkunci. Selesaikan modul sebelumnya terlebih dahulu.');
    return;
  }

  moduleProgress[moduleId].read = true;
  saveProgress();

  syncProgressToServer();

  window.location.href = `module-viewer.html?module=${moduleId}&pdf=${encodeURIComponent(pdfPath)}`;
}

async function syncProgressToServer() {
  if (!token) return;

  try {
    const completedCount = Object.values(moduleProgress)
      .filter(m => m.read)
      .length;

    const quizScores = Object.values(moduleProgress)
      .filter(m => m.quizCompleted)
      .map(m => m.quizScore);

    const avgQuizScore = quizScores.length
      ? (quizScores.reduce((a, b) => a + b, 0) / quizScores.length).toFixed(1)
      : 0;

    await fetch(`${API_BASE_URL}/stats`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        modulesCompleted: completedCount,
        avgQuizScore: avgQuizScore,
      }),
    });

    console.log(`Progress dikirim ke server: ${completedCount} modul, rata-rata ${avgQuizScore}%`);
  } catch (err) {
    console.error("Gagal sinkron ke server:", err);
  }
}

function handleStartQuiz(e) {
  const moduleId = parseInt(e.currentTarget.dataset.moduleId);

  if (!isQuizUnlocked(moduleId)) {
    showPopup('Baca modul terlebih dahulu sebelum mengerjakan quiz.');
    return;
  }

  window.location.href = `quiz.html?module=${moduleId}`;
}

function showPopup(message) {
  const popup = document.getElementById('popup');
  const popupMessage = document.getElementById('popup-message');
  popupMessage.textContent = message;
  popup.classList.remove('hidden');
}

document.getElementById('closePopup').addEventListener('click', () => {
  document.getElementById('popup').classList.add('hidden');
});

document.getElementById('logoutButton').addEventListener('click', (e) => {
  e.preventDefault();
  showLogoutConfirmation();
});

function showLogoutConfirmation() {
  const overlay = document.createElement('div');
  overlay.className = 'logout-overlay';
  overlay.innerHTML = `
    <div class="logout-modal">
      <div class="logout-icon">👋</div>
      <h3>Konfirmasi Logout</h3>
      <p>Apakah Anda yakin ingin keluar dari akun?</p>
      <div class="logout-actions">
        <button class="btn-cancel" id="cancelLogout">Batal</button>
        <button class="btn-logout" id="confirmLogout">Ya, Logout</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  document.getElementById('cancelLogout').addEventListener('click', () => {
    overlay.remove();
  });
  
  document.getElementById('confirmLogout').addEventListener('click', () => {
    overlay.remove();
    sessionStorage.clear();
    showNotification('Berhasil logout! Sampai jumpa lagi 👋', 'success');
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1000);
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `custom-notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  initializeProgress();
  renderModules();
});