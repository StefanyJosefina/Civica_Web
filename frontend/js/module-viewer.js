document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search)
  const moduleId = parseInt(urlParams.get('module'))
  const pdfPath = urlParams.get('pdf')

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
  ]

  const currentModule = modules.find(m => m.id === moduleId)
  
  if (!currentModule) {
    alert('Modul tidak ditemukan!')
    window.location.href = 'modules.html'
    return
  }

  document.getElementById('moduleViewerTitle').textContent = `Modul ${moduleId} - Civica`
  document.getElementById('moduleTitle').textContent = `Modul ${moduleId}: ${currentModule.title}`

  const pdfFrame = document.getElementById('pdfFrame')
  const pdfUrl = pdfPath || currentModule.pdf
  pdfFrame.src = pdfUrl

  const prevBtn = document.getElementById('prevModuleBtn')
  const nextBtn = document.getElementById('nextModuleBtn')
  const quizLink = document.querySelector('.btn-primary')

  quizLink.href = `quiz.html?module=${moduleId}`

  if (moduleId > 1) {
    prevBtn.disabled = false
    prevBtn.addEventListener('click', () => {
      const prevModule = modules.find(m => m.id === moduleId - 1)
      if (prevModule) {
        window.location.href = `module-viewer.html?module=${prevModule.id}&pdf=${encodeURIComponent(prevModule.pdf)}`
      }
    })
  } else {
    prevBtn.disabled = true
  }

  if (moduleId < modules.length) {
    nextBtn.disabled = false
    nextBtn.addEventListener('click', () => {
      const nextModule = modules.find(m => m.id === moduleId + 1)
      if (nextModule) {
        const progressData = sessionStorage.getItem('civica_module_progress')
        let moduleProgress = progressData ? JSON.parse(progressData) : {}
        
        if (!moduleProgress[moduleId]) {
          moduleProgress[moduleId] = {}
        }
        moduleProgress[moduleId].read = true
        sessionStorage.setItem('civica_module_progress', JSON.stringify(moduleProgress))
        
        const nextIsUnlocked = moduleProgress[moduleId] && moduleProgress[moduleId].read
        
        if (nextIsUnlocked) {
          window.location.href = `module-viewer.html?module=${nextModule.id}&pdf=${encodeURIComponent(nextModule.pdf)}`
        } else {
          alert('Selesaikan modul ini terlebih dahulu!')
        }
      }
    })
  } else {
    nextBtn.disabled = true
    nextBtn.textContent = 'Modul Terakhir'
  }

  document.getElementById('logoutButton').addEventListener('click', (e) => {
    e.preventDefault()
    showLogoutConfirmation()
  })

  function showLogoutConfirmation() {
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      backdrop-filter: blur(5px);
      animation: fadeIn 0.3s ease;
    `
    
    overlay.innerHTML = `
      <div style="
        background: white;
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        max-width: 400px;
        width: 90%;
        animation: slideUp 0.3s ease;
      ">
        <div style="font-size: 4rem; margin-bottom: 20px;">👋</div>
        <h3 style="font-size: 1.8rem; color: #2c3e50; margin-bottom: 15px; font-weight: 700;">Konfirmasi Logout</h3>
        <p style="font-size: 1.1rem; color: #7f8c8d; margin-bottom: 30px;">Apakah Anda yakin ingin keluar dari akun?</p>
        <div style="display: flex; gap: 15px; justify-content: center;">
          <button id="cancelLogout" style="
            padding: 12px 30px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            background: #ecf0f1;
            color: #2c3e50;
            flex: 1;
            transition: all 0.3s ease;
          ">Batal</button>
          <button id="confirmLogout" style="
            padding: 12px 30px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            background: linear-gradient(135deg, #e63900, #ff4d1a);
            color: white;
            flex: 1;
            box-shadow: 0 4px 12px rgba(230, 57, 0, 0.3);
            transition: all 0.3s ease;
          ">Ya, Logout</button>
        </div>
      </div>
    `
    
    document.body.appendChild(overlay)
    
    document.getElementById('cancelLogout').addEventListener('click', () => {
      overlay.remove()
    })
    
    document.getElementById('confirmLogout').addEventListener('click', () => {
      overlay.remove()
      sessionStorage.clear()
      window.location.href = '../index.html'
    })
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove()
      }
    })
  }

  window.addEventListener('beforeunload', () => {
    const progressData = sessionStorage.getItem('civica_module_progress')
    let moduleProgress = progressData ? JSON.parse(progressData) : {}
    
    if (!moduleProgress[moduleId]) {
      moduleProgress[moduleId] = {}
    }
    moduleProgress[moduleId].read = true
    sessionStorage.setItem('civica_module_progress', JSON.stringify(moduleProgress))
  })
})