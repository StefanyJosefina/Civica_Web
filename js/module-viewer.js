document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search)
  const moduleId = Number.parseInt(urlParams.get("id"))

  const modules = [
    { id: 1, title: "Filsafat Pancasila", pdf: "../public/pdfs/13523125_Latihan4_Kominter.pdf" },
    { id: 2, title: "Pancasila sebagai Filsafat dan Ideologi Negara", pdf: "../public/pdfs/13523125_Latihan4_Kominter.pdf" },
    { id: 3, title: "Identitas dan Integrasi Nasional", pdf: "../public/pdfs/13523125_Latihan4_Kominter.pdf" },
    { id: 4, title: "Demokrasi Pancasila", pdf: "../public/pdfs/13523125_Latihan4_Kominter.pdf" },
    { id: 5, title: "Nilai & Norma dalam Kerangka Negara Hukum", pdf: "../public/pdfs/13523125_Latihan4_Kominter.pdf" },
    { id: 6, title: "Demokrasi Berkedaaban", pdf: "../public/pdfs/13523125_Latihan4_Kominter.pdf" },
    { id: 7, title: "Hak dan Kewajiban Warga Negara", pdf: "../public/pdfs/13523125_Latihan4_Kominter.pdf" },
    { id: 8, title: "Kepentingan Nasional", pdf: "../public/pdfs/13523125_Latihan4_Kominter.pdf" },
    {
      id: 9,
      title: "Hak dan Kewajiban Negara & Warga Negara serta Hak Asasi Manusia",
      pdf: "../public/pdfs/13523125_Latihan4_Kominter.pdf",
    },
  ]

  const currentModuleIndex = modules.findIndex((m) => m.id === moduleId)
  const currentModule = modules[currentModuleIndex]

  if (currentModule) {
    document.getElementById("moduleViewerTitle").textContent = `Modul ${currentModule.id} - ${currentModule.title}`
    document.getElementById("moduleTitle").textContent = currentModule.title
    document.getElementById("pdfFrame").src = currentModule.pdf

    const prevModuleBtn = document.getElementById("prevModuleBtn")
    const nextModuleBtn = document.getElementById("nextModuleBtn")

    if (currentModuleIndex === 0) {
      prevModuleBtn.disabled = true
    } else {
      prevModuleBtn.addEventListener("click", () => {
        window.location.href = `module-viewer.html?id=${modules[currentModuleIndex - 1].id}`
      })
    }

    if (currentModuleIndex === modules.length - 1) {
      nextModuleBtn.disabled = true
    } else {
      nextModuleBtn.addEventListener("click", () => {
        window.location.href = `module-viewer.html?id=${modules[currentModuleIndex + 1].id}`
      })
    }

    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    if (currentUser && !currentUser.progress.completedModules.includes(moduleId)) {
      currentUser.progress.completedModules.push(moduleId)
      currentUser.progress.modulesCompleted = currentUser.progress.completedModules.length
      localStorage.setItem("currentUser", JSON.stringify(currentUser))
      updateAllUsers(currentUser)
    }
  } else {
    document.getElementById("moduleTitle").textContent = "Modul tidak ditemukan."
    document.querySelector(".pdf-viewer").innerHTML = "<p>Silakan kembali ke halaman modul.</p>"
    document.querySelector(".module-navigation").style.display = "none"
  }

  function updateAllUsers(updatedUser) {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const userIndex = users.findIndex((u) => u.email === updatedUser.email)
    if (userIndex > -1) {
      users[userIndex] = updatedUser
      localStorage.setItem("users", JSON.stringify(users))
    }
  }
})
