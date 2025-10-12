const BASE_URL = "https://civicaweb-production.up.railway.app";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
  return res;
}

function showNotification(message, type = "success") {
  let box = document.querySelector(".notification");
  if (!box) {
    box = document.createElement("div");
    box.className = "notification";
    document.body.appendChild(box);
    const style = document.createElement("style");
    style.textContent = `
      .notification{position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:14px 28px;border-radius:6px;color:#fff;font-weight:600;font-size:15px;opacity:0;pointer-events:none;transition:opacity .3s,transform .3s;z-index:9999}
      .notification.show{opacity:1;pointer-events:auto;transform:translate(-50%,0)}
      .notification.success{background:#4caf50}
      .notification.error{background:#f44336}
      .notification.info{background:#2196f3}
    `;
    document.head.appendChild(style);
  }
  box.textContent = message;
  box.className = `notification show ${type}`;
  setTimeout(() => box.classList.remove("show"), 3000);
}