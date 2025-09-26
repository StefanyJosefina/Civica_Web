document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const registerForm = document.getElementById("registerForm")
  const logoutButton = document.getElementById("logoutButton")

  function getCurrentUser() {
    const user = localStorage.getItem("currentUser")
    return user ? JSON.parse(user) : null
  }

  function saveUser(user) {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const existingUserIndex = users.findIndex((u) => u.email === user.email)
    if (existingUserIndex > -1) {
      users[existingUserIndex] = user
    } else {
      users.push(user)
    }
    localStorage.setItem("users", JSON.stringify(users))
    localStorage.setItem("currentUser", JSON.stringify(user))
  }

  function findUser(email) {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    return users.find((user) => user.email === email)
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const name = document.getElementById("name").value
      const email = document.getElementById("email").value
      const password = document.getElementById("password").value

      if (findUser(email)) {
        alert("Email sudah terdaftar. Silakan login atau gunakan email lain.")
        return
      }

      const newUser = {
        name: name,
        email: email,
        password: password,
        bio: "",
        avatar: "/placeholder.svg?key=9fgsv",
        progress: {
          modulesCompleted: 0,
          avgQuizScore: 0,
          gamesPlayed: 0,
          highestGameScore: "N/A",
          quizHistory: [],
          gamificationCollection: [],
          completedModules: [], 
        },
      }
      saveUser(newUser)
      alert("Registrasi berhasil! Silakan login.")
      window.location.href = "login.html"
    })
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const email = document.getElementById("email").value
      const password = document.getElementById("password").value

      const user = findUser(email)

      if (user && user.password === password) {
        localStorage.setItem("currentUser", JSON.stringify(user))
        alert("Login berhasil!")
        window.location.href = "dashboard.html"
      } else {
        alert("Email atau password salah.")
      }
    })
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault()
      localStorage.removeItem("currentUser")
      alert("Anda telah logout.")
      window.location.href = "../index.html"
    })
  }

  const protectedPages = [
    "dashboard.html",
    "profile.html",
    "modules.html",
    "quiz.html",
    "games.html"
  ];
  const currentPage = window.location.pathname.split("/").pop();

  if (
    protectedPages.includes(currentPage) &&
    !getCurrentUser() &&
    currentPage !== "login.html" &&
    currentPage !== "register.html"
  ) {
    alert("Anda harus login untuk mengakses halaman ini.");
    window.location.href = "login.html";
  }

})
