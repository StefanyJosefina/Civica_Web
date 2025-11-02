document.addEventListener("DOMContentLoaded", async () => {
  const defaultAvatar = "../assets/profile.jpg";
  const API_BASE_URL = "https://civicaweb-production.up.railway.app";
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const statsResponse = await fetch(`${API_BASE_URL}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (userResponse.ok && statsResponse.ok) {
      const currentUser = await userResponse.json();
      const stats = await statsResponse.json();

      const userNameEl = document.getElementById("dashboardUserName");
      const userEmailEl = document.getElementById("dashboardUserEmail");

      if (userNameEl) userNameEl.textContent = `Halo, ${currentUser.full_name || ""}!`;
      if (userEmailEl) userEmailEl.textContent = currentUser.email || "";

      const modulesCompleted = stats.modulesCompleted || 0;
      const avgQuizScore = stats.avgQuizScore || 0;
      const gamesPlayed = stats.gamesPlayed || 0;
      const highestGameScore = stats.highestGameScore || "N/A";

      const modulesCompletedEl = document.getElementById("modulesCompleted");
      const avgQuizScoreEl = document.getElementById("avgQuizScore");
      const gamesPlayedEl = document.getElementById("gamesPlayed");
      const highestGameScoreEl = document.getElementById("highestGameScore");
      const progressBar = document.querySelector(".progress-bar");

      if (modulesCompletedEl) modulesCompletedEl.textContent = modulesCompleted;
      if (avgQuizScoreEl) avgQuizScoreEl.textContent = `${avgQuizScore}%`;
      if (gamesPlayedEl) gamesPlayedEl.textContent = gamesPlayed;
      if (highestGameScoreEl) highestGameScoreEl.textContent = highestGameScore;
      if (progressBar)
        progressBar.style.width = `${(modulesCompleted / 9) * 100}%`;

      const profileAvatar = document.querySelector(".profile-summary .profile-avatar");
      if (profileAvatar) {
        profileAvatar.src = currentUser.avatar || defaultAvatar;
        profileAvatar.onerror = () => {
          profileAvatar.src = defaultAvatar;
        };
      }
    } else {
      console.error("Gagal memuat data dashboard:", userResponse.status, statsResponse.status);
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
    window.location.href = "login.html";
  }
});