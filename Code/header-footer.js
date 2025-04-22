function loadComponent(elementId, componentPath) {
    fetch(componentPath)
      .then(response => response.text())
      .then(data => document.getElementById(elementId).innerHTML = data);
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    // Check which page type we're on using data attribute
    const pageType = document.body.dataset.pageType || 'main';
    
    // Load the appropriate header and footer based on page type
    if (pageType === 'homepage') {
      loadComponent('header-placeholder', 'homepageheader.html');
      loadComponent('footer-placeholder', 'homepagefooter.html');
    } else {
      loadComponent('header-placeholder', 'header.html');
      loadComponent('footer-placeholder', 'footer.html');
    }
  });