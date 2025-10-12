document.addEventListener("DOMContentLoaded", () => {
  const BASE_URL = "https://civicaweb-production.up.railway.app"
  const loginForm = document.getElementById("loginForm")
  const registerForm = document.getElementById("registerForm")
  const logoutButton = document.getElementById("logoutButton")

  function getToken() {
    return localStorage.getItem("token")
  }

  function setToken(token) {
    localStorage.setItem("token", token)
  }

  function clearAuth() {
    localStorage.removeItem("token")
    localStorage.removeItem("currentUser")
  }

  async function apiFetch(endpoint, options = {}) {
    const token = getToken()
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })
    return response
  }

  async function getCurrentUser() {
    const token = getToken()
    if (!token) return null
    try {
      const response = await apiFetch("/users/me")
      if (response.ok) {
        const user = await response.json()
        localStorage.setItem("currentUser", JSON.stringify(user))
        return user
      } else {
        clearAuth()
        return null
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      return null
    }
  }

  function isValidPassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/
    return regex.test(password)
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      const name = document.getElementById("name").value.trim()
      const email = document.getElementById("email").value.trim()
      const password = document.getElementById("password").value.trim()
      if (!name || !email || !password) {
        showNotification("Harap isi semua kolom!", "error")
        return
      }
      if (!isValidPassword(password)) {
        showNotification("Password minimal 8 karakter, harus mengandung huruf besar, huruf kecil, dan karakter spesial.", "error")
        return
      }
      try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            email: email,
            password: password,
            full_name: name
          })
        })
        const data = await response.json()
        if (response.ok) {
          showNotification("Registrasi berhasil! Silakan login.", "success")
          setTimeout(() => (window.location.href = "login.html"), 1500)
        } else {
          showNotification(data.detail || "Registrasi gagal.", "error")
        }
      } catch (error) {
        console.error("Registration error:", error)
        showNotification("Terjadi kesalahan saat registrasi.", "error")
      }
    })
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      const email = document.getElementById("email").value.trim()
      const password = document.getElementById("password").value.trim()
      try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            username: email,
            password: password
          })
        })
        const data = await response.json()
        if (response.ok) {
          setToken(data.access_token)
          await getCurrentUser()
          showNotification("Login berhasil!", "success")
          setTimeout(() => (window.location.href = "dashboard.html"), 1500)
        } else {
          showNotification(data.detail || "Email atau password salah.", "error")
        }
      } catch (error) {
        console.error("Login error:", error)
        showNotification("Terjadi kesalahan saat login.", "error")
      }
    })
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault()
      clearAuth()
      showNotification("Anda telah logout.", "info")
      setTimeout(() => (window.location.href = "../index.html"), 1500)
    })
  }

  const protectedPages = ["dashboard.html", "profile.html", "modules.html", "quiz.html", "games.html"]
  const currentPage = window.location.pathname.split("/").pop()
  if (protectedPages.includes(currentPage) && !getToken() && !["login.html", "register.html"].includes(currentPage)) {
    showNotification("Sesi login kamu habis atau belum login.", "error")
    setTimeout(() => (window.location.href = "login.html"), 1500)
  }
})