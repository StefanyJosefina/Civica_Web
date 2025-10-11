document.addEventListener("DOMContentLoaded", async () => {
  const defaultAvatar = "../assets/profile.jpg";

  try {
    const userResponse = await apiFetch("/users/me");
    const statsResponse = await apiFetch("/stats");

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

      if (document.getElementById("modulesCompleted"))
        document.getElementById("modulesCompleted").textContent = modulesCompleted;
      if (document.getElementById("avgQuizScore"))
        document.getElementById("avgQuizScore").textContent = `${avgQuizScore}%`;
      if (document.querySelector(".progress-bar"))
        document.querySelector(".progress-bar").style.width = `${(modulesCompleted / 9) * 100}%`;
      if (document.getElementById("gamesPlayed"))
        document.getElementById("gamesPlayed").textContent = gamesPlayed;
      if (document.getElementById("highestGameScore"))
        document.getElementById("highestGameScore").textContent = highestGameScore;

      const profileAvatar = document.querySelector(".profile-summary .profile-avatar");
      if (profileAvatar) {
        profileAvatar.src = currentUser.avatar || defaultAvatar;
        profileAvatar.onerror = () => {
          profileAvatar.src = defaultAvatar;
        };
      }
    } else {
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
    window.location.href = "login.html";
  }
});