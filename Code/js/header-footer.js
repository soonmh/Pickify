function loadComponent(elementId, componentPath, callback) {
  fetch(componentPath)
    .then(response => response.text())
    .then(data => {
      const placeholder = document.getElementById(elementId);
      // console.log(placeholder);
      // console.log(data);
      if(placeholder) placeholder.innerHTML = data;

      // Header-specific adjustments
      if (elementId === 'header-placeholder') {
        const headerElement = placeholder.querySelector('header');
        if (headerElement) {
          const styles = window.getComputedStyle(headerElement);
          placeholder.style.boxShadow = styles.boxShadow;
          headerElement.style.boxShadow = 'none';
          headerElement.style.position = 'static';
          placeholder.style.padding = '0';
        }

        // 🔄 Call callback after header is injected
        if (typeof callback === 'function') {
          callback();
        }
      }
    });
}

document.addEventListener('DOMContentLoaded', function () {
  const pageType = document.body.dataset.pageType || 'main';

  const headerPath =
    pageType === 'landingpage'
      ? 'header-footer/landingpageheader.html'
      : 'header-footer/header.html';
  const footerPath =
    pageType === 'landingpage'
      ? 'header-footer/landingpagefooter.html'
      : 'header-footer/footer.html';

  loadComponent('header-placeholder', headerPath, () => {
    // ✅ After header is loaded, update username
    const userData = localStorage.getItem('loggedInUser') || sessionStorage.getItem('loggedInUser');
    const usernameEl = document.getElementById('header-username');

    if (usernameEl) {
      if (userData) {
        const user = JSON.parse(userData);
        usernameEl.textContent = user.name || user.nmail || "Profile";
        usernameEl.href = "profile.html";
      } else {
        usernameEl.textContent = "Login";
        usernameEl.href = "signin.html";
      }
    }

    // ✅ Logout functionality
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        sessionStorage.removeItem('loggedInUser');
        localStorage.removeItem('loggedInUser');
        window.location.href = 'landingpage.html'; // Redirect after logout
      });
    }
  });

  loadComponent('footer-placeholder', footerPath);
});
