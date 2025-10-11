document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const moduleId = Number.parseInt(urlParams.get("id"));

  const modules = [
    { id: 1, title: "Filsafat Pancasila", pdf: "../assets/2. Filsafat Pancasila.pptx.pdf" },
    { id: 2, title: "Pancasila sebagai Filsafat dan Ideologi Negara", pdf: "../assets/3. Pancasila sebagai Filsafat dan Ideologi Negara.pptx.pdf" },
    { id: 3, title: "Identitas dan Integrasi Nasional", pdf: "../assets/4. Identitas dan Integrasi Nasional.pptx.pdf" },
    { id: 4, title: "Demokrasi Pancasila", pdf: "../assets/5. Demokrasi Pancasila.pdf" },
    { id: 5, title: "Nilai & Norma dalam Kerangka Negara Hukum", pdf: "../assets/5. Nilai & Norma dalam Kerangka Negara Hukum.pptx.pdf" },
    { id: 6, title: "Demokrasi Berkeadaban", pdf: "../assets/6.1. Demokrasi-Berkeadaban.pptx.pdf" },
    { id: 7, title: "Hak dan Kewajiban Warga Negara", pdf: "../assets/6.2.Hak dan Kewajiban Warganegara .pptx.pdf" },
    { id: 8, title: "Kepentingan Nasional", pdf: "../assets/7.1.Kepentingan Nasional.pptx.pdf" },
    { id: 9, title: "Hak dan Kewajiban Negara & Warga Negara serta Hak Asasi Manusia", pdf: "../assets/7.2.Hak dan Kewajiban Negara dan Warga Negara serta Hak Asasi Manusia .pptx.pdf" },
  ];

  const currentModuleIndex = modules.findIndex((m) => m.id === moduleId);
  const currentModule = modules[currentModuleIndex];

  if (currentModule) {
    document.getElementById("moduleViewerTitle").textContent = `Modul ${currentModule.id} - ${currentModule.title}`;
    document.getElementById("moduleTitle").textContent = currentModule.title;
    document.getElementById("pdfFrame").src = currentModule.pdf;

    const prevModuleBtn = document.getElementById("prevModuleBtn");
    const nextModuleBtn = document.getElementById("nextModuleBtn");

    if (currentModuleIndex === 0) {
      prevModuleBtn.disabled = true;
    } else {
      prevModuleBtn.addEventListener("click", () => {
        window.location.href = `module-viewer.html?id=${modules[currentModuleIndex - 1].id}`;
      });
    }

    if (currentModuleIndex === modules.length - 1) {
      nextModuleBtn.disabled = true;
    } else {
      nextModuleBtn.addEventListener("click", () => {
        window.location.href = `module-viewer.html?id=${modules[currentModuleIndex + 1].id}`;
      });
    }

    try {
      const statsResponse = await apiFetch("/stats");
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        
        if (!stats.completedModules.includes(moduleId.toString())) {
          await apiFetch("/stats/completed-modules", {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ module: moduleId.toString() })
          });

          const newStats = stats.completedModules.length + 1;
          await apiFetch("/stats", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ modulesCompleted: newStats })
          });
        }
      }
    } catch (error) {
      console.error("Error updating module progress:", error);
    }
  } else {
    document.getElementById("moduleTitle").textContent = "Modul tidak ditemukan.";
    document.querySelector(".pdf-viewer").innerHTML = "<p>Silakan kembali ke halaman modul.</p>";
    document.querySelector(".module-navigation").style.display = "none";
  }
});