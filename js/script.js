document.addEventListener("DOMContentLoaded", () => {
  console.log("Civica script loaded.");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const currentPage = window.location.pathname.split("/").pop();

  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");

  if (currentUser) {
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
  }
  
  if (currentPage === "index.html" || currentPage === "") {
    const mulaiBelajarBtn = document.getElementById("mulaiBelajarBtn");

    if (mulaiBelajarBtn && currentUser) {

      mulaiBelajarBtn.href = "pages/dashboard.html";
      console.log("Pengguna sudah login. Tombol 'Mulai Belajar' sekarang mengarah ke dashboard.");
    }
  }
});