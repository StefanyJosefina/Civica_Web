document.addEventListener("DOMContentLoaded", () => {
  const defaultAvatar = "../assets/profile.jpg";
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (currentUser) {
    const userNameEl = document.getElementById("dashboardUserName");
    const userEmailEl = document.getElementById("dashboardUserEmail");
    if (userNameEl) userNameEl.textContent = `Halo, ${currentUser.name || ""}!`;
    if (userEmailEl) userEmailEl.textContent = currentUser.email || "";

    const modulesCompleted = currentUser.progress?.modulesCompleted || 0;
    const avgQuizScore = currentUser.progress?.avgQuizScore || 0;
    const gamesPlayed = currentUser.progress?.gamesPlayed || 0;
    const highestGameScore = currentUser.progress?.highestGameScore || "N/A";

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
});