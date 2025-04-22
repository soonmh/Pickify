// shared-components.js
function loadComponent(elementId, componentPath) {
    fetch(componentPath)
      .then(response => response.text())
      .then(data => {
        const placeholder = document.getElementById(elementId);
        
        // Simply insert the HTML content
        placeholder.innerHTML = data;
        
        // For header placeholders, transfer needed attributes to the placeholder
        if (elementId === 'header-placeholder') {
          const headerElement = placeholder.querySelector('header');
          if (headerElement) {
            // Get computed styles from the inner header
            const styles = window.getComputedStyle(headerElement);
            
            // Apply shadow to the placeholder instead of inner header
            placeholder.style.boxShadow = styles.boxShadow;
            headerElement.style.boxShadow = 'none';
            headerElement.style.position = 'static'; // Remove sticky from inner header
            
            // Ensure padding is properly applied
            placeholder.style.padding = '0';
          }
        }
      });   
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    const pageType = document.body.dataset.pageType || 'main';
    
    if (pageType === 'homepage') {
      loadComponent('header-placeholder', 'homepageheader.html');
      loadComponent('footer-placeholder', 'homepagefooter.html');
    } else {
      loadComponent('header-placeholder', 'header.html');
      loadComponent('footer-placeholder', 'footer.html');
    }
  });