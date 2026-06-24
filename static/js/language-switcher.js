document.addEventListener('DOMContentLoaded', function() {
    console.log('Language switcher script loaded');
    
    // Handle language switcher clicks
    function handleLanguageSwitcher() {
        const langSwitchers = document.querySelectorAll('a[data-lang]');
        console.log('Found language switchers:', langSwitchers.length);
        
        langSwitchers.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Language switcher clicked:', this.getAttribute('data-lang'));
                
                const currentPath = window.location.pathname;
                const targetLang = this.getAttribute('data-lang');
                let newUrl = '';
                
                if (targetLang === 'de') {
                    // Switch to German
                    if (currentPath.startsWith('/de/')) {
                        // Already on German page, no change needed
                        console.log('Already on German page');
                        return;
                    } else {
                        // On English page, switch to German equivalent
                        newUrl = '/de' + currentPath;
                    }
                } else if (targetLang === 'en') {
                    // Switch to English
                    if (currentPath.startsWith('/de/')) {
                        // On German page, switch to English equivalent
                        newUrl = currentPath.substring(3) || '/';
                    } else {
                        // Already on English page, no change needed
                        console.log('Already on English page');
                        return;
                    }
                }
                
                // Navigate to the new URL
                if (newUrl) {
                    console.log('Navigating to:', newUrl);
                    window.location.href = newUrl;
                }
            });
        });
    }
    
    // Initialize language switcher
    handleLanguageSwitcher();
});