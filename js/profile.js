document.addEventListener("DOMContentLoaded", () => {
  const defaultAvatar = "../assets/profile.jpg";
  const profileImage = document.getElementById("profileImage");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (currentUser) {
    document.getElementById("profileName").value = currentUser.name || "";
    document.getElementById("profileEmail").value = currentUser.email || "";
    document.getElementById("profileBio").value = currentUser.bio || "";

    profileImage.src = currentUser.avatar || defaultAvatar;
  } else {
    profileImage.src = defaultAvatar;
  }

  profileImage.onerror = () => {
    profileImage.src = defaultAvatar;
  };

  const avatarUpload = document.getElementById("avatarUpload");
  avatarUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        resizeImage(e.target.result, 200, 200, (resizedData) => {
          profileImage.src = resizedData;
          if (currentUser) {
            currentUser.avatar = resizedData;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            updateAllUsers(currentUser);
          }
        });
      };
      reader.readAsDataURL(file);
    }
  });

  const profileForm = document.getElementById("profileForm");
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (currentUser) {
      currentUser.name = document.getElementById("profileName").value;
      currentUser.bio = document.getElementById("profileBio").value;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      updateAllUsers(currentUser);
      alert("Profil berhasil diperbarui!");
    }
  });

  const quizHistoryDiv = document.getElementById("quizHistory");
  if (
    currentUser &&
    currentUser.progress &&
    currentUser.progress.quizHistory &&
    currentUser.progress.quizHistory.length > 0
  ) {
    quizHistoryDiv.innerHTML =
      "<h3>Riwayat Quiz</h3><ul>" +
      currentUser.progress.quizHistory
        .map(
          (entry) => `
              <li>
                  <span>${entry.module}:</span>
                  <span>Skor: ${entry.score}%</span>
                  <span>Tanggal: ${new Date(entry.date).toLocaleDateString()}</span>
              </li>
          `
        )
        .join("") +
      "</ul>";
  } else {
    quizHistoryDiv.innerHTML = "<p>Belum ada riwayat quiz.</p>";
  }

  const gamificationCollectionDiv = document.getElementById(
    "gamificationCollection"
  );
  if (
    currentUser &&
    currentUser.progress &&
    currentUser.progress.gamificationCollection &&
    currentUser.progress.gamificationCollection.length > 0
  ) {
    gamificationCollectionDiv.innerHTML =
      "<h3>Koleksi Gamifikasi</h3><ul>" +
      currentUser.progress.gamificationCollection
        .map((item) => `<li>${item}</li>`)
        .join("") +
      "</ul>";
  } else {
    gamificationCollectionDiv.innerHTML =
      "<p>Koleksi Anda akan muncul di sini.</p>";
  }

  function updateAllUsers(updatedUser) {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u) => u.email === updatedUser.email);
    if (userIndex > -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem("users", JSON.stringify(users));
    }
  }

  function resizeImage(base64Str, maxWidth, maxHeight, callback) {
    const img = new Image();
    img.onload = () => {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");

      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height *= maxWidth / width));
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width *= maxHeight / height));
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      callback(canvas.toDataURL("image/jpeg", 0.8)); 
    };
    img.src = base64Str;
  }
});