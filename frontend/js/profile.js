document.addEventListener("DOMContentLoaded", async () => {
  const defaultAvatar = "../assets/profile.jpg";
  const profileImage = document.getElementById("profileImage");

  try {
    const userResponse = await apiFetch("/users/me");
    const profileResponse = await apiFetch("/profile");
    const statsResponse = await apiFetch("/stats");

    if (userResponse.ok && profileResponse.ok && statsResponse.ok) {
      const user = await userResponse.json();
      const profile = await profileResponse.json();
      const stats = await statsResponse.json();

      document.getElementById("profileName").value = user.full_name || "";
      document.getElementById("profileEmail").value = user.email || "";
      document.getElementById("profileBio").value = profile.bio || "";

      profileImage.src = profile.avatar || defaultAvatar;
      profileImage.onerror = () => {
        profileImage.src = defaultAvatar;
      };

      const quizHistoryDiv = document.getElementById("quizHistory");
      if (stats.quizHistory && stats.quizHistory.length > 0) {
        quizHistoryDiv.innerHTML =
          "<h3>Riwayat Quiz</h3><ul>" +
          stats.quizHistory
            .map(entry => {
              const parsedEntry = typeof entry === 'string' ? JSON.parse(entry) : entry;
              return `
                <li>
                  <span>${parsedEntry.module}:</span>
                  <span>Skor: ${parsedEntry.score}%</span>
                  <span>Tanggal: ${new Date(parsedEntry.date).toLocaleDateString()}</span>
                </li>
              `;
            })
            .join("") +
          "</ul>";
      } else {
        quizHistoryDiv.innerHTML = "<p>Belum ada riwayat quiz.</p>";
      }

      const gamificationCollectionDiv = document.getElementById("gamificationCollection");
      if (stats.gamificationCollection && stats.gamificationCollection.length > 0) {
        gamificationCollectionDiv.innerHTML =
          "<h3>Koleksi Gamifikasi</h3><ul>" +
          stats.gamificationCollection.map(item => `<li>${item}</li>`).join("") +
          "</ul>";
      } else {
        gamificationCollectionDiv.innerHTML = "<p>Koleksi Anda akan muncul di sini.</p>";
      }
    }
  } catch (error) {
    console.error("Error loading profile:", error);
  }

  const avatarUpload = document.getElementById("avatarUpload");
  avatarUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        resizeImage(e.target.result, 200, 200, async (resizedData) => {
          profileImage.src = resizedData;
          
          try {
            const response = await apiFetch("/profile", {
              method: 'PUT',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                avatar: resizedData,
                bio: document.getElementById("profileBio").value
              })
            });

            if (response.ok) {
              showNotification("Avatar berhasil diperbarui!", "success");
            }
          } catch (error) {
            console.error("Error updating avatar:", error);
            showNotification("Gagal memperbarui avatar.", "error");
          }
        });
      };
      reader.readAsDataURL(file);
    }
  });

  const profileForm = document.getElementById("profileForm");
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("profileName").value;
    const bio = document.getElementById("profileBio").value;
    const currentAvatar = profileImage.src;

    try {
      const response = await apiFetch("/profile", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          full_name: name,
          bio: bio,
          avatar: currentAvatar
        })
      });

      if (response.ok) {
        showNotification("Profil berhasil diperbarui!", "success");
      } else {
        showNotification("Gagal memperbarui profil.", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification("Terjadi kesalahan saat memperbarui profil.", "error");
    }
  });

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